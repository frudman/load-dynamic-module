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

// CONCATENATED MODULE: ./http-get.mjs
// a simple replacement for axios.get (less code since can't just get axios.get)
// IMPORTANT:
//  this code depends on XMLHttpRequest settings .responseURL field upon completion
//  - that feature is NOT SUPPORTED in IE (any versions) [supported on Edge]
//  SO this code will NOT work on IE if need .responseURL [works on Edge]
// read: https://gomakethings.com/promise-based-xhr/
// also: https://gomakethings.com/why-i-still-use-xhr-instead-of-the-fetch-api/
// ref: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
// ref: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
function http(url, {
  method = 'GET',
  retry = 3,
  retryDelayInMS = 500
} = {}) {
  return new Promise((resolve, reject) => {
    // Create the XHR request
    const request = new XMLHttpRequest(); // Setup our listener to process compeleted requests

    request.onreadystatechange = () => {
      // wait until request/response complete
      if (request.readyState !== 4) return; // process the response

      if (request.status >= 200 && request.status < 300) {
        // success
        resolve({
          data: request.responseText,
          responseURL: request.responseURL // NOT SUPPORTED by IE

        });
      } else if (request.status >= 500 && retry-- > 0) {
        // server error: retry...
        setTimeout(() => {
          http(url, {
            method,
            retry,
            retryDelayInMS
          }).then(resolve).catch(reject);
        }, retryDelayInMS); // ...after a brief delay...

        retryDelayInMS *= 2; // ...and progressively increase it for next go around
      } else {
        // client error (4xx) or too many retries or other non-retriable error
        const err = new Error(`failed to ${method} ${url} [${retry <= 0 ? 'too many retries;' : ''}http-code=${request.status}${request.statusText ? `(${request.statusText})` : ''}]`);
        err.name = `HTTP-${method}-Error`;
        err.statusCode = request.status;
        err.statusText = request.statusText;
        reject(err);
      }
    }; // Setup our HTTP request


    request.open(method || 'GET', url, true); // last parm 'true' makes it async
    // Send the request

    request.send();
  });
}
// CONCATENATED MODULE: ./index.mjs
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addKnownModule", function() { return addKnownModule; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return loadModule; });
// NOT FULLY TESTED
// NOT FULLY TESTED
// NOT FULLY TESTED
// NOT FULLY TESTED: especially when modules have conflicting/cyclical dependencies
// NOT FULLY TESTED
// NOT FULLY TESTED
// NOT FULLY TESTED
// you've been warned! :-)
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
// our method used to actually download modules
 // instead of axios.get (lighter code base)
// prevent webpack/babel from removing async syntax (which would neutralize intended effect)
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction

const AsyncFunction = new Function(`return Object.getPrototypeOf(async function(){}).constructor`)(); // convert commonjs 'require' (implicitly sync) to 'await require' (explicit async)
// - WORKS ONLY FOR top-level requires since nested requires (i.e. within a function) will fail 
//   with syntax error. unless function itself was already marked async

