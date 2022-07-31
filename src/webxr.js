import PictureList from './ARComponents/pictureList.js';
import * as THREE from '/node_modules/three/build/three.module.js';

// global scene values
var btn, gl, glCanvas, camera, scene, renderer;
var controller, reticle;
let geo, mat;

let uiElement, debugElement, _pictureList, _ar, _container;
let initFlag = false;

// global xr value
var xrSession = null;
var viewerRefSpace;
var xrViewerPose;
var hitTestSource = null;
var hitTestSourceRequested = false;

export function loadScene() {
    // setup WebGL
    _container = document.createElement('div');
    document.body.appendChild(_container);
    glCanvas = document.createElement('canvas');
    gl = glCanvas.getContext('webgl', { antialias: true });

    // setup Three.js scene
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
    );

    scene = new THREE.Scene();
    // add hemisphere light
    var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    // setup Three.js WebGL renderer
    renderer = new THREE.WebGLRenderer({
        canvas: glCanvas,
        context: gl,
        alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    _container.appendChild(renderer.domElement);
    uiElement = document.querySelector('#ui');
    _ar = document.querySelector('#ar');
    // uiElement.appendChild(renderer.domElement);
    _ar.addEventListener('beforexrselect', (ev) => {
        console.log(ev.type);
        ev.preventDefault();
    });
    debugElement = document.querySelector('#debug');

    var geometry = new THREE.CylinderBufferGeometry(
        0.1,
        0.1,
        0.2,
        32
    ).translate(0, 0.1, 0);

    geo = new THREE.PlaneGeometry(1.6 / 3, 1.96 / 3);

    getTextureMap('/static/assets/textures/nighthawks.jpg') //
        .then((nighthawks) => {
            mat = new THREE.MeshStandardMaterial({
                map: nighthawks,
                side: THREE.DoubleSide,
            });
        });

    // get controller WebXR Device API through Three.js
    controller = renderer.xr.getController(0);
    // console.log(controller);
    // controller.addEventListener('select', onSelect);
    scene.add(controller);

    //
    // controller.addEventListener('beforexrselect', (e) => {
    //     e.preventDefault();
    //     // window.alert('clicked 1!');
    // });
    // glCanvas.addEventListener('select', () => {
    //     console.log('canvas click');
    //     window.alert('canvas click');
    // });

    // reticle and reticle properties
    reticle = new THREE.Mesh(
        new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: '#00FF00' })
    );

    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    // begin xr query
    navigator.xr
        .isSessionSupported('immersive-ar')
        .then((supported) => {
            if (supported) {
                btn = document.createElement('button');
                btn.addEventListener('click', onRequestSession);
                btn.innerHTML = 'Enter XR';
                var header = document.querySelector('header');
                header.appendChild(btn);
            } else {
                navigator.xr.isSessionSupported('inline').then((supported) => {
                    if (supported) {
                        console.log('inline session supported');
                    } else {
                        console.log('inline not supported');
                    }
                });
            }
        })
        .catch((reason) => {
            console.log('WebXR not supported: ' + reason);
        });
}
// controller click event listener
function onSelect(e) {
    // window.alert('xrsessions selected');
    console.log('on select fired...');
    // var material = new THREE.MeshPhongMaterial({
    //     color: 0xffffff * Math.random(),
    // });
    // var mesh = new THREE.Mesh(geometry, material);
    // mesh.applyMatrix4(reticle.matrix); // THIS IS A KEY FUNCTION
    // mesh.scale.y = Math.random() * 2 + 1; // double value of random number then add 1 for height, why?
    // scene.add(mesh);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.set(-Math.PI / 2, 0, 0);
    // mesh.position.set(0, 0, 0.00);
    mesh.applyMatrix4(reticle.matrix); // THIS IS A KEY FUNCTION
    // mesh.scale.y = Math.random() * 2 + 1; // double value of random number then add 1 for height, why?
    scene.add(mesh);
}

