// src/map-3d/components/polygon.tsx
import { useMap3D } from "@/context/map-context";
import React, { useEffect, useRef, useState } from "react";

// export interface Polygon3DProps {
//     outerCoordinates: google.maps.LatLngAltitudeLiteral[];
//     altitudeMode?:
//     | "ABSOLUTE"
//     | "CLAMP_TO_GROUND"
//     | "RELATIVE_TO_GROUND"
//     | "RELATIVE_TO_MESH";
//     fillColor?: string;
//     strokeColor?: string;
//     strokeWidth?: number;
//     extruded?: boolean;
//     zIndex?: number;
//     onClick?: () => void;
// }

// export const Polygon3D: React.FC<Polygon3DProps> = ({
//     outerCoordinates,
//     altitudeMode = "RELATIVE_TO_MESH",
//     fillColor = "rgba(66, 133, 244, 0.45)",
//     strokeColor = "rgba(25, 103, 210, 0.8)",
//     strokeWidth = 1.5,
//     zIndex = 0,
//     extruded = true,
//     onClick,
// }) => {
//     const { map3DElement, maps3d } = useMap3D();
//     const polygonRef = useRef<google.maps.maps3d.Polygon3DElement | null>(null);
//     const [polygonElementReady, setPolygonElementReady] = useState(false);

//     // Handle polygon element initialization
//     useEffect(() => {
//         if (!maps3d) return;
//         customElements
//             .whenDefined("gmp-polygon-3d")
//             .then(() => setPolygonElementReady(true));
//     }, [maps3d]);

//     // Handle polygon creation and updates
//     useEffect(() => {
//         if (!maps3d || !map3DElement || !polygonElementReady) return;

//         const createPolygon = async () => {
//             if (!polygonRef.current) {
//                 const polygon = document.createElement(
//                     "gmp-polygon-3d",
//                 ) as google.maps.maps3d.Polygon3DElement;
//                 polygonRef.current = polygon;

//                 if (onClick) {
//                     polygon.addEventListener("gmp-click", onClick);
//                 }
//             }

//             const polygon = polygonRef.current;

//             // Set polygon properties
//             polygon.outerCoordinates = outerCoordinates;
//             polygon.altitudeMode = maps3d.AltitudeMode[altitudeMode];
//             polygon.fillColor = fillColor;
//             polygon.strokeColor = strokeColor;
//             polygon.strokeWidth = strokeWidth;
//             polygon.extruded = extruded;
//             polygon.zIndex = zIndex;

//             // Append to map if not already added
//             if (!polygon.parentElement) {
//                 map3DElement.appendChild(polygon);
//             }
//         };

//         createPolygon();

//         // Cleanup
//         return () => {
//             if (polygonRef.current) {
//                 if (onClick) {
//                     polygonRef.current.removeEventListener("gmp-click", onClick);
//                 }
//                 polygonRef.current.remove();
//                 polygonRef.current = null;
//             }
//         };
//     }, [maps3d, map3DElement, polygonElementReady]);

//     return null;
// };

{/* <gm-model-3d position={`${currentLocation.lat},${currentLocation.lng},10000`} altitude-mode="RELATIVE_TO_GROUND" orientation="0,0,0" scale="200" src="http://localhost:3000/plane.glb"></gm-model-3d> */}

export interface Model3DProps {
    position: google.maps.LatLngAltitudeLiteral;
    altitudeMode?:
    | "ABSOLUTE"
    | "CLAMP_TO_GROUND"
    | "RELATIVE_TO_GROUND"
    | "RELATIVE_TO_MESH";
    orientation?: google.maps.Orientation3D;
    scale?: string | number;
    src: string;
}

export const Model3D: React.FC<Model3DProps> = ({
    position,
    altitudeMode = "RELATIVE_TO_MESH",
    orientation = "0,0,0",
    scale = 1,
    src,
}) => {
    const { map3DElement, maps3d } = useMap3D();
    const modelRef = useRef<google.maps.maps3d.Model3DElement | null>(null);
    const [modelElementReady, setModelElementReady] = useState(false);

    // Handle model element initialization
    useEffect(() => {
        if (!maps3d) return;
        customElements
            .whenDefined("gmp-model-3d")
            .then(() => setModelElementReady(true));
    }, [maps3d]);

    // handle position change
    useEffect(() => {
        if (!modelRef.current) return;
        modelRef.current.position = position;
    }, [position]);

    // Handle model creation and updates
    useEffect(() => {
        if (!maps3d || !map3DElement || !modelElementReady) return;

        console.log("Creating model");

        const createModel = async () => {
            if (!modelRef.current) {
                const model = document.createElement(
                    "gmp-model-3d",
                ) as google.maps.Orientation3D;
                modelRef.current = model;
            }

            const model = modelRef.current;

            // Set model properties
            model.position = position;
            model.altitudeMode = maps3d.AltitudeMode[altitudeMode];
            model.orientation = orientation;
            model.scale = scale;
            model.src = src;

            // Append to map if not already added
            if (!model.parentElement) {
                console.log("Appending model");
                map3DElement.appendChild(model);
            }
        };

        createModel();

        // Cleanup
        return () => {
            if (modelRef.current) {
                modelRef.current.remove();
                modelRef.current = null;
            }
        };
    }, [maps3d, map3DElement, modelElementReady]);

    return null;
};