"use client";
import { Map3DProvider } from "@/context/map-context";
import { APIProvider } from "@vis.gl/react-google-maps";

export default function Providers({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <APIProvider apiKey={"AIzaSyAOsk3zgPK7ZQWWWa7VTjg2zvU6WMla27U"} version={"alpha"}>
            <Map3DProvider>
                {children}
            </Map3DProvider>
        </APIProvider>
    );
}