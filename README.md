# load-dynamic-module
a browser-based loader that works with both AMD and CommonJS modules

- minimal IF already using AXIOS in app (will reuse that module to actually get remote modules)
- webpacked with and without AXIOS (without means define(['axios'], ...))
- best use is to import this module in an app that then gets bundled (webpack, rollup) with axios

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

