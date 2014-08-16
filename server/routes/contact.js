var email = require('./email')
  , html = require('./html')
  , path = require('path')
    
exports.processMessage = function(req, res){
    var fileLocation = path.resolve(__dirname, '../email-templates/contact-message.html')
    html.returnHtml(req.body.msg, fileLocation, function(err, contents){
            email.sendEmail('mbg@outlook.com', 'New contact', contents, function(err, json){
        		res.send({ msg: "Thank you - we'll be in touch"})
   		})
    })
}