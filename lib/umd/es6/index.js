(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);


var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _tidbits = require("tidbits");

var _extractRequire = require("./extract-require");

// important
// important: see README.md before using - you've been warned! :-)
// important
// Ability to dynamically load code/css/json without ANY need for <link> or <script> tags
// document that a module name can be used as its base reference
// - so 'axios=axios/dist/axios.min.js' will now allow 'axios' to be used directly
// - problem is if a module name matches a window property name (e.g. alert)

/*
    TODO: seriously consider switching to JSDELIVR.NET (from unpkg.com)
          because (as of Feb 2019) unpkg seems to have reliability issues (http 50x & 40x) [growing pains?]
          (see: https://w3techs.com/technologies/comparison/cd-jsdelivr,cd-unpkg)
          jsdelivr docs: https://www.jsdelivr.com/features
          - may affect relative-name dependency resolution (jsdelivr does redirects differently)
          - jsdelivr may be best when using amd explicitly, and specifying actual
            paths (e.g. 'axios/dist/axios.min.js' instead of 'axios')

    if/when moving over to jsdelivr, use tests below for url resolution
    hint: we want LAST ONE...

    testx('https://cdn.jsdelivr.net/npm/axios', './lib/subdep.js', 'https://cdn.jsdelivr.net/npm/axios/lib/subdep.js');
    testx('https://cdn.jsdelivr.net/npm/axios/index.js', './lib/subdep.js', 'https://cdn.jsdelivr.net/npm/axios/lib/subdep.js');
    testx('https://cdn.jsdelivr.net/npm/axios/', './lib/subdep.js', 'https://cdn.jsdelivr.net/npm/axios/lib/subdep.js');

    function testx(base, relDep, want) {
        var cj = 0;
        function trii(url) {
            log('URLX' + (++cj), url.href === want ? '[OK]' : '', url.href);
        }

        log('URLX using base=' + base, '   relUrl=' + relDep, '   want=' + want);

        trii(new URL(relDep, base)); // can fail
        trii(new URL(relDep, base+'/')); // can fail
        trii(new URL(relDep, base.replace(/[/][^/]+?[.][^./]+$/, ''))); // can fail

        // LAST ONE:
        // remove last part if it looks like a file (i.e. has an extension); else keep it
        // CAVEAT: this will fail if filename is extension-less
        trii(new URL(base.replace(/([/][^/]+?[.][^./]+|[/])$/, '') + '/' + relDep)); // OK: https://cdn.jsdelivr.net/npm/axios/lib/subofios
    }
*/
// misc helpers
//'my-npm-packages/freddy-javascript-utils';
const urlResolvers = [// resolvers are executed from top-down: higher (earlier) resolvers take precedence over 
// lower (later) ones. custom resolvers get added AHEAD of these built-ins (below) so can always 
// override them
// for each {resolver}:
// - t to test if applicable; r to resolve the url; u for url; b for baseUrl (if url is relative)
// absolute urls are kept as-is
{
  t: (u, b) => /^(https?[:])?[/][/]/i.test(u),
  r: (u, b) => u
}, // // [UNTESTED] UNPKG: see README.md#cdn-issues
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
// note: for unpkg, we trim trailing slash(es) in requires (e.g. https://unpkg.com/assert@1.4.1/assert.js)
// not sure the standard allows for trailing slashes anyway (tbv)
{
  t: (u, b) => /^[a-z_$]/i.test(u),
  r: (u, b) => `https://unpkg.com/${u.replace(/[/]+$/, '')}`
}, // see readme.md...
// our catch all (required for simpler logic in knownModule and later on)
// based on: https://developer.mozilla.org/en-US/docs/Web/API/URL
{
  t: (u, b) => true,
  r: (u, b) => b ? new URL(u, b).href : u
}]; // some helpers for CDNs above (jsdelivr, unpkg, cdnjs)
// const cdnx = [/^[^#]+[#]/, '']; // removes cdn prefix (e.g. unpkg#...)
// const vers = [/([^/]+)[@]/, '\\1/']; // change ...pkg@version... to ...pkg/version... (only first '@' and only when no preceding '/')
// const repl = (u,...args) => Array(args.length/2).reduce(now => now.replace(args.shift(), args.shift()), u); // cheap hack...

