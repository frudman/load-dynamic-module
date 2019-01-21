// a simple replacement for axios.get (less code since can't just get axios.get)

// IMPORTANT:
//  this code depends on XMLHttpRequest settings .responseURL field upon completion
//  - that feature is NOT SUPPORTED in IE (any versions) [supported on Edge]
//  SO this code will NOT work on IE if need .responseURL [works on Edge]

// read: https://gomakethings.com/promise-based-xhr/
// also: https://gomakethings.com/why-i-still-use-xhr-instead-of-the-fetch-api/
// ref: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
// ref: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest

export function http(url, {method = 'GET', retry = 3, retryDelayInMS = 500} = {}) {
	return new Promise((resolve,reject) => {

        // Create the XHR request
        const request = new XMLHttpRequest();

		// Setup our listener to process compeleted requests
		request.onreadystatechange = () => {

            // wait until request/response complete
			if (request.readyState !== 4) return; 

			// process the response
			if (request.status >= 200 && request.status < 300) {
                // success
				resolve({ 
                    data: request.responseText,
                    responseURL: request.responseURL, // NOT SUPPORTED by IE
                });
			} else if (request.status >= 500 && retry-- > 0) {
                // server error: retry...
                setTimeout(() => {
                    http(url, {method, retry, retryDelayInMS})
                        .then(resolve)
                        .catch(reject);
                }, retryDelayInMS); // ...after a brief delay...
                retryDelayInMS *= 2; // ...and progressively increase it for next go around
            } else { 
                // client error (4xx) or too many retries or other non-retriable error
                const err = new Error(`failed to ${method} ${url} [${retry <= 0 ? 'too many retries;' : ''}http-code=${request.status}${request.statusText ? `(${request.statusText})`:''}]`)
                err.name = `HTTP-${method}-Error`;
                err.statusCode = request.status;
                err.statusText = request.statusText; 
				reject(err);
			}
        };
        
        // Setup our HTTP request
		request.open(method || 'GET', url, true); // last parm 'true' makes it async

		// Send the request
		request.send();
	});
}
