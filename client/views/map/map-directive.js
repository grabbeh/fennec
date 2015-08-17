angular.module('app')

.directive('mgMap', function($rootScope) {
    return {
        replace: true,
        template: '<div></div>',
        link: function(scope, element, attrs) {

            map = L.mapbox.map(attrs.id, 'grabbeh.gch0omlb', {
                //center: [33, 31],
                //zoom: 2,
                minZoom: 2
            });

            function updateGeoJson(world) {
                L.remove();
                if ($rootScope.l || $rootScope.m) {
                    map.removeLayer($rootScope.l);
                    map.removeLayer($rootScope.m);
                }
                var onlyMarks = [];
                angular.forEach(world, function(country){
                    var status = country.properties.status
                    if (status === "only pending" || status === "only published" || status === "pending published" || status === "only registered" || status === "registered pending published" || status === "registered pending" || status === "registered published" )
                        onlyMarks.push(country);
                });
                if (onlyMarks.length > 0){
                    $rootScope.m = L.geoJson(onlyMarks);
                    map.fitBounds($rootScope.m.getBounds());
                };
                
                $rootScope.l = L.geoJson(world, {
                    style: function(feature) {
                        switch (feature.properties.status) {
                            case false:
                                return {
                                    "color": "white",
                                    "weight": 1,
                                    "opacity": 0
                                };
                            case "only pending":
                                return {
                                    "color": "red",
                                    "weight": 1,
                                    "opacity": 1
                                };
                            case "only published":
                                return {
                                    "color": "red",
                                    "weight": 1,
                                    "opacity": 1
                                };
                            case "pending published":
                                return {
                                    "color": "red",
                                    "weight": 1,
                                    "opacity": 1
                                };
                            case "only registered":
                                return {
                                    "color": "green",
                                    "weight": 1,
                                    "opacity": 100
                                };
                            case "registered pending published":
                                return {
                                    "color": "green",
                                    "weight": 1,
                                    "opacity": 100
                                };
                            case "registered published":
                                return {
                                    "color": "green",
                                    "weight": 1,
                                    "opacity": 100
                                };
                            case "registered pending":
                                return {
                                    "color": "green",
                                    "weight": 1,
                                    "opacity": 100
                                };
                        }
                    },
                    onEachFeature: function(feature, layer) {
                        layer.on('click', function(e) {
                            $rootScope.$broadcast('country.click', e);
                        })
                    }
                })
                //map.fitBounds($rootScope.l.getBounds());
                $rootScope.l.addTo(map)
            }

            scope.$watch(attrs.geojson, function(world) {
                if (!world) {
                    return;
                }
                updateGeoJson(world);
            })

        }
    };
})
