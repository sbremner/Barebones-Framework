/*
    Core routing component for the framework module. It handles
    registered URL mapping and middleware components for processing
    any request.
*/

var url = require('url');
var HTTPResponse = require('./httpResponse.js');

var listener = (function(){
    // Private function for default route if none are defined
    var defaultRoute = function(request) {
        // Write our response here to see how it is handeled
        //response.writeHead(200);            // status code
        //response.write("Default route");    // response body
        //response.end();                     // close connection
        
        // NOTE: Need to add an "HTTPResponse" object that we return
        // from the listner. Without this, it won't be possible to have
        // responseMiddleware processed since the connection would have
        // been closed.
        return new HTTPResponse(200, {}, 'Default route');
    };
    
    /* Constructor */
    var cls = function() {
        // Maintain a map of active routes to index later
        this.routes = { };
        
        this.defaultRoute = defaultRoute;
    };

    cls.prototype.route = function(request, response) {        
        // https://nodejs.org/docs/latest/api/url.html
        var req = url.parse(request.url);
        
        // Call the register routes callback
        // NOTE: Need to error check here for registered route
        if(this.routes.hasOwnProperty(req.pathname)) {
            // We have a route, lets call it!
            return this.routes[req.pathname].route(request, response);
        } else {
            // No route found, call the default
            return this.defaultRoute(request, response);
        }
    };
    
    cls.prototype.registerRoute = function(path, callback) {
        if(this.routes.hasOwnProperty(path)){
            throw ('Duplicate route registration for path: ' + path);
        }
        
        this.routes[path] = {
            route: callback
        };
    };
    
    // Return the constructed object
    return cls;
})();

/* export our listener module */
module.exports = listener;