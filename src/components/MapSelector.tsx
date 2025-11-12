import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Locate } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface MapSelectorProps {
  location: { lat: number; lng: number };
  onLocationChange: (location: { lat: number; lng: number }) => void;
  onAddressChange?: (address: string) => void;
}

// Buenaventura boundaries (approximate)
const BUENAVENTURA_BOUNDS = {
  north: 3.92,
  south: 3.84,
  east: -77.00,
  west: -77.08,
};

const BUENAVENTURA_CENTER = {
  lat: 3.8801,
  lng: -77.0312,
};

export function MapSelector({ location, onLocationChange, onAddressChange }: MapSelectorProps) {
  const [zoom, setZoom] = useState(14);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [address, setAddress] = useState<string>('Cargando dirección...');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    let isMounted = true;
    let leafletCss: HTMLLinkElement | null = null;
    
    const loadLeaflet = async () => {
      try {
        // Add Leaflet CSS if not already added
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          leafletCss = document.createElement('link');
          leafletCss.rel = 'stylesheet';
          leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          leafletCss.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          leafletCss.crossOrigin = '';
          document.head.appendChild(leafletCss);
        }

        // Wait a bit for CSS to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Dynamically import Leaflet
        const L = (await import('leaflet')).default;
        
        // Create the map - Always center on Buenaventura initially
        if (mapContainerRef.current && !mapRef.current && isMounted) {
          const initialCenter = [BUENAVENTURA_CENTER.lat, BUENAVENTURA_CENTER.lng];
          
          const map = L.map(mapContainerRef.current, {
            center: initialCenter as [number, number],
            zoom: 14,
            zoomControl: false,
            maxBounds: [
              [BUENAVENTURA_BOUNDS.south - 0.05, BUENAVENTURA_BOUNDS.west - 0.05],
              [BUENAVENTURA_BOUNDS.north + 0.05, BUENAVENTURA_BOUNDS.east + 0.05]
            ],
            maxBoundsViscosity: 0.8,
            minZoom: 12,
            maxZoom: 19,
            preferCanvas: true,
          });

          // Add OpenStreetMap tiles with better configuration
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            minZoom: 10,
            tileSize: 256,
            zoomOffset: 0,
            crossOrigin: true,
            // Retry failed tiles
            errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2UwZjJmZSIvPjwvc3ZnPg==',
          }).addTo(map);

          // Custom marker icon
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="position: relative;">
              <svg width="40" height="50" viewBox="0 0 24 24" fill="#10b981" stroke="#fff" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3" fill="#fff"/>
              </svg>
            </div>`,
            iconSize: [40, 50],
            iconAnchor: [20, 50],
          });

          // Add marker at center
          const marker = L.marker(initialCenter as [number, number], {
            icon: customIcon,
            draggable: true,
          }).addTo(map);

          // Update initial location (only if parent didn't provide one)
          if (location.lat === 3.8801 && location.lng === -77.0312) {
            onLocationChange({ lat: BUENAVENTURA_CENTER.lat, lng: BUENAVENTURA_CENTER.lng });
          }

          // Handle marker drag
          marker.on('dragend', () => {
            const position = marker.getLatLng();
            onLocationChange({ lat: position.lat, lng: position.lng });
            fetchAddress(position.lat, position.lng);
          });

          // Handle map click
          map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            onLocationChange({ lat, lng });
            fetchAddress(lat, lng);
          });

          // Force map to invalidate size after a short delay
          setTimeout(() => {
            if (map && isMounted) {
              map.invalidateSize();
            }
          }, 250);

          mapRef.current = map;
          markerRef.current = marker;
          
          if (isMounted) {
            setMapLoaded(true);
          }
          
          // Fetch initial address
          fetchAddress(BUENAVENTURA_CENTER.lat, BUENAVENTURA_CENTER.lng);
        }
      } catch (error) {
        console.error('Error loading map:', error);
        if (isMounted) {
          setMapLoaded(false);
        }
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
      if (leafletCss && leafletCss.parentNode) {
        leafletCss.parentNode.removeChild(leafletCss);
      }
    };
  }, []);

  // Update marker position when location prop changes externally
  useEffect(() => {
    if (markerRef.current && mapLoaded && location) {
      markerRef.current.setLatLng([location.lat, location.lng]);
      if (mapRef.current) {
        mapRef.current.panTo([location.lat, location.lng]);
      }
    }
  }, [location, mapLoaded]);

  // Fetch address from coordinates using Nominatim (OpenStreetMap)
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      setAddress('Obteniendo dirección...');
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'es',
          },
        }
      );
      const data = await response.json();
      
      if (data.display_name) {
        // Format address for Buenaventura
        const addressParts = [];
        if (data.address.road) addressParts.push(data.address.road);
        if (data.address.house_number) addressParts.push(`#${data.address.house_number}`);
        if (data.address.neighbourhood || data.address.suburb) {
          addressParts.push(data.address.neighbourhood || data.address.suburb);
        }
        if (addressParts.length === 0) {
          addressParts.push(data.address.city || 'Buenaventura');
        }
        addressParts.push('Buenaventura, Valle del Cauca');
        
        const finalAddress = addressParts.join(', ');
        setAddress(finalAddress);
        if (onAddressChange) {
          onAddressChange(finalAddress);
        }
      } else {
        const defaultAddress = 'Buenaventura, Valle del Cauca, Colombia';
        setAddress(defaultAddress);
        if (onAddressChange) {
          onAddressChange(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      const defaultAddress = 'Buenaventura, Valle del Cauca, Colombia';
      setAddress(defaultAddress);
      if (onAddressChange) {
        onAddressChange(defaultAddress);
      }
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
      setZoom(mapRef.current.getZoom());
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
      setZoom(mapRef.current.getZoom());
    }
  };

  const handleRecenter = () => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([BUENAVENTURA_CENTER.lat, BUENAVENTURA_CENTER.lng], 14);
      markerRef.current.setLatLng([BUENAVENTURA_CENTER.lat, BUENAVENTURA_CENTER.lng]);
      onLocationChange(BUENAVENTURA_CENTER);
      fetchAddress(BUENAVENTURA_CENTER.lat, BUENAVENTURA_CENTER.lng);
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-green-50 to-lime-50 border-2 border-green-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <span className="text-base font-semibold text-green-900">Ubicación del Problema</span>
          </div>
          <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
            <Locate className="w-3 h-3 mr-1" />
            Buenaventura
          </Badge>
        </div>

        {/* Map Container - Mejorado con mayor altura */}
        <div className="relative w-full h-[500px] md:h-[600px] bg-gradient-to-br from-green-100 to-yellow-100 rounded-xl overflow-hidden border-2 border-green-300 shadow-lg">
          <div 
            ref={mapContainerRef} 
            className="w-full h-full"
            style={{ background: '#e0f2fe', minHeight: '500px' }}
          />
          
          {/* Map Controls - Mejorados */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={handleZoomIn}
              className="bg-white hover:bg-green-50 shadow-xl border-2 border-green-200 h-10 w-10"
            >
              <ZoomIn className="w-5 h-5 text-green-600" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={handleZoomOut}
              className="bg-white hover:bg-green-50 shadow-xl border-2 border-green-200 h-10 w-10"
            >
              <ZoomOut className="w-5 h-5 text-green-600" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={handleRecenter}
              className="bg-white hover:bg-green-50 shadow-xl border-2 border-green-200 h-10 w-10"
              title="Centrar en Buenaventura"
            >
              <Navigation className="w-5 h-5 text-green-600" />
            </Button>
          </div>

          {/* Instructions overlay - Mejorado */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-900/90 to-transparent text-white p-4 z-[999]">
            <p className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación exacta
            </p>
          </div>
        </div>

        {/* Address Display - Mejorado */}
        <div className="bg-white border-2 border-green-200 rounded-xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <MapPin className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Dirección seleccionada:</p>
              <p className="text-base text-green-900 font-medium">{address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaflet CSS - Inline styles - Mejorados */}
      <style>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          border-radius: 0.75rem;
          background: linear-gradient(to bottom, #e0f2fe, #bae6fd);
        }
        .custom-marker {
          background: transparent;
          border: none;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
        }
        .leaflet-control-attribution {
          font-size: 10px;
          background: rgba(255, 255, 255, 0.9) !important;
          padding: 4px 10px;
          border-radius: 6px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .leaflet-tile-pane {
          filter: saturate(1.2) brightness(1.05) contrast(1.05);
        }
        .leaflet-tile {
          transition: opacity 0.3s ease-in-out;
        }
        .leaflet-fade-anim .leaflet-tile {
          will-change: opacity;
        }
        .leaflet-tile-container img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
        /* Mejor visualización de tiles */
        .leaflet-tile-loaded {
          opacity: 1 !important;
        }
        /* Controles del mapa mejorados */
        .leaflet-bar {
          border-radius: 8px;
          overflow: hidden;
        }
        .leaflet-bar a {
          background-color: rgba(255, 255, 255, 0.95);
          border-bottom: 1px solid rgba(34, 197, 94, 0.2);
        }
        .leaflet-bar a:hover {
          background-color: rgba(34, 197, 94, 0.1);
        }
      `}</style>
    </Card>
  );
}