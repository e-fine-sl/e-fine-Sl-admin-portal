'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox, InfoWindow } from '@react-google-maps/api';
import { Search, Building2, MapPin, Pencil, Trash2 } from 'lucide-react';
import { PoliceStation } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GlobalStationsMapProps {
    stations: PoliceStation[];
    onEdit: (station: PoliceStation) => void;
    onDelete: (stationId: string) => void;
    canManageStations: boolean;
}

const containerStyle = {
    width: '100%',
    height: '650px',
};

// Default center: Sri Lanka
const defaultCenter = {
    lat: 7.8731,
    lng: 80.7718,
};

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ['places'];

export default function GlobalStationsMap({ stations, onEdit, onDelete, canManageStations }: GlobalStationsMapProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script-global',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
    const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(null);

    const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    const onMapUnmount = useCallback((mapInstance: google.maps.Map) => {
        setMap(null);
    }, []);

    // Automatically adjust map bounds when stations change
    useEffect(() => {
        if (map && stations.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            let hasValidLocation = false;
            
            stations.forEach(station => {
                if (station.location && station.location.coordinates) {
                    bounds.extend(new google.maps.LatLng(
                        station.location.coordinates[1], // lat
                        station.location.coordinates[0]  // lng
                    ));
                    hasValidLocation = true;
                }
            });
            
            if (hasValidLocation) {
                map.fitBounds(bounds);
                // Prevent zooming in too much if there's only 1 station or they are very close
                const listener = google.maps.event.addListener(map, "idle", function() {
                    if (map.getZoom()! > 12) map.setZoom(12);
                    google.maps.event.removeListener(listener);
                });
            } else {
                map.panTo(defaultCenter);
                map.setZoom(7);
            }
        }
    }, [map, stations]);

    const onSearchBoxLoad = useCallback((ref: google.maps.places.SearchBox) => {
        setSearchBox(ref);
    }, []);

    const onPlacesChanged = () => {
        if (!searchBox) return;
        const places = searchBox.getPlaces();
        if (places && places.length > 0) {
            const place = places[0];
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                map?.panTo({ lat, lng });
                map?.setZoom(13);
            }
        }
    };

    if (loadError) {
        return (
            <div className="h-[650px] w-full bg-red-50 rounded-xl flex flex-col items-center justify-center text-red-500 border border-red-200">
                <p className="font-semibold text-lg">Error loading Google Maps</p>
                <p className="mt-2 text-sm">Please check your API key configuration.</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="h-[650px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-500 border border-gray-200">
                Loading Island-Wide Map...
            </div>
        );
    }

    return (
        <div className="w-full rounded-xl border border-gray-200 overflow-hidden relative shadow-sm">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={defaultCenter}
                zoom={7}
                onLoad={onMapLoad}
                onUnmount={onMapUnmount}
                onClick={() => setSelectedStation(null)} // Close infowindow when clicking elsewhere
                options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                }}
            >
                {/* Search Box Overlay */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-xl z-10">
                    <StandaloneSearchBox
                        onLoad={onSearchBoxLoad}
                        onPlacesChanged={onPlacesChanged}
                        options={{ bounds: new google.maps.LatLngBounds(
                            new google.maps.LatLng(5.916667, 79.683333), // SW Sri Lanka
                            new google.maps.LatLng(9.833333, 81.883333)  // NE Sri Lanka
                        )}}
                    >
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search for any location in Sri Lanka..."
                                className="w-full h-12 pl-12 pr-4 rounded-full shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/95 backdrop-blur-md text-base text-gray-800 transition-all duration-200"
                            />
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                        </div>
                    </StandaloneSearchBox>
                </div>

                {/* Render all stations as markers */}
                {stations.map(station => {
                    if (!station.location || !station.location.coordinates) return null;
                    
                    const lat = station.location.coordinates[1];
                    const lng = station.location.coordinates[0];
                    
                    return (
                        <Marker
                            key={station._id}
                            position={{ lat, lng }}
                            onClick={() => setSelectedStation(station)}
                            animation={google.maps.Animation.DROP}
                        />
                    );
                })}

                {/* Info Window when a station is clicked */}
                {selectedStation && selectedStation.location && selectedStation.location.coordinates && (
                    <InfoWindow
                        position={{ 
                            lat: selectedStation.location.coordinates[1], 
                            lng: selectedStation.location.coordinates[0] 
                        }}
                        onCloseClick={() => setSelectedStation(null)}
                    >
                        <div className="p-3 min-w-[220px]">
                            <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5 mb-2">
                                <Building2 className="h-4 w-4 text-blue-600" />
                                {selectedStation.name}
                            </h3>
                            <div className="mb-4 space-y-2">
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">{selectedStation.stationCode}</Badge>
                                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                    {selectedStation.district}, {selectedStation.province}
                                </p>
                            </div>
                            
                            {canManageStations && (
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-8 flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                        onClick={() => onEdit(selectedStation)}
                                    >
                                        <Pencil className="h-3 w-3 mr-1.5" /> Edit
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-8 flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => {
                                            onDelete(selectedStation._id);
                                            setSelectedStation(null); // close window
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1.5" /> Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
