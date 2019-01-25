// read: https://developers.google.com/web/fundamentals/primers/modules
//  - https://developers.google.com/web/updates/2017/11/dynamic-import
//  - https://www.sitepoint.com/using-es-modules/
// also: https://curiosity-driven.org/minimal-loader
// also: https://michelenasti.com/2018/10/02/let-s-write-a-simple-version-of-the-require-function.html
// also: https://davidwalsh.name/javascript-loader
// also: https://www.davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/

// read: https://hackernoon.com/7-different-ways-to-use-es-modules-today-fc552254ebf4

// dynamic import() NOT SUPPORTED by most modern browsers (as of jan 21, 2019: edge:no, firefox:no, chrome:yes, safari:yes)
// - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import


// method used to actually download modules
import { http as download} from './http-get'; // instead of axios.get (lighter)

// prevent webpack/babel from removing async syntax (which neutralizes intended effect)
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
const AsyncFunction = new Function(`return Object.getPrototypeOf(async function(){}).constructor`)();

// convert commonjs 'require' (implicit sync) to 'await require' (explicit sync)
const commonjsToAwaitRequire = cjs => cjs.replace(/\brequire\s*[(]/g, 'await require(');

// quick way to see if code might be commonjs
const isCommonJS = code => /module[.]exports/.test(code); 

// convert a dependancy reference to an http-gettable url
function defaultUrlResolver(requestedUrl, baseURL) {
    if (/^(https?[:])?[/][/]/i.test(requestedUrl)) 
        return requestedUrl; // explicit url so leave it alone

    if (/^[a-z_$]/i.test(requestedUrl)) // a.k.a. a "bare import" in CJS parlance (i.e. /node_modules/...)
        return `https://unpkg.com/${requestedUrl}`; // simple name so use NPM (via unpkg)

    // based on: https://developer.mozilla.org/en-US/docs/Web/API/URL
    return baseURL ? new URL(requestedUrl, baseURL).href : requestedUrl;
}

var resolveUrl = defaultUrlResolver;
export function setCustomUrlResolver(customResolver) {
    // - can set customResolver to null to reset
    // - customResolver expects 3 parms: url, baseUrl, defaultUrlResolverFunction
    resolveUrl = customResolver || defaultUrlResolver; 
}

const loadedModules = {};

// allow for pre-loaded modules to be referenced
export function addKnownModule(name, module) {
    // must store name as it would be resolved
    // issue: what happens if urlResolver is changed after the facts?
    loadedModules[resolveUrl(name)] = { 
        isKnown: true,
        isLoaded: true,
        type: 'isBuiltin',
        module,
    };
}

addKnownModule('load-dynamic-module', loadModule); // self: trivial case
addKnownModule('require-async', requireAsync); // lets AMD modules load deps on-demand
addKnownModule('async-require', requireAsync); // alias

async function requireAsync(url) {
    const requested = await loadModule(url);
    return requested.module; 
}

const globalAliases = {};
export function genModuleGlobal(name, generatingFcn) {

    // MUST DOCUMENT: this allows for GLOBALS to be defined ahead of a module's initialialization
    // to document: must be a generating function so that base 'define' is available

    // IMPORTANT: generatingFcn CAN change underlying define, module.exports, require if it wants
    //            because these are passed as fields in an object, then those fields are passed
    //            module context. 

    globalAliases[name] = generatingFcn;
}

export default async function loadModule(moduleRequestUrl, parentModuleUrl = window.location.href) {

    // IMPORTANT: loadModuleByUrl NEVER FAILS, but/so:
    // - so unloadable modules (e.g. network|syntax errors) simply set to undefined (module.err contains reason)
    // - so reject clause (of Promise below) is NEVER used

    const actualModuleUrl = resolveUrl(moduleRequestUrl, parentModuleUrl, defaultUrlResolver);

    return new Promise(async resolve => { // NO 'reject' param/clause as per note above...

        const module = loadedModules[actualModuleUrl] || (loadedModules[actualModuleUrl] = { isKnown: false, module: undefined });

        function moduleIsNowResolved(m, type) {
            // first
            if (arguments.length === 1) {
                const err = module.err = m;
                const name = `dynamic module ${moduleRequestUrl} (actualModuleUrl)`;
                // test 'err.message' (to give friendly hint): e.g. from chrome: 'await is only valid in async function'
                if (err.name === 'SyntaxError' && /await.+async.+function/i.test(err.message || ''))
                    console.warn(`${name} may be CommonJS with nested requires\n\t(only top-level requires are supported by loadModule)`)
                else
                    console.error(`${name} failed to be loaded`, err);
            }
            else {
                module.module = m; 
                module.type = type;
            }

            // then
            module.isLoaded = !!module.module;

            // now, resolve modules waiting on this one
            module.listeners.forEach(listener => listener(module));

            // finally, resolve this one
            resolve(module);
        }

        if (module.isKnown) {
            if (module.isLoaded || module.err) {
                resolve(module); // modules are loaded once, then reused
            }
            else {
                if (parentModuleUrl) {
                    const cycle = module.dependents.find(m => m === parentModuleUrl);
                    if (cycle)
                        return moduleIsNowResolved(new Error('CYCLYCAL DEPENDENCY: ' + moduleRequestUrl + '<-->' + cycle));
                    else
                        module.dependents.push(parentModuleUrl);
                }

                module.listeners.push(resolvedModule => resolve(resolvedModule)); // ??? needs TESTING
            }
        }
        else { // loading a new module

            Object.assign(module, {
                isKnown: true,
                dependents: [ parentModuleUrl ],
                listeners: [], // i.e. those waiting for this module to be loaded
                moduleRequestUrl, // original, as requested
                actualModuleUrl, // as received, including possible redirects (301/302)
            });

            try {
                const m = await download(actualModuleUrl);
                const baseUrlForSubDeps = m.responseURL; // any deps in this module are relative to this base url
                const code = m.data; // may be AMD/UMD or CommonJS

                const amdProxy = { // for amd modules
                    define: amdDefine,
                    module: undefined,
                    require: () => {throw new Error('require is invalid in AMD modules (use require-async instead): ' + moduleRequestUrl);},
                };

                const cjsProxy = { // for commonjs modules
                    define: () => { throw new Error('unexpected use of DEFINE in commonJS module')},
                    module: { exports: {} },
                    require: async modName => (await loadModule(modName, baseUrlForSubDeps)).module,
                }

                const proxiedGlobals = { names: [], values: [], };
                Object.entries(globalAliases).forEach(([name,genFcn]) => {
                    proxiedGlobals.names.push(name);
                    proxiedGlobals.values.push(genFcn(amdProxy, cjsProxy)); // passed as objects so callers can change default values
                })
               
                // Try as AMD module first because 1) many browser-based modules are AMD/UMD anyway and 2) no need for code manipulation
                // - MUST pass dummy module/exports/require else would use/fallback those from global context (i.e. window) if any
                // - Use AsyncFunction in case module code uses async-require
                // - could initModule.bind(x) but this would change meaning of 'this' within module: default is global/window object
                //    - this could be a means to protect the window object if needed (e.g. by replacing it with null, or a proxying object)
                const initModule = new AsyncFunction('define', 'module', 'exports', 'require', ...proxiedGlobals.names, code); 

                // IMPORTANT: all AMD modules test for 'define.amd' being 'truthy'
                //            but some (e.g. lodash) ALSO check that "typeof define.amd == 'object'" so...
                amdDefine.amd = {}; // ...use an object (truthy) NOT just 'true'

                // keep track of whether or not our define method was actually called...
                var isAMD = false; // ...because if not called, likely NOT an AMD module
                function amdDefine(...args) {
                    isAMD = true; // yay!

                    const moduleDefine = args.pop(); // always last param
                    if (typeof moduleDefine !== 'function') 
                        throw new Error(`expecting 'define' to be a function (was ${typeof moduleDefine})`);

                    // find out how many deps the define function expects
                    const numDeps = moduleDefine.length; // function.length returns how many parms (so, deps) are declared for it

                    // we allow for either an array of deps (traditional) or just comma-separated parms (for convenience when creating amd modules manually)
                    // we're ok with a mixture of strings and arrays (of strings only), though not clear why that would be the case
                    // and we always work backwards on parms (from right to left) to allow for possibility of a module name at the front/left
                    // (as per traditional, in case first/leftmost parm is module's 'name', as per typical AMD define([name,][...deps,] fcn(...depRefs){}))
                    // IF a module name is specified, it remains UNUSED (not needed for modules loaded by URLs)
                    // POSSIBLE: if single string parm left (i.e. module name), maybe register it as the module's name also: i.e. an alias
                    // - but what happens if another module wants that name: overwrite? remove both? keep first? keep both?
                    const externals = [];
                    while(externals.length < numDeps) {
                        const nextDep = args.pop(); // from right/back to left/front 
                        if (typeof nextDep === 'string')
                            externals.unshift(nextDep); // add to front/left of array
                        else if (Array.isArray(nextDep)) {
                            while (externals.length < numDeps && nextDep.length > 0) { // process nested deps
                                const nd = nextDep.pop(); // take last one (so going from back to front)...
                                if (typeof nd === 'string')
                                    externals.unshift(nd); // add to front of array
                                else 
                                    throw new Error(`invalid dependency in AMD module definition - can only be a string (got type=${typeof nd})`);
                            }
                        }
                        else 
                            throw new Error(`invalid dependency in AMD module definition - can only be a string or an array of strings`);
                    }


                    // this is the module's name (as author wants it defined)
                    // if (args.length === 1 && typeof args[0] === 'string') { ...UNUSED for now...
                    //     // use it? 
                    //     // maybe set option to use only URLs, URLs AND named defines, or just named defines (if no name, use url)
                    //     // to consider: add option in case of conflicts: replace with newer/last-loaded, remove both, keep first (e.g. different url but same name)
                    // }

                    // resolve deps
                    const deps = externals.map(dep => loadModule(dep, baseUrlForSubDeps));

                    Promise.all(deps).then(modules => {
                        try {
                            moduleIsNowResolved(moduleDefine(...modules.map(m => m.module)), 'AMD'); // could fail (if not [correct] AMD)
                        }
                        catch(err) {
                            moduleIsNowResolved(err); // ...but with errors
                        }
                    });
                }

                try { 
                    // pass #1: try it as an AMD module first
                    await initModule(amdProxy.define, amdProxy.module, (amdProxy.module || {}).exports, amdProxy.require, ...proxiedGlobals.values);
                }
                catch(err) {
                    isAMD && moduleIsNowResolved(err); // if was an AMD, consider it resolved (though with errors)
                }

                if (!isAMD) {
                    if (isCommonJS(code)) { 
                        // pass #2: yes, less efficient (since 2 passes) but allows for both modes (i.e. amd/umd and cjs) to be imported
                        // BIG CAVEAT: only top-level requires will be honored; nested requires (i.e. within non-asyn functions) will fail
                        
                        const awaitableCode = commonjsToAwaitRequire(code);
                        const commonjsInit = new AsyncFunction('module', 'exports', 'require', ...proxiedGlobals.names, awaitableCode);
                        try {
                            await commonjsInit(cjsProxy.module, (cjsProxy.module || {}).exports, cjsProxy.require, ...proxiedGlobals.values);
                            moduleIsNowResolved((cjsProxy.module||{}).exports, 'CommonJS');
                        }
                        catch(err) {
                            moduleIsNowResolved(err);
                        }
                    }
                    else {
                        moduleIsNowResolved(new Error('module seems to be neither AMD/UMD nor CommonJS'));
                    }
                }
            }
            catch(err) {
                moduleIsNowResolved(err);
            }
        }
    });
}
