"use client";

import { useMapsLibrary } from "@vis.gl/react-google-maps";
import React, {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useMap3DCameraEvents } from "./use-map-3d-camera-events";
import { useCallbackRef, useDeepCompareEffect } from "../utility-hooks";

import './map-3d-types';
import { getAllAirports } from '@/lib/client/utils';
import { useMap3D } from "@/context/map-context";

export type Map3DProps = google.maps.maps3d.Map3DElementOptions & {
  onCameraChange?: (cameraProps: Map3DCameraProps) => void;
  children?: ReactNode;
};

export type Map3DCameraProps = {
  center: google.maps.LatLngAltitudeLiteral;
  range: number;
  heading: number;
  tilt: number;
  roll: number;
};

export type Polyline3DProps = {
  altitudeMode: string;
  coordinates: google.maps.LatLngAltitudeLiteral[];
  drawsOccludedSegments?: boolean;
  extruded?: boolean;
  geodesic?: boolean;
  outerColor?: string;
  outerWidth?: number;
  strokeColor?: string;
  strokeWidth?: number;
  zIndex?: number;
}

export type Marker3DProps = {
  altitudeMode?: string;
  position: google.maps.LatLngLiteral;
  onClick: (event: any) => void;
  label?: string;
  children?: ReactNode;
}

export const Polyline3D = forwardRef(
  (
    props: Polyline3DProps,
    forwardedRef: ForwardedRef<google.maps.maps3d.Polyline3DElement | null>
  ) => {
    useMapsLibrary('maps3d');

    const [polyline3DElement, polyline3dRef] = useCallbackRef<google.maps.maps3d.Polyline3DElement>();

    useEffect(() => {
      customElements.whenDefined('gmp-polyline-3d').then(() => {
        setCustomElementsReady(true);
      });
    }, []);

    const [customElementsReady, setCustomElementsReady] = useState(false);

    useImperativeHandle<
      google.maps.maps3d.Polyline3DElement | null,
      google.maps.maps3d.Polyline3DElement | null
    >(forwardedRef, () => polyline3DElement, [polyline3DElement]);

    if (!customElementsReady) return null;

    return (
      <>
        <gmp-polyline-3d ref={polyline3dRef} {...props}></gmp-polyline-3d>
      </>
    )
  }
);

export type Orientation3D = {
  heading: number;
  tilt: number;
  roll: number;
}

export type Model3DProps = {
  position: google.maps.LatLngAltitudeLiteral;
  altitudeMode: string;
  orientation: Orientation3D;
  scale: number;
  src: string;
  children?: ReactNode;
  onClick?: (event: any) => void;
}

export const Model3D = forwardRef(
  (
    props: Model3DProps,
    forwardedRef: ForwardedRef<google.maps.maps3d.Model3DElement | null>
  ) => {
    useMapsLibrary('maps3d');

    const [model3DElement, model3dRef] = useCallbackRef<google.maps.maps3d.Model3DElement>();

    useEffect(() => {
      customElements.whenDefined('gmp-model-3d').then(() => {
        setCustomElementsReady(true);
      });
    }, []);



    const [customElementsReady, setCustomElementsReady] = useState(false);

    useImperativeHandle<
      google.maps.maps3d.Model3DElement | null,
      google.maps.maps3d.Model3DElement | null
    >(forwardedRef, () => model3DElement, [model3DElement]);

    if (!customElementsReady) return null;

    return (
      <>
        <gmp-model-3d ref={model3dRef} {...props}></gmp-model-3d>
        {/* <Marker3D position={props.position} onClick={props.onClick ?? () => {}} >}></Marker3D> */}
      </>
    )
  }
);


export const Marker3D = forwardRef(
  (
    props: Marker3DProps,
    forwardedRef: ForwardedRef<google.maps.maps3d.Marker3DInteractiveElement | null>
  ) => {
    useMapsLibrary('maps3d');

    const [marker3DElement, marker3dRef] = useCallbackRef<google.maps.maps3d.Marker3DInteractiveElement>();

    useEffect(() => {
      customElements.whenDefined('gmp-marker-3d').then(() => {
        setCustomElementsReady(true);
      });
    }, []);

    useEffect(() => {
      // add event listener for click event
      if (!marker3DElement) return;

      marker3DElement.addEventListener('gmp-click', props.onClick);

      return () => {
        marker3DElement.removeEventListener('gmp-click', props.onClick);
      }
    }, [marker3DElement, props.onClick]);

    const [customElementsReady, setCustomElementsReady] = useState(false);

    useImperativeHandle(
      forwardedRef,
      () => marker3DElement!,
      [marker3DElement]
    );

    if (!customElementsReady) return null;

    return (
      <>
        <gmp-marker-3d-interactive ref={marker3dRef} {...props}></gmp-marker-3d-interactive>
      </>
    )
  }
);

