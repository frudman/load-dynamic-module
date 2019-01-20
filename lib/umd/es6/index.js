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
// a trivial replacement for axios.get (less code)

// this code depends on XMLHttpRequest settings .responseURL field on completion
// this is NOT SUPPORTED in IE (any versions)
// so this code will NOT work on IE

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

			// Only run if the request is complete
			if (request.readyState !== 4) return;

			// Process the response
			if (request.status >= 200 && request.status < 300) {
				resolve({ // success
                    data: request.responseText,
                    responseURL: request.responseURL, // NOT SUPPORTED by IE
                });
			} else if (request.status >= 500 && request.status < 600 && retry-- > 0) {
                // server error: retry...
                setTimeout(() => {
                    http(url, {method, retry, retryDelayInMS})
                        .then(resolve)
                        .catch(reject);
                }, retryDelayInMS); // ...after a brief delay...
                retryDelayInMS *= 2; // ...and progressively increase it for next go around
            } else { // 4xx errors or too many retries
				reject({
                    status: request.status,
                    statusText: request.statusText
                })
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
// method used to actually download modules
 

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

// todo: create: npm run inc: incr [package.json.version] && git add . && git commit -m 'misc' && git push && npm publish
// need to write 'incr'

// const settings = {
//     actualUrl: basicActualUrl, // give callers control over final url
//     //async download(url) { return http(url); }, // async method to download item: expect .data & .responseURL (in case of redirects)
// };

var resolveURL = basicActualUrl;
loadModuleByUrl.setUrlResolver = customResolver => {
    resolveURL = customResolver || basicActualUrl; // so set to null to reset
    return loadModuleByUrl; // can chain op
}

// loadModuleByUrl.settings = options => {
//     Object.assign(settings, options);
//     return loadModuleByUrl; // chaining
// }

const loadedModules = {};

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


async function loadModuleByUrl(moduleRequestUrl, dependent) {

    // loadModuleByUrl NEVER FAILS:
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
            module.isLoaded = !module.err;

            // then, resolve modules waiting on this one
            module.listeners.forEach(listener => listener(module));

            // then, resolve this one
            resolve(module);
        }

        if (module.isKnown) {
            if (module.isLoaded)// !== undefined) 
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
                moduleRequestUrl, // original
                actualModuleUrl,
            });

            try {
                const m = await http(actualModuleUrl);
                //logInfo(`DOWNLOADED MODULE=${moduleRequestUrl}${(moduleRequestUrl === actualModuleUrl ? '' : ` [from ${actualModuleUrl}]`)}`, m);

                const code = m.data; // may be AMD/UMD or CommonJS

                // Favor AMD modules first because no need for code manipulation and many browser-based modules are AMD/UMD anyway
                // - MUST pass dummy (i.e. undefined) module/exports/require else would use those from global context (if any)
                const initModule = new Function('define', 'module', 'exports', 'require', code); 

                // SHOULD WE make asyncFunction also (to allow for require-async?)

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
                            moduleIsNowResolved(define(...modules.map(m => m.module)), 'AMD'); // could fail (if not [correct] AMD)
                        }
                        catch(err) {
                            moduleIsNowResolved(err);
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
                    if (isAMD) moduleIsNowResolved(err)
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


/***/ })
/******/ ]);
});