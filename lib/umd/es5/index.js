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
// must keep track of previously loaded modules that may be referenced by multiple different URLs:
// e.g. 'assert' becomes 'https://unpkg.com/assert' becomes 'https://unpkg.com/assert@1.4.1/assert.js'
// e.g. using relative URLs: './helpers/bind' (from within https://unpkg.com/axios@0.18.0/index.js) 
//      becomes 'https://unpkg.com/axios@0.18.0/lib/helpers/bind'


const loadedModules = {}; // holds all modules' meta info (id, module, state)

const addModule = (id, module) => loadedModules[id] = new DynamicModule({
  id,
  module
});

function getModuleMetaOrCreate(id) {
  // returns module's META (NOT its .module) if it exists (loaded or not)
  // creates the new module's meta if doesn't exist
  return loadedModules[id] || (loadedModules[id] = new DynamicModule({
    id
  }));
}

function getPreloadedModule(config, ref) {
  // this is a SYNC module (to be used within AMD & CJS 'require')
  // returns actual module (i.e. moduleMeta.module) if it exists AND is loaded
  // throws error otherwise
  const {
    baseUrl,
    urlResolvers
  } = config;
  const id = urlResolvers.find(resolver => resolver.t(ref, baseUrl)).r(ref, baseUrl);
  const lm = loadedModules[id];
  if (lm && lm.isLoaded) return lm.module;
  throw new RequiredModuleMissingError(id);
}

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

} // cheap means to ensure no infinite loop while resolving dependencies


const LONGEST_LIKELY_DEPENDENCY_CHAIN = 30; // number of modules depending on me BEFORE I'm initially resolved

class DynamicModule {
  // really just a Module but that name conflicts with ES6 'Module' name used by modern browsers (when loading
  // modules!) - so let's keep it distinct
  constructor({
    id,
    module
  } = {}) {
    id && (this.id = id); // its source URL

    module && (this.module = module); // DO NOT SET IT without actual module (else will break isLoaded below)
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

    if (deps.length > LONGEST_LIKELY_DEPENDENCY_CHAIN) this.resolved(new ModuleLoadError(`likely cycle in module resolution for ${this.id} (depth=${deps.length})`));
  }

} // allows modules loaded by other means to be referenced by all


function knownModule(ref, module) {
  const {
    config,
    baseLoader
  } = this; // store name as it would be resolved: different (e.g. relative) URLS pointing to same module load only once
  // e.g. so 'load-dynamic-module' becomes https://unpkg.com/load-dynamic-module

  const id = config.urlResolvers.find(resolver => resolver.t(ref)).r(ref); // will always find one (because of catch-all)

  addModule(id, new DynamicModule({
    id,
    module
  }));
  return baseLoader; // allows for chaining
}

const newConfig = (original, updates = {}) => (0, _objectSpread2.default)({}, original, updates, {
  // ...then override with these...
  // special cases: want to clone the arrays so [possible future] changes don't affect original
  urlResolvers: (updates.urlResolvers || []).concat(original.urlResolvers),
  loaders: (updates.loaders || []).concat(original.loaders)
});

function createLoader(baseConfig, overrides = {}) {
  const customConfig = newConfig(baseConfig, overrides);
  const customLoader = internalLoader.bind(customConfig);
  customLoader.load = customLoader; // can use fcn(...) OR can chain in single call fcn.config({...}).knownModule().load(...)

  customLoader.knownModule = knownModule.bind({
    config: customConfig,
    baseLoader: customLoader
  });
  customLoader.config = createLoader.bind(null, customConfig); //customLoader.all = () => loadedModules; // for debug

  return customLoader;
} // our loader with a base configuration


const publicLoader = createLoader({
  baseUrl: window.location.href,
  globals: () => {},
  // inject globals into execution environment of modules
  urlResolvers,
  // where to download from
  loaders,

  // once downloaded, how to load it
  log(...args) {
    console.log('[LOADING-DYNAMIC-MODULE]', ...args);
  },

  alwaysAsArray: false,
  // if false and loading single module, will get back that module (not an array of 1 element)
  useStrict: true // forces strict mode on loaded modules (recommended): will prepend '"use strict";\n\n' before loading modules

}); // Our main export --------------

var _default = publicLoader; // and while we're at it...

exports.default = _default;
publicLoader.knownModule('load-dynamic-module', publicLoader);

