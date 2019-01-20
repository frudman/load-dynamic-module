// a trivial replacement for axios.get (less code)

// this code depends on XMLHttpRequest settings .responseURL field on completion
// this is NOT SUPPORTED in IE (any versions)
// so this code will NOT work on IE

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

			// Only run if the request is complete
			if (request.readyState !== 4) return;

			// Process the response
			if (request.status >= 200 && request.status < 300) {
				resolve({ // success
                    data: request.responseText,
                    responseURL: request.responseURL, // NOT SUPPORTED by IE
                });
			} else if (request.status >= 500 && request.status < 600 && retry-- > 0) {
                // server error: retry...
                setTimeout(() => {
                    http(url, {method, retry, retryDelayInMS})
                        .then(resolve)
                        .catch(reject);
                }, retryDelayInMS); // ...after a brief delay...
                retryDelayInMS *= 2; // ...and progressively increase it for next go around
            } else { // 4xx errors or too many retries
				reject({
                    status: request.status,
                    statusText: request.statusText
                })
			}
        };
        
        // Setup our HTTP request
		request.open(method || 'GET', url, true); // last parm 'true' makes it async

		// Send the request
		request.send();
	});
}
