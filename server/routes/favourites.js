exports.addFavouriteProperty = function(trademarks, favourites){
     trademarks.forEach(function(tm){
     	favourites.forEach(function(fav){
     	    if (tm._id.equals(fav)){
     	    	tm.favourite = true;
     	    }
     	  })
     })	
     return trademarks;
}