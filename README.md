# load-dynamic-module
a browser-based loader that works with both AMD and CommonJS modules (with some caveats)

- **NOT YET FULLY TESTED**
    - **DO NOT USE**

- [![check it out](https://badgen.net/bundlephobia/minzip/load-dynamic-module)](https://bundlephobia.com/result?p=load-dynamic-module@1.0.25)
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

```
// TO DOCUMENT: 
// - can define GLOBALS to better "sandbox" module initialization
//     - can 'protect' framework code: e.g. redefine window. or console. or alert/confirm
// - custom url resolvers
// - custom loaders (css, json, ...)
//     - can load modules other than just javascript (text, json, css, objects, data)

// once loaded, modules are reused as initially loaded
// BUT, what happens if module is loaded with custom settings?
// - should that module be loadable again with different settings?
// - may want to reload an existing module but with different parameters (i.e. config)
// - save source? retry if config now different then config then?

/* generally background info:

    read: https://developers.google.com/web/fundamentals/primers/modules 
    - https://developers.google.com/web/updates/2017/11/dynamic-import
    - https://www.sitepoint.com/using-es-modules/
    also: https://curiosity-driven.org/minimal-loader
    also: https://michelenasti.com/2018/10/02/let-s-write-a-simple-version-of-the-require-function.html
    also: https://davidwalsh.name/javascript-loader
    also: https://www.davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/

    read: https://hackernoon.com/7-different-ways-to-use-es-modules-today-fc552254ebf4

    important fyi:
    - dynamic import() is NOT SUPPORTED by most modern browsers:
       - as of jan 21, 2019: edge=no, firefox=no, chrome=yes, safari=yes
       - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
*/

/* loadModule: similarities and differences from AMD's define structure:

    - no last param as function: 
        - use .then([...loadedModules]) instead
            - loadModule returns a promise that completes after all modules are loaded
    - loadModule NEVER FAILS: 
        - 'await loadModule' ALWAYS succeeds: 
            - no need to try/catch; catch clause will never execute
            - only .then clause needed; .catch clause will ever be called
        - problem modules (e.g. network|syntax|initialization errors) are resolved
          as the Error that caused the load failure
            - dependents can test for 'mod instanceof Error'
        - individual modules WILL be resolved as:
            - undefined: if nothing is returned from their execution
                - module loading is for its side-effects (e.g. sets up global vars, like jQuery, lodash)
            - Error: if loading generates an error (network|download|syntax|initialization error)
            - actual module if all is well
                - e.g. axios
    - loadModule can be called with 1 or more parameter:
        - each params treated as individual modules
            - can load a single module: 
                    const mod = loadModule('mod-url');
            - can load multiple modules (using array destructuring): 
                    const [mod1, mod2, mod3] = await loadModule('mod1-url', 'mod2-url', 'mod3-url');
        - each module is loaded ONLY ONCE
            - ID for that module is its resolved url
            - any further request for that module returns original initialized module
        - return for 'await loadModule(...)' is:
            - single module, if using single param
                - explicit: 
                        const mod = await loadModule('mod-url');
                - then clause: 
                        loadModule('mod-url')
                          .then(mod => {...code using module...});
            - [...array of modules...], if using 2 or more params
                - array of modules, can be destructured as follows:
                    - explicit: 
                          const [mod1, mod2, mod3] = await loadModule('mod1-url', 'mod2-url', 'mod3-url');
                    - then clause: 
                          loadModule('mod1-url', 'mod2-url', 'mod3-url')
                            .then(([mod1, mod2, mod3]) => {...code using modules...});
            - if don't know how many modules loaded (e.g. from a ...computedArray), 
                loadModule(...arrayOfModules)
                    .then(modOrMods => {
                        // resolvedMods (below) is ALWAYS an array
                        const resolvedMods = Array.isArray(modOrMods) ? modOrMods : [modOrMods];
                        // alternative:
                        // Array.isArray(modOrMods) || (modOrMods = [modOrMods]); 
                        // alternative:
                        const mods = Array([modOrMods]).flat(); // but array.flat() is NOT supported by Edge
                    })

    // readme.md#module-references
    //  - arg can be a string or not
    //      - if it's a string, it's loaded as per below
    //      - if it's not a string, the module's value is that arg
    //          - only sensical purpose for this is there is an onReady function as last param
    // if only 1 arg, that module is returned
    // if 2 or more args, loaded modules are returned as an array

    [read this](https://metafizzy.co/blog/switching-out-cdnjs-for-unpkg/)

    [CDNJS](https://cdnjs.com/api)

    [also this for jsdelivr](https://cdn.jsdelivr.net/npm/noty/)

    [Some notes from here](https://medium.freecodecamp.org/anatomy-of-js-module-systems-and-building-libraries-fadcd8dbd0e)
    - in package.json:
        - main is for UMDs
        - module is for ES6/import-export
        - also seen in the wild: 
            - browser (presumably amd)
            - unpkg: guess... :-)



    - QUESTION: should we ALWAYS return an array instead?
        - then there's no guessing
            - always destructure it
                const [mod] = loadModule('single-mod-url');
                loadModule('single-mod-url')
                    .then(([mod]) => {...code using single module...});
                const [mod1, mod2, mod3] = await loadModule('mod1-url', 'mod2-url', 'mod3-url');
                loadModule('mod1-url', 'mod2-url', 'mod3-url')
                    .then(([mod1, mod2, mod3]) => {...code using modules...});
            - use array[0] if know it's a single mod
        - maybe we export loadModules() and loadSingleModule()?
            - but then, which is default?
        - SO, question is, how likely/often will we load modules WITHOUT knowing specifically which 
          or how many modules we're loading... (i suspect, not many)
*/

/* loadModule parameters:

    - each param can be:
        - string (i.e. typeof param === 'string')
        - not a string (i.e. typeof param !== 'string')
            
    - if param is NOT a string
        - module becomes that object
            - no further processing occurs
    - if param is a string:
        - format is: [name=] [type: | type!] dataOrUrl
        - where:
            name: used to assign resulting module (as loaded & initialized)
            as window[name] = moduleValue;

            type: format is loaderName | loaderName-data | data
                    - if data or -data present, rest of string (including multilines)
                      is treated as explicit immediate data
                    - if no [-]data present, rest of string (presumably single line; meaningless otherwise)
                      is treated as a url to be resolved later

            dataOrUrl: either:
            - data (as specified by type)
            - a url, to be resolved by url resolvers

        All module content (immediate data or downloaded from a url) is then loaded
        through a loader

    - url resolving:
        - if starts with 'https://' or '//',
            - url is used as-is
        - if starts with '.' or '/'
            - url is used as relative to main html page (i.e. window,location.href)
                or url of parent module that requested it (e.g. https://cdn.jsdelivr.net/npm/axios)
        - anything else is treated as an NPM package and downloaded from:
            'https://cdn.jsdelivr.net/npm/url-ref-here'

        custom resolvers:
            - can be added via config and will take precendence over default resolvers (above)
                - to override a resolver, use a matching scheme that covers the url-scheme/format

    - loaders:
        - once downloaded (or if immediate data), content is processed through
            applicable loader (by type if explicit, by content-type if downloaded, 
            or by its extension if content-type not available)
        - each loader can pre-process content as needed, then returned [possibly] updated
            content, if needed (e.g. turn json content into an actual object using JSON.parse)
        - each loader can take actions on behalf of the content (e.g. load css code directly
            into the html page)
        - if [content-]type is javascript, code will THEN (i.e. after pre-processed by loader)
            be executed/initialized

        default (builtin) loaders:
        - css
            - loads css into html page
                - returned module value is css code
        - json
            - converts json content into an object
        - javascript
            - to prevent auto-initialization, use 'text' or 'data' as type
                - then will be left alone
            - can specify custom type
                - then pre-process and/or load as needed

        - custom loaders:
            - can be added via config and will take precendence over default loaders
                - to override a loader, use a matching scheme that covers the content type
*/

/* examples of module string references:

    'axios' 
        download from jsdelivr and load (i.e. initialize) module
    'axs=axios' 
        download from jsdelivr and load (i.e. initialize) module; then assign that module to window.axs
    'axs=text:axios' 
        download from jsdelivr but treat as text (so do NOT initialize); assign downloaded content (presumably text) to window.axs
    
    name=url // download and loads as css or json-param
    name=http://url 
    name=//url [same as above]
    name=./relative/url
    name=data:...plain text data...
    name=text-data:... load and assign (same as above)
    name=json-data:... load and assign as object
    name=json:url
    name=css:url

    url
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

    http://url
    http-data:??? [download as text?]
    https-data:??? [download as text?]
    text:url [download and use as-is]
    raw:url [download and use as-is]
    css:url
    json:url
    data:... [same as text-data; do nothing with data]
    css-data:... [loads as style]
    json-data:... [convert to obj]

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

// WHEN RESOLVING URLs:
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


// Using WITH and PROXY to create an execution context (e.g. for a plugin):
// - https://gist.github.com/soareschen/9b63a016174b6123abc073a2be068d48
// - read: http://2ality.com/2014/01/eval.html
// VERY convenient to add GLOBAL variables without explicitly defining it them upfront
// as required when using new Function(); good when there are MANY such variables
// BUT, gist above is NOT secure:
//  can ALWAYS access GLOBAL context: (0,eval)('this')
// UNLESS override EVAL && FUNCTION directly
// because if not ovveriden, can always access it directly using:
//    Object.getPrototypeFor(function(){}).constructor(...stringParms, 'function code here');


## Security

// BEST APPROACH to security for now: warn that dynamically loaded code has ACCESS TO EVERYTHING

/*
   Trying to sandbox dynamic code by protecting/securing the global window object 
   is a LOSING PROPOSITION:
   - it can add a lot of code (as per below)
   - a large amount of overhead (so likely performance hit)
   - and unless each case is considered individually, it's not clear that dynamic code
     will be appropriately sand-boxed
   - can always load by adding script tag (or iframe or img or audio/video or ?) and that would
     be VERY hard to prevent (unless prevent document manipulation)

   code below was an attempt in that direction: 
   - it is NOT currently used anywhere (or tested, or completed)
   - it MUST NOT be used anywhere else
   - it is kep here strictly for reference

    ### Javascript REALMS WILL SOLVE THESE issues
    - we'll wait for this to become part of the language
    - currently at stage 2 in TC39

    There is no easy way to prevent module code from accessing main window object, 
    even if proxying all vars using 'with' because even without using any names, 
    Object.getPrototypeOf(function(){}).constructor(...parms, `window; (0,eval)('this')`) will
    gain access to top window unless CHANGE (function(){}).constructor itself
    which would change it FOR EVERYONE (which may be OK)
    - still does NOT prevent code from explicitly loading directly from script element

    ### REALMS are likely what I'm looking for to execute 3rd-party code using a separate 
    // (i.e. self-contained) global context;
    // TODO: wait until REALMS/SES are at TC39 Stage 3 level before implementing
    //       - in the meantime, NO global security for dynamic modules/plugins
    //       - BUT:
    //          - no worse than, say, jquery plugins, that work in main/global/user space anyway
    //          - no worse than php wordpress plugins that also work in user space and can take down
    //            a site, or spy for information
    // - READ about REALMS and SES:
    //   - read: https://ocapjs.org/ (forum about javascript items, esp. relating to security)
    //   - REALMS:
    //      - not currently transpilable from babel (feb 12, 2019)
    //      - best to wait until realms at least at stage 3
    //      - read: https://gist.github.com/dherman/7568885
    //      - read: https://github.com/tc39/proposal-realms
    //      - read: https://github.com/tc39/proposal-realms/tree/master/shim
    //   - SES: Secure EcmaScript
    //      - https://github.com/Agoric/SES
    //      - based on Google CAJA SES
    //        - https://developers.google.com/caja/
    //        - https://github.com/google/caja/wiki/SES
*/

```

