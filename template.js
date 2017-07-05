/*
    Class built to render template language/html files to be
    converted to raw text in an HTTP response
*/

var fs = require('fs');
var _path = require('path');

var template = (function() {
    var defaultSettings = {
        TEMPLATE_DIR: _path.resolve(__dirname, "../templates"),
    };

    /* Constructor */
    var cls = function(path) {
        this.path = _path.resolve(defaultSettings.TEMPLATE_DIR, path);
        console.log('Path: ' + this.path);
    };

    cls.prototype.render = function(context) {
        // Load the template when we render so we can
        // update on the fly while testing
        var text = fs.readFileSync(this.path, 'utf-8');
        
        // Very basic variable replacement within the template
        for(var key in context) {
            // TODO: Need to sanitize context[key] to avoid XSS
            text = text.replace(new RegExp("{{\\s?" + key + "\\s?}}"), context[key]);
        }
        
        // Process the template with the context
        return text;
    };
    
    return cls;
})();

module.exports = {
    Template: template,
    render: function(path, context) {
        var t = new template(path);
        
        return t.render(context);
    }
}