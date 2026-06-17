'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

function LocationMarker({ position, onChange }: MapComponentProps) {
    useMapEvents({
        click(e) {
            onChange([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={customIcon} />
    );
}

export default function MapComponent({ position, onChange }: MapComponentProps) {
    // Default to Sri Lanka coordinates
    const defaultCenter: [number, number] = [7.8731, 80.7718]; 

    return (
        <div className="h-[300px] w-full rounded-md border overflow-hidden">
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
                <LocationMarker position={position} onChange={onChange} />
            </MapContainer>
        </div>
    );
}
