angular.module('app')

.directive('mgMap', function($rootScope) {
    return {
        replace: true,
        template: '<div></div>',
        link: function(scope, element, attrs) {

            map = L.mapbox.map(attrs.id, 'grabbeh.gch0omlb', {
                center: [33, 31],
                zoom: 2,
                minZoom: 1
            });

            function updateGeoJson(world) {
                if ($rootScope.l) {
                    map.removeLayer($rootScope.l);
                }
                var onlyMarks = [];
                angular.forEach(world, function(country){
                    if (country.properties.status === "only pending" || "only published" || "pending published" || "only registered" || "registered pending published" || "registered pending" || "registered published" )
                        onlyMarks.push(country);
                });
                $rootScope.m = L.geoJson(onlyMarks)
                map.fitBounds($rootScope.m.getBounds());
                
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
