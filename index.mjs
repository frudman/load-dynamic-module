
// NOT FULLY TESTED
// NOT FULLY TESTED
// NOT FULLY TESTED
// NOT FULLY TESTED: especially when modules have conflicting/cyclical dependencies (seems to work so far but NOT FULLY TESTED)
// NOT FULLY TESTED
// NOT FULLY TESTED
// NOT FULLY TESTED

// you've been warned! :-)

// PROBLEM: when resolving relative URLs into absolute URLs (by appending '/'):
// if base = /noty & rel = ./lib/style.css, result is: /noty/lib/style.css
// if base = /noty/file.js & rel = ./lib/style.css, result is: /noty/file.js/lib/style.css [ERROR]
// if base = /noty/file.js & rel = ../lib/style.css, result MIGHT BE: /noty/lib/style.css [NEED TO TEST]


// MUST DOCUMENT: GLOBALS allowed to be defined ahead of a module's initialialization
// - can define custom globals
// - can 'protect' framework code: e.g. redefine window. or console. or alert/confirm


// read: https://developers.google.com/web/fundamentals/primers/modules 
//  - https://developers.google.com/web/updates/2017/11/dynamic-import
//  - https://www.sitepoint.com/using-es-modules/
// also: https://curiosity-driven.org/minimal-loader
// also: https://michelenasti.com/2018/10/02/let-s-write-a-simple-version-of-the-require-function.html
// also: https://davidwalsh.name/javascript-loader
// also: https://www.davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/

// read: https://hackernoon.com/7-different-ways-to-use-es-modules-today-fc552254ebf4

// dynamic import() is NOT SUPPORTED by most modern browsers:
// - as of jan 21, 2019: edge=no, firefox=no, chrome=yes, safari=yes
// - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import

/*
    url
    name=url // download and loads as css or json-param
    name=http://url // same as
    name=//url
    name=./relative/url
    name=data:...plain text data...
    name=text-data:... load and assign (same as above)
    name=json-data:... load and assign as object
    name=json:url
    name=css:url
    name
    css:url // loaded
    json:url // param
    text:url // param always (even if text or css)


    'url' // downloaded as abs; then, if css-loaded; if json, kept for param (need function); if JS, kept for exec later
    'name=url', // assign to windows download to windows; if css, loaded first
    'name=raw!data' // assign text data as name
    'name=raw-json!data' // load as json, assign to name
    'raw-json!data'
    'json!url' // usable only if a function is specified else no purpose
    'css!url'
    'data!url' 
    
    // for each arg:
    //      if url, download; mark spot to place
    //      if data, mark spot
    // when all downloaded:
    //      exec all non-data (css, js, json)
    //          replace in their spot
    // if function at end:
    //      exec with spots
*/

// data means 'right there, no download'
// so http-data is meaningless

// http://url
// http-data:??? [download as text?]
// https-data:??? [download as text?]
// text:url [download and use as-is]
// raw:url [download and use as-is]
// css:url
// json:url
// data:... [same as text-data; do nothing with data]
// css-data:... [loads as style]
// json-data:... [convert to obj]

/*
    docs (todo: move to readme)

    - '[name=]string...' -> loads from unpkg
    - '[name=]./string...' -> loads relative to base url
    - '[name=]http://...', '[name=]https://...', '[name=]//...' loads directly from absolute url (also becomes base url for sub-dependencies)
    - object { main, css, json, text, base } // script? loaded as script instead of function
        - main: js code (downloaded first, executed last)
            - if array, executed left-to-right
        - css: downloaded first, loaded into page/doc
        - json/text: downloaded next
        - data/img: ???

    - if [name=], result (or data) assigned to window.name
    - if last param is function(dep1,dep2,...)
        - num dep parms must match num prior args
        - each prior arg's value becomes matching dep
        - function executed last (same as an AMD define call)

    - if download content-type or url extension is:
        - application/javascript, will be executed
        - /css: will be loaded as style
        - all others downloaded and used as parmDep, window.name=, or kept as its module name for later use
            - /json: will be loaded as data (then used as parmDep, window.name=, or kept as its module name for later use)
            - text/: try to decode? or keep as text data?
            - binary: ? image? stream? (video, audio? pdf? other) how to keep, how to use

    - AMD define depends on module being pre-bundled/packaged
    - our loadModule allows for "manual define" to be done on-the-fly
*/

