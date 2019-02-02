// FYI: these BABEL settings (below) could be included directly in package.json 
// as "babel":{ presets, plugins} root property (read https://babeljs.io/docs/en/config-files)
// BUT... package.json CANNOT be annotated with comments so keep it as a separate file here for docs

// ALSO, we now have functions/code below so inclusion in package.json is no longer an option

// important: .babelrc is another way (traditional) to configure babel BUT IT DOESN'T [seem to] WORK 
// with webpack and the @babel/plugin-proposal-class-properties plugin, for whatever reason (tbi)
// info on the intertubes is varied but solution seems to be to use the NEWER **babel.config.js**
// format, so that's what we did below

/*
    IMPORTANT: 
        - in order to us ES6 import/export statements in webpack configuration file,
          the webpack config file must be named 'webpack.config.babel.js' (from older webpack.config.js)
        - in order to be able to import non-transpiled ES6 modules directly, @babel/register MUST
          be called below before ALL ELSE

        This babel.config.js file will be implicitly called by webpack as soon as webpack.config.babel.js
        starts processing. This babel.config.js file (via @babel/register) will "hook" into webpack's
        'require' mechanism and then be able to transpile ES6 modules on the fly as needed (hence, these
        modules will become usable for consumption by webpack framework)

        @babel/register is also required in order to allow babel to transpile modules outside the root
        directory of this project (e.g. https://github.com/babel/babel/issues/8321)

        The key to it all is to simply add the ignore function (as per below) that determines
        which files should be transpiled or not (i.e. ignored or transpiled)

*/

require('@babel/register')({
    ignore: [ // CANNOT be a function, BUT, can contain functions in its array (functions and regexes)

        ///node_modules/], // normally all that's needed

        function(file) {
            // remember that we use tidbits directly in our webpack configuration 
            // so we must not ignore that file (even if it's node_modules)
            const ignored = !/tidbits/.test(file) && /node_modules/.test(file);
            !ignored && console.log('babel will transpile', file);
            return ignored;
        },
    ],
  })
  
module.exports = function(api) {

    // seems to be important... (don't know why: tbi)
    api.cache(true); // ...so there you go...

    const presets = [ 
        
        // read: https://babeljs.io/docs/en/babel-preset-env
        
        ["@babel/preset-env", {//preset-env", {
        
            //"modules": false, // false to NOT transform modules (presumably webpack will do this?)
            "modules": false,//'auto',//false, // false to NOT transform modules (presumably webpack will do this?)
        
            "targets": { 
                // we skip IE: too many limitations and not needed to support windows users anymore
                // todo: reduce browser versions below based on minimum reqs
                "chrome": "71",
                "firefox": "64",
                "edge": "44",
                "safari": "11.1",
                // "browsers": ["> 1%", "last 2 versions", "not ie <= 8"] // NOPE, we don't want this anymore

                "node": "current",
            }
        }]
    ];

    const plugins = [

        // Enables CLASS private & static properties (see example in globals.js/EventEmitter)
        // - https://www.npmjs.com/package/@babel/plugin-proposal-class-properties
        // - https://babeljs.io/docs/en/next/babel-plugin-proposal-class-properties.html
        //"@babel/plugin-proposal-class-properties",
        ["@babel/plugin-proposal-class-properties", { "loose": true }],

        // require to enable webpack config files to use import/export
        "@babel/plugin-transform-modules-commonjs",

        // required to allow import() statements in app 
        // - e.g. return import(/* webpackChunkName: '[request]' */ './components/plugins/' + url + '/plugin.vue');
        // make these as chunks WITHOUT using import() (otherwise fails in Firefox)
        // we SHOUD NOT USE dynamic imports (i.e. import()) ANYMORE (use load-dynamic-module instead)
        // commented out below as per note above
        "@babel/plugin-syntax-dynamic-import", 

        // // required to allow for [top-level?] async/await code (used by babel 7+)
        // // read: https://github.com/babel/babel-loader/issues/560#issuecomment-435479549
        "@babel/plugin-transform-runtime",
    ]

    return { presets, plugins, };
}