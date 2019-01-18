(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("axios"));
	else if(typeof define === 'function' && define.amd)
		define(["axios"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("axios")) : factory(root["axios"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(window, function(__WEBPACK_EXTERNAL_MODULE__0__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__0__;

/***/ }),
/* 1 */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadedModules", function() { return loadedModules; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return loadModuleByUrl; });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);


// Some alternatives (though not complete as per our reqs): 
// - minimal REQUIRE implementation: https://eloquentjavascript.net/10_modules.html
// - http://stuk.github.io/require1k/

// NPM package.json DOC: https://docs.npmjs.com/files/package.json
// also: https://github.com/defunctzombie/package-browser-field-spec

// es2015 === es6 modules: import x from 'y';
// commonjs2: for node, module.exports = _entry_return_; // uses require('dep') for dependencies
// amd: for browsers, define([...deps],function(...deps){}) 
//      - should not use require; all deps are upfront in deps array

// AMD: 
// - define(name, [deps], fcn) ===> modules[name/url] = fcn(...resolvedDeps);
//      - this is how to define a module
//      - fcn executed once, then cached for that name
//          - fcn must RETURN its module (e.g. an object of methods)
//      - fcn executed AFTER all deps are loaded & resolved
// - require([deps], fcn) is how to USE/EXECUTE a module:
//      - module is represented by fcn
//      - module is executed by calling fcn(deps)
//          - but only once all deps are loaded

// todo: **could** allow require from within an AMD module (use same technique as for commonjs modules)
//       - not standard, but so what... (simplifies writing manually-written plugins perhaps?)

// prevent webpack/babel from removing async syntax (which neutralizes intended effect)
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
const AsyncFunction = new Function(`return Object.getPrototypeOf(async function(){}).constructor`)();

const cjsToAwaitRequire = cjs => cjs.replace(/\brequire\s*[(]/g, 'await require(');

const isCommonJS = code => /module[.]exports/.test(code);

function basicActualUrl(requestedUrl) {
    return /^(https?[:])?[/][/]/i.test(requestedUrl) ? requestedUrl // explicit url so leave it alone
                    : /^[a-z_$]/i.test(requestedUrl) ? `https://unpkg.com/${requestedUrl}` // simple name so use NPM (via unpkg)
                                                     : requestedUrl; // relative path from here (where's here?)
}

const settings = {
    logInfo: console.log.bind(console),
    logError: console.error.bind(console),
    actualUrl: basicActualUrl, // give callers control over final url
};

loadModuleByUrl.settings = options => {
    Object.assign(settings, options);
    return loadModuleByUrl; // for chaining
}

const loadedModules = {};
async function loadModuleByUrl(moduleRequestUrl, dependent) {

    // reject is NEVER used: unloadable modules (e.g. network|syntax errors) simply set to null
    return new Promise(async resolve => { // NO 'reject' as per above...

        const module = loadedModules[moduleRequestUrl] || (loadedModules[moduleRequestUrl] = { isKnown: false, module: undefined }),
              logInfo = settings.logInfo, // shorthand
              logError = settings.logError; // shorthand

        function resolvedModule(m, type, err) {
            if (err)
                logError(moduleRequestUrl.toUpperCase() + ' module: FAILED TO LOAD', type, err);
            else
                logInfo(moduleRequestUrl.toUpperCase() + ' module: LOADED', type, m);

            module.module = m; 
            module['is' + type] = true;
            module.listeners.forEach(listener => listener(m)); // resolve waiting modules
            resolve(module); // resolve this one
        }

        if (module.isKnown) {
            if (module.module !== undefined) 
                resolve(module); // modules are loaded once, then reused
            else {
                if (dependent) {
                    const cycle = module.dependents.find(m => m === dependent);
                    if (cycle) {
                        return resolvedModule(null, 'CYCLICAL-DEPENDENCY', new Error('CYCLYCAL DEPENDENCY for ' + moduleRequestUrl + ' with ' + cycle));
                    }
                    module.dependents.push(dependent);
                }

                listeners.push(mod => resolve(mod));
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
                const m = await axios__WEBPACK_IMPORTED_MODULE_0__.get(actualModuleUrl);
                logInfo(`DOWNLOADED MODULE=${moduleRequestUrl}${(moduleRequestUrl === actualModuleUrl ? '' : ` [from ${actualModuleUrl}]`)}`, m);

                const code = m.data; // may be AMD/UMD or CommonJS

                // Favor AMD modules first because no need for code manipulation and many browser-based modules are AMD/UMD anyway
                // - MUST pass dummy (i.e. undefined) module/exports/require else would use those from global context (if any)
                const initModule = new Function('define', 'module', 'exports', 'require', code); 

                // IMPORTANT: all AMD modules test for 'define.amd' being truthy
                //            but some (e.g. lodash) ALSO check that typeof define.amd == 'object' so...
                amdDefine.amd = {}; // ...an object (truthy) NOT 'true' (as per above note)

                // keep track of whether or not our define method was actually called...
                var isAMD = false; // ...because if not called, likely NOT an AMD module
                function amdDefine(...args) {
                    isAMD = true;
                    logInfo('...' + moduleRequestUrl + ' is an AMD module');//, ...args);

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
                            resolvedModule(null, 'AMD-INIT-ERROR', err);
                        }
                    });
                }

                try {
                    let undefined_module, // unassigned means undefined
                        undefined_exports, // ditto
                        dummy_require = () => {throw new Error('require is invalid in AMD modules: ' + moduleRequestUrl);};

                    initModule(amdDefine, undefined_module, undefined_exports, dummy_require);
                    logInfo('...' + moduleRequestUrl + ' successfully completed initialization', isAMD ? 'is an AMD module' : 'is NOT and amd module');
                }
                catch(err) {
                    logError('...' + moduleRequestUrl + ' failed to initialize as amd module', isAMD, err);
                }

                if (!isAMD) {
                    if (isCommonJS(code)) { 
                        
                        // pass #2: yes, less efficient (since 2 passes) but allows for both modes (i.e. amd/umd and cjs) to be imported
                        
                        const newCode = cjsToAwaitRequire(code);
                        const cjsInit = new AsyncFunction('module', 'exports', 'require', newCode);
                        const moduleProxy = { exports: {} };
                        async function requireProxy(modName) {
                            const x2 = new URL(modName, m.request.responseURL); // todo: need better handling for this (e.g. absolute https://)
                            const upl = x2.href;
                            logInfo('CJS REQUIRE: importing ' + upl);
                            const mmx = await loadModuleByUrl(upl, moduleRequestUrl);
                            return mmx.module;
                        }
                        try {
                            await cjsInit(moduleProxy, moduleProxy.exports, requireProxy);
                            resolvedModule(moduleProxy.exports, 'CommonJS');
                        }
                        catch(err) {
                            resolvedModule(null, 'CommonJS-INIT-ERROR', err);
                        }
                    }
                    else {
                        resolvedModule(null, 'MODULE-TYPE-UNKNOWN', new Error('module seems to be neither AMD/UMD not CommonJS'));
                    }
                }
            }
            catch(err) {
                resolvedModule(null, 'AXIOS-DOWNLOAD-ERR', err);
            }
        }
    });
}


/***/ })
/******/ ]);
});