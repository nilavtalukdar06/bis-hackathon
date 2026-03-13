"use client";

import { useEffect, useRef, useState } from "react";
import { useTRPC } from "@/dal/client";
import { useQuery } from "@tanstack/react-query";
import { Map as MapIcon, Loader2 } from "lucide-react";

export default function MapPage() {
  const trpc = useTRPC();
  const { data: locations, isLoading } = useQuery(
    trpc.reports.getLocations.queryOptions()
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/10">
            <MapIcon className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fraud Heatmap</h1>
            <p className="text-sm text-muted-foreground">
              Counterfeit medicine reports across locations
            </p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <MapView
            locations={
              locations?.map((loc) => ({
                id: loc.id,
                lat: loc.latitude!,
                lng: loc.longitude!,
                batchNumber: loc.medicineBatch?.batchNumber ?? "Unknown",
                medicineName: loc.medicineBatch?.medicineName ?? "Unknown",
                createdAt: loc.createdAt,
              })) ?? []
            }
          />
        )}
      </div>
    </div>
  );
}

function MapView({
  locations,
}: {
  locations: {
    id: string;
    lat: number;
    lng: number;
    batchNumber: string;
    medicineName: string;
    createdAt: Date | string;
  }[];
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Load Leaflet CSS from CDN (avoids TS module resolution issues with .css imports)
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Center on India
      const map = L.map(mapContainerRef.current!, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
      });

      // Dark-themed tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org">OSM</a> &copy; <a href="https://carto.com">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      // Add markers for each report location
      const dangerIcon = L.divIcon({
        html: `<div style="
          background: #ef4444;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(239,68,68,0.5);
          animation: pulse 2s infinite;
        "></div>`,
        className: "custom-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      locations.forEach((loc) => {
        const marker = L.marker([loc.lat, loc.lng], {
          icon: dangerIcon,
        }).addTo(map);

        const dateStr = new Date(loc.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        marker.bindPopup(`
          <div style="font-family: system-ui; min-width: 180px;">
            <p style="font-weight: 600; margin: 0 0 4px; font-size: 14px;">⚠️ Counterfeit Report</p>
            <p style="margin: 0; font-size: 12px; color: #666;">
              <strong>Batch:</strong> ${loc.batchNumber}<br/>
              <strong>Medicine:</strong> ${loc.medicineName}<br/>
              <strong>Date:</strong> ${dateStr}
            </p>
          </div>
        `);
      });

      // If we have locations, fit bounds
      if (locations.length > 0) {
        const group = L.featureGroup(
          locations.map((loc) => L.marker([loc.lat, loc.lng]))
        );
        map.fitBounds(group.getBounds().pad(0.2));
      }

      mapRef.current = map;
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mounted, locations]);

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
        .custom-marker { background: transparent !important; border: none !important; }
      `}</style>
      <div
        ref={mapContainerRef}
        className="h-full min-h-[500px] w-full"
      />
      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-[1000] rounded-xl border border-border bg-card/90 p-3 backdrop-blur-sm">
        <p className="mb-2 text-xs font-medium">Legend</p>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500 shadow" />
          <span className="text-xs text-muted-foreground">Counterfeit Report</span>
        </div>
      </div>
      {locations.length === 0 && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
            <MapIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-1 font-semibold">No Reports Yet</h3>
            <p className="text-sm text-muted-foreground">
              Counterfeit medicine reports will appear here as markers on the map.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
