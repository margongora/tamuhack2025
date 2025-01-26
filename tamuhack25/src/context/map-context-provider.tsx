"use client"

import { useState } from "react";
import { MapContext } from "./map-context";

export default function MapContextProvider({ children }: {
    children: React.ReactNode;
}) {
    const [mapElement, setMapElement] = useState<google.maps.maps3d.Map3DElement | null>(null);
    return (
        <MapContext.Provider value={{ mapElement, setMapElement }}>
            {children}
        </MapContext.Provider>
    );
}