/*
    Standalone helper functions
*/

var utils = {
    extend: function(){
        // Iterate over all the arguments except the first and 
        // override the first arguments values with values from
        // the other arguments (last argument has highest priority)
        for(var i = 1; i < arguments.length; i++) {
            for(var key in arguments[i]) {
                if(arguments[i].hasOwnProperty(key)) {
                    arguments[0][key] = arguments[i][key];
                }
            }
        }
        
        return arguments[0];
    },
    timestamp: function(date) {
        if(!date) {
            return new Date(Date.now()).toLocaleString();
        }
        return date.toLocaleString()
    },
};

module.exports = utils;