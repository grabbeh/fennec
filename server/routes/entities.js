var Entity = require('../models/entitySchema');

exports.saveEntity = function(entity, fn){
    Entity.findOne({_id: entity}, function(err, e){
        if (e){
            return fn(new Error("Existing entity"));
        }
        else {
            new Entity({
                    _id: entity
                }).save(function(err, entity){
                    fn(null, "Done")
                }) 
        }
    })
}

exports.updatePortfolio = function(entity, portfolio, fn){
    Entity.findOneAndUpdate({ _id: entity }, { $addToSet: { portfolios: portfolio } }, function(err, entity){
        if (err) { return fn(err)}
        return fn(null, true);
    })
}