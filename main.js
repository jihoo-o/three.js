import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
// import vertexShader from './shaders/room/vertex.glsl';
// import fragmentShader from './shaders/room/fragment.glsl';

main();

async function main() {
    THREE.Cache.enabled = true;

    // create context
    const canvas = document.querySelector('#c');
    const gl = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
    });

    // create camera
    const angleOfView = 55; // 가시 범위
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const nearPlane = 0.1; // 하한 거리
    const farPlane = 100; // 상한 거리
    const camera = new THREE.PerspectiveCamera(
        angleOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    camera.position.set(0, 8, 30);

    // create the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(1, 1, 1);
    const fog = new THREE.Fog('grey', 0, 90);
    scene.fog = fog;

    //LIGHTS
    const color = 0xffffff;
    const intensity = 0.7;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 30, 30);
    scene.add(light);

    const ambientColor = 0xffffff;
    const ambientIntensity = 0.2;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);

    // DRACOLodaer
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    dracoLoader.setDecoderPath(
        'https://www.gstatic.com/draco/versioned/decoders/1.4.0/'
    );

    // GLTFLoader
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    // gltfLoader.load();

    /**
     * AxesHelper
     * The X axis is red. The Y axis is green. The Z axis is blue.
     */
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // DRAW
    function draw(time) {
        time *= 0.001;

        // frame buffer
        if (resizeGLToDisplaySize(gl)) {
            const canvas = gl.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        gl.render(scene, camera);
        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}

// UPDATE RESIZE
function resizeGLToDisplaySize(gl) {
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width != width || canvas.height != height;
    if (needResize) {
        gl.setSize(width, height, false);
    }
    return needResize;
}

function getShader(url) {
    const loader = new THREE.FileLoader();
    return new Promise((resolve) => {
        loader.load(
            url,
            // onLoad callback
            function (shader) {
                resolve(shader);
            },
            // onProgress callback
            function (xhr) {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            // onError callback
            function (err) {
                console.error('An error happened');
            }
        );
    });
}

async function getTexture(url) {
    const textureLoader = new THREE.TextureLoader();
    return new Promise((resolve) => {
        textureLoader.load(
            url,
            // onLoad callback
            function (texture) {
                const newTexture = new THREE.Texture(texture);
                resolve(newTexture);
            },
            // onProgress callback currently not supported
            undefined,
            // onError callback
            function (err) {
                console.error('An error happened.');
            }
        );
    });
}

async function getMaterial(map, lightMap) {
    return new THREE.MeshBasicMaterial({ map, lightMap });
}