// our method used to actually download modules
import { http as download, AsyncFunction } from 'tidbits';//'my-npm-packages/freddy-javascript-utils';//'tidbits';

// convert commonjs 'require' (implicitly sync) to 'await require' (explicit async)
// - WORKS ONLY FOR top-level requires since nested requires (i.e. within a function) will fail 
//   with a syntax error (unless that function itself was already marked async)
const commonjsToAwaitRequire = cjs => cjs.replace(/\brequire\s*[(]/g, 'await require(');

// quick way to see if code MIGHT be commonjs
const isCommonJS = code => /module[.]exports/.test(code); 

// convert a dependency reference to an http-gettable url
function defaultUrlResolver(requestedUrl, baseURL) {

    // - if ([0] === '.') or ([0]==='/'&&[1]!=='/') it's relative to window.location.href

    // convert '//url...' to 'https://url...'
    // most (all?) browsers will do that conversion implicitly: should we comment out?
    //requestedUrl = requestedUrl.replace(/^[/][/]/, location.protocol + '//'); // location.protocol includes a trailing ':'

    if (/^(https?[:])?[/][/]/i.test(requestedUrl)) 
        return requestedUrl; // explicit url so leave it alone

    // MAJOR ISSUES with UNPKG CDN: was broken for a few days before/during Feb 4, 2019
    // (and a few times in prior months/years for a variety of reasons: bugs, upgrades, ...)

    // SO, we decided to use cdn.jsdelivr.net CDN instead
    // - documentation: https://www.jsdelivr.com/features

    // one benefit: automatically serves content WITHOUT redirects even when not specifying exact versions (i.e. server-side redirection)
    // another: add .min to cs/js files and will ALWAYS serve minified (if not already minified, jsdelivr will minify for you: may be slower initially)

    /* another alternative:
        read: https://github.com/tiencoffee/requirejs/blob/master/require.js
        - uses yet another CDN: cdnjs.cloudflare.com
        - format seems to be: https://cdnjs.cloudflare.com/ajax/libs/[LIB_NAME_HERE]/[VERSION.HERE]/[FILE-NAME.HERE]
        - e.g. https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.22/vue.common.js

        // based on: https://cdnjs.com/api
        // const cdnjs = what => `https://api.cdnjs.com/${what}`,
        //       search = name => cdnjs(`libraries?search=${name}`), // .results = [], .total = number; each result: { .name, .latest: file-url-of-latest-version (presumably minifiled)}
        //       lib = name => cdnjs(`libraries/${name}`), // .name, .filename, .assets = [{ .version, .files=[ 'core.js', 'jquery.js', 'jquery.min.js',... ]}...]
        //       libv = name => cdnjs(`libraries/${name}?fields=name,filename,version`);
    */

    if (/^[a-z_$]/i.test(requestedUrl)) // a.k.a. a "bare import" in CJS parlance (i.e. /node_modules/...)
        //return `https://unpkg.com/${requestedUrl}`; // simple name so use NPM (via unpkg)
        return `https://cdn.jsdelivr.net/npm/${requestedUrl}`; // simple name so use NPM (via unpkg)

    // based on: https://developer.mozilla.org/en-US/docs/Web/API/URL
    return baseURL ? new URL(requestedUrl, baseURL).href : requestedUrl;
}

const extension = str => (str||'').split('.').pop(); // very crude; also, dot is not included
// a more "accurate" (or complete) method (but more code)
//const extension = (str, keepDot = false) => ((str||'').match(/[.][^.]*$/)||[''])[0].substring(keepDot ? 0 : 1);

// we keep the 'private static' field loadedModules as a separate const because,
// even if we could have it as a class field (es10+?) and build it using @babel/plugin-proposal-class-properties, 
// bundlephobia (https://bundlephobia.com/result?p=load-dynamic-module) doesn't seem
// to recognize that plugin or the build steps (returns with build error)
const loadedModules = {};

// cheap means to ensure no infinite loop while resolving dependencies
const MAX_LIKELY_NUMBER_OF_DEPENDENTS = 20; 
class Module {

    // static loadedModules = {}; 

    static getModule(name) {
        //return Module.loadedModules[name] || (Module.loadedModules[name] = new Module({name}));
        return loadedModules[name] || (loadedModules[name] = new Module({name}));
    }

    static addModule(name, module) {
        //Module.loadedModules[name] = new Module({name, module});
        loadedModules[name] = new Module({name, module});
    }

    constructor({name, module} = {}) {
        this.name = name; // its source URL
        this.module = module;
    }

    get isLoaded() { return this.module || this.err; }
    get isUnresolved() { return !this.isLoaded && !!this.resolveMe; }

    resolved(m) {
        this.module = m; 
        this.publicizeResolution();
    }

    resolvedWithError(err) {
        this.err = err;

        // try to give a friendly hint: e.g. from chrome: 'await is only valid in async function'
        if (err.name === 'SyntaxError' && /await.+async.+function/i.test(err.message || ''))
            console.warn(`${this.name} may be CJS module with nested requires\n\t(nested requires must be inside async functions)`)
        else
            console.error(`${this.name} module was not loaded`, err);

        this.publicizeResolution();
    }

    publicizeResolution() {
        // first...
        this.resolveMe();
        delete this.resolveMe; // why not...

        // ...then, let dependents know
        (this.waitingOnMe || []).forEach(resolveDep => resolveDep());
        delete this.waitingOnMe; // why not...
    }

    dependsOnMe(resolveDependent) {

        // 2 ways to do this:
        // - check for cycles: need to know dependent perent<-->child relationships for that
        //      - most efficient, most "correct", most work, but only useful if cycles (which should never be the case, otherwise it's an error)
        // - just allow for maximum number of dependents; if more, assume it's because of a cycle
        //      - simplest implementation
        //      - less efficient: runs extra cycles before notices error; and limit may be less than a legitimate case may have
        //      - BUT, in case where no ACTUAL errors (most of the time; should be ALL of the time), FASTEST! EASIEST! SIMPLEST!
        
        const deps = this.waitingOnMe || (this.waitingOnMe = []);
        deps.push(resolveDependent);

        if (deps.length > MAX_LIKELY_NUMBER_OF_DEPENDENTS)
            this.resolvedWithError(new Error(`likely cycle in module resolution for ${this.name} (depth=${deps.length})`));
    }

    genAMDDefine(subDepResolution) {

        const thisModule = this; // self ref for within amdDefine below

        // IMPORTANT: all AMD modules test for 'define.amd' being 'truthy'
        //            but some (e.g. lodash) ALSO check that "typeof define.amd == 'object'" so...
        defineMethod.amd = {}; // ...use an object (truthy) NOT just 'true'

        // keep track of whether or not our define method was actually called...
        var isAMD = false; // ...because if not called, likely NOT an AMD module
        function defineMethod(...args) {
            isAMD = true; // yay!

            const moduleDefine = args.pop(); // always last param
            if (typeof moduleDefine !== 'function') 
                throw new Error(`expecting 'define' to be a function (was ${typeof moduleDefine})`);

            // find out how many deps the moduleDefine function expects
            // WHOAAA: BUT if function uses ...ARGS format (i.e. the spread/rest operator), FUNCTION.LENGTH === 0!!!
            const numDeps = moduleDefine.length; // ...function.length returns how many parms (so, deps) are declared for it

            // if numDeps === 0, may mean NO parms, or means ...parms: how to proceed???

            // we allow for either an array of deps (traditional) or just comma-separated parms (for convenience when creating amd modules manually)
            // we're also ok with a mixture of strings and arrays (of strings only), though not clear why that would be the case
            // and we always work backwards on parms (from right to left) to allow for possibility of a module name at the front/leftmost position
            // (as per traditional, in case first/leftmost parm is module's 'name', as is typical of AMD define([mod-name,][...deps,] fcn(...depRefs){}))
            // IF a module name is specified, it remains UNUSED (not needed for modules loaded by URLs)
            // POSSIBLE: if single string parm left (i.e. module name), maybe register it as the module's name also: i.e. as an alias
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


            // this is the module's name (as module author wants it defined) [we're not using it here: code is for reference only]
            // if (args.length === 1 && typeof args[0] === 'string') { ...UNUSED for now...
            //     // use it? 
            //     // maybe set option to use only URLs, URLs AND named defines, or just named defines (if no name, use url)
            //     // to consider: add option in case of conflicts: replace with newer/last-loaded, remove both, keep first (e.g. different url but same name)
            // }

            // resolve dependencies
            privateLoader(subDepResolution, ...externals, (...resolvedDeps) => {
                try {
                    thisModule.resolved(moduleDefine(...resolvedDeps.map(dep => dep.module))); // could fail (if not [correct] AMD)
                }
                catch(err) {
                    thisModule.resolvedWithError(err); // if not AMD, or some other error...
                }
            });
        }

        return { defineMethod, get isAMD() { return isAMD; } };
    }
}


// allows modules loaded by other means to be referenced by all
export function addKnownModule(ref, module, resolveUrl = defaultUrlResolver) {

    // store name as it would be resolved so if different relative URLS point to same module,
    // that module is loaded only once

    const name = resolveUrl(ref);
    Module.addModule(name, new Module({name, module}))
}

const handlers = [
    // each handler has:
    // - .m, a regular expression test if handler applies to a particular type/content-type
    // - .h, the handler that handles the content (e.g. loads it as css) then returns [possibly modified] content
    { 
        m: /css/i, 
        h: content => addCSS(content)
    },
    { 
        m: /json/i, 
        h: content => JSON.parse(content) // ignore errors: will be handled later
    },

    // keep for last because 'text/' is part of others (e.g. text/css)
    { 
        m: /text|data/i, // should we make this a catch all? (except for javascript)
        h: content => content
    },
];

// todo: make it easier to enhance urlResolver & handlers (instead of overriding all, as per below)

const mainConfig = {
    baseUrl: window.location.href, 
    globals: ()=>{}, 
    urlResolver: defaultUrlResolver,
    handlers,
};


const publicLoader = privateLoader.bind(null, mainConfig);
publicLoader.config = cfg => privateLoader.bind(null, Object.assign({}, mainConfig, cfg)); // another function

export default publicLoader;

addKnownModule('load-dynamic-module', publicLoader); // self: trivial case


function addCSS(cssCode) {
    const head = document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.appendChild(document.createTextNode(cssCode));
    head.appendChild(style);
    return cssCode; // just a cheap hack for css handler above :-)
}

// keep track of downloading/downloaded modules/dependencies
const alreadyInProgress = {};

async function privateLoader(config, ...args) {

    // NO REJECT CLAUSE: will never fail (but there can be modules that are resolved to Error)
    // - so unloadable modules (e.g. network or syntax errors) are set to undefined (module.err contains reason)
    // - so reject clause (of Promise below) is NEVER used

    return new Promise(resolveWhenReady => { 

        const {baseUrl, globals, urlResolver, handlers} = config; // extract config parms

        // for when all is said & done...
        const onReady = (args.length && typeof args[args.length-1] === 'function') ? args.pop() : undefined;

        const downloads = [];
        for (const dep of args) {
            if (typeof dep === 'string') {
                const m = dep.match(/(\w+[=])?(([a-z]+)([-]data)?[:!])?([^]+)/i), // [^] matches everything including newlines
                      globalName = m && m[1] && m[1].slice(0, -1), // to be assigned as window.[globalName]
                      isData = m && (/data/i.test(m[3]) || m[4]),
                      data = isData ? m[5] : '',
                      isHttpx = m && /https?/i.test(m[3]),
                      url = isData ? '' : isHttpx ? (m[3] + '://' + m[5]) : m[5],
                      type = m[3]; // if explicit (else get from downloaded content's type)

                if (url) { // DOWNLOAD DATA
                    const finalUrl = urlResolver(url, baseUrl);

                    // see if a module and if already there
                    const inProgress = alreadyInProgress[finalUrl];
                    if (inProgress) { 
                        downloads.push(inProgress); // just wait for it...
                    }
                    else {
                        downloads.push(alreadyInProgress[finalUrl] = download(finalUrl)
                            .then(downloaded => ({
                                type: type || downloaded.contentType || extension(finalUrl),
                                data: downloaded.content,
                                globalName,
                                finalUrl, // becomes base for relative-base sub-dependencies
                            }))
                            .catch(err => ({downloadErr: err})));
                    }
                }
                else { // IMMEDIATE DATA
                    downloads.push({ type, data, globalName, });
                }
            }
            else { // ACTUAL OBJECT
                downloads.push({ data: dep }); // all done
            }
        }

        Promise.all(downloads)
            .then(async resolvedDeps => { // an array
                // first, do all non-js deps
                for (const dep of resolvedDeps) {
                    if (dep.downloadErr) {
                        dep.VALUE = dep.downloadErr; // is that a reasonable thing?
                        // in module, can test with 'dep instanceof Error'?
                    }
                    else {
                        // handlers should NEVER find one for javascript because those must be handled in subsequent step
                        try {
                            const handler = handlers.find(hndlr => hndlr.m.test(dep.type)); 
                            dep.VALUE = handler ? handler.h(dep.data, dep) : dep.data;      
                        }
                        catch(err) {
                            dep.VALUE = err; // really should not be here...
                        }

                        // todo: maybe check (& invalidate) some important globals (e.g. xmlhttprequest, alert/confirm, console, document, ...)
                        // although a module/plugin could always just assign directly...
                        dep.globalName && (window[globalName] = dep.VALUE);    
                    }
                }

                // next, do all js deps (modules)
                for (const dep of resolvedDeps) {
                    if (/javascript/i.test(dep.type)) {
                        dep.VALUE = (await loadJavascriptModule(dep.finalUrl, dep.data)).module; // may already be resolved
                    }
                    // else: should have been handled in first loop, right?
                }

                // finally, 
                try {
                    resolveWhenReady(onReady && onReady(...resolvedDeps.map(dep => dep.VALUE)));
                }
                catch(err) {
                    resolveWhenReady(err);
                }
            })

        // method to load javascript modules in a controlled environment (i.e. using AsyncFunction)
        async function loadJavascriptModule(moduleUrl, moduleSourcecode) {
            
            // code is ALWAYS javascript BUT may be AMD/UMD or CommonJS: we don't know yet

            return new Promise(async resolveJSM => { // NO 'reject' param/clause as per note above...

                // get existing module (if already loaded), or creates new one
                const module = Module.getModule(moduleUrl); 

                if (module.isLoaded) {
                    resolveJSM(module); // modules are loaded once, then reused
                }
                else if (module.isUnresolved) {
                    module.dependsOnMe(() => resolveJSM(module)); // queue request
                }
                else { // loading a new module

                    // set up what will happens when it's resolved
                    module.resolveMe = () => resolveJSM(module);

                    try {
                        // when resolving sub-dependencies; FROM original configuration except for baseUrl
                        const subDepResolution = {baseUrl: moduleUrl, globals, urlResolver, handlers};

                        // will try it as an amd module
                        const AMD_MODULE = module.genAMDDefine(subDepResolution);

                        const amdProxy = { // for amd modules
                            define: AMD_MODULE.defineMethod,
                            module: undefined,
                            exports: undefined,
                            require(ref) { throw new Error(`cannot 'require' in AMD module ${moduleUrl}:\n\try 'await requireAsync("${ref}"' instead`) },
                            requireAsync: async nameOrUrl => (await privateLoader(subDepResolution, nameOrUrl)).module, // recursion here
                        };

                        // may also need to try it as a CJS module (if amd fails)
                        const cjsExports = {};
                        const cjsProxy = { // for commonjs modules
                            define: () => { throw new Error('unexpected use of DEFINE in commonJS module')},
                            module: { exports: cjsExports },
                            exports: cjsExports,

                            // resolve dep for CJS module
                            require: async nameOrUrl => (await privateLoader(subDepResolution, nameOrUrl)).module, // recursion here
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
                            AMD_MODULE.isAMD && module.resolvedWithError(err);
                            
                            // else, fall through and see if it works with CJS below
                        }

                        if (!AMD_MODULE.isAMD) {
                            if (isCommonJS(moduleSourcecode)) { 
                                // pass #2: yes, less efficient (since 2 passes) but allows for both modes (i.e. amd/umd and cjs) to be imported
                                // BIG CAVEAT: only top-level requires will be honored in cjs; nested requires (within non-async functions) will fail
                                
                                const awaitableCode = commonjsToAwaitRequire(moduleSourcecode);
                                const commonjsInit = new AsyncFunction(...Object.keys(cjsProxy), awaitableCode);
                                await commonjsInit(...Object.values(cjsProxy));
                                module.resolved((cjsProxy.module || {}).exports || cjsExports);
                            }
                            else {
                                module.resolvedWithError(new Error('module seems to be neither AMD/UMD nor CommonJS'));
                            }
                        }
                    }
                    catch(err) {
                        module.resolvedWithError(err);
                    }
                }
            });
        }
    });
}
