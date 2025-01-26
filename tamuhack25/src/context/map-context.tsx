"use client";

import { Map3DCameraProps } from "@/components/map-3d";
import { useCallbackRef } from "@/components/utility-hooks";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import React, { createContext, useContext, ReactNode, Ref } from "react";

interface IMap3DContext {
    map3DElement: google.maps.maps3d.Map3DElement | null;
    map3dRef: Ref<google.maps.maps3d.Map3DElement>;
    maps3d: typeof google.maps.maps3d | null;
    camProps: Map3DCameraProps | null;
    setCamProps?: (camProps: Map3DCameraProps) => void;
}

const Map3DContext = createContext<IMap3DContext | null>({
    map3DElement: null,
    map3dRef: null,
    maps3d: null,
    camProps: null,
    setCamProps: () => {},
});

interface Map3DProviderProps {
    children: ReactNode;
}

const Map3DProvider: React.FC<Map3DProviderProps> = ({ children }) => {
    const maps3d = useMapsLibrary("maps3d");
    const [map3DElement, map3dRef] =
        useCallbackRef<google.maps.maps3d.Map3DElement>();
    const [camProps, setCamProps] = React.useState<Map3DCameraProps | null>(null);

    const value = {
        map3DElement,
        map3dRef,
        maps3d,
        camProps,
        setCamProps
    };
    return (
        <Map3DContext.Provider value={value}>{children}</Map3DContext.Provider>
    );
};

const useMap3D = () => {
    const context = useContext(Map3DContext);
    if (context === null) {
        throw new Error("useMap3D must be used within a Map3DProvider");
    }
    return context;
};

export type { IMap3DContext };
export { useMap3D, Map3DProvider };