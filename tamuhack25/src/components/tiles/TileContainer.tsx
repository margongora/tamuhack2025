// import * as ReactDOM from 'react-dom/client'
import { useRef, Suspense, useEffect, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import {
    PerspectiveCamera,
} from "@react-three/drei";
import { ErrorBoundary } from "react-error-boundary";

// import { Loader3DTilesR3FAsset } from "./GoogleTiles";
import { Controls } from "./Controls";
import { SkyBox } from "./Skybox";
import { Map3D, Map3DCameraProps } from "../map-3d";
// import { MapMouseEvent } from "@vis.gl/react-google-maps";

const INITIAL_VIEW_PROPS = {
    center: { lat: 37.72809, lng: -119.64473, altitude: 1300 },
    range: 5000,
    heading: 61,
    tilt: 69,
    roll: 0
};

export function TileContainer({
    lat,
    lng,
}: {
    lat: number;
    lng: number;
}) {

    const [viewProps, setViewProps] = useState(INITIAL_VIEW_PROPS);

    const handleCameraChange = useCallback((props: Map3DCameraProps) => {
        setViewProps(oldProps => ({ ...oldProps, ...props }));
    }, []);

    // const handleMapClick = useCallback((ev: MapMouseEvent) => {
    //     if (!ev.detail.latLng) return;

    //     const { lat, lng } = ev.detail.latLng;
    //     setViewProps(p => ({ ...p, center: { lat, lng, altitude: 0 } }));
    // }, []);

    const camera = useRef(null);

    const [reset, setReset] = useState(true);

    useEffect(() => {
        console.log("New Lat and Lng", lat, lng);
        setReset(true);
    }, [lat, lng]);

    useEffect(() => {
        if (!reset) return;
        setTimeout(() => {
            setReset(false);
        }, 1000);
    }, [reset]);

    return (
        <div
            id="canvas-container"
            style={{
                width: "100%",
                height: "100%",
            }}
        >
            
            {/* <Image source={require('@/assets/images/skybox/px.png')} /> */}
            <Canvas style={{ background: "#272730", width: "100%", height: "100%" }}>
                <Controls cameraRef={camera}>
                    <SkyBox currentSkybox="sunrise" />
                    <PerspectiveCamera ref={camera}>
                        <ErrorBoundary
                            fallbackRender={() => (
                                <mesh>
                                    <sphereGeometry />
                                    <meshBasicMaterial color="red" />
                                </mesh>
                            )}
                        >
                            <Suspense
                                fallback={
                                    <mesh>
                                        <sphereGeometry />
                                        <meshBasicMaterial color="yellow" />
                                    </mesh>
                                }
                            >
                                {/* <Plane args={[100000, 100000]} rotation={new Euler(-Math.PI / 2, 0, 0)} position={[0, -200, 0]} /> */}

                                {/* <group rotation={new Euler(Math.PI / 2, 0, 0)}>
                                    {!reset && <Loader3DTilesR3FAsset
                                        key={lat + lng}
                                        dracoDecoderPath={
                                            "https://unpkg.com/three@0.160.0/examples/jsm/libs/draco"
                                        }
                                        basisTranscoderPath={
                                            "https://unpkg.com/three@0.160.0/examples/jsm/libs/basis"
                                        }
                                        rotation={new Euler(-Math.PI / 2, 0, 0)}
                                        googleApiKey={"AIzaSyA93feLsDanu49drjBDTWtmoZ5rcc0c7BQ"}
                                        // url="https://int.nyt.com/data/3dscenes/ONA360/TILESET/0731_FREEMAN_ALLEY_10M_A_36x8K__10K-PN_50P_DB/tileset_tileset.json"
                                        url="https://tile.googleapis.com/v1/3dtiles/root.json?key=AIzaSyAOsk3zgPK7ZQWWWa7VTjg2zvU6WMla27U"
                                        maximumScreenSpaceError={48}
                                        resetTransform={true}
                                        lat={lat}
                                        lng={lng}
                                    />}
                                </group> */}
                                
                            </Suspense>
                        </ErrorBoundary>
                    </PerspectiveCamera>


                    {/* <OrbitControls camera={camera.current ?? undefined} /> */}
                </Controls>
            </Canvas>
        </div>
    );
}
