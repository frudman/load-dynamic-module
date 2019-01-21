# load-dynamic-module
a browser-based loader that works with both AMD and CommonJS modules (with some caveats)

- **NOT YET FULLY TESTED**
    - **DO NOT USE**

- [Currently at 1.5kB (minified & gzipped)](https://bundlephobia.com/result?p=load-dynamic-module@1.0.22)
- ![check it out](https://badgen.net/bundlephobia/minzip/load-dynamic-module)
- Allows for on-demand requires in AMD modules
- Allows imports of CommonJS modules into browser
    - CAVEAT: cjs module can only have top-level requires. Nested requires (i.e. those within a function) 
      will not work (because that function would need to be made async, then any function using that function
      would also need to be made async, and so on...)

## Some alternatives (though not complete as per our reqs): 
- minimal REQUIRE implementation: https://eloquentjavascript.net/10_modules.html
- http://stuk.github.io/require1k/

Read [NPM package.json DOC](https://docs.npmjs.com/files/package.json) and also [this bit about the .browser field](https://github.com/defunctzombie/package-browser-field-spec)

- es2015 === es6 modules: import x from 'y';
- commonjs2: for node, module.exports = _entry_return_; // uses require('dep') for dependencies
- amd: for browsers, define([...deps],function(...deps){}) 
    - should not use require; all deps are upfront in deps array

## AMD: 
- `define(name, [deps], fcn`) ===> modules[name/url] = fcn(...resolvedDeps);
    - this is how to define a module
    - fcn executed once, then cached for that name
        - fcn must RETURN its module (e.g. an object of methods)
    - fcn executed AFTER all deps are loaded & resolved
- `require([deps], fcn)` is how to USE/EXECUTE a module:
     - module is represented by fcn
     - module is executed by calling fcn(deps)
         - but only once all deps are loaded


- todo: **could** allow require from within an AMD module (use same technique as for commonjs modules)
    - not standard, but so what... (simplifies writing manually-written plugins perhaps?)

