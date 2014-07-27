
mustache = require('mustache');

   exports.returnHtml = function(obj, path, fn) {
    fs.readFile(path, function (err, contents) {
        if (err) { console.log(err) }
        var compiled = mustache.render(contents.toString(), obj);
        return fn(null, compiled);
    });
}
