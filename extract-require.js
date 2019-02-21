/* 
    1- we used the now-commented-out code below to generate our [complex] regular expressions
    2- then we captured that outout (using the console.log statement)
    3- then we used those generated regexps directly (cut-and-paste) to reduce final code/module size

    FYI: can verify regular expressions here: https://www.regexpal.com/ and https://regex101.com/ 
    FYI: [^] matches everything (including newlines): same as [/s/S]

    ***** commented out code begins below: *****

    // toRegEx uses '.{0,}/g' instead of 'dot-star-slash-gee' because dot-star-slash-gee would terminate this commented out code at slash-gee!
    const toRegEx = (srcRE,bs,flags) => new RegExp(srcRE.replace(/[#]{2,}.{0,}/g, '').replace(/\s+/g,'').replace(bs, '\\'), flags);

    const commentsPatSrc = toRegEx(`
        ## must look for (and ignore) quoted strings because could contain text that looks like comments

        ### quoted strings
        (['"\`])                 ## start (opening quote); becomes ~1
        (~~~1|(?:(?!~1)[^]))*?   ## quoted content (sans quotes); ~~~1 allows for embedded quotes
        ~1                       ## end (same as opening quote)
    |
        ### comments
        [/][/].*           ## end-of-line
        |
        [/][*][^]*?[*][/]  ## multiline
    `, /[~]/g, 'g');

    const requireDepPatSrc = (function(requireName) {

        // Non-captured groups STILL COUNT as indices when counting groups (and must be skipped
        // as parameters when matching) though likely returned always as undefined

        return toRegEx(`## using '~' as backslash character (easier than to have to double them up: \\)

            (?:
                ## skip1: ignore quoted strings because may include require-like text
                (['"\`])                ## string start (will become \\2)
                (~~~2|(?:(?!~2)[^]))*?  ## actual string content: allows for escaped quote
                ~2                      ## string end
            )   
        |
            (?:
                ## skip2: ignore 'embedded_requires' or used as someones.require property
                [.$_]~s*${requireName}
            )
        |
            ~b
            (   ## the FULL_REQUIRE part we want
                ${requireName}~s*[(]     ## 'require(' including opening paren
                (
                    ## simple-string require
                    ~s*
                    (['"\`])      ## opening quote: 3rd paren in (skipping over non-captured groups)
                    (((?!~5).)+?) ## REQUIRE_DEP content: we ignore escaped/embedded quotes: too much an edge case for this
                    ~5~s*[)]      ## closing quote and trailing closing paren
                |
                    ## non-simple-string require (either an expression or multiple parms)
                    [^)]+?[)]  
                )
            ) 
        `, /[~]/g, 'g')
    })('require');

    // OUR GENERATED REGULAR EXPRESSIONS (cut-and-pasted below)
    // we're NOT concatenating the REs to string because the string-conversion of these REs
    // display slightly different resulting REs ([\/] instead of just [/])
    console.log('const commentsPat =' , commentsPatSrc, ',\n' +
                '      requireDepPat =' , requireDepPatSrc, ';');
*/            

const commentsPat = /(['"`])(\\\1|(?:(?!\1)[^]))*?\1|[/][/].*|[/][*][^]*?[*][/]/g ,
      requireDepPat = /(?:(['"`])(\\\2|(?:(?!\2)[^]))*?\2)|(?:[.$_]\s*require)|\b(require\s*[(](\s*(['"`])(((?!\5).)+?)\5\s*[)]|[^)]+?[)]))/g ;

function removeComments(code) {
    return code.replace(commentsPat, full => (full[0] === '/') ? (full[1] === '/' ? '' : /\n/.test(full) ? '\n' : ' ') : full);
}

export function extractRequireDependencies(fcn, makeAwaitable = false) {

    // this method extracts all deps (i.e. 'dep') from "require('dep');" statements in the function fcn
    // fcn can be either a string (source code) or an actual function (we get its string representation below)

    // capture source code from fcn (as string or as an actual function, hence .toString())
    // important to remove comments, else they can obscure 'require' pattern matching
    const fcnCode = removeComments(fcn.toString()); 

    const dependencies = [];
    const finalCode = fcnCode.replace(requireDepPat, (full, skip1, skip2, fullRequire, requireParms, requireQuote, requireDep) => {
        if (requireDep) {
            dependencies.push(requireDep.trim()); // extract...
            return fullRequire; // return as-is (static string so no need for await)
        }
        else { // possibly dynamic require: need to make asynchronous
            // construct below (with prepended 'await') will FAIL if anything follows require 
            // [such as 'require(...).field' or 'require(...)(...immediate function call...)'] because 
            // right-associativity precedence rule means that the full expression will be awaited (wrong for us) 
            // rather than just the (await require()) part...
            return (makeAwaitable ? 'await ':'') + fullRequire; // ...so must use with care, only in simplest of cases
        }
    });

    return makeAwaitable ? [dependencies, finalCode] : dependencies;
}
