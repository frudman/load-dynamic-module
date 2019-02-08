// important
// important: see README.md before using - you've been warned! :-)
// important

// misc helpers
import { http as download, AsyncFunction, loadCSSCode } from 'tidbits';//'my-npm-packages/freddy-javascript-utils';

const urlResolvers = [

    // resolvers are executed from top-down: higher resolvers take precedence over lower ones
    // custom resolvers get added AHEAD of these so can always override resolvers below

    // for each {resolver}:
    // - t to test if applicable; r to resolve the url; u for url; b for baseUrl (if url is relative)

    // any absolute url is kept as is
    { t: (u,b) => /^(https?[:])?[/][/]/i.test(u), r: (u,b) => u },


    // // [UNTESTED] UNPKG: see README.md#cdn-issues
    // read: https://portswigger.net/daily-swig/cdn-flaw-left-thousands-of-websites-open-to-abuse
    // { t: (u,b) => /^unpkg[#]/i.test(u), 
    //   r: (u,b) => `https://unpkg.com/${repl(u, ...cdnx)}` }, // see README.md#cdn-issues


    // // [UNTESTED] CDNJS: see README.md#cdn-issues
    // { t: (u,b) => /^cdnjs[#]/i.test(u), 
    //   r: (u,b) => `https://cdnjs.cloudflare.com/ajax/libs/${repl(u, ...cdnx, ...vers)}` }, 


    // // [UNTESTED] JSDELIVR, part 1: see README.md#cdn-issues
    // also read: https://www.jsdelivr.com/features (but requires users to manually add their libraries; not complete and unwieldy)
    // { t: (u,b) => /^jsdelive?r[#]/i.test(u), 
    //   r: (u,b) => `https://cdn.jsdelivr.net/npm/${repl(u, ...cdnx, ...vers)}`, }, // see readme.md...

    // // [UNTESTED] JSDELIVR, part 2: need to append '/' for relative sub-dependencies to work 
    // { t: (u,base) => /jsdelivr.com/i.test(base || ''), 
    //   r: (u,base) => new URL(u, base + '/').href, }, // see README.md#cdn-issues


    // default for name-only urls: consider them NPM modules and use UNPKG as per above
    { t: (u,b) => /^[a-z_$]/i.test(u), r: (u,b) => `https://unpkg.com/${u}`, }, // see readme.md...

    // our catch all (required for simpler logic in addKnownModule and later on)
    // based on: https://developer.mozilla.org/en-US/docs/Web/API/URL
    { t: (u,b) => true, r: (u,b) => b ? new URL(u, b).href : u },
];

// some helpers for CDNs above (jsdelivr, unpkg, cdnjs)
// const cdnx = [/^[^#]+[#]/, '']; // removes cdn prefix (e.g. unpkg#...)
// const vers = [/([^/]+)[@]/, '\\1/']; // change ...pkg@version... to ...pkg/version... (only first '@' and only when no preceding '/')
// const repl = (u,...args) => Array(args.length/2).reduce(now => now.replace(args.shift(), args.shift()), u); // cheap hack...

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
const getModule = id => loadedModules[id] || (loadedModules[id] = new DynamicModule({id})); 
const addModule = (id, module) => loadedModules[id] = new DynamicModule({id, module});

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

// TODO: if change name of this class (e.g. Modulex), does this affect plugin-loader.js???
// PROBABLY YES!!!

class DynamicModule {

    // really just a Module but that name conflicts with ES6 'Module' name used by modern browsers (when loading
    // modules!) - so let's keep it distinct

    constructor({id, module} = {}) {
        id && (this.id = id); // its source URL
        module && (this.module = module); // DO NOT SET IT without actual module (else will break isLoaded below)
    }

    get isLoaded() { return 'module' in this };
    get isUnresolved() { return !!this.waitingOnMe; }