export const Map3D = forwardRef(
  (
    props: Map3DProps,
    forwardedRef: ForwardedRef<google.maps.maps3d.Map3DElement | null>
  ) => {
    useMapsLibrary("maps3d");
    const markerLib = useMapsLibrary("marker");

    const { map3DElement, map3dRef, setCamProps } = useMap3D();

    useMap3DCameraEvents(map3DElement, (p) => {
      if (setCamProps) setCamProps(p);
      if (!props.onCameraChange) return;
      props.onCameraChange(p);
    });

    const [customElementsReady, setCustomElementsReady] = useState(false);
    const [userLocation, setUserLocation] =
      useState<google.maps.LatLngAltitudeLiteral | null>(null);

    useEffect(() => {
      customElements.whenDefined("gmp-map-3d").then(() => {
        setCustomElementsReady(true);
      });
    }, []);


    const { center, heading, tilt, range, roll, children, ...map3dOptions } = props;

    useDeepCompareEffect(() => {
      if (!map3DElement || !markerLib) return;

      Object.assign(map3DElement, map3dOptions);

      const fallbackLocation = { lat: 37.7749, lng: -122.4194, altitude: 0 };

      const addUserMarker = (position: { lat: number; lng: number }) => {
        const marker = new google.maps.maps3d.Marker3DInteractiveElement();
        marker.position = {
          lat: position.lat,
          lng: position.lng,
          altitude: 0,
        };
        marker.addEventListener("gmp-click", (event: any) => {
          console.log("User Marker clicked:", event.target.position)

          map3DElement?.flyCameraTo({
            endCamera: {
              center: {
                lat: position.lat,
                lng: position.lng,
                altitude: 200
              },
              tilt: 70,
              heading: 0,
              range: 800
            },
            durationMillis: 8000
          });


        });

        // make a pin 
        const pin = new markerLib.PinElement({
          background: "#42aaf5",
          borderColor: "#175eb0", // dark blue
          glyphColor: "#175eb0", // dark blue
          scale: 1,
        });

        marker.append(pin);


        map3DElement.append(marker);
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            addUserMarker({ lat: position.coords.latitude, lng: position.coords.longitude });
            // setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude, altitude: 1000 });

            setTimeout(() => {
              map3DElement?.flyCameraTo({
                endCamera: {
                  center: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    altitude: 200
                  },
                  tilt: 70,
                  heading: 0,
                  range: 800
                },
                durationMillis: 5000
              });
            }, 1000);
          },
          () => addUserMarker(fallbackLocation)
        );
      } else {
        addUserMarker(fallbackLocation);
      }

      // getAllAirports()
      //   .then((flights) => {
      //     if (!map3DElement || !flights) return;
      //     flights.forEach((flight) => {
      //       const position = {
      //         lat: flight.location.latitude,
      //         lng: flight.location.longitude,
      //         altitude: 0,
      //       };
      //       const marker = new google.maps.maps3d.Marker3DInteractiveElement({
      //         position,
      //       });
      //       marker.addEventListener("gmp-click", (event: any) =>
      //         console.log("Marker clicked:", event.target.position)
      //       );
      //       map3DElement.append(marker);
      //     });

      // })
      // .catch((error) => console.error("Error fetching flights:", error));
    }, [map3DElement, map3dOptions, markerLib]);



    useImperativeHandle<
      google.maps.maps3d.Map3DElement | null,
      google.maps.maps3d.Map3DElement | null
    >(forwardedRef, () => map3DElement, [map3DElement]);

    if (!customElementsReady) return null;

    Map3D.displayName = "Map3D";

    return (
      <>
        <gmp-map-3d
          ref={map3dRef}
          center={userLocation}
          range={range}
          heading={heading}
          tilt={tilt}
          roll={roll}>
          {props.children}
        </gmp-map-3d>

      </>
    );
  }
);
