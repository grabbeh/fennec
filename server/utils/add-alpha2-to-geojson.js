
function addAlpha2(world, countryData, fn){
    var arr = [];
    world.features.forEach(function(c){
		countryData.forEach(function(country){
			if (c.id === country.alpha3){
			     c.alpha2 = country.alpha2;
			};
		});
		arr.push(c)
	})
	return fn(null, arr);
}

module.exports = addAlpha2;