const loaders = [// loaders are executed from top-down: higher loaders take precedence over lower ones
// custom loaders get added AHEAD of these so can always override loaders below
// each {loader} has:
// - t: function that TESTs if loader applies to this TYPE of content
// - c: function that processes the Content as needed (e.g. loads it as css); then it SHOULD return the [possibly modified] Content
// custom loaders get added AHEAD of these so can always override loaders below
{
  t: _t => /css/i.test(_t),
  c: _c => ((0, _tidbits.loadCSSCode)(_c), _c)
}, {
  t: _t2 => /json/i.test(_t2),
  c: _c2 => JSON.parse(_c2)
}, // ignore parse errors: will be handled later
// catch all (so there's always a handler: makes for easier logic later)
{
  t: _t3 => true,
  c: _c3 => _c3 // text, data, ...

}]; // very crude means of extracting an extension; also, dot is not included; and another thing... :-)

const extension = str => (str || '').split('.').pop(); // a more "accurate" (or complete) method, though using more code, is as follows:
//const extension = (str, keepDot = false) => ((str||'').match(/[.][^.]*$/)||[''])[0].substring(keepDot ? 0 : 1);


const scanForRequires = function () {
  // keeps track of javascript modules which need to be pre-scanned for embedded
  // 'require's in order to pre-load those: applies to cjs and amd-cjs modules
  const scan = [];
  return {
    // add prefix paths (remove filename, if any: filename if a .extension is present)
    add: (...args) => scan.push(...args.map(a => a.replace(/[/][^/]+?[.][^./]+$/, '').toLowerCase())),
    // looks if a name is prefixed with existing/known path (that path is then returned)
    // lcn parm is NOT TO BE PASSED by callers (cheap shortcut (hack?) to set variable ahead of method)
    // callers only pass the name to be queried
    query: (name, lcn = name.toLowerCase()) => !!scan.find(s => lcn.startsWith(s))
  };
}();

const cached = function () {
  // keep track of previously loaded modules
  // each may be referenced by different references:
  // e.g. 'assert' becomes 'https://unpkg.com/assert' becomes 'https://unpkg.com/assert@1.4.1/assert.js'
  // e.g. using relative URLs: './helpers/bind' (from within https://unpkg.com/axios@0.18.0/index.js) 
  //      becomes 'https://unpkg.com/axios@0.18.0/lib/helpers/bind'
  // ALSO: any module assigned a global name is accessible via that global name:
  // e.g. 'axios=axios/dist/axios.min.js' is accessible as:
  //      window.axios; loadModule('axios'); loadModule('axios/dist/axios.min.js');
  //      and loadModule('https://unpkg.com/axios@0.18.1/dist/axios.min.js');
  const loadedModules = {}; // holds all modules' meta info (module, state)

  return {
    getModuleMetaOrCreate,
    getPreloadedModule,
    setModule,
    addRefToMeta,
    refs
  };

  function getModuleMetaOrCreate(ref, url) {
    // returns module's META (NOT its .module) if it exists (loaded or not)
    // creates the new module's meta if doesn't exist
    if (ref[0] === '.') {
      // relative refs cannot be used as explicit/absolute references
      return loadedModules[url] || addRefToMeta(url); // only consider a full url
    } else {
      return loadedModules[ref] || loadedModules[url] || addRefToMeta(ref, addRefToMeta(url));
    }
  }

  function refs(mm) {
    return Object.entries(loadedModules).filter(([name, meta]) => meta === mm).map(([name, meta]) => name);
  }

  function addRefToMeta(ref, mm) {
    return loadedModules[ref] = mm || new ModuleMeta();
  }

  function getPreloadedModule(ref) {
    // this is a SYNC module (to be used within AMD & CJS 'require')
    // returns ACTUAL MODULE (i.e. moduleMeta.module) if it exists AND is loaded
    // throws error otherwise
    // important usage detail: expects a config object to be explicitly bound to this method
    const {
      baseUrl,
      urlResolvers
    } = this; // a relative ref must be resolved

    const id = urlResolvers.find(resolver => resolver.t(ref, baseUrl)).r(ref, baseUrl);
    const lm = ref[0] === '.' ? loadedModules[id] : loadedModules[ref] || loadedModules[id];
    if (lm && lm.isLoaded) return lm.module;
    throw new RequiredModuleMissingError(id);
  }

  function setModule(ref, module) {
    // allows modules loaded by other means to be referenced by all
    // BUT, what about setting window.global??? e.g. axios so window.axios exists?
    // if set from loadModule(name=mod); window.name is there and also loadModule(name)
    loadedModules[ref] = Object.values(loadedModules).find(lm => lm.module === module) || new ModuleMeta(module);
  }
}();

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

