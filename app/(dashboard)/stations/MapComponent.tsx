'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix for default Leaflet icon not showing correctly in Next.js
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapComponentProps {
    position: [number, number] | null;
    onChange: (position: [number, number]) => void;
}

function SearchField() {
    const map = useMap();

    useEffect(() => {
        const baseProvider = new OpenStreetMapProvider({
            params: {
                countrycodes: 'lk', // Restrict search results to Sri Lanka
                addressdetails: 1,
            },
        });

        // Wrapper to fix common spelling mistakes since Nominatim is strict
        const customProvider = {
            search: async ({ query }: { query: string }) => {
                let fixedQuery = query.toLowerCase();
                
                // Common Sri Lankan spelling variations and typos
                const corrections: Record<string, string> = {
                    'mathara': 'matara',
                    'kolombo': 'colombo',
                    'rathnapura': 'ratnapura',
                    'kurunagala': 'kurunegala',
                    'anuradapura': 'anuradhapura',
                    'moneragala': 'monaragala',
                    'hambanthota': 'hambantota',
                    'kegalle': 'kegalla',
                };

                for (const [typo, fix] of Object.entries(corrections)) {
                    fixedQuery = fixedQuery.replace(new RegExp(`\\b${typo}\\b`, 'g'), fix);
                }

                return baseProvider.search({ query: fixedQuery });
            }
        };
        
        // @ts-ignore
        const searchControl = new GeoSearchControl({
            provider: customProvider,
            style: 'bar',
            showMarker: false,
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: true,
            autoComplete: true, 
            autoCompleteDelay: 250,
            searchLabel: 'Search for location in Sri Lanka...'
        });

        map.addControl(searchControl);

        return () => {
            map.removeControl(searchControl);
        };
    }, [map]);

    return null;
}

function LocationMarker({ position, onChange }: MapComponentProps) {
    const map = useMapEvents({
        click(e) {
            onChange([e.latlng.lat, e.latlng.lng]);
        },
    });

    useEffect(() => {
        map.on('geosearch/showlocation', (result: any) => {
            if (result && result.location) {
                // Leaflet-geosearch result.location has x (lng) and y (lat)
                onChange([result.location.y, result.location.x]);
            }
        });
        
        return () => {
            map.off('geosearch/showlocation');
        };
    }, [map, onChange]);

    return position === null ? null : (
        <Marker position={position} icon={customIcon} />
    );
}

export default function MapComponent({ position, onChange }: MapComponentProps) {
    // Default to Sri Lanka coordinates
    const defaultCenter: [number, number] = [7.8731, 80.7718]; 

    return (
        <div className="h-[300px] w-full rounded-md border overflow-hidden relative">
            {/* The leaflet-geosearch bar will append to the map control container */}
            <MapContainer 
                center={position || defaultCenter} 
                zoom={position ? 15 : 7} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <SearchField />
                <LocationMarker position={position} onChange={onChange} />
            </MapContainer>
        </div>
    );
}
