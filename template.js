/*
    Class built to render template language/html files to be
    converted to raw text in an HTTP response
*/

var fs = require('fs');
var _path = require('path');

// A tag used in our template grammar:
// {{ variable | tag arg1 arg2 }}
var Tag = (function() {
    var cls = function(name, args) {
        this.name = name;
        this.args = args;
    };
    
    // Static method to create a Tag from a string
    cls.create = function(data) {
        // Trim any whitespace
        data = data.trim();
        
        // Split based on whitespace to get tag/args
        var params = data.split(' ');
        
        // Return a Tag with the appopriate data
        return new cls(params[0].trim(), params.slice(1, params.length));
    };
    
    return cls;
})();

// Class used to define a variable with our template
// grammar language (includes associated tags)
var Variable = (function() {
    var cls = function(name, tags) {
        this.name = name;
        this.tags = tags;
    };
    
    // Static method to create a Variable from a string
    cls.create = function(data) {    
        // Remove the leading '{{' and trailing '}}'
        data = data.substring(2, data.length - 2);
        
        // Get params by splitting on the '|'
        var params = data.split('|');

        // Initialize an empty array of tags that we will populate
        // with our parsed tag data
        var tags = [];
        
        // Create our tag and append it to our list of tags
        params.slice(1, params.length).forEach(function(element){
            tags.push(Tag.create(element));
        });
        
        // Variable = first value of params
        // Tags = all of the params[1...n]
        return new cls(params[0].trim(), tags);
    };
    
    return cls;
})();

// Context resolver class resolves a context based on 
// defined grammar
var contextResolver = (function() {
    /* --- PRIVATE HELPER FUNCTIONS --- */
    // Need to extract a value from the context (may require 
    // an iterative process if variable uses 'dot' notation)
    //  e.g. variable_name vs variable.sub_var
    var get_value_from_ctx = function(variable, ctx) {
        // If the key exists in its entirety, just return this value
        if(ctx.hasOwnProperty(variable)) {
            return ctx[variable];
        }
        
        // These are the keys into our ctx
        var keys = variable.split('.');
        
        // this will keep track of where we are in
        // the context as we walk down it with our keys
        var ctxPtr = ctx;

        // Walk down our ctx tree
        keys.forEach(function(element) {
            ctxPtr = ctxPtr[element];
        });
        
        return ctxPtr; // final result will point to our value
    };
    
    /* --- END HELPER FUNCTIONS --- */
    
    var cls = function(){
        
    };
    
    // resolve:
    //  data = input string with context specific grammar
    //  ctx = input dictionary with context used to resolve
    //      references made within the data
    //
    //  return = resolved data using the provided context
    cls.prototype.resolve = function(data, ctx) {
        // Get a map of grammar :: Variable
        var rMap = this.build_resolution_map(data);
        
        // Iterate over our rMap to replace grammar
        // with the resolved values using our ctx
        for(var key in rMap) {
            data = data.replace(key, this.evaluate(rMap[key], ctx));
        }
        
        return data;
    };
    
    // build_resolution map:
    //  data = input string with grammar needed to be resolved
    //
    //  return = a map of the input grammar to key terms
    cls.prototype.build_resolution_map = function(data) {
        // Expression to identify valid variable/tag usage
        // TODO: Fix regex to be better suited to detect viable arguments to a tag
        var expr = /(?:{{\s*)(?:[\w\.]+)(?:\s*\|\s*(?:[\w\.]+)(?:(?:\s*[\w'"]+)+)?)?(?:\s*}})/gi;
        
        var resolutionMap = {};
        var matches = data.match(expr);
        
        // Iterate over our matches to extract the relevant data
        matches.forEach(function(element){
            // If our key already exists, no sense in adding it again
            if(resolutionMap.hasOwnProperty(element)){
                return;
            }
        
            resolutionMap[element] = Variable.create(element);
        });
        
        return resolutionMap;
    };
    
    // TODO: Need to allow evaluate to process variables as args to a tag
    cls.prototype.evaluate = function(variable, ctx) {
        // Start by getting the variable from our ctx
        var value = get_value_from_ctx(variable.name, ctx);
        
        // Pass the variable to our tags as required
        variable.tags.forEach(function(tag) {
            var args = [ value ].concat(tag.args);
            value = get_value_from_ctx(tag.name, ctx).apply(this, args);
        });
        
        // return the result
        return value;
    };
    
    return cls;
})();

var template = (function() {
    // Need to add a way to customize these settings eventually
    var defaultSettings = {
        TEMPLATE_DIR: _path.resolve(__dirname, "../templates"),
    };

    /* Constructor */
    var cls = function(path) {
        this.path = _path.resolve(defaultSettings.TEMPLATE_DIR, path);
    };
    
    cls.prototype.render = function(context) {        
        // Load the template when we render so we can
        // update on the fly while testing
        var text = fs.readFileSync(this.path, 'utf-8');
        
        // Setup a context resolver to be used
        var ctxResolver = new contextResolver();
        
        // Resolve our context and return the result
        return ctxResolver.resolve(text, context);
    };
    
    return cls;
})();

module.exports = {
    Template: template,
    ContextResolver: contextResolver,
    render: function(path, context) {
        var t = new template(path);
        
        return t.render(context);
    }
}