class RequiredModuleMissingError extends Error {
  constructor(missingName) {
    super(`module ${missingName} is missing (or not pre-loaded)`);
    this.missingName = missingName;
  }

} // max number of modules depending on me BEFORE I'm initially resolved
// if more than that, we assume that it's an error. this is a cheap
// method to ensure no infinite loop while resolving dependencies


const LONGEST_LIKELY_DEPENDENCY_CHAIN = 30;

class ModuleMeta {
  // not worth keeping addtl meta info (e.g. refs, src url) until (if) actually needed for something
  constructor(module) {
    // DO NOT SET IT (i.e. .module) without actual module (else will break isLoaded below)
    module && (this.module = module);
  }

  get isLoaded() {
    return 'module' in this;
  }

  get isUnresolved() {
    return !!this.waitingOnMe;
  }

  get isLoadedWithError() {
    return this.isLoaded && this.module instanceof Error;
  }

  resolved(m) {
    // set it (isLoaded will now always be true)...
    this.module = m; // m can be an actual module OR an Error if loading failed
    // UNCOMMENT (below) to give users a hint of a likely issue when loading CJS modules:
    // if (m instanceof Error && m.name === 'SyntaxError' && /await.+async.+function/i.test(m.message || ''))
    //     m.message = `${this.id} may be CJS module with nested requires\n\t(nested requires must be inside async functions)\n\toriginal error: ${m.message}`)
    // ...then, let dependents know

    (this.waitingOnMe || []).forEach(resolveDep => resolveDep());
    delete this.waitingOnMe; // some housekeeping: why not...
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
    deps.push(resolveDependent); // as per method 2 (above)

    if (deps.length > LONGEST_LIKELY_DEPENDENCY_CHAIN) this.resolved(new ModuleLoadError(`likely infinite cycle in module resolution for [${cached.refs(this).join(';')}]`));
  }

}

const newConfig = (original, updates = {}) => (0, _objectSpread2.default)({}, original, updates, {
  // ...then override with these...
  // special cases: want to clone the arrays so [possible future] changes don't affect original
  urlResolvers: (updates.urlResolvers || []).concat(original.urlResolvers),
  loaders: (updates.loaders || []).concat(original.loaders)
});

function createLoader(baseConfig, overrides = {}) {
  const customConfig = newConfig(baseConfig, overrides);
  const customLoader = internalLoader.bind(customConfig); // can use as fcn(...)...
  // add methods

  customLoader.load = customLoader; // ...OR can chain in single call fcn.config({...}).load(...)

  customLoader.config = createLoader.bind(null, customConfig);

  customLoader.knownModule = (ref, module) => {
    cached.setModule(ref, module);
    return customLoader;
  };

  return customLoader;
} // our loader with a basic configuration


