'use client';

import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { Search } from 'lucide-react';

interface MapComponentProps {
    position: [number, number] | null;
    onChange: (position: [number, number]) => void;
}

const containerStyle = {
    width: '100%',
    height: '100%',
};

// Default center: Sri Lanka
const defaultCenter = {
    lat: 7.8731,
    lng: 80.7718,
};

// Only load libraries once, outside component to prevent re-renders
const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ['places'];

export default function MapComponent({ position, onChange }: MapComponentProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);

    const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    const onMapUnmount = useCallback((mapInstance: google.maps.Map) => {
        setMap(null);
    }, []);

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
                onChange([lat, lng]);
                map?.panTo({ lat, lng });
                map?.setZoom(15);
            }
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            onChange([e.latLng.lat(), e.latLng.lng()]);
        }
    };

    if (loadError) {
        return (
            <div className="h-[300px] w-full bg-red-50 rounded-md flex flex-col items-center justify-center text-red-500 border border-red-200">
                <p className="font-semibold">Error loading Google Maps</p>
                <p className="text-xs mt-1">Please check your API key configuration.</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center text-gray-500">
                Loading Google Maps...
            </div>
        );
    }

    const currentCenter = position ? { lat: position[0], lng: position[1] } : defaultCenter;

    return (
        <div className="h-[300px] w-full rounded-md border overflow-hidden relative">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={currentCenter}
                zoom={position ? 15 : 7}
                onLoad={onMapLoad}
                onUnmount={onMapUnmount}
                onClick={handleMapClick}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                }}
            >
                {/* Search Box Overlay */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-[85%] max-w-sm z-10">
                    <StandaloneSearchBox
                        onLoad={onSearchBoxLoad}
                        onPlacesChanged={onPlacesChanged}
                        options={{ bounds: new google.maps.LatLngBounds(
                            new google.maps.LatLng(5.916667, 79.683333), // SW Sri Lanka
                            new google.maps.LatLng(9.833333, 81.883333)  // NE Sri Lanka
                        )}}
                    >
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search for location in Sri Lanka..."
                                className="w-full h-10 pl-10 pr-4 rounded-full shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/95 backdrop-blur-sm text-sm text-gray-800"
                            />
                            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-500" />
                        </div>
                    </StandaloneSearchBox>
                </div>

                {position && (
                    <Marker
                        position={{ lat: position[0], lng: position[1] }}
                        animation={google.maps.Animation.DROP}
                    />
                )}
            </GoogleMap>
        </div>
    );
}