async function internalLoader(...args) {
  const config = this; // each arg is a module reference or actual string data: see readme.md#module-references

  return new Promise(resolveWhenReady => {
    // NO REJECT CLAUSE: will never fail (but there can be modules that are resolved to Error)
    // - so unloadable modules (e.g. network or syntax errors) are set to the ERROR that made them fail (can test for 'module instanceof Error')
    // - so reject clause (of Promise above) would NEVER be used
    const {
      baseUrl,
      urlResolvers,
      loaders,
      alwaysAsArray,
      log
    } = config; // extract config parms

    const downloads = [];

    for (const dep of args) {
      if (typeof dep === 'string') {
        // string format: [name=][type!]url or [name=]type-data!...immediate-data-here...
        // since [^] matches everything (including newlines), m will ALWAYS match EVERY string
        // so no need to test for m (as in m && ...)
        const m = dep.match(/([a-z0-9_$]+[=])?(([a-z]+)([-]data)?[:!])?([^]+)/i),
              globalName = m[1] && m[1].slice(0, -1),
              // to be assigned as window.[globalName]
        isData = /data/i.test(m[3]) || m[4],
              data = isData ? m[5] : '',
              isHttpx = /https?/i.test(m[3]),
              url = isData ? '' : isHttpx ? m[3] + '://' + m[5] : m[5],
              type = m[3]; // if explicit (here), takes precedence over downloaded content-type

        const makeGlobal = m => (globalName && (window[globalName] = m), m);

        const addDependency = m => downloads.push(makeGlobal(m));

        if (url) {
          // DOWNLOAD DATA
          const requestUrl = urlResolvers.find(resolver => resolver.t(url, baseUrl)).r(url, baseUrl);
          const depModule = getModuleMetaOrCreate(requestUrl);

          if (depModule.isLoaded) {
            addDependency(depModule.module); // no need for a promise, already resolved
          } else if (depModule.isUnresolved) {
            downloads.push(new Promise(moduleReady => {
              depModule.dependsOnMe(() => moduleReady(makeGlobal(depModule.module)));
            }));
          } else {
            downloads.push(new Promise(moduleReady => {
              // MUST IMMEDIATELY add an initial .dependsOnMe() 
              // to mark this module as now-known but still UNRESOLVED
              depModule.dependsOnMe(() => makeGlobal(depModule.module));

              const done = module => {
                depModule.resolved(module); // will trigger .dependsOnMe listener from above

                moduleReady(module); // depModule.module === module
                //log(requestUrl, depModule.isLoadedWithError ? 'LOAD ERROR: ' + module.message : 'LOADED');

                depModule.isLoadedWithError && log(requestUrl, 'LOAD ERROR: ' + module.message);
              };

              (0, _tidbits.http)(requestUrl).then(async downloaded => {
                const actualUrl = downloaded.responseURL || requestUrl;
                actualUrl !== requestUrl && (loadedModules[actualUrl] = depModule); // gives it a second point of entry

                const treatAsType = type || downloaded.contentType || extension(actualUrl);
                const asLoaded = loaders.find(loader => loader.t(treatAsType)).c(downloaded.content);
                done(/javascript/i.test(treatAsType) ? await initJSModule(config, actualUrl, asLoaded) : asLoaded);
              }).catch(err => {
                done(new DownloadError(`module ${requestUrl} not downloaded (${err.code})`, err));
              });
            }));
          }
        } else {
          // IMMEDIATE [string-based] DATA so use it after processed via loaders
          addDependency(loaders.find(loader => loader.t(type)).c(data));
        }
      } else {
        // ACTUAL OBJECT
        downloads.push(dep); // all done: not a remembered module
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
      useStrict,
      log
    } = config; // extract config parms
    // when resolving RELATIVE-based sub-modules, config is same as parent/asking-module
    // except for its baseUrl which now reflects its parent module

    const subModulesConfig = newConfig(config, {
      baseUrl: moduleUrl,
      alwaysAsArray: true
    });
    const dependenciesLoader = internalLoader.bind(subModulesConfig); // basic safety & better performance: is that safe for every module?

    useStrict && (moduleSourceCode = '"use strict";\n\n' + moduleSourceCode);

    const preloadedModules = name => getPreloadedModule(subModulesConfig, name);

    const {
      moduleExports,
      moduleGlobals
    } = genModuleInitMethods(dependenciesLoader, preloadedModules);

    try {
      // customize module's virtual globals
      globals(moduleGlobals); // extract then preload any required dependencies

      const deps = (0, _extractRequire.extractRequireDependencies)(moduleSourceCode); // extract them...

      await dependenciesLoader(...deps); // pre-load them... (should never fail?)
      // Try loading the module: using AsyncFunction prevents 1 module from blocking all others

      const initModule = new _tidbits.AsyncFunction(...Object.keys(moduleGlobals), moduleSourceCode);
      resolveJSM((await moduleExports((await initModule(...Object.values(moduleGlobals))))));
    } catch (err) {
      // would be from globals (possible) or extractRequireDependencies (unlikely)
      resolveJSM(new ModuleLoadError(`module ${moduleUrl} initialization failed (${err.message})`, err));
    }
  });
}

function genModuleInitMethods(preloadSubModules, getPreloadedModule) {
  // generates define & require methods used by AMD modules, and module.exports used by CJS modules
  // a module can be resolved as follows:
  // - if define is called:
  //     1- the result of calling define's definition function (may be undefined or error)
  //     2- the results of exports or module.exports having been assigned from within define's definition function
  // - if define is NOT called:
  //     3- the results of exports or module.exports having been assigned from within the module's code
  //     4- the result of the module's code, if any (i.e. as a top-level return statement)
  //     5- module's value is undefined (presumably module code runs for its side-effects)
  var exportsFromDefine = false; // if define method is called, that will be the module's value

  const exports = {},
        // or use Object.create(null) instead?
  module = {
    exports
  };

  const exportsUsed = () => Object.keys(exports).length > 0,
        // means 'exports.[name] = ...' form was used
  moduleExportsAssigned = () => module.exports !== exports; // means 'module.exports = ...' form was used


  const getExports = m => exportsUsed() ? exports : moduleExportsAssigned() ? module.exports : m; // IMPORTANT: all UMD modules test for 'define.amd' being 'truthy'
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
        // no explicit dependencies, so either none at all or expecting simplified commonjs (require, exports, module)...
        moduleDefine.length === 0 ? executeModuleDefinition() : executeModuleDefinition(require, exports, module);
      } else {
        // AMD expects a possibly-empty array of dependencies (or nothing)
        const depsArray = args.pop() || [];

        if (Array.isArray(depsArray)) {
          if (depsArray.length > 0) {
            preloadSubModules(...depsArray) // always an array (as per config.alwaysAsArray)
            .then(resolvedDeps => executeModuleDefinition(...resolvedDeps));
          } else executeModuleDefinition();
        } else resolveModuleAs(new ModuleLoadError(`expecting array of dependencies (was ${typeof externals})`));
      }

      async function executeModuleDefinition(...externalDeps) {
        try {
          // moduleDefine method may be sync or async: await allows for either
          resolveModuleAs(getExports((await moduleDefine(...externalDeps))));
        } catch (err) {
          resolveModuleAs(new ModuleLoadError(`define method failed (${err.message})`, err));
        }
      }
    });
  }

  function require(...args) {
    try {
      const req = args.pop(); // last or only parm

      if (args.length === 0 && typeof req === 'string') {
        // uses basic form: require('dependency-reference');
        // we expect 'dependency-reference' to have been [extracted then] pre-loaded...
        return getPreloadedModule(req); // ...else may throw RequiredModuleMissingError
      } else if (typeof req === 'function') {
        // treat it as if it's [assumes it's] a define?
        // meaning uses the AMD form of: require([...deps...], fcn(...deps...){}));
        // which is just a define BUT without a module actually being "defined" 
        // (rather, it's equivalent to code executing using an after-deps-loaded method)
        // - but if code executing, what does this "module" become? its result, if any? and if no result?
        // and if there is code (outside the require) that does return something: then what?
        define(...args, req);
      } else {
        resolveModuleAs(new ModuleLoadError(`unexpected parameters for require method (neither string nor function)`));
      }
    } catch (err) {
      resolveModuleAs(err);
    }
  }

  async function moduleExports(originalResult) {
    return new Promise(async finalExports => finalExports(exportsFromDefine ? await exportsFromDefine : getExports(originalResult)));
  }

  return {
    moduleExports,
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