const publicLoader = createLoader({
  baseUrl: window.location.href,
  globals: () => {},
  // inject globals into execution environment of modules
  urlResolvers,
  // where to download dependencies from
  loaders,
  // once downloaded, how to load (interpret) its content
  alwaysAsArray: false,
  // if false and loading single module, will get back that module (not an array of 1 element)
  useStrict: true // forces strict mode on loaded modules (recommended): will prepend '"use strict";\n\n' before loading modules

}); // Our main export --------------

var _default = publicLoader; // and while we're at it...

exports.default = _default;
publicLoader.knownModule('load-dynamic-module', publicLoader);
var ty = 0;

async function internalLoader(...args) {
  // each arg is a module reference or actual string data: see readme.md#module-references
  // internalLoader must always be explicitly bound to a configuration object (internalLoader.bind({config}))
  const config = this; // for readability below

  return new Promise(resolveWhenReady => {
    // NO REJECT CLAUSE: will never fail (but there can be modules that are resolved to Error)
    // - so unloadable modules (e.g. network or syntax errors) are set to the ERROR that made them fail 
    //  (can always test for 'module instanceof Error')
    // - so reject clause (of Promise above) would NEVER be used
    const {
      baseUrl,
      urlResolvers,
      loaders,
      alwaysAsArray
    } = config; // extract config parms

    const downloads = [];

    for (const dep of args) {
      if (typeof dep === 'string') {
        // string format: 
        //   - [name=][type!]url or [name=][type-]data!...immediate-data-here...
        //   - [name=][type:]url or [name=][type-]data:...immediate-data-here...
        //   if type not explicitly specified and...
        //      ...url/downloaded: use downloaded content-type or (if not available) url extension
        //      ...[immediate] data: use imediate data as text
        //   [name=] can also be [window.name=]
        //   - if preceded by 'window.', module will be available as a global window property
        //   - otherwise, 'name' is used as an alias reference for that module (i.e. loadModule('name'))
        // since [^] matches everything (including newlines), m will ALWAYS match EVERY string
        // so no need to test for m (as in m && ...)
        const m = dep.match(/(([a-z0-9_$.-]+[=])*)(([a-z]+)([-]data)?[:!])?([^]+)/i),
              usesRefs = m[1] ? m[1].split(/=/g) : [],
              globalRefs = (usesRefs.pop(), usesRefs),
              isData = /data/i.test(m[4]) || m[5],
              data = isData ? m[6] : '',
              isHttpx = /https?/i.test(m[4]),
              ref = isData ? '' : isHttpx ? m[4] + '://' + m[6] : m[6],
              type = m[4]; // if explicit (here), takes precedence over downloaded content-type

        function setGlobalRefs(m) {
          globalRefs.forEach(ref => {
            var asWinProp;
            ref = ref.trim().replace(/^window[.]/, () => {
              asWinProp = true;
              return '';
            });
            asWinProp ? window[ref] = m : cached.setModule(ref, m);
          });
          return m;
        }

        const addDependency = m => downloads.push(setGlobalRefs(m));

        if (ref) {
          // DOWNLOAD DATA
          const requestUrl = urlResolvers.find(resolver => resolver.t(ref, baseUrl)).r(ref, baseUrl);
          const depModule = cached.getModuleMetaOrCreate(ref, requestUrl);

          if (depModule.isLoaded) {
            addDependency(depModule.module); // no need for a promise, already resolved
          } else if (depModule.isUnresolved) {
            downloads.push(new Promise(moduleReady => {
              depModule.dependsOnMe(() => moduleReady(setGlobalRefs(depModule.module)));
            }));
          } else {
            downloads.push(new Promise(moduleReady => {
              // MUST IMMEDIATELY add an initial .dependsOnMe() 
              // to mark this module as now-known but still UNRESOLVED
              depModule.dependsOnMe(() => setGlobalRefs(depModule.module));

              const done = module => {
                depModule.resolved(module); // will trigger .dependsOnMe listener from above

                moduleReady(module); // depModule.module === module
                //log(requestUrl, depModule.isLoadedWithError ? 'LOAD ERROR: ' + module.message : 'LOADED');

                depModule.isLoadedWithError && console.error(requestUrl + ' LOAD ERROR: ' + module.message); // must be a string?
              };

              (0, _tidbits.http)(requestUrl).then(async downloaded => {
                const actualUrl = downloaded.responseURL || requestUrl;
                actualUrl !== requestUrl && cached.addRefToMeta(actualUrl, depModule);

                const treatAsType = (() => {
                  // a 'do-expression' would be more appropriate here
                  // see: https://github.com/tc39/proposal-do-expressions
                  if (/^(amd[-])?cjs$/.test(type)) {
                    scanForRequires.add(actualUrl, requestUrl);
                    return 'javascript';
                  }

                  return type || downloaded.contentType || extension(actualUrl);
                })();

                const asLoaded = loaders.find(loader => loader.t(treatAsType)).c(downloaded.content);
                done(/javascript/i.test(treatAsType) ? await initJSModule(config, actualUrl, asLoaded) : asLoaded);
              }).catch(err => {
                done(new DownloadError(`module ${requestUrl} not downloaded (${err.code})`, err));
              });
            }));
          }
        } else {
          // IMMEDIATE [string-based] DATA so use it after processed via loaders
          try {
            addDependency(loaders.find(loader => loader.t(type)).c(data));
          } catch (err) {
            addDependency(err);
          }
        }
      } else {
        // ACTUAL OBJECT
        downloads.push(dep); // all done: not a remembered or gloabally known module
      }
    }

    Promise.all(downloads).then(resolvedDeps => resolveWhenReady(alwaysAsArray || resolvedDeps.length > 1 ? resolvedDeps : resolvedDeps[0]));
  });
}

