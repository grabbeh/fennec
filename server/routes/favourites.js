exports.checkTrademarks = function(trademarks, favourites){
     trademarks.forEach(function(tm){
     	favourites.forEach(function(fav){
     	    if (tm._id.equals(fav)){
     	    	tm.favourite = true;
     	    }
     	  })
     })	
     return trademarks;
}

exports.checkActivities = function(activities, favourites, fn){
     activities.forEach(function(activity){
     	favourites.forEach(function(fav){
     	    if (activity.trademark._id.equals(fav)){
     	    	activity.trademark.favourite = true;
     	    }
     	  })
     })	
     fn(null, activities);
}