    resolved(m) {
        // set it (isLoaded will now always be true)...
        this.module = m; // m can be an actual module OR an Error if loading failed

        // UNCOMMENT (below) to give users a hint of a likely issue when loading CJS modules:
        // if (m instanceof Error && m.name === 'SyntaxError' && /await.+async.+function/i.test(m.message || ''))
        //     m.message = `${this.id} may be CJS module with nested requires\n\t(nested requires must be inside async functions)\n\toriginal error: ${m.message}`)
        
        // ...then, let dependents know
        (this.waitingOnMe || []).forEach(resolveDep => resolveDep());
        delete this.waitingOnMe; // good housekeeping: why not...
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
            this.resolved(new ModuleLoadError(`likely cycle in module resolution for ${this.id} (depth=${deps.length})`));
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
                throw new ModuleLoadError(`expecting 'define' to be a function (was ${typeof moduleDefine})`);

            // SIMPLE STRATEGY 1: implement as AMD wants
            const externals = args.pop() || [];
            if (!Array.isArray(externals))
                throw new ModuleLoadError(`expecting '[dependencies]' to be an array (was ${typeof externals})`);

            /* More involved Strategy 2 (unused for now)
                // find out how many deps the moduleDefine function expects
                // WHOAAA: BUT if function uses ...ARGS format (i.e. the spread/rest operator), FUNCTION.LENGTH === 0!!!
                const numDeps = moduleDefine.length; // ...function.length returns how many parms (so, deps) are declared for it

                // WHOAAA, part 2: if numDeps === 0, may mean NO parms, or means ...parms: how to proceed???
                // if (numDeps === 0 && args.length > 0)
                //     throw new ModuleLoadError(`define method takes no parms but some dependencies declared\n\t[possible issue: 'define(...parms){}' declaration format NOT supported]`); // give users a hint

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
                                throw new ModuleLoadError(`invalid dependency in AMD module definition - can only be a string (got type=${typeof nd})`);
                        }
                    }
                    else 
                        throw new ModuleLoadError(`invalid dependency in AMD module definition - can only be a string or an array of strings`);
                }
            */

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
    addModule(name, new DynamicModule({id, module}))
}

const mainConfig = {
    baseUrl: window.location.href, 
    globals: ()=>{}, 
    urlResolvers,
    loaders,

    useStrict: true, // forces strict mode (recommended): prepends '"use strict";\n\n' before loading modules
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

        const {baseUrl, globals, urlResolvers, loaders, useStrict} = config; // extract config parms

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
                    else (function(requestUrl) { // close over finalUrl for this download...
                        // ...since next loop may come around (and change finalUrl above) before this download is complete

                        // since a CONST cannot be changed (or shared past the end of its block),
                        // it's likely that it's closed within EACH iteration of a loop (else would have its value
                        // change on each iteration, which is illegal; not so for let variables, so an issue there? tbi)
                        // so (function()) closing here is probably not needed

                        downloads.push(alreadyInProgress[requestUrl] = download(requestUrl)
                            .then(downloaded => {
                                const actualUrl = (downloaded.responseURL === requestUrl) ? requestUrl : downloaded.responseURL;
                                if (actualUrl !== requestUrl) {
                                    // initial url was redirected (e.g. 301, 302) by server (e.g. unpkg.com servers when not specifying version or file)
                                    alreadyInProgress[actualUrl] = alreadyInProgress[requestUrl]; // module reachable from either url
                                }
                                return {
                                    type: type || downloaded.contentType || extension(actualUrl),
                                    data: downloaded.content,
                                    globalName,
                                    actualUrl, // becomes base for relative sub-dependencies
                                }
                            })
                            .catch(err => ({finalVALUE: new DownloadError(`module ${requestUrl} failed to download`, err)})));
                    })(finalUrl); // tbi: are const within for loops closed with each iteration (like their const loop variables)
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
                            const asLoaded = loaders.find(loader => loader.t(dep.type)).c(dep.data);

                            // final value is as loaded above unless it's a javascript module...
                            dep.finalVALUE = (/javascript/i.test(dep.type)) ? (await initJSModule(dep.actualUrl, asLoaded)).module : asLoaded;

                            // NOW, can assign to global (if need be)
                            // todo: maybe check (& invalidate) some important globals (e.g. xmlhttprequest, alert/confirm, console, document, ...)
                            // although a module/plugin could always just assign directly UNLESS window object itself is "protected"...
                            dep.globalName && (window[dep.globalName] = dep.finalVALUE);

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

        async function initJSModule(moduleUrl, moduleSourceCode) {
            
            // this method NEVER FAILS but a module may "resolve" to an Error
            // - so NO 'reject' param/clause as per note above...

            return new Promise(async resolveJSM => { 

                // basic safety & better performance: is that safe for every module?
                useStrict && (moduleSourceCode = '"use strict";\n\n' + moduleSourceCode);

                // get existing module (if already loaded), or creates new one
                const module = getModule(moduleUrl); 

                const modID = `module[${moduleUrl}]`;

                if (module.isLoaded) {
                    resolveJSM(module); // modules are loaded once, then reused
                }
                else if (module.isUnresolved) {
                    module.dependsOnMe(() => resolveJSM(module)); // add myself to its queue (let it know that I need to know when it's ready)
                }
                else { // loading a new module

                    // set up what will happens when i'm resolved: i should be the first in [my own] queue...
                    module.dependsOnMe(() => resolveJSM(module)); // ...to resolve whoever requested me (i.e. resolveJSM)

                    // when resolving sub-dependencies, use same config except baseUrl which now reflects asking module
                    const subDepResolution = {baseUrl: moduleUrl, globals, urlResolvers, loaders, useStrict};

                    // will try it first as an amd module
                    const AMD_MODULE = module.genAMDDefine(subDepResolution);

                    const amdProxy = { // for amd modules
                        define: AMD_MODULE.defineMethod,
                        module: undefined,
                        exports: undefined,
                        require(ref) { throw new ModuleLoadError(`cannot 'require' in AMD ${modID}:\n\ttry 'await requireAsync("${ref}"' instead`) },
                        requireAsync: async nameOrUrl => await privateLoader(subDepResolution, nameOrUrl), // recursion here
                    };

                    // may also need to try it as a CJS module (if amd fails)
                    const cjsExports = {};
                    const cjsProxy = { // for commonjs modules
                        define: () => { throw new ModuleLoadError(`unexpected use of DEFINE in commonJS ${modID}`)},
                        module: { exports: cjsExports },
                        exports: cjsExports,

                        // resolve dep for CJS module
                        require: async nameOrUrl => await privateLoader(subDepResolution, nameOrUrl), // recursion here
                    }

                    try {
                        globals(amdProxy, cjsProxy); // customize proxies & globals as needed
                    }
                    catch(err) {
                        return module.resolved(new ModuleLoadError(`globals initialization problem with ${modID}`, err)); 
                    }
                    
                    // Try as AMD module first because 1) many browser-based modules are AMD/UMD anyway and 2) no need for code manipulation
                    // - MUST pass dummy module/exports/require else would use/fallback on those from global context if any
                    // - Use AsyncFunction in case module code uses async requires
                    // - could initModule.bind(x) but this would change meaning of 'this' within module: default is global/window object
                    //    - this could be a means to protect the window object if needed (e.g. by replacing it with null, or a proxying object)
                    const initModule = new AsyncFunction(...Object.keys(amdProxy), moduleSourceCode);

                    try { 
                        // pass #1: try it as an AMD module first
                        const nonAMDResult = await initModule(...Object.values(amdProxy));

                        // no errors
                        // if amd, we're done
                        // if NOT amd: are we done? yes, if no errors?

                        // can we have a CJS module that does not refer to module or exports?
                        // - in which case, strictly for side effects? but if so, that's ok for us then, right? same deal as non-amd/non-cjs module

                        if (AMD_MODULE.isAMD) {
                            // we're done: module was already resolved through define method
                        }
                        else {
                            // no errors, so not an AMD module but also not likely a CJS module (no references to module.exports or require)
                            // so assume a valid module run for its side-effects (e.g. api calls) that is neither amd nor cjs
                            module.resolved(nonAMDResult); // if anything returned; all actions may have been set in code itself (e.g. api...)
                        }
                    }
                    catch(err) {
                        if (AMD_MODULE.isAMD)
                            module.resolved(new ModuleLoadError(`AMD ${modID} error`, err)); // consider it resolved (albeit with errors)
                        else if (isCommonJS(moduleSourceCode)) { 

                            // pass #2: 2 passes is less efficient but allows for both modes (i.e. amd/umd and cjs) to be tried/imported
                            // BIG CAVEAT: only top-level requires will be honored in cjs; nested requires (within non-async functions) will fail
                            
                            try {
                                const awaitableCode = commonjsToAwaitRequire(moduleSourceCode);
                                const commonjsInit = new AsyncFunction(...Object.keys(cjsProxy), awaitableCode);

                                await commonjsInit(...Object.values(cjsProxy));
                                module.resolved((cjsProxy.module || {}).exports || cjsExports);
                            }
                            catch(err) {
                                module.resolved(new ModuleLoadError(`Failed to load ${modID} as CommonJS`, err));
                            }
                        }
                        else {
                            module.resolved(new ModuleLoadError(`${modID} initialization problem`, err));
                        }
                    }
                }
            });
        }
    });
}

