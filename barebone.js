/*
    Web framework:
    1. URL Mapping
        Request -> Function
        
    Workflow:
        Request -> Request listener -> global middleware
        -> URL Mapper -> URL Mapped function

*/

var http = require('http'); // how to require (import) modules
var utils = require('./utils.js');
var Listener = require('./listener.js');
var Middleware = require('./middleware.js');

var framework = (function(){
    var defaultSettings = {
        port: 8080,
    };

    /* Constructor */
    var cls = function(settings){
        
        // Load all the settings (merge with defaults)
        this.settings = utils.extend({}, defaultSettings, settings);
        
        // Listener used to route requests
        this.listener = new Listener();
        
        // Middleware called for request/response
        this.middleware = new Middleware();
    };
    
    cls.prototype.writeResponse = function(httpResponse, response) {
        // Write out the HTTP status code
        response.writeHead(httpResponse.status, httpResponse.headers);
        
        // Write out the body of our response
        response.write(httpResponse.body)
    };
    
    cls.prototype.endResponse = function(response) {
        response.end();
    };
    
    cls.prototype.run = function(){
        var cls = this; // pass this to the sub-scoped function
    
        http.createServer(function(request, response) {
            try {                
                /* process inbound middleware on the request */
                cls.middleware.processRequest(request);
                
                /* route the request to the registered listener */
                httpResponse = cls.listener.route(request);
                
                /* merge the headers with our current response headers */
                httpResponse.headers = utils.extend({}, response.headers, httpResponse.headers);
                
                /* process any outbound middleware on the response */
                cls.middleware.processResponse(request, httpResponse);

                /* write our the final response */
                cls.writeResponse(httpResponse, response);
                
                /* close connection with our client */
                cls.endResponse(response);
            } catch(e) {
                // NOTE: Need to implement more robust error catching and
                // graceful responses back to the end user
                console.log('Error: ' + e);
            }
        }).listen(this.settings.port);
    };
    
    return cls;
})();

// Export the framework to make it available
module.exports = framework;
