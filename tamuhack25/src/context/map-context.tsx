import { createContext } from "react";

export type MapContextType = {
    mapElement: google.maps.maps3d.Map3DElement | null;
    setMapElement: React.Dispatch<React.SetStateAction<google.maps.maps3d.Map3DElement | null>>;
};

export const MapContext = createContext<MapContextType>({
    mapElement: null,
    setMapElement: () => {},
});