"use client";

import { useMapsLibrary } from "@vis.gl/react-google-maps";
import React, {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useMap3DCameraEvents } from "./use-map-3d-camera-events";
import { useCallbackRef, useDeepCompareEffect } from "../utility-hooks";

import './map-3d-types';
import { getAllAirports } from '@/lib/client/utils';

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
}

export const Polyline3D = forwardRef(
  (
    props: Polyline3DProps,
    forwardedRef: ForwardedRef<google.maps.maps3d.Polyline3DElement | null>
  ) => {
    useMapsLibrary('maps3d');

    const [polyline3DElement, polyline3dRef] = useCallbackRef<google.maps.maps3d.Polyline3DElement>();

    useEffect(() => {
      customElements.whenDefined('gmp-map-3d').then(() => {
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
        <gmp-polyline-3d
          ref={polyline3dRef}
          {...props}
        >

        </gmp-polyline-3d>
      </>
    )
  }
);

export const Marker3D = (
    props: Marker3DProps,
  ) => {
    useMapsLibrary('maps3d');

    useEffect(() => {
      customElements.whenDefined('gmp-marker-3d').then(() => {
        setCustomElementsReady(true);
      });
    }, []);

    const [customElementsReady, setCustomElementsReady] = useState(false);

    if (!customElementsReady) return null;
    
    return (
      <>
        <gmp-marker-3d
        {...props}
        >          
        </gmp-marker-3d>
      </>
    )
  };

export const Map3D = forwardRef(
  (
    props: Map3DProps,
    forwardedRef: ForwardedRef<google.maps.maps3d.Map3DElement | null>
  ) => {
    useMapsLibrary("maps3d");

    const [map3DElement, map3dRef] =
      useCallbackRef<google.maps.maps3d.Map3DElement>();

    useMap3DCameraEvents(map3DElement, (p) => {
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
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({
              lat: latitude,
              lng: longitude,
              altitude: 15000,
            });
          },
          () => {
            setUserLocation({ lat: 37.7749, lng: -122.4194, altitude: 15000 });
          }
        );
      }
    }, []);

    const { center, heading, tilt, range, roll, children, ...map3dOptions } = props;

    useDeepCompareEffect(() => {
      if (!map3DElement) return;
    
      Object.assign(map3DElement, map3dOptions);
    
      getAllAirports()
        .then((flights) => {
          if (!map3DElement || !flights) return;
          flights.forEach((flight) => {
            const position = {
              lat: flight.location.latitude,
              lng: flight.location.longitude,
              altitude: 0,
            };
            const marker = new google.maps.maps3d.Marker3DInteractiveElement({
              position,
            });
            marker.addEventListener("gmp-click", (event: any) =>
              console.log("Marker clicked:", event.target.position)
            );
            map3DElement.append(marker);
          });
          const fallbackLocation = { lat: 37.7749, lng: -122.4194, altitude: 0 };
    
          const addUserMarker = (position: { lat: number; lng: number }) => {
            const marker = new google.maps.maps3d.Marker3DInteractiveElement({
              position,
            });
            marker.addEventListener("gmp-click", (event: any) =>
              console.log("User Marker clicked:", event.target.position)
            );
            map3DElement.append(marker);
          };
    
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => addUserMarker({ lat: position.coords.latitude, lng: position.coords.longitude }),
              () => addUserMarker(fallbackLocation)
            );
          } else {
            addUserMarker(fallbackLocation);
          }
        })
        .catch((error) => console.error("Error fetching flights:", error));
    }, [map3DElement, map3dOptions]);
    
    

    useImperativeHandle(
      forwardedRef,
      () => map3DElement!,
      [map3DElement]
    );

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