async function initJSModule(config, moduleUrl, moduleSourceCode) {
  // this method NEVER FAILS but a module may "resolve" to an Error
  // - so NO 'reject' param/clause as per note above...
  return new Promise(async resolveJSM => {
    const {
      globals,
      useStrict
    } = config; // extract config parms
    // when resolving RELATIVE-based sub-modules, config is same as parent/asking-module
    // except for its baseUrl which now reflects its parent module

    const subModulesConfig = newConfig(config, {
      baseUrl: moduleUrl,
      alwaysAsArray: true
    });
    const dependenciesLoader = internalLoader.bind(subModulesConfig); // recursion here

    const preloadedModules = cached.getPreloadedModule.bind(subModulesConfig);

    try {
      const {
        moduleExports,
        moduleGlobals
      } = genModuleInitMethods(dependenciesLoader, preloadedModules); // basic safety & better performance: is that safe for every module?

      useStrict && (moduleSourceCode = '"use strict";\n' + moduleSourceCode); // customize module's virtual globals

      globals(moduleGlobals);

      if (scanForRequires.query(moduleUrl)) {
        const deps = (0, _extractRequire.extractRequireDependencies)(moduleSourceCode); // extract required dependencies...

        await dependenciesLoader(...deps); // pre-load them... (should never fail?)
      } // Try loading the module: using AsyncFunction prevents 1 module from blocking all others


      const initModule = new _tidbits.AsyncFunction(...Object.keys(moduleGlobals), moduleSourceCode);
      const exported = await moduleExports((await initModule(...Object.values(moduleGlobals))));
      return resolveJSM(exported); // return because we don't want to loop again
    } catch (err) {
      return resolveJSM(new ModuleLoadError(`module ${moduleUrl} initialization failed (${err.message})`, err));
    }
  });
}

