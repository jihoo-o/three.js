import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(1, 1, 1);
const fog = new THREE.Fog('grey', 0, 90);
scene.fog = fog;

// create context
const canvas = document.querySelector('#c');
const gl = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
});

// create camera
const angleOfView = 100; // 가시 범위
const aspectRatio = canvas.clientWidth / canvas.clientHeight;
const nearPlane = 0.1; // 하한 거리
const farPlane = 100; // 상한 거리
const camera = new THREE.PerspectiveCamera(
    angleOfView,
    aspectRatio,
    nearPlane,
    farPlane
);
camera.position.set(10, 30, 20);

let controls;

main();

async function main() {
    init();

    //LIGHTS
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 5, 5);
    scene.add(light);

    const ambientColor = 0xffffff;
    const ambientIntensity = 0.5;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    // scene.add(ambientLight);

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

    // walls
    const {
        planeTop,
        planeBack,
        planeBottom,
        planeFront,
        planeRight,
        planeLeft,
        picture,
    } = await setWalls();

    // lights
    setLights({
        wall: { planeBack, planeTop, planeFront },
        target: picture[0],
    });

    // controls
    controls = new OrbitControls(camera, gl.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 10;
    controls.maxDistance = 30;
    controls.enablePan = true;

    requestAnimationFrame(draw);
}

function render(controls) {
    gl.render(scene, camera);
}

function draw(time) {
    time *= 0.001;
    controls.update();

    // frame buffer
    if (resizeGLToDisplaySize(gl)) {
        const canvas = gl.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    gl.render(scene, camera);
    requestAnimationFrame(draw);
}

function init() {
    THREE.Cache.enabled = true;

    // GridHelper
    const size = 100;
    const divisions = 20;

    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);

    /**
     * AxesHelper
     * The X axis is red. The Y axis is green. The Z axis is blue.
     */
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
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

async function getTextureMap(url) {
    const textureLoader = new THREE.TextureLoader();
    return new Promise((resolve) => {
        textureLoader.load(
            url,
            // onLoad callback
            function (texture) {
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;
                resolve(texture);
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

function setWalls() {
    const wallWidth = 20;
    const planeGeo = new THREE.PlaneGeometry(wallWidth, wallWidth);
    const planeGeo2 = new THREE.PlaneGeometry(wallWidth * 3, wallWidth);

    const planeTop = new THREE.Mesh(
        planeGeo2,
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    planeTop.position.y = wallWidth;
    planeTop.rotateX(Math.PI / 2);
    scene.add(planeTop);

    const planeBottom = new THREE.Mesh(
        planeGeo2,
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    planeBottom.rotateX(-Math.PI / 2);
    planeBottom.position.y = 0.1;
    scene.add(planeBottom);

    const planeFront = new THREE.Mesh(
        planeGeo2,
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    planeFront.position.z = wallWidth / 2;
    planeFront.position.y = wallWidth / 2;
    planeFront.rotateY(Math.PI);
    scene.add(planeFront);

    const planeBack = new THREE.Mesh(
        planeGeo2,
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    planeBack.position.z = -wallWidth / 2;
    planeBack.position.y = wallWidth / 2;
    // planeBack.rotateY(Math.PI);
    scene.add(planeBack);

    const planeRight = new THREE.Mesh(
        planeGeo,
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    planeRight.position.x = (wallWidth * 3) / 2;
    planeRight.position.y = wallWidth / 2;
    planeRight.rotateY(-Math.PI / 2);
    scene.add(planeRight);

    const planeLeft = new THREE.Mesh(
        planeGeo,
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    planeLeft.position.x = -(wallWidth * 3) / 2;
    planeLeft.position.y = wallWidth / 2;
    planeLeft.rotateY(Math.PI / 2);
    scene.add(planeLeft);

    const pictureGeo = new THREE.PlaneGeometry(
        wallWidth / 1.6,
        wallWidth / 1.96
    );

    let picture = [];
    return new Promise((resolve) => {
        getTextureMap('/textures/nighthawks.jpg') //
            .then((nighthawks) => {
                const newPicture = new THREE.Mesh(
                    pictureGeo,
                    new THREE.MeshStandardMaterial({
                        map: nighthawks,
                        side: THREE.DoubleSide,
                    })
                );
                newPicture.position.z = 0.1;
                picture.push(newPicture);
                planeBack.add(newPicture);
                resolve({
                    planeTop,
                    planeBack,
                    planeBottom,
                    planeFront,
                    planeRight,
                    planeLeft,
                    picture,
                });
            });
    });
}

function setLights({ wall, target }) {
    const bulbGeometry = new THREE.SphereGeometry(0.02, 16, 8);

    const bulbLight = new THREE.SpotLight(0xffffff, 0.7);
    bulbLight.position.set(0, 35, -10);
    bulbLight.castShadow = true;
    bulbLight.angle = Math.PI / 15;
    bulbLight.penumbra = 0.7;
    bulbLight.decay = 2;
    // bulbLight.target = wall.planeBack;
    bulbLight.target = target;

    const bulbMat = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1,
        // color: 0x000000
    });
    const bulb = new THREE.Mesh(bulbGeometry, bulbMat);
    // bulb.position.set(50, 0, 0);
    bulb.add(bulbLight);
    wall.planeFront.add(bulb);

    const bulbLight2 = new THREE.SpotLight(0xffffff, 0.7);
    bulbLight2.position.set(0, 40, -10);
    bulbLight2.castShadow = true;
    bulbLight2.angle = Math.PI / 30;
    bulbLight2.penumbra = 0.7;
    bulbLight2.decay = 2;
    bulbLight2.target = wall.planeBack;
    // wall.planeFront.add(bulbLight2);
}
