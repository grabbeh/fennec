var knox = require('knox')
, mime = require('mime')
, fs = require('fs')
, s3 = require('../config/s3')
, client = knox.createClient({
    key: s3.key
  , secret: s3.secret
  , bucket: 'grabeh-trademarks'
});

exports.uploadImage = function(req, res){
    var file = req.files.image;
    var stream = fs.createReadStream(file.path)
    var mimetype = mime.lookup(file.path);
    var req;

    if (mimetype.localeCompare('image/jpeg')
        || mimetype.localeCompare('image/pjpeg')
        || mimetype.localeCompare('image/png')
        || mimetype.localeCompare('image/gif')) {

        req = client.putStream(stream, file.name, {
                'Content-Type': mimetype,
                'Cache-Control': 'max-age=604800',
                'x-amz-acl': 'public-read',
                'Content-Length': file.size
            }, function(err, result) {
                //console.log(result);
            }
       );
       } else {
          console.log("Wrong file type")
       }

       req.on('response', function(resp){
           if (resp.statusCode == 200) {
               console.log(req.url);
               res.json({ url: req.url })
           } else {
               console.log("Error")
           }
    	})
}