/* reference for future exploration: loading modules using <script type=module> techniques

    A big issue with our strategy is that we always wrap downloaded code inside a Function/AsyncFunction
    for the dynamic module's initialization:
    - this permits passing global variables available to module's initialization
    - BUT, this prevent ES6 usage of 'import/export' statements since those CANNOT be used within functions

    todo: find a way to 'detect' pure ES6 modules
          ...then, find way to import them as is (i.e. no transpilation required)

    becomes a 3rd way to try and load module (1st 2 are amd, cjs)
    - either with pure eval() OR create <script type=module> tag and add to body

    issues with ES6 modules: import 'x'; what is x? relative to page/website? or NPM module? but then, from where?
    - probably should be controlled from website, so possibly a 302/redirect or just direct download from website (from
      its own node_modules folder)

    note: eval does NOT support import/export syntax so can't use it to load es6 module

    Closest to this will be dynamic imports: import(url).then(...)
    - but not currently supported in Firefox (experimental with manual switch) or Edge (no timeline)

    

    // method below "works" but no way to extract resulting module (so, not really loading a module)

    async function loadAsScript({url, code, type = 'module'}) {

        // used to load code directly as script
        // in particular, works for ES6 modules (i.e. which use non-transpiled import/export statements)

        // with this method, use either url or code (code used if both specified)

        // read: https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement#Dynamically_importing_scripts

        // LOTS OF ISSUES with loading js code using <script> technique (below)

        // BIGGEST ISSUE: script "result" (i.e. the module, or its exports) is NOT accessible
        //                to the outside world: there is no way to IMPORT whatever the module
        //                is exporting. So no easy way to load individual modules for composition/usage
        //                by other modules (e.g. a plugin system)

        // Other issues:
        //  - scripts load in full context of app
        //      - could be good (if trusted scripts) or not
        // - CANNOT set GLOBALS as per Function/AsyncFunction except by setting them VIA 'window.'
        // - maybe that's not so bad

        return new Promise((resolve,reject) => {

            // required for both methods
            const body = document.body;//getElementsByTagName('body')[0];
            const script = document.createElement('script');
            script.type=type;//.setAttribute('type', type); // must be 'module' if js code uses import/export

            // make it unique (in case used for window/global custom onload method)
            const scriptID = ('module_' + Math.random() ).replace(/[^a-z0-9_]+/ig,'');
            // script.id = scriptID;//.setAttribute('id', scriptID); // must be 'module' if js code uses import/export

            function getModuleResults() {
                console.log('ES6 Module resolving to x', script, script.module, script.exports);
                resolve(script);
            }

            script.onerror = function(...args) {

                // REGARDLESS of method: will be called on ANY code execution error
                console.log('JAVSCRIPT MODULE LOAD ERROR', url || code, args, ';;;');
                reject(new Error(`ES6 Module loaded but has errors`));
            }

            if (code) { // favor this one (if both specified) since code already downloaded

                // only onerror can be triggered (never onload) so no 'native' way to know it finished loading
                // our workaround is to explicitly append our we-b-done method
                // will NOT work if code does not execute till the end (e.g. a top-level return)

                // will need a window/global name for callback
                const customOnLoad = scriptID + '_loading_complete';

                // so required to know when initialization code ends
                window[customOnLoad] = () => {
                    //console.log('ES6 Module loaded OK, looks like it worked!', url || code);
                    getModuleResults();
                }

                // then (only onerror can be triggered so append our custom onload)...
                script.appendChild(document.createTextNode(`"use strict";\n\n${code}\n\n;${customOnLoad}()`));
            }
            else { // uses src attribute (browser will do the download)

                // required: to know when loaded
                script.onload = function(...args) {
                    
                    // CALLED (after execution) if using src=url (and code is good)
                    // NOT CALLED when loading via srcCode

                    //console.log('ES6 MODULE ONLOAD CALLED: well, something happened', args, ';;;');
                    getModuleResults();
                }

                // both onload and onerror can be triggered
                script.setAttribute('src', url); 
            }

            // trigger loading process...
            body.appendChild(script);
        });
    }
*/