/*
    This is the fundamental HTTP response class. It contains
    the registered response details (headers/status code/body/etc).
*/

var utils = require('./utils.js');

var httpResponse = (function(){

    var defaultHeaders = {};

    var cls = function(status, headers, body){
        this.status = status;
        this.headers = utils.extend({}, defaultHeaders, headers);
        this.body = body;
    };
    
    cls.prototype.updateHeaders = function(headers) {
        this.headers = utils.extend({}, this.headers, headers);
    };
    
    return cls;
})();

module.exports = httpResponse;