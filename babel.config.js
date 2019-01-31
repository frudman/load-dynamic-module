// FYI: these BABEL settings (below) could be included directly in package.json as "babel":{} root property
// (as per https://babeljs.io/docs/en/config-files)
// BUT... package.json CANNOT be annotated with comments so keep it as a separate file to allow for this

// important: .babelrc is another way (traditional) to configure babel BUT IT DOESN'T [seem to] WORK 
// with webpack and the @babel/plugin-proposal-class-properties plugin, for whatever reason
// info on the intertubes is varied but solution seems to be to use the newer babel.config.js
// format, so that's what we did below

module.exports = function(api) {

    api.cache(true); // seems to be important, so there you go...

    const presets = [ // read: https://babeljs.io/docs/en/babel-preset-env
        ["@babel/env", {
            "modules": false, // false to NOT transform modules (presumably webpack will do this?)
            "targets": { 
                // we skip IE: too many limitations and not needed to support windows users anymore
                // todo: reduce browser versions below based on minimum reqs, documented in CAN-I-USE.md
                "chrome": "71",
                "firefox": "64",
                "edge": "44",
                "safari": "11.1",
                // "browsers": ["> 1%", "last 2 versions", "not ie <= 8"] // NOPE, we don't want this anymore
            }
        }]
    ];

    const plugins = [
        // Enables CLASS private & static properties (see example in globals.js/EventEmitter)
        // - https://www.npmjs.com/package/@babel/plugin-proposal-class-properties
        // - https://babeljs.io/docs/en/next/babel-plugin-proposal-class-properties.html
        //"@babel/plugin-proposal-class-properties",
        ["@babel/plugin-proposal-class-properties", { "loose": true }],

        // // required to allow import() statements in app 
        // // - e.g. return import(/* webpackChunkName: '[request]' */ './components/plugins/' + url + '/plugin.vue');
        // // we currently use import() for SweetAlert2 (in global.js)
        // // ALSO we use import() in client-src/components/editing-asset.vue
        // // make these as chunks WITHOUT using import() (fails in Firefox)
        // "@babel/plugin-syntax-dynamic-import", // we SHOUD NOT USE dynamic imports (i.e. import()) ANYMORE

        // // required to allow for [top-level?] async/await code (used by babel 7+)
        // // read: https://github.com/babel/babel-loader/issues/560#issuecomment-435479549
        // "@babel/plugin-transform-runtime",
    ]

    return { presets, plugins};
}