const commonjsToAwaitRequire = cjs => cjs.replace(/\brequire\s*[(]/g, 'await require('); // quick way to see if code MIGHT be commonjs


const isCommonJS = code => /module[.]exports/.test(code); // convert a dependency reference to an http-gettable url


function defaultUrlResolver(requestedUrl, baseURL) {
  if (/^(https?[:])?[/][/]/i.test(requestedUrl)) return requestedUrl; // explicit url so leave it alone

  if (/^[a-z_$]/i.test(requestedUrl)) // a.k.a. a "bare import" in CJS parlance (i.e. /node_modules/...)
    return `https://unpkg.com/${requestedUrl}`; // simple name so use NPM (via unpkg)
  // based on: https://developer.mozilla.org/en-US/docs/Web/API/URL

  return baseURL ? new URL(requestedUrl, baseURL).href : requestedUrl;
} // // our module cache
// const loadedModules = {};


class Module {
  static getModule(name) {
    return Module.loadedModules[name] || (Module.loadedModules[name] = new Module({
      name
    }));
  }

  static addModule(name, module) {
    Module.loadedModules[name] = new Module({
      name,
      module
    });
  }

  constructor({
    name,
    module
  } = {}) {
    this.name = name; // its source URL

    this.module = module;
  }

  get isLoaded() {
    return this.module || this.err;
  }

  get isUnresolved() {
    return !this.isLoaded && !!this.resolveMe;
  }

  resolved(m) {
    this.module = m;
    this.publicizeResolution();
  }

  resolvedWithError(err) {
    this.err = err; // try to give a friendly hint: e.g. from chrome: 'await is only valid in async function'

    if (err.name === 'SyntaxError' && /await.+async.+function/i.test(err.message || '')) console.warn(`${this.name} may be CJS module with nested requires\n\t(nested requires must be inside async functions)`);else console.error(`${this.name} module was not loaded`, err);
    this.publicizeResolution();
  }

  publicizeResolution() {
    // first...
    this.resolveMe();
    delete this.resolveMe; // why not...
    // ...then, let dependents know

    (this.waitingOnMe || []).forEach(dep => dep.resolveDependent());
    delete this.waitingOnMe; // why not...
  }

  dependsOnMe(dependentUrl, resolveDependent) {
    const deps = this.waitingOnMe || (this.waitingOnMe = []);

    if (deps.find(dep => dep.url === dependentUrl)) {
      // adding same dependent more than once: i have a cycle? (what if separate mods requesting )
      this.resolvedWithError(new Error('CYCLYCAL DEPENDENCY: ' + dependentUrl + '<-->' + this.name));
    } else {
      deps.push({
        url: dependentUrl,
        resolveDependent
      });
    }
  }

} // allows modules loaded by other means to be referenced by all


Module.loadedModules = {};
function addKnownModule(ref, module, resolveUrl = defaultUrlResolver) {
  // store name as it would be resolved so if different relative URLS point to same module,
  // that module is loaded only once
  const name = resolveUrl(ref); //loadedModules[name] = new Module({name, module});

  Module.addModule(name, new Module({
    name,
    module
  }));
}
addKnownModule('load-dynamic-module', loadModule); // self: trivial case

async function loadModule(moduleRequestUrl, {
  baseUrl = window.location.href,
  globals = () => {},
  urlResolver = defaultUrlResolver
} = {}) {
  // need baseUrl for sub-dependencies that use relative-urls: sub-deps are therefore relative to baseUrl
  // IMPORTANT: baseUrl is ALSO the parent module's url: i.e. the module that needs this moduleRequestUrl
  // IMPORTANT: loadModule NEVER FAILS, but/so:
  // - so unloadable modules (e.g. network or syntax errors) are set to undefined (module.err contains reason)
  // - so reject clause (of Promise below) is NEVER used
  return new Promise(async resolve => {
    // NO 'reject' param/clause as per note above...
    const actualModuleUrl = urlResolver(moduleRequestUrl, baseUrl);
    const module = Module.getModule(actualModuleUrl); // loadedModules[actualModuleUrl] || (loadedModules[actualModuleUrl] = new Module({name: actualModuleUrl}));

    if (module.isLoaded) {
      resolve(module); // modules are loaded once, then reused
    } else if (module.isUnresolved) {
      // add myself (i.e. my 'resolve') to its list
      log(baseUrl + ' WAITING FOR dependent ' + actualModuleUrl);
      module.dependsOnMe(baseUrl, () => resolve(module)); // queue request: use baseUrl because that's the one depending on me
    } else {
      // loading a new module
      module.resolveMe = () => resolve(module);

      try {
        const m = await http(actualModuleUrl); // do redirects matter for relative URLs? if redirected once, will redirect again for subs, right?
        // const baseUrlForSubDeps = m.responseURL; // any deps in this module (with a relative url) are relative to this base url
        // //if (baseUrlForSubDeps !== actualModuleUrl)
        // loadedModules[baseUrlForSubDeps] = module; // may be yet another reference to that module
        //const subDepResolution = {baseUrl: baseUrlForSubDeps, globals, urlResolver};

        const subDepResolution = {
          baseUrl: actualModuleUrl,
          globals,
          urlResolver
        };
        const code = m.data; // may be AMD/UMD or CommonJS: we don't know yet

        const amdProxy = {
          // for amd modules
          define: amdDefine,
          module: undefined,
          exports: undefined,

          require(ref) {
            throw new Error(`cannot 'require' in AMD module ${actualModuleUrl}:\n\try 'await requireAsync("${ref}"' instead`);
          },

          async requireAsync(nameOrUrl) {
            const requested = await loadModule(nameOrUrl, subDepResolution);
            return requested.module;
          }

        };
        const cjsExports = {};
        const cjsProxy = {
          // for commonjs modules
          define: () => {
            throw new Error('unexpected use of DEFINE in commonJS module');
          },
          module: {
            exports: cjsExports
          },
          exports: cjsExports,
          // resolve dep for CJS module
          require: async modName => (await loadModule(modName, subDepResolution)).module // change proxies & globals as needed

        };
        globals(amdProxy, cjsProxy); // Try as AMD module first because 1) many browser-based modules are AMD/UMD anyway and 2) no need for code manipulation
        // - MUST pass dummy module/exports/require else would use/fallback on those from global context if any
        // - Use AsyncFunction in case module code uses async requires
        // - could initModule.bind(x) but this would change meaning of 'this' within module: default is global/window object
        //    - this could be a means to protect the window object if needed (e.g. by replacing it with null, or a proxying object)

        const initModule = new AsyncFunction(...Object.keys(amdProxy), code); // IMPORTANT: all AMD modules test for 'define.amd' being 'truthy'
        //            but some (e.g. lodash) ALSO check that "typeof define.amd == 'object'" so...

        amdDefine.amd = {}; // ...use an object (truthy) NOT just 'true'
        // keep track of whether or not our define method was actually called...

        var isAMD = false; // ...because if not called, likely NOT an AMD module

        function amdDefine(...args) {
          isAMD = true; // yay!

          const moduleDefine = args.pop(); // always last param

          if (typeof moduleDefine !== 'function') throw new Error(`expecting 'define' to be a function (was ${typeof moduleDefine})`); // find out how many deps the moduleDefine function expects

          const numDeps = moduleDefine.length; // ...function.length returns how many parms (so, deps) are declared for it
          // we allow for either an array of deps (traditional) or just comma-separated parms (for convenience when creating amd modules manually)
          // we're also ok with a mixture of strings and arrays (of strings only), though not clear why that would be the case
          // and we always work backwards on parms (from right to left) to allow for possibility of a module name at the front/leftmost position
          // (as per traditional, in case first/leftmost parm is module's 'name', as is typical of AMD define([mod-name,][...deps,] fcn(...depRefs){}))
          // IF a module name is specified, it remains UNUSED (not needed for modules loaded by URLs)
          // POSSIBLE: if single string parm left (i.e. module name), maybe register it as the module's name also: i.e. as an alias
          // - but what happens if another module wants that name: overwrite? remove both? keep first? keep both?

          const externals = [];

          while (externals.length < numDeps) {
            const nextDep = args.pop(); // from right/back to left/front 

            if (typeof nextDep === 'string') externals.unshift(nextDep); // add to front/left of array
            else if (Array.isArray(nextDep)) {
                while (externals.length < numDeps && nextDep.length > 0) {
                  // process nested deps
                  const nd = nextDep.pop(); // take last one (so going from back to front)...

                  if (typeof nd === 'string') externals.unshift(nd); // add to front of array
                  else throw new Error(`invalid dependency in AMD module definition - can only be a string (got type=${typeof nd})`);
                }
              } else throw new Error(`invalid dependency in AMD module definition - can only be a string or an array of strings`);
          } // this is the module's name (as module author wants it defined) [we're not using it here: code is for reference only]
          // if (args.length === 1 && typeof args[0] === 'string') { ...UNUSED for now...
          //     // use it? 
          //     // maybe set option to use only URLs, URLs AND named defines, or just named defines (if no name, use url)
          //     // to consider: add option in case of conflicts: replace with newer/last-loaded, remove both, keep first (e.g. different url but same name)
          // }
          // [start to] resolve deps for AMD module


          const deps = externals.map(dep => loadModule(dep, subDepResolution)); // wait for all resolutions to be completed

          Promise.all(deps).then(resolvedDeps => {
            try {
              module.resolved(moduleDefine(...resolvedDeps.map(dep => dep.module))); // could fail (if not [correct] AMD)
            } catch (err) {
              module.resolvedWithError(err);
            }
          });
        }

        try {
          // pass #1: try it as an AMD module first
          await initModule(...Object.values(amdProxy));
        } catch (err) {
          // if was an AMD, consider it resolved (though with errors)
          isAMD && module.resolvedWithError(err); // else, fall through and see if it works with CJS below
        }

        if (!isAMD) {
          if (isCommonJS(code)) {
            // pass #2: yes, less efficient (since 2 passes) but allows for both modes (i.e. amd/umd and cjs) to be imported
            // BIG CAVEAT: only top-level requires will be honored in cjs; nested requires (within non-async functions) will fail
            const awaitableCode = commonjsToAwaitRequire(code);
            const commonjsInit = new AsyncFunction(...Object.keys(cjsProxy), awaitableCode);
            await commonjsInit(...Object.values(cjsProxy));
            module.resolved((cjsProxy.module || {}).exports || cjsExports);
          } else {
            module.resolvedWithError(new Error('module seems to be neither AMD/UMD nor CommonJS'));
          }
        }
      } catch (err) {
        module.resolvedWithError(err);
      }
    }
  });
}

/***/ })
/******/ ]);
});