function genModuleInitMethods(preloadSubModules, preloadedModule) {
  // generates define & require methods used by AMD modules, and module.exports used by CJS modules
  // a module can be resolved as follows:
  // - if define is called:
  //     1- the result of calling define's definition function (may be undefined or error)
  //     2- the results of exports or module.exports having been assigned from within define's definition function
  // - if define is NOT called:
  //     3- the results of exports or module.exports having been assigned from within the module's code
  //     4- the result of the module's code, if any (i.e. as a top-level return statement)
  //     5- module's value is undefined (presumably module code runs for its side-effects)
  var exportsFromDefine = false; // if define method is called, that will be the module's value (as a promise)

  const exports = {},
        // or use Object.create(null) instead?
  module = {
    exports
  };

  const exportsUsed = () => Object.keys(exports).length > 0,
        // means 'exports.[name] = ...' form was used
  moduleExportsAssigned = () => module.exports !== exports; // means 'module.exports = ...' form was used


  const getExports = m => m instanceof RequiredModuleMissingError ? m : moduleExportsAssigned() ? module.exports : exportsUsed() ? exports : m; // IMPORTANT: all UMD modules test for 'define.amd' being 'truthy'
  //            but some (e.g. lodash) ALSO check that "typeof define.amd == 'object'" so...


  define.amd = {}; // ...use an object (truthy) NOT just 'true'

  function define(...args) {
    // CANNOT be async else init may complete before init is done!!!
    // but let getResults method know to wait for answers
    exportsFromDefine = new Promise(resolveModuleAs => {
      // at this point we know we're in an AMD module since this define method was called from module source code
      // so parse args as per AMD modules and [any] results (or errors) becomes this module's value
      const moduleDefine = args.pop(); // always last param; may be a sync OR async method, so must be prepared

      if (typeof moduleDefine !== 'function') return resolveModuleAs(new ModuleLoadError(`expecting module definition to be a function (was ${typeof moduleDefine})`));

      if (args.length === 0) {
        // no explicit dependencies...
        // ...so either none at all or expecting simplified commonjs (require, exports, module)...
        moduleDefine.length === 0 ? executeModuleDefinition() : executeModuleDefinition(require, exports, module);
      } else {
        // AMD expects a possibly-empty array of dependencies (or nothing)
        const depsArray = args.pop() || [];

        if (Array.isArray(depsArray)) {
          preloadSubModules(...depsArray) // always an array (as per internally-set config.alwaysAsArray to true above)
          .then(resolvedDeps => executeModuleDefinition(...resolvedDeps));
        } else resolveModuleAs(new ModuleLoadError(`expecting array of dependencies (was ${typeof externals})`));
      }

      async function executeModuleDefinition(...externalDeps) {
        try {
          // moduleDefine method may be sync or async: 'await'ing allows for either
          resolveModuleAs(getExports((await moduleDefine(...externalDeps))));
        } catch (err) {
          resolveModuleAs(err instanceof RequiredModuleMissingError ? err : new ModuleLoadError(`define method failed (${err.message})`, err));
        }
      }
    });
  }

  function require(...args) {
    // thrown errors are propagated and must be handled by caller
    const req = args.pop(); // last or only parm

    if (args.length === 0 && typeof req === 'string') {
      // uses basic form: require('dependency-reference');
      // 'dependency-reference' was [previously downloaded/extracted then] pre-loaded...
      return preloadedModule(req); // ...else may throw RequiredModuleMissingError
    }

    if (typeof req === 'function') {
      // treat it as if it's [assumes it's] a define?
      // meaning uses the AMD form of: require([...deps...], fcn(...deps...){}));
      // which is just a define BUT without a module actually being "defined" 
      // (rather, it's equivalent to code executing using an after-deps-loaded method)
      // - but if code executing, what does this "module" become? its result, if any? and if no result?
      // and if there is code (outside the require) that does return something: then what?
      define(...args, req);
    } else {
      throw new ModuleLoadError(`unexpected parameters for require method (neither string nor function)`);
    }
  }

  return {
    async moduleExports(originalResult) {
      return new Promise(async finalExports => finalExports(exportsFromDefine ? await exportsFromDefine : getExports(originalResult)));
    },

    moduleGlobals: {
      define,
      require,
      module,
      exports
    }
  };
}

/***/ })
/******/ ]);
});