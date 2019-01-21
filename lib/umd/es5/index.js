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

function http(url, {method = 'GET', retry = 3, retryDelayInMS = 500} = {}) {
	return new Promise((resolve,reject) => {

        // Create the XHR request
        const request = new XMLHttpRequest();

		// Setup our listener to process compeleted requests
		request.onreadystatechange = () => {

            // wait until request/response complete
			if (request.readyState !== 4) return; 

			// process the response
			if (request.status >= 200 && request.status < 300) {
                // success
				resolve({ 
                    data: request.responseText,
                    responseURL: request.responseURL, // NOT SUPPORTED by IE
                });
			} else if (request.status >= 500 && retry-- > 0) {
                // server error: retry...
                setTimeout(() => {
                    http(url, {method, retry, retryDelayInMS})
                        .then(resolve)
                        .catch(reject);
                }, retryDelayInMS); // ...after a brief delay...
                retryDelayInMS *= 2; // ...and progressively increase it for next go around
            } else { 
                // client error (4xx) or too many retries or other non-retriable error
                const err = new Error(`failed to ${method} ${url} [${retry <= 0 ? 'too many retries;' : ''}http-code=${request.status}${request.statusText ? `(${request.statusText})`:''}]`)
                err.name = `HTTP-${method}-Error`;
                err.statusCode = request.status;
                err.statusText = request.statusText; 
				reject(err);
			}
        };
        
        // Setup our HTTP request
		request.open(method || 'GET', url, true); // last parm 'true' makes it async

		// Send the request
		request.send();
	});
}

// CONCATENATED MODULE: ./index.mjs
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadedModules", function() { return loadedModules; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return loadModuleByUrl; });
// read: https://developers.google.com/web/fundamentals/primers/modules
// also: https://curiosity-driven.org/minimal-loader
// also: https://davidwalsh.name/javascript-loader
// also: https://www.davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/

// read: https://hackernoon.com/7-different-ways-to-use-es-modules-today-fc552254ebf4

// method used to actually download modules
 // instead of axios.get (lighter)

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

var urlResolver = defaultUrlResolver;
loadModuleByUrl.setUrlResolver = customResolver => {
    urlResolver = customResolver || defaultUrlResolver; // so set to null to reset
    return loadModuleByUrl; // can chain op
}

// let loaded modules be visible to all (any benefits to that?)
const loadedModules = {};

// allow for pre-loaded modules to be referenced
loadedModules.addKnownModule = addKnownModule;
function addKnownModule(name, module) {
    loadedModules[name] = {
        isKnown: true,
        isLoaded: true,
        type: 'isBuiltin',
        module,
    };
    return loadedModules;
}

addKnownModule('load-dynamic-module', loadModuleByUrl); // trivial case
addKnownModule('require-async', requireAsync); // lets AMD modules load deps on-demand
addKnownModule('async-require', requireAsync); // alias

async function requireAsync(url) {
    const requested = await loadModuleByUrl(url);
    return requested.module; 
}

async function loadModuleByUrl(moduleRequestUrl, parentModuleUrl = window.location.href) {

    // IMPORTANT: loadModuleByUrl NEVER FAILS, but/so:
    // - so unloadable modules (e.g. network|syntax errors) simply set to undefined (module.err contains reason)
    // - so reject (below) is NEVER used

    const actualModuleUrl = urlResolver(moduleRequestUrl, parentModuleUrl);

    return new Promise(async resolve => { // NO 'reject' param as per above...

        const module = loadedModules[actualModuleUrl] || (loadedModules[actualModuleUrl] = { isKnown: false, module: undefined });

        function moduleIsNowResolved(m, type) {
            // first
            if (arguments.length === 1) {
                module.err = m;
                // test err.message: e.g. from chrome: 'await is only valid in async function'
                if (m.name === 'SyntaxError' && /await.+async.+function/i.test(m.message || ''))
                    console.warn(`WARNING: module ${moduleRequestUrl} may be CommonJS with nested requires\n\t(only top-level requires are supported by loadModuleByUrl)`)
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
                const m = await http(actualModuleUrl);
                const baseUrlForSubDeps = m.responseURL; // any deps in this module are relative to this base url
                const code = m.data; // may be AMD/UMD or CommonJS

                // Try as AMD module first because 1) many browser-based modules are AMD/UMD anyway and 2) no need for code manipulation
                // - MUST pass dummy (i.e. undefined) module/exports/require else would use those from global context (if any)
                // - Use AsyncFunction in case module code uses async-require
                const initModule = new AsyncFunction('define', 'module', 'exports', 'require', code); 

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

                    const externals = args.pop() || [];
                    //const name_unused = args.pop(); // unused: here for ref

                    // resolve deps
                    const deps = externals.map(dep => loadModuleByUrl(dep, baseUrlForSubDeps));

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

                    let undefined_module, // unassigned === undefined
                        undefined_exports, // ditto
                        dummy_require = () => {throw new Error('require is invalid in AMD modules (use require-async instead): ' + moduleRequestUrl);};

                    await initModule(amdDefine, undefined_module, undefined_exports, dummy_require);
                }
                catch(err) {
                    isAMD && moduleIsNowResolved(err); // if was an AMD, consider it resolved (though with errors)
                }

                if (!isAMD) {
                    if (isCommonJS(code)) { 

                        // pass #2: yes, less efficient (since 2 passes) but allows for both modes (i.e. amd/umd and cjs) to be imported
                        // BIG CAVEAT: only top-level requires will be honored; nested requires (i.e. within non-asyn functions) will fail
                        
                        const awaitableCode = commonjsToAwaitRequire(code);
                        const commonjsInit = new AsyncFunction('module', 'exports', 'require', awaitableCode);
                        const moduleProxy = { exports: {} };
                        const requireProxy = async modName => (await loadModuleByUrl(modName, baseUrlForSubDeps)).module;
                        try {
                            await commonjsInit(moduleProxy, moduleProxy.exports, requireProxy);
                            moduleIsNowResolved(moduleProxy.exports, 'CommonJS');
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


/***/ })
/******/ ]);
});