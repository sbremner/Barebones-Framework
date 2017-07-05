/*
    This is the middleware component for the web framework.
    
    Middleware is code which gets called before a request
    is processed or after a response has been generated.
    
    Middleware has the capabilities of modifying the request
    or response before it is finalized.
*/

var middleware = (function(){    
    /* Constructor */
    var cls = function() {
        // Might make sense to process these with a priority queue later
        this.requestMiddleware = [];
        this.responseMiddleware = [];
    };
    
    // Handles registration of any request middleware
    cls.prototype.registerRequestMiddleware = function(callback) {
        this.requestMiddleware.push(callback);
    };
    
    // Handles registration of any response middleware
    cls.prototype.registerResponseMiddleware = function(callback) {
        this.responseMiddleware.push(callback);
    };
    
    // Process all of our request middleware
    cls.prototype.processRequest = function(request) {
        // TODO: Need to add error checking if one middleware
        // fails it shouldn't stop all the rest from executing
        
        // Can probably use forEach but unsure if order will be maintained 100%
        for(var i = 0; i < this.requestMiddleware.length; i++) {
            // Invoke the middleware on our request
            this.requestMiddleware[i](request);
        }
    };
    
    // Process all of our response middleware
    cls.prototype.processResponse = function(request, response) {
        // TODO: Need to add error checking if one middleware
        // fails it shouldn't stop all the rest from executing
        
        // Can probably use forEach but unsure if order will be maintained 100%
        for(var i = 0; i < this.responseMiddleware.length; i++) {
            // Invoke the middleware on our request
            this.responseMiddleware[i](request, response);
        }
    };
    
    return cls;
})();

module.exports = middleware;