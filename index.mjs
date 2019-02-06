// important: refer to README.md before using - you've been warned! :-)

// our method used to actually download modules
import { http as download, AsyncFunction, loadCSSCode } from 'tidbits';//'my-npm-packages/freddy-javascript-utils';

// convert commonjs 'require' (implicitly sync) to 'await require' (explicit async)
// - WORKS ONLY FOR top-level requires since nested requires (i.e. within a function) will fail 
//   with a syntax error (unless that function itself was already marked async)
// - also works only with plain require() without intervening comments
// - also works only without 'await require(' TODO: could actually check for this and leave it alone if already there
const commonjsToAwaitRequire = cjs => cjs.replace(/\brequire\s*[(]/g, 'await require(');

// // from requirejs, efficient mostly-correct(?) regex for simple stuff:
// const commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg, // can detect comments
//       cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g; // should probably strip comments first; will fail with some regex; ignores `ticks`

// quick way to see if code MIGHT be commonjs
const isCommonJS = code => /module[.]exports/.test(code); 

// very crude means of extracting an extension; also, dot is not included; and another thing... :-)
const extension = str => (str||'').split('.').pop(); 
// a more "accurate" (or complete) method (but more code)
//const extension = (str, keepDot = false) => ((str||'').match(/[.][^.]*$/)||[''])[0].substring(keepDot ? 0 : 1);

const loadedModules = {};
const getModule = id => loadedModules[id] || (loadedModules[id] = new Module({id})); 
const addModule = (id, module) => loadedModules[id] = new Module({id, module});

class DownloadError extends Error {
    constructor(msg, err) { 
        super(msg);
        this.downloadError = err;
    }
}

class ModuleLoadError extends Error {
    constructor(msg, ...errs) { 
        super(msg);
        this.loadErrors = errs;
    }
}

// cheap means to ensure no infinite loop while resolving dependencies
const LONGEST_LIKELY_DEPENDENCY_CHAIN = 30; // number of modules depending on me BEFORE I'm initially resolved

class Module {

    constructor({id, module} = {}) {
        id && (this.id = id); // its source URL
        module && (this.module = module); // DO NOT SET IT without actual module (else will break isLoaded below)
    }

    get isLoaded() { return 'module' in this };
    get isUnresolved() { return !this.isLoaded && !!this.waitingOnMe; }

    resolved(m) {
        // set it (isLoaded will now always be true)...
        this.module = m; // m can be an actual module OR an Error if loading failed

        // UNCOMMENT (below) to give users a hint of a likely issue when loading CJS modules:
        // if (m instanceof Error && m.name === 'SyntaxError' && /await.+async.+function/i.test(m.message || ''))
        //     m.message = `${this.id} may be CJS module with nested requires\n\t(nested requires must be inside async functions)\n\toriginal error: ${m.message}`)
        
        // ...then, let dependents know
        (this.waitingOnMe || []).forEach(resolveDep => resolveDep());
        delete this.waitingOnMe; // why not...
    }

    dependsOnMe(resolveDependent) {

        // Strategies to prevent infinite dependency loops (e.g. a --> b --> c --> a):
        // 1) actually check for cycles: 
        //    - would need to keep track of relationships between dependents (i.e. parent<-->child)
        //    - most efficient, most "correct"
        //    - [but] most code/work
        //    - [and] only useful if cycles do occur (which is an error so should be caught during dev)
        // 2) just allow for a maximum number of dependents; if more are added, assume it's because of a cycle:
        //    - trivial implementation
        //    - less efficient because if there is a cycle error, it will runs extra loops before error is "detected"
        //    - selected limit should be high enough to make sure legitimate cases are not erroneously flagged
        //        - which exacerbates earlier point (of being less efficient)
        //    - BUT, in cases where no ACTUAL errors, which should be ALL of the time :-)
        //      - it's the FASTEST! EASIEST! SIMPLEST!
        
        const deps = this.waitingOnMe || (this.waitingOnMe = []);
        deps.push(resolveDependent);

        // as per method 2 (above)
        if (deps.length > LONGEST_LIKELY_DEPENDENCY_CHAIN)
            this.resolved(new Error(`likely cycle in module resolution for ${this.id} (depth=${deps.length})`));
    }

    genAMDDefine(subDepResolution) {

        const thisModule = this; // self ref for within amdDefine below

        // IMPORTANT: all AMD modules test for 'define.amd' being 'truthy'
        //            but some (e.g. lodash) ALSO check that "typeof define.amd == 'object'" so...
        defineMethod.amd = {}; // ...use an object (truthy) NOT just 'true'

        // keep track of whether or not our define method was actually called...
        var isAMD = false; // ...because if not called, likely NOT an AMD module
        function defineMethod(...args) {

            // at this point we know we're in an AMD module since this define method was called from module source code
            // so if any errors after this (e.g. coding errors), we won't bother with trying CJS

            isAMD = true; // yay!

            // now, parse parms as an actual AMD module...

            const moduleDefine = args.pop(); // always last param
            if (typeof moduleDefine !== 'function') 
                throw new Error(`expecting 'define' to be a function (was ${typeof moduleDefine})`);

            // find out how many deps the moduleDefine function expects
            // WHOAAA: BUT if function uses ...ARGS format (i.e. the spread/rest operator), FUNCTION.LENGTH === 0!!!
            const numDeps = moduleDefine.length; // ...function.length returns how many parms (so, deps) are declared for it

            // WHOAAA, part 2: if numDeps === 0, may mean NO parms, or means ...parms: how to proceed???

            // we allow for either an array of deps (traditional) or just comma-separated parms (for convenience when creating amd modules manually)
            // we're also ok with a mixture of strings and arrays (of strings only), though not clear why that would be the case
            // and we always work backwards on parms (from right to left) to allow for possibility of a module name at the front/leftmost position
            // (as per traditional, in case first/leftmost parm is module's 'name', as is typical of AMD define([mod-name,][...deps,] fcn(...depRefs){}))
            // IF a module name is specified, it remains UNUSED (not needed for modules loaded by URLs)
            // POSSIBLE: if single string parm left (i.e. module name), maybe register it as the module's name also: i.e. as an alias
            // - but what happens if another module wants that name: overwrite? remove both? keep first? keep both?
            // alternative: Array.flat() would be REALLY NICE here, but Edge does NOT support it (as of feb 6, 2019)
            // - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
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


            // BELOW (commented out): this is the module's name (as module author wants it defined, if strictly following AMD define) 
            // - [we're not using it here: code is for reference only]
            // if (args.length === 1 && typeof args[0] === 'string') { ...UNUSED for now...
            //     // maybe set option to use only URLs, URLs AND named defines, or just named defines (if no name, use url)
            //     // to consider: add option in case of conflicts: replace with newer/last-loaded, remove both, keep first (e.g. different url but same name)
            // }

            // resolve dependencies
            privateLoader(subDepResolution, ...externals)
                .then(async depOrDeps => {
                    const resolvedDeps = Array.isArray(depOrDeps) ? depOrDeps : [depOrDeps]; // todo: change this if ALWAYS returning an array
                    const errs = resolvedDeps.filter(dep => dep instanceof Error);
                    if (errs.length > 0) {
                        // resolved dependencies ERRORS will PREVENT AMD Define method from executing
                        // - that's a big difference between AMD modules and ours
                        thisModule.resolved(new ModuleLoadError(`AMD Define method NOT executed because of failed dependencies`, ...errs));
                    }
                    else {
                        try {
                            thisModule.resolved(await moduleDefine(...resolvedDeps));
                        }
                        catch(err) {
                            thisModule.resolved(new ModuleLoadError(`AMD Define method failed`, err));
                        }
                    }
                })
        }

        return { defineMethod, get isAMD() { return isAMD; } };
    }
}

// allows modules loaded by other means to be referenced by all
export function addKnownModule(ref, module, custom = []) {
    // store name as it would be resolved: different (e.g. relative) URLS pointing to same module load only once
    const id = (custom||[]).concat(urlResolvers).find(resolver => resolver.t(ref)).r(ref); // will always find one (because of catch-all)
    addModule(name, new Module({id, module}))
}

const urlResolvers = [

    // resolvers are executed from top-down: higher resolvers take precedence over lower ones
    // custom resolvers get added AHEAD of these so can always override resolvers below

    // for each {resolver}:
    // - t to test if applicable; r to resolve the url; u for url; b for baseUrl (if url is relative)

    // any absolute url is kept as is
    { t: (u,b) => /^(https?[:])?[/][/]/i.test(u), r: (u,b) => u, },

    // name-only urls are considered NPM modules (VERY important note in README.md about NPM-based CDNs)
    { t: (u,b) => /^[a-z_$]/i.test(u), r: (u,b) => `https://cdn.jsdelivr.net/npm/${u}`, }, // see readme.md...

    // our catch all (required for simpler logic in addKnownModule and later on)
    // based on: https://developer.mozilla.org/en-US/docs/Web/API/URL
    { t: (u,b) => true, r: (u,b) => b ? new URL(u, b).href : u, },
];

const loaders = [

    // loaders are executed from top-down: higher loaders take precedence over lower ones
    // custom loaders get added AHEAD of these so can always override loaders below

    // each {loader} has:
    // - t: function that TESTs if loader applies to this TYPE of content
    // - c: function that processes the Content as needed (e.g. loads it as css); then it SHOULD return the [possibly modified] Content

    // custom loaders get added AHEAD of these so can always override loaders below

    { t: t => /css/i.test(t), c: c => (loadCSSCode(c), c) }, 
    { t: t => /json/i.test(t), c: c => JSON.parse(c) }, // ignore parse errors: will be handled later

    // catch all (so there's always a handler: makes for easier logic later)
    { t: t => true, c: c => c } 
];

const mainConfig = {
    baseUrl: window.location.href, 
    globals: ()=>{}, 
    urlResolvers,
    loaders,
};

const publicLoader = privateLoader.bind(null, mainConfig);
publicLoader.config = (cfg = {}) => {
    const fcn = privateLoader.bind(null, Object.assign({}, mainConfig, cfg, {
        loaders: (cfg.loaders||[]).concat(mainConfig.loaders),
        urlResolvers: (cfg.urlResolvers||[]).concat(mainConfig.urlResolvers),
    }));
    fcn.load = fcn; // so can chain in single call loadModule.config({...}).load(...)
    return fcn;
}

// Our main export --------------
export default publicLoader;

// and while we're at it...
addKnownModule('load-dynamic-module', publicLoader);


// keep track of downloading/downloaded modules/dependencies
const alreadyInProgress = {};

async function privateLoader(config, ...args) {

    // each arg is a module reference or actual string data: see readme.md#module-references

    return new Promise(resolveWhenReady => { 

        // NO REJECT CLAUSE: will never fail (but there can be modules that are resolved to Error)
        // - so unloadable modules (e.g. network or syntax errors) are set to the ERROR that made them fail (can test for module instanceof Error)
        // - so reject clause (of Promise above) would NEVER be used

        const {baseUrl, globals, urlResolvers, loaders} = config; // extract config parms

        const downloads = [];
        for (const dep of args) {
            if (typeof dep === 'string') {
                // since [^] matches everything (including newlines), m will ALWAYS match EVERY string
                // so no need to test for m (as in m && ...)
                const m = dep.match(/(\w+[=])?(([a-z]+)([-]data)?[:!])?([^]+)/i), 
                      globalName = m[1] && m[1].slice(0, -1), // to be assigned as window.[globalName]
                      isData = /data/i.test(m[3]) || m[4],
                      data = isData ? m[5] : '',
                      isHttpx = /https?/i.test(m[3]),
                      url = isData ? '' : isHttpx ? (m[3] + '://' + m[5]) : m[5],
                      type = m[3]; // if explicit (here), takes precedence over downloaded content-type

                if (url) { // DOWNLOAD DATA
                    const finalUrl = urlResolvers.find(resolver => resolver.t(url, baseUrl)).r(url, baseUrl);

                    // see if a module and if already there
                    const inProgress = alreadyInProgress[finalUrl];
                    if (inProgress) { 
                        downloads.push(inProgress); // wait for it; may already be downloaded
                    }
                    else {
                        downloads.push(alreadyInProgress[finalUrl] = download(finalUrl)
                            .then(downloaded => ({
                                type: type || downloaded.contentType || extension(finalUrl),
                                data: downloaded.content,
                                globalName,
                                finalUrl, // becomes base for relative-base sub-dependencies
                            }))
                            .catch(err => ({finalVALUE: new DownloadError(`module ${finalUrl} failed to download`, err)})));
                    }
                }
                else { // IMMEDIATE [string-based] DATA
                    downloads.push({ type, data, globalName, }); // may still pass through loaders
                }
            }
            else { // ACTUAL OBJECT
                downloads.push({ finalVALUE: dep }); // all done
            }
        }

        Promise.all(downloads)
            .then(async resolvedDeps => { // an array
                for (const dep of resolvedDeps) {
                    if (!('finalVALUE' in dep)) { 

                        // not already set [note: we test for actual presence (not just test for dep.finalVALUE)
                        // since it may have been resolved using a 'falsey' value]

                        try {
                            // loaders includes [MUST have] a catch-all so always a loader to be found
                            const preProcessed = loaders.find(loader => loader.t(dep.type)).c(dep.data);

                            dep.finalVALUE = (/javascript/i.test(dep.type)) ? (await initializeJavascriptModule(dep.finalUrl, preProcessed)).module
                                                                            : preProcessed;

                            // NOW, can assign to global (if need be)
                            // todo: maybe check (& invalidate) some important globals (e.g. xmlhttprequest, alert/confirm, console, document, ...)
                            // although a module/plugin could always just assign directly UNLESS window object itself is "protected"...
                            dep.globalName && (window[globalName] = dep.finalVALUE);

                            // housekeeping: delete all keys now that we have a final value
                            Object.keys(dep).forEach(k => !/finalVALUE/.test(k) && delete dep[k]);
                        }
                        catch(err) {
                            dep.finalVALUE = err; // an error from its loader (e.g. syntax error)
                        }
                    }
                }

                // finally, 
                try {
                    const mods = resolvedDeps.map(dep => dep.finalVALUE);
                    resolveWhenReady(resolvedDeps.length === 1 ? mods[0] : mods); // todo: always return an array instead?
                }
                catch(err) {
                    resolveWhenReady(err);
                }
            })

        // our private method to load javascript modules in a controlled environment (i.e. using AsyncFunction)
        async function initializeJavascriptModule(moduleUrl, moduleSourcecode) {
            
            // initializeJavascriptModule NEVER FAILS but a module may "resolve" to an Error
            // - so NO 'reject' param/clause as per note above...

            return new Promise(async resolveJSM => { 

                // get existing module (if already loaded), or creates new one
                const module = getModule(moduleUrl); 

                if (module.isLoaded) {
                    resolveJSM(module); // modules are loaded once, then reused
                }
                else if (module.isUnresolved) {
                    module.dependsOnMe(() => resolveJSM(module)); // add myself to its queue (let it know that I need to know when it's ready)
                }
                else { // loading a new module

                    // set up what will happens when it's resolved...
                    module.dependsOnMe(() => resolveJSM(module)); // ...i should be the first in [my own] queue

                    try {
                        // when resolving sub-dependencies, use same config except baseUrl which now reflects asking module
                        const subDepResolution = {baseUrl: moduleUrl, globals, urlResolvers, loaders};

                        // will try it as an amd module
                        const AMD_MODULE = module.genAMDDefine(subDepResolution);

                        const amdProxy = { // for amd modules
                            define: AMD_MODULE.defineMethod,
                            module: undefined,
                            exports: undefined,
                            require(ref) { throw new Error(`cannot 'require' in AMD module ${moduleUrl}:\n\ttry 'await requireAsync("${ref}"' instead`) },
                            requireAsync: async nameOrUrl => await privateLoader(subDepResolution, nameOrUrl), // always returns actual module/err; recursion here
                        };

                        // may also need to try it as a CJS module (if amd fails)
                        const cjsExports = {};
                        const cjsProxy = { // for commonjs modules
                            define: () => { throw new Error('unexpected use of DEFINE in commonJS module')},
                            module: { exports: cjsExports },
                            exports: cjsExports,

                            // resolve dep for CJS module
                            require: async nameOrUrl => await privateLoader(subDepResolution, nameOrUrl), // recursion here
                        }

                        // customize proxies & globals as needed
                        globals(amdProxy, cjsProxy); 
                    
                        // Try as AMD module first because 1) many browser-based modules are AMD/UMD anyway and 2) no need for code manipulation
                        // - MUST pass dummy module/exports/require else would use/fallback on those from global context if any
                        // - Use AsyncFunction in case module code uses async requires
                        // - could initModule.bind(x) but this would change meaning of 'this' within module: default is global/window object
                        //    - this could be a means to protect the window object if needed (e.g. by replacing it with null, or a proxying object)
                        const initModule = new AsyncFunction(...Object.keys(amdProxy), moduleSourcecode);

                        try { 
                            // pass #1: try it as an AMD module first
                            await initModule(...Object.values(amdProxy));
                        }
                        catch(err) {
                            // if was an AMD, consider it resolved (though with errors)
                            AMD_MODULE.isAMD && module.resolved(err);
                            
                            // else, fall through and see if it works with CJS below
                        }

                        if (!AMD_MODULE.isAMD) {
                            if (isCommonJS(moduleSourcecode)) { 
                                // pass #2: less efficient (since 2 passes) but allows for both modes (i.e. amd/umd and cjs) to be imported
                                // BIG CAVEAT: only top-level requires will be honored in cjs; nested requires (within non-async functions) will fail
                                
                                const awaitableCode = commonjsToAwaitRequire(moduleSourcecode);
                                const commonjsInit = new AsyncFunction(...Object.keys(cjsProxy), awaitableCode);
                                try {
                                    await commonjsInit(...Object.values(cjsProxy));
                                    module.resolved((cjsProxy.module || {}).exports || cjsExports);
                                }
                                catch(err) {
                                    module.resolved(new ModuleLoadError(`Failed to load ${moduleUrl} as CJS module`, err));
                                }
                            }
                            else {
                                module.resolved(new ModuleLoadError('module seems to be neither AMD/UMD nor CommonJS'));
                            }
                        }
                    }
                    catch(err) {
                        module.resolved(err); // could be an error with globals(...) [not much else is going on that could trip catch here]
                    }
                }
            });
        }
    });
}
