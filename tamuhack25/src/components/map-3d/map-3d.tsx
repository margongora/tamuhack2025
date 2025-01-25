"use client";

import { useMapsLibrary } from '@vis.gl/react-google-maps';
import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import { useMap3DCameraEvents } from './use-map-3d-camera-events';
import { useCallbackRef, useDeepCompareEffect } from '../utility-hooks';

import './map-3d-types';
import { getAllFlights } from '@/lib/client/utils';

export type Map3DProps = google.maps.maps3d.Map3DElementOptions & {
  onCameraChange?: (cameraProps: Map3DCameraProps) => void;
};

export type Map3DCameraProps = {
  center: google.maps.LatLngAltitudeLiteral;
  range: number;
  heading: number;
  tilt: number;
  roll: number;
};

export const Map3D = forwardRef(
  (
    props: Map3DProps,
    forwardedRef: ForwardedRef<google.maps.maps3d.Map3DElement | null>
  ) => {
    useMapsLibrary('maps3d');

    const [map3DElement, map3dRef] =
      useCallbackRef<google.maps.maps3d.Map3DElement>();

    useMap3DCameraEvents(map3DElement, p => {
      if (!props.onCameraChange) return;

      props.onCameraChange(p);
    });

    const [customElementsReady, setCustomElementsReady] = useState(false);
    const [userLocation, setUserLocation] = useState<google.maps.LatLngAltitudeLiteral | null>(null);
    
    useEffect(() => {

      getAllFlights().then((flights) => {
        console.log(flights);
      }).catch((error) => {
        console.error(error);
      });


      customElements.whenDefined('gmp-map-3d').then(() => {
        setCustomElementsReady(true);
      });
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({
              lat: latitude,
              lng: longitude,
              altitude: 15000,
            });
          },
          (error) => {
            //console.error("Error getting location",error);
            setUserLocation({lat: 37.7749, lng: -122.4194, altitude: 15000});
          }
        );
      }
    }, []);

    const { center, heading, tilt, range, roll, ...map3dOptions } = props;

    useDeepCompareEffect(() => {
      if (!map3DElement) return;

      // copy all values from map3dOptions to the map3D element itself
      Object.assign(map3DElement, map3dOptions);
    }, [map3DElement, map3dOptions]);

    useImperativeHandle<
      google.maps.maps3d.Map3DElement | null,
      google.maps.maps3d.Map3DElement | null
    >(forwardedRef, () => map3DElement, [map3DElement]);

    if (!customElementsReady) return null;

    Map3D.displayName = 'Map3D';

    return (
      <>
        <gmp-map-3d
          ref={map3dRef}
          center={userLocation}
          range={range}
          heading={heading}
          tilt={tilt}
          roll={roll}>
        </gmp-map-3d>

      </>

    );
  }
);