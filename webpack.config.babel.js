
// - to build libs: npm run build
// - to run tests: npm run test
// - don't forget to:
//  - npm update [regularly]
//  - also: npm run pub [to publish new version]

// this file named with webpack.config.BABEL.JS extension to ALLOW for import/exports below
// this file implicitly uses babel.config.js for its babel configuration
// - READ: IMPORTANT NOTES in babel.config.js that explain how to:
//   1- enable import/export to work in this file, at all
//   2- to be able to import non-transpiled ES6 modules directly

// helpers
const log = console.log.bind(console); // shorthand
const path = require('path')
const resolveDir = (...dir) => path.join(__dirname, ...dir); // implies/expects this file to be at root of project

const webpackConfig = opt => ({
        mode: 'production',
        entry: './index.mjs',
        output: { 
            path: __dirname, 
            filename: `lib/${opt.target.lib}/es${opt.ecma}/index${opt.minimize?'.min':''}.js`,
            libraryTarget: opt.target.name,

            // // VERY IMPORTANT: globalObject as per below else 'window' will be used and this fails when
            // // trying to import this module in a node app (e.g. another webpack config file)
            // // - as per: https://github.com/webpack/webpack/issues/6525#issuecomment-417580843
            // // - also: https://github.com/webpack/webpack/issues/6522#issuecomment-366708234
            // globalObject: `typeof self !== 'undefined' ? self : this`, // replaces default of 'window' (for webpack 4)
        }, 
        module: {
            rules: [
                // as per: https://webpack.js.org/contribute/writing-a-loader/
                //  "loaders (in .use[arrays] below) are executed from last-to-first (e.g. right-to-left below)"

                {  test: /\.m?js$/, use: [ 'babel-loader'] }, 
            ]
        },
        
        optimization: {
            minimize: opt.minimize,
            minimizer: opt.minimize ? [ minimizerConfig(opt.ecma) ] : [],
        },

        resolve: {
            alias: {
                // allows us to use (e.g.) 'xglobals' to import assets from anywhere (no relative paths needed)
                // - as '~xglobals/...' to '@import' assets from css (e.g. stylus) files: e.g. @import '~xglobals/settings.stylus';
                //      - note: the IMPORTANT leading squiggly
                // - as 'xglobals/...' to 'import' assets from JS (e.g. <script> code): e.g. import 'xglobals/settings.stylus';
                //      - note: NO leading squiggly]
    
                // and while in dev for my npm modules
                'my-npm-packages': resolveDir('..'),

            },
        },
    
}); 

// "maintained" minimizer for webpack (from https://github.com/terser-js/terser)
import TerserPlugin from 'terser-webpack-plugin';
const minimizerConfig = ecmaVersion => new TerserPlugin({
    terserOptions: {
        // from: https://github.com/terser-js/terser#minify-options-structure
        // and: https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        // - basic settings below (many more available)

        ecma: ecmaVersion,
        mangle: true, // Note `mangle.properties` is `false` by default.

        output: {
            comments: false, // https://github.com/webpack-contrib/terser-webpack-plugin#remove-comments
        },

        ie8: false,
        keep_classnames: undefined,
        keep_fnames: false,
        safari10: false,
    },
});

// genCombinations is a webpack helper
// cannot use 'my-npm-packages/' here because not defined until later in this file: 
// - MUST use either 'tidbits' or, while tidbits is in dev, '../freddy-javascript-utils'
import { genCombinations } from 'tidbits'; // '../freddy-javascript-utils';
export default Array.from(genCombinations({
        target: [ 
        { lib: 'umd', name: 'umd', },
        { lib: 'amd', name: 'amd', },
        { lib: 'cjs', name: 'commonjs2', },
    ],
    minimize: [ false, true ],
    ecma: [ 5, 6 ],//, 7, 8],
})).map(webpackConfig);
