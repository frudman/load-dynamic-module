(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
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
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadedModules", function() { return loadedModules; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return loadModuleByUrl; });
//import {get as axiosGet} from 'axios';

// prevent webpack/babel from removing async syntax (which neutralizes intended effect)
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
const AsyncFunction = new Function(`return Object.getPrototypeOf(async function(){}).constructor`)();

// turn cjs sync requires to async
const cjsToAwaitRequire = cjs => cjs.replace(/\brequire\s*[(]/g, 'await require(');

// trivial test
const isCommonJS = code => /module[.]exports/.test(code);

function basicActualUrl(requestedUrl) {
    return /^(https?[:])?[/][/]/i.test(requestedUrl) ? requestedUrl // explicit url so leave it alone
                    : /^[a-z_$]/i.test(requestedUrl) ? `https://unpkg.com/${requestedUrl}` // simple name so use NPM (via unpkg)
                                                     : requestedUrl; // relative path from here (where's here?)
}

// npm run inc: incr [package.json.version] && git add . && git commit -m 'misc' && git push && npm publish
// need to write 'incr'

// todo: retry logic for 5xx errors
// todo: on-demand-requires in AMD modules? or just have them use this module as dependent?

function http(url, {method = 'GET', retry = 3} = {}) {

    // read: https://gomakethings.com/promise-based-xhr/
    // also: https://gomakethings.com/why-i-still-use-xhr-instead-of-the-fetch-api/
    // ref: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    // ref: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest

	return new Promise((resolve,reject) => {

        // Create the XHR request
        const request = new XMLHttpRequest();

		// Setup our listener to process compeleted requests
		request.onreadystatechange = () => {

			// Only run if the request is complete
			if (request.readyState !== 4) return;

			// Process the response
			if (request.status >= 200 && request.status < 300) {
				resolve({ // success
                    data: request.responseText,
                    responseURL: request.responseURL, // NOT Supported by IE
                });
			} else if (request.status >= 500 && request.status < 600 && retry-- > 0) {
                // server error: retry after a brief delay
                setTimeout(() => {
                    http(url, {method, retry})
                        .then(resolve)
                        .catch(reject);
                }, 2000);
            } else { // 4xx errors
				reject({
                    status: request.status,
                    statusText: request.statusText
                })
			}
        };
        
        // Setup our HTTP request
		request.open(method || 'GET', url, true); // last parm true === make it async

		// Send the request
		request.send();
	});
}

const settings = {
    actualUrl: basicActualUrl, // give callers control over final url
    async download(url) { return http(url); }, // async method to download item: expect .data & .responseURL (in case of redirects)
};

loadModuleByUrl.settings = options => {
    Object.assign(settings, options);
    return loadModuleByUrl; // chaining
}

const loadedModules = {};
async function loadModuleByUrl(moduleRequestUrl, dependent) {

    // reject is NEVER used: unloadable modules (e.g. network|syntax errors) simply set to undefined
    return new Promise(async resolve => { // NO 'reject' as per above...

        const module = loadedModules[moduleRequestUrl] || (loadedModules[moduleRequestUrl] = { isKnown: false, module: undefined });

        function resolvedModule(m, type) {
            // if (err)
            //     logError(moduleRequestUrl.toUpperCase() + ' module: FAILED TO LOAD', type, err);
            // else
            //     logInfo(moduleRequestUrl.toUpperCase() + ' module: LOADED', type, m);
            if (arguments.length === 1) {//m instanceof Error) {
                module.err = m;
            }
            else {
                module.module = m; 
                module.type = type;
            }
            module.isLoaded = !module.err;
            module.listeners.forEach(listener => listener(module)); // resolve waiting modules: M or MODULE???
            resolve(module); // resolve this one
        }

        if (module.isKnown) {
            if (module.isLoaded)// !== undefined) 
                resolve(module); // modules are loaded once, then reused
            else {
                if (dependent) {
                    const cycle = module.dependents.find(m => m === dependent);
                    if (cycle) {
                        return resolvedModule(new Error('CYCLYCAL DEPENDENCY: ' + moduleRequestUrl + '<-->' + cycle));
                    }
                    module.dependents.push(dependent);
                }

                module.listeners.push(mod => resolve(mod)); // ??? needs TESTING
            }
        }
        else { // loading a new module
            const actualModuleUrl = settings.actualUrl(moduleRequestUrl, basicActualUrl);

            Object.assign(module, {
                isKnown: true,
                dependents: dependent ? [ dependent ] : [],
                listeners: [], // i.e. those waiting for this module to be loaded
                moduleRequestUrl, // original
                actualModuleUrl,
            });

            try {
                const m = await settings.download(actualModuleUrl);
                //logInfo(`DOWNLOADED MODULE=${moduleRequestUrl}${(moduleRequestUrl === actualModuleUrl ? '' : ` [from ${actualModuleUrl}]`)}`, m);

                const code = m.data; // may be AMD/UMD or CommonJS

                // Favor AMD modules first because no need for code manipulation and many browser-based modules are AMD/UMD anyway
                // - MUST pass dummy (i.e. undefined) module/exports/require else would use those from global context (if any)
                const initModule = new Function('define', 'module', 'exports', 'require', code); 

                // IMPORTANT: all AMD modules test for 'define.amd' being 'truthy'
                //            but some (e.g. lodash) ALSO check that "typeof define.amd == 'object'" so...
                amdDefine.amd = {}; // ...use an object (truthy) NOT 'true'

                // keep track of whether or not our define method was actually called...
                var isAMD = false; // ...because if not called, likely NOT an AMD module
                function amdDefine(...args) {
                    isAMD = true; // yey!
                    //logInfo('...' + moduleRequestUrl + ' is an AMD module');//, ...args);

                    const define = args.pop(); // always last param
                    if (typeof define !== 'function') 
                        throw new Error(`expecting 'define' to be a function - was ${typeof define}`);

                    const externals = args.pop() || [];
                    //const name = args.pop(); // unused so commented out (here for ref)

                    // resolve deps
                    const deps = externals.map(dep => loadModuleByUrl(dep, moduleRequestUrl));

                    Promise.all(deps).then(modules => {
                        try {
                            resolvedModule(define(...modules.map(m => m.module)), 'AMD'); // could fail (if not [correct] AMD)
                        }
                        catch(err) {
                            resolvedModule(err);
                        }
                    });
                }

                try {
                    // pass #1: try it as an AMD module
                    let undefined_module, // unassigned === undefined
                        undefined_exports, // ditto
                        dummy_require = () => {throw new Error('require is invalid in AMD modules: ' + moduleRequestUrl);};

                    initModule(amdDefine, undefined_module, undefined_exports, dummy_require);
                    //logInfo('...' + moduleRequestUrl + ' successfully completed initialization', isAMD ? 'is an AMD module' : 'is NOT and amd module');
                }
                catch(err) {
                    //logError('...' + moduleRequestUrl + ' failed to initialize as amd module', isAMD, err);
                    if (isAMD) resolvedModule(err)
                }

                if (!isAMD) {
                    if (isCommonJS(code)) { 
                        
                        // pass #2: yes, less efficient (since 2 passes) but allows for both modes (i.e. amd/umd and cjs) to be imported
                        
                        const newCode = cjsToAwaitRequire(code);
                        const cjsInit = new AsyncFunction('module', 'exports', 'require', newCode);
                        const moduleProxy = { exports: {} };
                        async function requireProxy(modName) {
                            const upl = new URL(modName, m.responseURL).href; // todo: need better handling for this (e.g. absolute https://)
                            return (await loadModuleByUrl(upl, moduleRequestUrl)).module;
                        }
                        try {
                            await cjsInit(moduleProxy, moduleProxy.exports, requireProxy);
                            resolvedModule(moduleProxy.exports, 'CommonJS');
                        }
                        catch(err) {
                            resolvedModule(err);
                        }
                    }
                    else {
                        resolvedModule(new Error('module seems to be neither AMD/UMD not CommonJS'));
                    }
                }
            }
            catch(err) {
                resolvedModule(err);
            }
        }
    });
}


/***/ })
/******/ ])));