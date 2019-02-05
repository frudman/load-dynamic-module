define(function() { return /******/ (function(modules) { // webpackBootstrap
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


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addKnownModule = addKnownModule;
exports.default = void 0;

var _tidbits = require("tidbits");

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
    loadModule has many similarities and some difference from AMD's define structure:

    if called without a last-param onready function,
        - all params treated as individual modules
            - can load a single module: const mod = loadModule('mod-url');
            - can load multiple modules: const [mod1, mod2, mod3] = await loadModule('mod1-url', 'mod2-url', 'mod3-url');
        - each module is loaded ONLY ONCE
            - ID for that module is its resolved url
            - any further request for that module returns original result
        - return for call is module (if single param) or array of modules (if 2 or more params)
            - if array of modules, can be destructured as follows:
                const [mod1, mod2, mod3] = await loadModule('mod1-url', 'mod2-url', 'mod3-url');
        - loadeModule NEVER FAILS (await ALWAYS succeeds: no need to try/catch; catch clause will never execute)
            - individual modules CAN be:
                - undefined: if nothing is returned from their execution
                - Error: if loading generates an error (either a download error or an execution error on load)
                - actual module if all is well

    - if last param is a function, it's considered an onReady-type function
        - the function will be passed 1 parm for each of the prior arguments
            - for example: 
                - loadModule('mod1-url', 'mod2-url', 'mod3-url', (mod1,mod2,mod3) => { ...you code here...; return [mod1,mod2,mod3]; })
                - loadModule('mod1-url', 'mod2-url', 'mod3-url', (...mods) => { ...you code here...; return ...mods; })
                - loadModule('mod1-url', 'mod2-url', 'mod3-url', (...mods) => { ...you code here...; return [newModx, newMody]; })
        - the "loaded" module will then be set from the RESULT of that function's execution
        - if the function returns undefined (i.e. returns nothing)
            - the module will then also be undefined (a valid value)
        - if the function returns an array of "stuff" (including incoming loaded modules)
            - the result could then be destructured as needed
        - the function will be executed ALWAYS, even if some dep-mods fail
            - that's different from define, which doesn't execute the function if any dependencies fail (RIGHT? TBV)
*/

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
//'my-npm-packages/freddy-javascript-utils';//'tidbits';
// convert commonjs 'require' (implicitly sync) to 'await require' (explicit async)
// - WORKS ONLY FOR top-level requires since nested requires (i.e. within a function) will fail 
//   with a syntax error (unless that function itself was already marked async)
// - also workd only with plain require() without intervening comments
// - also works only without 'await require(' TODO: could actually check for this and leave it alone if already there
const commonjsToAwaitRequire = cjs => cjs.replace(/\brequire\s*[(]/g, 'await require('); // quick way to see if code MIGHT be commonjs


const isCommonJS = code => /module[.]exports/.test(code); // convert a dependency reference to an http-gettable url
// todo: conver to series of matches/resolver


function xxdefaultUrlResolver(requestedUrl, baseURL) {
  // - if ([0] === '.') or ([0]==='/'&&[1]!=='/') it's relative to window.location.href
  // convert '//url...' to 'https://url...'
  // most (all?) browsers will do that conversion implicitly: should we comment out?
  //requestedUrl = requestedUrl.replace(/^[/][/]/, location.protocol + '//'); // location.protocol includes a trailing ':'
  if (/^(https?[:])?[/][/]/i.test(requestedUrl)) return requestedUrl; // explicit url so leave it alone
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
} // very crude means of extracting an extension; also, dot is not included; and another thing... :-)


const extension = str => (str || '').split('.').pop(); // a more "accurate" (or complete) method (but more code)
//const extension = (str, keepDot = false) => ((str||'').match(/[.][^.]*$/)||[''])[0].substring(keepDot ? 0 : 1);
// we keep the 'private static' field loadedModules as a separate const because,
// even if we could have it as a class field (es10+?) and build it using @babel/plugin-proposal-class-properties, 
// bundlephobia (https://bundlephobia.com/result?p=load-dynamic-module) doesn't seem
// to recognize that plugin or the build steps (returns with build error)


const loadedModules = {}; // todo: change name to url OR ID where id can be a name or a url (for ref only so doens't matter, but same name for same module)
// BUT: if can have same module ID with different results (i.e. module pre-processed on load and/or different globals)
//      then what? new name for newer module? overwwrite old module? get explicit module name?
//      if so, only need to keep source then re-compile...

const getModule = id => loadedModules[id] || (loadedModules[id] = new Module({
  id
}));

const addModule = (id, module) => loadedModules[id] = new Module({
  id,
  module
}); // log('PPPPP', typeof Error, Error instanceof Error, new Error('dd') instanceof Error, typeof new Error('da'), Error instanceof class abc{}, typeof class abcx{})


class DownloadError extends Error {
  constructor(msg, err) {
    super(msg);
    this.downloadError = err;
  }

} //const DownloadError = (msg, downloadError) => Object.assign(new Error(msg), {downloadError});
//const ModuleLoadError = (msg, ...loadErrors) => Object.assign(new Error(msg), {loadErrors});


class ModuleLoadError extends Error {
  constructor(msg, ...errs) {
    super(msg);
    this.loadErrors = errs;
  }

} // cheap means to ensure no infinite loop while resolving dependencies


const LONGEST_LIKELY_DEPENDENCY_CHAIN = 20; // number of modules depending on me BEFORE I'm initially resolved

class Module {
  constructor({
    id,
    module
  } = {}) {
    id && (this.id = id); // its source URL

    module && (this.module = module); // DON'T SET IT unless there's a value there
  }

  get isLoaded() {
    return 'module' in this;
  }

  //|| 'err' in this; }// this.module || this.err; }
  get isUnresolved() {
    return !this.isLoaded && !!this.resolveMe;
  } // maybe just always resolve (either module or err, no need to differentiate?)


  resolved(m) {
    this.module = m; // UNCOMMENT to give users a hint
    // if (m instanceof Error && m.name === 'SyntaxError' && /await.+async.+function/i.test(m.message || ''))
    //     m.message = `${this.id} may be CJS module with nested requires\n\t(nested requires must be inside async functions)\n\toriginal error: ${m.message}`)
    // this.publicizeResolution();

    this.resolveMe();
    delete this.resolveMe; // why not...
    // ...then, let dependents know

    (this.waitingOnMe || []).forEach(resolveDep => resolveDep());
    delete this.waitingOnMe; // why not...
  } // resolvedWithError(err) {
  //     this.err = err;
  //     // try to give a friendly hint: e.g. from chrome: 'await is only valid in async function'
  //     if (err.name === 'SyntaxError' && /await.+async.+function/i.test(err.message || ''))
  //         console.warn(`${this.id} may be CJS module with nested requires\n\t(nested requires must be inside async functions)`)
  //     else
  //         console.error(`${this.id} module was not loaded`, err);
  //     this.publicizeResolution();
  // }
  // publicizeResolution() {
  //     // first...
  //     this.resolveMe();
  //     delete this.resolveMe; // why not...
  //     // ...then, let dependents know
  //     (this.waitingOnMe || []).forEach(resolveDep => resolveDep());
  //     delete this.waitingOnMe; // why not...
  // }


  dependsOnMe(resolveDependent) {
    // Strategies to prevent infinite dependency loops (e.g. a --> b --> c --> a):
    // 1) actually check for cycles: 
    //    - would need to keep track of relationships between dependents (i.e. parent<-->child)
    //    - most efficient, most "correct"
    //    - most code/work
    //    - and only useful if cycles do occur (which is an error so should be caught during dev)
    // 2) just allow for a maximum number of dependents; if more are added, assume it's because of a cycle
    //    - trivial implementation
    //    - less efficient because if there is a cycle error, it will runs extra loops before error is raised
    //    - selected limit should be high enough to make sure legitimate cases are not erroneously flagged
    //        - which exacerbates earlier point (of being less efficient)
    //    - BUT, in case where no ACTUAL errors (which should be ALL of the time)
    //      - it's the FASTEST! EASIEST! SIMPLEST!
    const deps = this.waitingOnMe || (this.waitingOnMe = []);
    deps.push(resolveDependent); // method 2, as per above

    if (deps.length > LONGEST_LIKELY_DEPENDENCY_CHAIN) this.resolved(new Error(`likely cycle in module resolution for ${this.id} (depth=${deps.length})`));
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

      if (typeof moduleDefine !== 'function') throw new Error(`expecting 'define' to be a function (was ${typeof moduleDefine})`); // find out how many deps the moduleDefine function expects
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
      // at this point we know we're in an AMD module since this define method was called from module source code
      // resolve dependencies


      privateLoader(subDepResolution, ...externals, async (...resolvedDeps) => {
        try {
          // IF ANY resolvedDeps are ERRORS, do NOT execute define method
          const errs = resolvedDeps.filter(dep => dep instanceof Error);

          if (errs.length > 0) {
            thisModule.resolved(new ModuleLoadError(`AMD Define method not executed because of failed dependencies`, ...errs));
          } else {
            //thisModule.resolved(moduleDefine(...resolvedDeps.map(dep => dep.module))); // could fail (if not [correct] AMD)
            //log('AMD DEFINE private loading', ...resolvedDeps, ';;;');
            //const xx = await moduleDefine(...resolvedDeps); // for an AMD, resulting/defined module is RESULT of function
            //log('AMD DEFINE private loading - after defined', xx || "NOTHING_NADA", ';;;');
            thisModule.resolved((await moduleDefine(...resolvedDeps))); // could fail (if not [correct] AMD)
          }
        } catch (err) {
          //log('AMD DEFINE private loading - ERROR', err);
          thisModule.resolved(new ModuleLoadError(`AMD Define method failed`, err)); // if not AMD, or some other error...
        }
      });
    }

    return {
      defineMethod,

      get isAMD() {
        return isAMD;
      }

    };
  }

} // allows modules loaded by other means to be referenced by all


function addKnownModule(ref, module, customResolvers = []) {
  // store name as it would be resolved so if different relative URLS point to same module,
  // that module is loaded only once
  const id = customResolvers.concat(urlResolvers).find(resolver => resolver.t(ref)).r(ref); // resolve it (& becomes its id)

  addModule(name, new Module({
    id,
    module
  }));
}

const urlResolvers = [// r = requestUrl, b = baseUrl; return string if good, false otherwise
//(r,b) => /^(https?[:])?[/][/]/i.test(r) && r,
{
  t: (u, b) => /^(https?[:])?[/][/]/i.test(u),
  r: (u, b) => u
}, {
  t: (u, b) => /^[a-z_$]/i.test(u),
  r: (u, b) => `https://cdn.jsdelivr.net/npm/${u}`
}, //(r,b) => /^[a-z_$]/i.test(r) && `https://cdn.jsdelivr.net/npm/${r}`, // a.k.a. a "bare import" in CJS parlance (i.e. /node_modules/...)
//return `https://unpkg.com/${requestedUrl}`; // simple name so use NPM (via unpkg)
//return `https://cdn.jsdelivr.net/npm/${requestedUrl}`; // simple name so use NPM (via unpkg)
// based on: https://developer.mozilla.org/en-US/docs/Web/API/URL
//(r,b) => b ? new URL(r, b).href : r,
{
  t: (u, b) => true,
  r: (u, b) => b ? new URL(u, b).href : u
}];
const loaders = [// each {handler} has:
// - t: function that test if loader applies to this type of content
// - c: function that processes the content as needed (e.g. loads it as css); then it SHOULD return the [possibly modified] content
// custom loaders get added AHEAD of these so can always override loaders below
{
  t: _t => /css/i.test(_t),
  c: _c => (addCSS(_c), _c)
}, {
  t: _t2 => /json/i.test(_t2),
  c: _c2 => JSON.parse(_c2)
}, // ignore parse errors: will be handled later
// catch all (so there's always a handler: makes for easier logic later)
{
  t: _t3 => true,
  c: _c3 => _c3
}];
const mainConfig = {
  baseUrl: window.location.href,
  globals: () => {},
  urlResolvers,
  loaders
};
const publicLoader = privateLoader.bind(null, mainConfig);

publicLoader.config = (cfg = {}) => {
  const fcn = privateLoader.bind(null, Object.assign({}, mainConfig, cfg, {
    loaders: (cfg.loaders || []).concat(mainConfig.loaders),
    urlResolvers: (cfg.urlResolvers || []).concat(mainConfig.urlResolvers)
  }));
  fcn.load = fcn; // so can chain in single call loadModule.config({...}).load(...)

  return fcn;
};

var _default = publicLoader;
exports.default = _default;
addKnownModule('load-dynamic-module', publicLoader); // self: trivial case

function addCSS(cssCode) {
  const head = document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  style.setAttribute('type', 'text/css');
  style.appendChild(document.createTextNode(cssCode));
  head.appendChild(style);
} // keep track of downloading/downloaded modules/dependencies


const alreadyInProgress = {};

async function privateLoader(config, ...args) {
  // each arg is a module (except maybe last arg)
  //  - arg can be a string or not
  //      - if it's a string, it's loaded as per below
  //      - if it's not a string, the module's value is that arg
  //          - only sensical purpose for this is there is an onReady function as last param
  //  - if LAST ARG is a function:
  //      - that's an OnReady() function executed after all other modules are loaded
  //      - loaded mods are passed to that function
  //      - result of privateLoader is result from that function
  //          - if result is undefined: should we just return the modules in first place?
  // if only 1 arg, that module is returned
  // if 2 or more args, loaded modules are returned as an array
  // NO REJECT CLAUSE: will never fail (but there can be modules that are resolved to Error)
  // - so unloadable modules (e.g. network or syntax errors) are set to undefined (module.err contains reason)
  // - so reject clause (of Promise below) is NEVER used
  // ALWAYS returns an actual module or err
  return new Promise(resolveWhenReady => {
    const {
      baseUrl,
      globals,
      urlResolvers,
      loaders
    } = config; // extract config parms
    // for when all is said & done...

    const onReady = args.length && typeof args[args.length - 1] === 'function' ? args.pop() : undefined;
    const downloads = [];

    for (const dep of args) {
      if (typeof dep === 'string') {
        // since [^] matches everything (including newlines), m will ALWAYS match EVERY string
        // so no need to test for m (as in m && ...)
        const m = dep.match(/(\w+[=])?(([a-z]+)([-]data)?[:!])?([^]+)/i),
              globalName = m[1] && m[1].slice(0, -1),
              // to be assigned as window.[globalName]
        isData = /data/i.test(m[3]) || m[4],
              data = isData ? m[5] : '',
              isHttpx = /https?/i.test(m[3]),
              url = isData ? '' : isHttpx ? m[3] + '://' + m[5] : m[5],
              type = m[3]; // if explicit (else get from downloaded content's type)

        if (url) {
          // DOWNLOAD DATA
          const finalUrl = urlResolvers.find(rslvr => rslvr.t(url, baseUrl)).r(url, baseUrl); // see if a module and if already there

          const inProgress = alreadyInProgress[finalUrl];

          if (inProgress) {
            downloads.push(inProgress); // wait for it; may already be downloaded
          } else {
            downloads.push(alreadyInProgress[finalUrl] = (0, _tidbits.http)(finalUrl).then(downloaded => ({
              type: type || downloaded.contentType || extension(finalUrl),
              data: downloaded.content,
              globalName,
              finalUrl // becomes base for relative-base sub-dependencies

            })).catch(err => ({
              finalVALUE: new DownloadError(`module ${finalUrl} failed to download`, err)
            })));
          }
        } else {
          // IMMEDIATE DATA
          downloads.push({
            type,
            data,
            globalName
          }); // may still pass through loaders
        }
      } else {
        // ACTUAL OBJECT
        downloads.push({
          finalVALUE: dep
        }); // all done
      }
    }

    Promise.all(downloads).then(async resolvedDeps => {
      // an array
      // first, load all non-js dependencies
      for (const dep of resolvedDeps) {
        if (!('finalVALUE' in dep)) {
          // not already set (note: we test for actual presence (not just test for dep.finalVALUE)
          // since it may have been resolved using a 'falsey' value)
          // ALL deps come through here, INCLUDING javascript code
          // to enable PRE-PROCESSING of source before loading
          try {
            // loaders includes [MUST have] a catch-all so always a loader to be found
            dep.initialVALUE = loaders.find(loader => loader.t(dep.type)).c(dep.data);
          } catch (err) {
            dep.finalVALUE = err; // an error from its loader (e.g. syntax error)
          }
        }
      } // may want to reload an existing module but with different parameters (i.e. config)
      // - save source? retry if config now different then config then?
      // next, do all js deps (modules)


      for (const dep of resolvedDeps) {
        if (!('finalVALUE' in dep)) {
          if (/javascript/i.test(dep.type)) {
            // may already be resolved; NEVER FAILS, but may have error
            dep.finalVALUE = (await loadJavascriptModule(dep.finalUrl, dep.initialVALUE)).module;
          } else dep.finalVALUE = dep.initialVALUE; // now final forever
          // NOW, can assign to global (if need be)
          // todo: maybe check (& invalidate) some important globals (e.g. xmlhttprequest, alert/confirm, console, document, ...)
          // although a module/plugin could always just assign directly...


          dep.globalName && (window[globalName] = dep.finalVALUE); // delete all keys now that we have a final value

          Object.keys(dep).forEach(k => !/finalVALUE/.test(k) && delete dep[k]);
        }
      } // finally, 


      try {
        const mods = resolvedDeps.map(dep => dep.finalVALUE);
        if (onReady) resolveWhenReady(onReady(...mods)); // result is whatever the onReady returns...
        else if (resolvedDeps.length === 1) resolveWhenReady(mods[0]); // could be: undefined, module, or error
          else resolveWhenReady(mods); // an array
      } catch (err) {
        resolveWhenReady(err);
      }
    }); // method to load javascript modules in a controlled environment (i.e. using AsyncFunction)

    async function loadJavascriptModule(moduleUrl, moduleSourcecode) {
      // code is ALWAYS javascript BUT may be AMD/UMD or CommonJS: we don't know yet
      // NEVER FAILS but module may "resolve" to an Error
      // NO 'reject' param/clause as per note above...
      // returns a module object with {.module, .err, .otherStuff}
      return new Promise(async resolveJSM => {
        // get existing module (if already loaded), or creates new one
        const module = getModule(moduleUrl);

        if (module.isLoaded) {
          resolveJSM(module); // modules are loaded once, then reused
        } else if (module.isUnresolved) {
          module.dependsOnMe(() => resolveJSM(module)); // queue request
        } else {
          // loading a new module
          // set up what will happens when it's resolved
          module.resolveMe = () => resolveJSM(module);

          try {
            // when resolving sub-dependencies; FROM original configuration except for baseUrl
            const subDepResolution = {
              baseUrl: moduleUrl,
              globals,
              urlResolvers,
              loaders
            }; // will try it as an amd module

            const AMD_MODULE = module.genAMDDefine(subDepResolution);
            const amdProxy = {
              // for amd modules
              define: AMD_MODULE.defineMethod,
              module: undefined,
              exports: undefined,

              require(ref) {
                throw new Error(`cannot 'require' in AMD module ${moduleUrl}:\n\try 'await requireAsync("${ref}"' instead`);
              },

              requireAsync: async nameOrUrl => await privateLoader(subDepResolution, nameOrUrl) // always returns actual module (or err)

            }; // may also need to try it as a CJS module (if amd fails)

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
              require: async nameOrUrl => await privateLoader(subDepResolution, nameOrUrl) // recursion here
              // customize proxies & globals as needed

            };
            globals(amdProxy, cjsProxy); // Try as AMD module first because 1) many browser-based modules are AMD/UMD anyway and 2) no need for code manipulation
            // - MUST pass dummy module/exports/require else would use/fallback on those from global context if any
            // - Use AsyncFunction in case module code uses async requires
            // - could initModule.bind(x) but this would change meaning of 'this' within module: default is global/window object
            //    - this could be a means to protect the window object if needed (e.g. by replacing it with null, or a proxying object)

            const initModule = new _tidbits.AsyncFunction(...Object.keys(amdProxy), moduleSourcecode);

            try {
              // pass #1: try it as an AMD module first
              await initModule(...Object.values(amdProxy));
            } catch (err) {
              // if was an AMD, consider it resolved (though with errors)
              if (AMD_MODULE.isAMD) log('RESOLved mod WITH ERRORS', moduleUrl, err);
              AMD_MODULE.isAMD && module.resolved(err); // else, fall through and see if it works with CJS below
            }

            if (!AMD_MODULE.isAMD) {
              if (isCommonJS(moduleSourcecode)) {
                // pass #2: yes, less efficient (since 2 passes) but allows for both modes (i.e. amd/umd and cjs) to be imported
                // BIG CAVEAT: only top-level requires will be honored in cjs; nested requires (within non-async functions) will fail
                const awaitableCode = commonjsToAwaitRequire(moduleSourcecode);
                const commonjsInit = new _tidbits.AsyncFunction(...Object.keys(cjsProxy), awaitableCode);
                await commonjsInit(...Object.values(cjsProxy));
                module.resolved((cjsProxy.module || {}).exports || cjsExports);
              } else {
                module.resolved(new Error('module seems to be neither AMD/UMD nor CommonJS'));
              }
            }
          } catch (err) {
            module.resolved(err);
          }
        }
      });
    }
  });
}

/***/ })
/******/ ])});;