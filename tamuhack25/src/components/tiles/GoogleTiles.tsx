import { Loader3DTiles, LoaderProps, Runtime } from 'three-loader-3dtiles'
import { useLoader, useThree, useFrame } from '@react-three/fiber'
import { Loader, MeshToonMaterial, Vector2, WebGLRenderer } from 'three'
import { useEffect } from 'react'

import * as THREE from 'three'

// import '@/assets/images/threeTone.jpg' 
// import the threeTone image from the assets folder
import threeToneImg from '@/assets/images/threeTone.jpg'

class Loader3DTilesBridge extends Loader {
    props: LoaderProps = {
        url: "",
        renderer: new WebGLRenderer(),
        viewport: {
            width: 1920,
            height: 1080,
            devicePixelRatio: 1
        },
    }

    load(url: string, onLoad: (result: { model: any, runtime: Runtime }) => void, onProgress?: (event: ProgressEvent<EventTarget>) => void, onError?: (error: Error) => void) {
        const loadTileset = async () => {
            try {
                this.props.url = url;
                const result = await Loader3DTiles.load({
                    ...this.props,
                    onProgress
                })
                onLoad(result);
            }
            catch (e) {
                console.log("Error loading 3d tiles!", e);
                if (onError) {
                    onError(e as Error);
                }
            }
        }
        loadTileset();
    }
    setProps(props: LoaderProps) {
        this.props = props;
    }
};

function Loader3DTilesR3FAsset(props: any) {
    const threeState = useThree();

    const threeTone = new THREE.TextureLoader().load(threeToneImg.src);
    threeTone.minFilter = THREE.NearestFilter
    threeTone.magFilter = THREE.NearestFilter

    const material = new MeshToonMaterial({
        color: "white",
        gradientMap: threeTone,
    });

    const loaderProps = {
        url: "",
        renderer: threeState.gl,
        viewport: getViewport(threeState.gl),
        options: {
            ...props,
            // material
        }
    }

    // TODO: Getting type error
    // @ts-ignore
    const { model, runtime } = useLoader(Loader3DTilesBridge, props.url, (loader: Loader3DTilesBridge) => {
        loader.setProps(loaderProps);
    })

    useEffect(() => {
        if (!runtime) return;
        runtime.orientToGeocoord({
            lat: Number(props.lat ?? 32.781311113132396), // 32.781311113132396, -96.79762963384655
            long: Number(props.long ?? -96.79762963384655),
            height: Number(270)
        });
    }, [runtime])

    useFrame(({ size, camera }, dt) => {
        // console.log("Updating runtime", size);
        runtime.update(dt, camera);
    });

    return (
        <group {...props} dispose={runtime.dispose}>
            <primitive object={model} material={material} />
        </group>
    )
}

function getViewport(renderer: WebGLRenderer) {
    const viewSize = renderer.getSize(new Vector2());
    return {
        width: viewSize.x,
        height: viewSize.y,
        devicePixelRatio: renderer.getPixelRatio()
    }
}

export { Loader3DTilesR3FAsset }