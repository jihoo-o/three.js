import * as THREE from '/node_modules/three/build/three.module.js';
import Wall from './Components/Wall.js';

export default class Main {
    helpers = {};

    constructor({ canvasElement }) {
        if (!canvasElement) {
            throw new Error('canvasElement is null');
        }
        this.canvas = canvasElement;

        // scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(1, 1, 1);

        // camera
        const angleOfView = 100; // 가시 범위
        const aspectRatio = this.canvas.clientWidth / this.canvas.clientHeight;
        const nearPlane = 0.1; // 하한 거리
        const farPlane = 100; // 상한 거리
        this.camera = new THREE.PerspectiveCamera(
            angleOfView,
            aspectRatio,
            nearPlane,
            farPlane
        );
        this.camera.position.set(0, 8, 30);

        // renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });

        // THREE.Cache.enabled = true;

        // helpers
        const gridHelperSize = 100;
        const gridHelperDivisions = 20;
        this.helpers['grid'] = new THREE.GridHelper(
            gridHelperSize,
            gridHelperDivisions
        );
        this.helpers['axis'] = new THREE.AxesHelper(5);
        for (const helper in this.helpers) {
            this.scene.add(this.helpers[helper]);
        }

        // walls
        this.wall = new Wall({ scene: this.scene });
        this.wall.setWall({
            width: 20,
            height: 20,
            color: 0xffffff,
            position: { x: 10, y: 10, z: 10 },
        });

        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.draw);
    }

    draw = (time) => {
        time *= 0.001;
        // controls.update();

        // frame buffer
        if (this.resizeGLToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.draw);
    };

    resizeGLToDisplaySize = (gl) => {
        const canvas = gl.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width != width || canvas.height != height;
        if (needResize) {
            gl.setSize(width, height, false);
        }
        return needResize;
    };
}