// request immersive-ar session with hit-test
export function onRequestSession() {
    console.log('requesting session');

    /**
     * Hangable picture list
     * It only renders the picture list's UI once.
     * after that, it controls it with a class to change the display style to Block or Hidden.
     */
    if (!initFlag) {
        _pictureList = new PictureList({
            _parent: document.querySelector('#pictures'),
        });
    }
    initFlag = true;

    navigator.xr
        .requestSession('immersive-ar', {
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['local-floor', 'dom-overlay'],
            domOverlay: { root: _ar },
        })
        .then(onSessionStarted)
        .catch((reason) => {
            console.log('request disabled: ' + reason);
        });
}

function onSessionStarted(session) {
    console.log('starting session');
    btn.removeEventListener('click', onRequestSession);
    btn.addEventListener('click', endXRSession);
    btn.innerHTML = 'STOP AR';
    xrSession = session;
    xrSession.addEventListener('select', onSelect); // <-> same as binding to the Controller?
    xrSession.addEventListener('end', endXRSession);
    setupWebGLLayer().then(() => {
        renderer.xr.setReferenceSpaceType('local');
        renderer.xr.setSession(xrSession);
        animate();
    });
}

function setupWebGLLayer() {
    return gl.makeXRCompatible().then(() => {
        xrSession.updateRenderState({
            baseLayer: new XRWebGLLayer(xrSession, gl),
        });
    });
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render(time, frame) {
    if (frame) {
        var referenceSpace = renderer.xr.getReferenceSpace('local');
        xrViewerPose = frame.getViewerPose(referenceSpace);
        var session = frame.session;
        if (hitTestSourceRequested === false) {
            // console.log(session.requestReferenceSpace);
            session.requestReferenceSpace('viewer').then((referenceSpace) => {
                // console.log(referenceSpace);
                viewerRefSpace = referenceSpace;
                session
                    .requestHitTestSource({ space: referenceSpace }) // subscribe
                    .then((source) => {
                        hitTestSource = source;
                    });
            });

            session.addEventListener('end', () => {
                hitTestSourceRequested = false;
                hitTestSource = null;
            });

            hitTestSourceRequested = true;
        }

        if (hitTestSource) {
            var hitTestResults = frame.getHitTestResults(hitTestSource);
            let viewerPose = frame.getViewerPose(viewerRefSpace);

            if (hitTestResults.length > 0) {
                var hit = hitTestResults[0];
                reticle.visible = true;
                // reticle.matrix.fromArray(
                //     hit.getPose(referenceSpace).transform.matrix
                // );

                const hitMatrix = new THREE.Matrix4().fromArray(
                    hit.getPose(referenceSpace).transform.matrix
                );
                // console.log(hitMatrix);
                // debugElement.innerHTML = `${hitMatrix.elements[0]}, ${hitMatrix.elements[5]}, ${hitMatrix.elements[10]}`;

                debugElement.innerText = `
                ${xrViewerPose.transform.matrix[0]}
                 ${xrViewerPose.transform.matrix[5]}
                  ${xrViewerPose.transform.matrix[10]}`;
                // if (hitMatrix.elements[5] < 0) {
                //     reticle.matrix = hitMatrix;
                // }
                reticle.matrix = hitMatrix;
            } else {
                reticle.visible = false;
            }
        }
    }

    renderer.render(scene, camera);
}

function endXRSession() {
    if (xrSession) {
        xrSession
            .end()
            .then(() => {
                xrSession.ended = true;
                onSessionEnd();
            })
            .catch((reason) => {
                console.log('session not ended because ' + reason);
                onSessionEnd();
            });
    } else {
        onSessionEnd();
    }
}

function onSessionEnd() {
    xrSession = null;
    console.log('session ended');
    btn.innerHTML = 'START AR';
    btn.removeEventListener('click', endXRSession);
    btn.addEventListener('click', onRequestSession);
    window.requestAnimationFrame(render);
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
