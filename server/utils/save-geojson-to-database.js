// saves geojson into database

var geojson = require('../models/geoJSONSchema.js')

function saveGeoJson(countries, fn){
	countries.forEach(function(country){
	    new geojson({
	        type: country.type,
		id: country.id,
		properties: country.properties,
		geometry: country.geometry,
		alpha2: country.alpha2
	    }).save(function(err){
	    	if (err) console.log(err)
	    })
	})
	return fn(null, "Done")
}

module.exports = saveGeoJson;
