// method used to actually download modules
import { http as download} from './http-get'; 

// prevent webpack/babel from removing async syntax (which neutralizes intended effect)
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
const AsyncFunction = new Function(`return Object.getPrototypeOf(async function(){}).constructor`)();

// turn commonjs requires (sync) to async
const cjsToAwaitRequire = cjs => cjs.replace(/\brequire\s*[(]/g, 'await require(');

// quick way to see if code is [likely] commonjs
const isCommonJS = code => /module[.]exports/.test(code); 

// convert a dependancy reference to its http-gettable url
function basicActualUrl(requestedUrl) {
    return /^(https?[:])?[/][/]/i.test(requestedUrl) ? requestedUrl // explicit url so leave it alone
                    : /^[a-z_$]/i.test(requestedUrl) ? `https://unpkg.com/${requestedUrl}` // simple name so use NPM (via unpkg)
                                                     : requestedUrl; // relative path from here (where's here?)
}

var resolveURL = basicActualUrl;
loadModuleByUrl.setUrlResolver = customResolver => {
    resolveURL = customResolver || basicActualUrl; // so set to null to reset
    return loadModuleByUrl; // can chain op
}

export const loadedModules = {};

function addKnownModule(name, module) {
    loadedModules[name] = {
        isKnown: true,
        isLoaded: true,
        type: 'isBuiltin',
        module,
    };
}

addKnownModule('load-dynamic-module', loadModuleByUrl); // trivial case
addKnownModule('require-async', requireAsync); // lets amd modules load deps on-demand
addKnownModule('async-require', requireAsync); // alias

async function requireAsync(url) {
    const requested = await loadModuleByUrl(url);
    return requested.module; 
}

export default async function loadModuleByUrl(moduleRequestUrl, dependent) {

    // IMPORTANT: loadModuleByUrl NEVER FAILS
    // - unloadable modules (e.g. network|syntax errors) simply set to undefined
    // - so reject (below) is NEVER used

    return new Promise(async resolve => { // NO 'reject' param as per above...

        const module = loadedModules[moduleRequestUrl] || (loadedModules[moduleRequestUrl] = { isKnown: false, module: undefined });

        function moduleIsNowResolved(m, type) {
            if (arguments.length === 1) {
                module.err = m;
            }
            else {
                module.module = m; 
                module.type = type;
            }

            module.isLoaded = !!module.module;

            // first, resolve modules waiting on this one
            module.listeners.forEach(listener => listener(module));

            // then, resolve this one
            resolve(module);
        }

        if (module.isKnown) {
            if (module.isLoaded)
                resolve(module); // modules are loaded once, then reused
            else {
                if (dependent) {
                    const cycle = module.dependents.find(m => m === dependent);
                    if (cycle)
                        return moduleIsNowResolved(new Error('CYCLYCAL DEPENDENCY: ' + moduleRequestUrl + '<-->' + cycle));
                    else
                        module.dependents.push(dependent);
                }

                module.listeners.push(resolvedModule => resolve(resolvedModule)); // ??? needs TESTING
            }
        }
        else { // loading a new module
            const actualModuleUrl = resolveURL(moduleRequestUrl, basicActualUrl); // always make default available to custom resolvers

            Object.assign(module, {
                isKnown: true,
                dependents: dependent ? [ dependent ] : [],
                listeners: [], // i.e. those waiting for this module to be loaded
                moduleRequestUrl, // original, as requested
                actualModuleUrl, // as received, including possible redirects (301/302)
            });

            try {
                const m = await download(actualModuleUrl);

                const code = m.data; // may be AMD/UMD or CommonJS

                // Favor AMD modules first because no need for code manipulation and many browser-based modules are AMD/UMD anyway
                // - MUST pass dummy (i.e. undefined) module/exports/require else would use those from global context (if any)
                // - Use AsyncFunction in case module code uses async-require
                const initModule = new AsyncFunction('define', 'module', 'exports', 'require', code); 

                // IMPORTANT: all AMD modules test for 'define.amd' being 'truthy'
                //            but some (e.g. lodash) ALSO check that "typeof define.amd == 'object'" so...
                amdDefine.amd = {}; // ...use an object (truthy) NOT 'true'

                // keep track of whether or not our define method was actually called...
                var isAMD = false; // ...because if not called, likely NOT an AMD module
                function amdDefine(...args) {
                    isAMD = true; // yey!

                    const define = args.pop(); // always last param
                    if (typeof define !== 'function') 
                        throw new Error(`expecting 'define' to be a function - was ${typeof define}`);

                    const externals = args.pop() || [];
                    //const name_unused = args.pop(); // unused: here for ref

                    // resolve deps
                    const deps = externals.map(dep => loadModuleByUrl(dep, moduleRequestUrl));

                    Promise.all(deps).then(modules => {
                        try {
                            moduleIsNowResolved(define(...modules.map(m => m.module)), 'AMD'); // could fail (if not [correct] AMD)
                        }
                        catch(err) {
                            moduleIsNowResolved(err);
                        }
                    });
                }

                try { // pass #1: try it as an AMD module
                    let undefined_module, // unassigned === undefined
                        undefined_exports, // ditto
                        dummy_require = () => {throw new Error('require is invalid in AMD modules: ' + moduleRequestUrl);};

                    await initModule(amdDefine, undefined_module, undefined_exports, dummy_require);
                }
                catch(err) {
                    if (isAMD) moduleIsNowResolved(err)
                }

                if (!isAMD) {
                    if (isCommonJS(code)) { 
                        
                        // pass #2: yes, less efficient (since 2 passes) but allows for both modes (i.e. amd/umd and cjs) to be imported
                        
                        const awaitableCode = cjsToAwaitRequire(code);
                        const cjsInit = new AsyncFunction('module', 'exports', 'require', awaitableCode);
                        const moduleProxy = { exports: {} };
                        async function requireProxy(modName) {
                            const upl = new URL(modName, m.responseURL).href; // todo: need better handling for this (e.g. absolute https://)
                            return (await loadModuleByUrl(upl, moduleRequestUrl)).module;
                        }
                        try {
                            await cjsInit(moduleProxy, moduleProxy.exports, requireProxy);
                            moduleIsNowResolved(moduleProxy.exports, 'CommonJS');
                        }
                        catch(err) {
                            moduleIsNowResolved(err);
                        }
                    }
                    else {
                        moduleIsNowResolved(new Error('module seems to be neither AMD/UMD not CommonJS'));
                    }
                }
            }
            catch(err) {
                moduleIsNowResolved(err);
            }
        }
    });
}
