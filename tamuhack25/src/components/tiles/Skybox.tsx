import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

import * as THREE from "three";

import { CubeTextureLoader } from "three";

import sunrisePx from "@/assets/images/skybox/sunrise/px.png";
import sunriseNx from "@/assets/images/skybox/sunrise/nx.png";
import sunrisePy from "@/assets/images/skybox/sunrise/py.png";
import sunriseNy from "@/assets/images/skybox/sunrise/ny.png";
import sunrisePz from "@/assets/images/skybox/sunrise/pz.png";
import sunriseNz from "@/assets/images/skybox/sunrise/nz.png";

import dayPx from "@/assets/images/skybox/day/px.png";
import dayNx from "@/assets/images/skybox/day/nx.png";
import dayPy from "@/assets/images/skybox/day/py.png";
import dayNy from "@/assets/images/skybox/day/ny.png";
import dayPz from "@/assets/images/skybox/day/pz.png";
import dayNz from "@/assets/images/skybox/day/nz.png";

import sunsetPx from "@/assets/images/skybox/sunset/px.png";
import sunsetNx from "@/assets/images/skybox/sunset/nx.png";
import sunsetPy from "@/assets/images/skybox/sunset/py.png";
import sunsetNy from "@/assets/images/skybox/sunset/ny.png";
import sunsetPz from "@/assets/images/skybox/sunset/pz.png";
import sunsetNz from "@/assets/images/skybox/sunset/nz.png";

const day = [
    dayPx,
    dayNx,
    dayPy,
    dayNy,
    dayPz,
    dayNz,
];

const sunrise = [
    sunrisePx,
    sunriseNx,
    sunrisePy,
    sunriseNy,
    sunrisePz,
    sunriseNz,
];

const sunset = [
    sunsetPx,
    sunsetNx,
    sunsetPy,
    sunsetNy,
    sunsetPz,
    sunsetNz,
];

// export function getLocalImgPath(path: string = ""): string {
//     // return Image.resolveAssetSource(require(path)).uri;
// }


export function SkyBox({
    currentSkybox = "day"
}: {
    currentSkybox?: "day" | "sunrise" | "sunset";
}) {
    const { scene } = useThree();

    const configs = {
        day: {
            images: day,
            fog: new THREE.Fog("#E7E8D7", 10, 1000),
            light: new THREE.DirectionalLight(0xffffff, 10)
        },
        sunrise: {
            images: sunrise, // use pinkish white for fog
            fog: new THREE.Fog("#493749", 10, 1000),
            light: new THREE.DirectionalLight("#ffabbd", 5)
        },
        sunset: {
            images: sunset,
            fog: new THREE.Fog("#5A3607", 10, 1000),
            light: new THREE.DirectionalLight("#e6ba85", 2)
        }
    }

    async function loadTexture() {

        let ready = 0;

        function updateReady() {
            ready++;
        }

        const cubes = configs[currentSkybox].images.map((path) => new THREE.TextureLoader().load(path.src, updateReady));

        while (ready < 6) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // use loader
        const loader = new CubeTextureLoader();

        const texture = loader.load([
            cubes[0].image.src,
            cubes[1].image.src,
            cubes[2].image.src,
            cubes[3].image.src,
            cubes[4].image.src,
            cubes[5].image.src,
        ]);

        scene.background = texture;

        

    }

    useEffect(() => {
        loadTexture();

        // add fog to the scene
        scene.fog = configs[currentSkybox].fog;
        const light = configs[currentSkybox].light;
        light.position.set(0, 0, 10);
        scene.add(light);

        return () => {
            scene.background = null;
            scene.fog = null;
            scene.remove(light);
        }
    }, [currentSkybox]);


    return null;
}