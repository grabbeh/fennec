
var fs = require('fs')
	, mustache = require('mustache');

exports.returnHtml = function(obj, path, fn) {
    fs.readFile(path, function (err, contents) {
        var compiled = mustache.render(contents.toString(), obj);
        return fn(null, compiled);
    });
}
