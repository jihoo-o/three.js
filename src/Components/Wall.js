import * as THREE from 'three';

export default class Wall {
    /**
     * @param {ColorRepresentation} color
     * @param {Object} position - { x, y, z }
     * @param {Object} rotation - { x, y, z }
     */
    constructor({ scene }) {
        this.scene = scene;
    }

    setWall({ width, height, color, position, rotation }) {
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshPhongMaterial({ color });
        this.wall = new THREE.Mesh(geometry, material);
        this.position = this.threeDimensionalValidator(position);
        this.rotation = this.threeDimensionalValidator(rotation);
        this.wall.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        this.wall.rotation.set(
            this.rotation.x,
            this.rotation.y,
            this.rotation.z
        );

        if (this.scene) {
            this.scene.add(this.wall);
        }
        return this.wall;
    }

    /**
     *
     * @param {Object} obj - { a: number, b: number, c: number ...}
     */
    threeDimensionalValidator(obj) {
        let newObj;
        if (obj) {
            newObj = { ...obj };
            for (const key in newObj) {
                if (newObj[key] != null && typeof newObj[key] !== 'number') {
                    throw new Error(
                        'The type of the object value must be a number.'
                    );
                }
            }
        } else {
            newObj = {};
            for (const key of ['x', 'y', 'z']) {
                newObj[key] = 0;
            }
        }
        return newObj;
    }
}
