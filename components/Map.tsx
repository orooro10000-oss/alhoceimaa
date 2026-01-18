import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Coordinates for Al Hoceima (Default Center)
const DEFAULT_CENTER = { lat: 35.2446, lng: -3.9321 };

interface MapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  interactive?: boolean; // If true, allows picking location
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
}

const MapComponent: React.FC<MapProps> = ({ 
  lat, 
  lng, 
  zoom = 13, 
  interactive = false,
  onLocationSelect,
  height = "300px"
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already initialized
    if (!mapInstanceRef.current) {
      const initialLat = lat || DEFAULT_CENTER.lat;
      const initialLng = lng || DEFAULT_CENTER.lng;

      mapInstanceRef.current = L.map(mapContainerRef.current).setView([initialLat, initialLng], zoom);

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Custom Icon
      const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Add Marker if coordinates exist
      if (lat && lng) {
        markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current);
      } else if (interactive) {
        // If adding new property (interactive) but no lat/lng yet, put a marker at center as suggestion
        markerRef.current = L.marker([initialLat, initialLng], { icon: customIcon, draggable: true }).addTo(mapInstanceRef.current);
      }

      // Handle Click/Drag for Interactive Mode
      if (interactive) {
        mapInstanceRef.current.on('click', (e) => {
          const { lat, lng } = e.latlng;
          
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
             markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current!);
          }
          
          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
        });

        // Also update if marker is dragged
        if(markerRef.current && markerRef.current.dragging) {
           markerRef.current.on('dragend', (event) => {
             const marker = event.target;
             const position = marker.getLatLng();
             if (onLocationSelect) {
                onLocationSelect(position.lat, position.lng);
             }
           });
        }
      }
    } else {
      // Update existing map view
      const map = mapInstanceRef.current;
      if (lat && lng) {
         map.setView([lat, lng], zoom);
         if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
         } else {
             // Re-create icon logic for updates
            const customIcon = L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            });
            markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map);
         }
      }
      // Force resize calculation after a small delay (fixes modal rendering issues)
      setTimeout(() => {
          map.invalidateSize();
      }, 200);
    }

    // Cleanup
    return () => {
        // We don't destroy the map on every render to prevent flashing, 
        // but in a real SPA you might want to map.remove() on unmount.
        // For this implementation, keeping the ref alive is safer.
    };
  }, [lat, lng, interactive, onLocationSelect, zoom]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm z-0">
      <div ref={mapContainerRef} style={{ height: height, width: '100%' }} />
      {interactive && (
          <div className="absolute top-2 right-2 z-[400] bg-white/90 backdrop-blur px-3 py-1 rounded-md text-xs font-bold shadow text-gray-700 pointer-events-none">
              اضغط على الخريطة لتحديد الموقع
          </div>
      )}
    </div>
  );
};

export default MapComponent;