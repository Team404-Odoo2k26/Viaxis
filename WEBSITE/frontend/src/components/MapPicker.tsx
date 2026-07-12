"use client";

import { useEffect, useRef } from "react";

interface MapPickerProps {
  activeMode: "source" | "destination";
  onSelect: (name: string) => void;
  onDistanceChange?: (km: number) => void;
}

export default function MapPicker({ activeMode, onSelect, onDistanceChange }: MapPickerProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const onDistanceChangeRef = useRef(onDistanceChange);

  // References for coordinates
  const sourceCoords = useRef<{ lat: number; lng: number } | null>(null);
  const destCoords = useRef<{ lat: number; lng: number } | null>(null);

  // References for Leaflet markers
  const sourceMarker = useRef<any>(null);
  const destMarker = useRef<any>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    onDistanceChangeRef.current = onDistanceChange;
  }, [onDistanceChange]);

  // Haversine formula to compute geodesic distance in kilometers
  const calculateDistance = (
    c1: { lat: number; lng: number },
    c2: { lat: number; lng: number }
  ) => {
    const R = 6371; // Earth radius in km
    const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
    const dLon = ((c2.lng - c1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((c1.lat * Math.PI) / 180) *
        Math.cos((c2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in km
  };

  useEffect(() => {
    let isMounted = true;
    let mapInstance: any = null;

    const loadLeaflet = async () => {
      // 1. Inject Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // 2. Inject Leaflet JS
      if (!window.hasOwnProperty("L")) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      if (!isMounted) return;

      const L = (window as any).L;
      if (!L || !containerRef.current) return;

      // Center map on India (centered hub)
      mapInstance = L.map(containerRef.current).setView([20.5937, 78.9629], 5);
      mapRef.current = mapInstance;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapInstance);

      mapInstance.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        const currentMode = activeMode; // Use closure for click capture

        // Create colored icon or standard icon
        const icon = L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        });

        if (activeMode === "source") {
          sourceCoords.current = { lat, lng };
          if (sourceMarker.current) {
            sourceMarker.current.setLatLng(e.latlng);
          } else {
            sourceMarker.current = L.marker(e.latlng, { icon }).addTo(mapInstance);
            sourceMarker.current.bindPopup("Source").openPopup();
          }
        } else {
          destCoords.current = { lat, lng };
          if (destMarker.current) {
            destMarker.current.setLatLng(e.latlng);
          } else {
            destMarker.current = L.marker(e.latlng, { icon }).addTo(mapInstance);
            destMarker.current.bindPopup("Destination").openPopup();
          }
        }

        // Calculate distance if both pins are placed
        if (sourceCoords.current && destCoords.current && onDistanceChangeRef.current) {
          const dist = calculateDistance(sourceCoords.current, destCoords.current);
          onDistanceChangeRef.current(Math.round(dist));
        }

        // Reverse geocode the location
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const placeName = addr.city || addr.town || addr.village || addr.suburb || addr.state || data.display_name.split(",")[0];
            onSelectRef.current(placeName);
          } else {
            onSelectRef.current(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        } catch (err) {
          onSelectRef.current(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      });
    };

    loadLeaflet();

    return () => {
      isMounted = false;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [activeMode]); // Re-bind click handler on active mode changes to capture mode correctly

  return (
    <div className="relative">
      <div 
        ref={containerRef} 
        style={{ height: "320px" }} 
        className="w-full rounded-md border border-[var(--border)] z-0" 
      />
      <div className="absolute top-2 right-2 bg-neutral-900/90 text-white text-[10px] px-2 py-1 rounded shadow pointer-events-none z-10">
        Click to pin {activeMode}
      </div>
    </div>
  );
}
