// converts basic portfolio into more structured format
 
 var _ = require('underscore');

 function curry(fun){
    return function(arg){
         return fun(arg);
    }   
 }

function formatTrademarks(portfolio, countryData, fn){
     portfolio.forEach(function(trademark){
         // Classes at position 2 in array (starting at 0)
         if (tradmark[2] === ""){
            trademark[2] = false;
         }
         
         if (trademark[2].indexOf(",")) {
            trademark[2] = _.map(trademark[2].split(","), curry(parseInt))
         }
         else {
             var arr = [];
             var clss = parseInt(trademark[2]);
             arr[0] = clss;
             trademark[2] = arr;
        }
        // create object at end of array
        trademark[9] = {};
        trademark[10] = "";
 
         countryData.forEach(function(country){
            
             if (trademark[0].trim() === country.name) {
                 trademark[10] = country.alpha3;
                 trademark[9].name = trademark[0].trim();
                 trademark[9].alpha3 = country.alpha3;
                 trademark[9].alpha2 = country.alpha2;
                 trademark[9].coordinates = country.coordinates;
             }
             if (trademark[0].trim() === "European Union"){
                 trademark[10] = "EU";
                 trademark[9].alpha3 = "EU";
                 trademark[9].name = "European Union";
                 trademark[9].coordinates = [48.2, 9.1];
                 trademark[9].alpha2 = "EU";
             }
         })
     })
     return fn(null, portfolio);
 }
 
 module.exports = formatTrademarks;

