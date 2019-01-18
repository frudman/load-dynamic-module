import axios from 'axios';

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

const settings = {
    logInfo: console.log.bind(console),
    logError: console.error.bind(console),
    actualUrl: basicActualUrl, // give callers control over final url
    async download(url) { return axios.get(url); }, // async method to download item: expect .data & .request.responseURL
    // todo: turn above as simple methods
};

loadModuleByUrl.settings = options => {
    Object.assign(settings, options);
    return loadModuleByUrl; // chaining
}

export const loadedModules = {};
export default async function loadModuleByUrl(moduleRequestUrl, dependent) {

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
                const m = await settings.download(actualModuleUrl);
                logInfo(`DOWNLOADED MODULE=${moduleRequestUrl}${(moduleRequestUrl === actualModuleUrl ? '' : ` [from ${actualModuleUrl}]`)}`, m);

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
                    let undefined_module, // unassigned === undefined
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
