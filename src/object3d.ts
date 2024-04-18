import { mat4, vec3 } from "gl-matrix";
import { ModelData } from "./models";

import * as twgl from "twgl.js";
import { gl } from "./gl-utils";
import { Attributes } from "./drawPhongModel";

let currentObjectID = 0;
export class Object3D {
    _id: number;
    name: string;
    // parent: Object3D;
    showInPanel: boolean = true;

    // #matrix: mat4; // world transform
    readonly matrix: mat4 = mat4.create();
    readonly position: vec3; // global position
    readonly rotation: vec3; // euler angles, XYZ
    readonly scale: vec3;
    readonly shear: mat4 = mat4.create();

    readonly children: Object3D[] = [];
    parent: Object3D | null = null;

    readonly matrixWorld: mat4 = mat4.create();

    isHover: boolean = false;

    onclick: () => void = () => {};
    onmouseenter: () => void = () => {};
    onmouseleave: () => void = () => {};
    onmousedown: () => void = () => {};
    onmousemove: () => void = () => {};
    onmouseup: () => void = () => {};
    ontick: () => void = () => {};

    constructor(name: string) {
        this.name = name;
        this._id = ++currentObjectID;

        // this.matrix = glMat4.create();
        this.position = vec3.zero(vec3.create());
        this.rotation = vec3.zero(vec3.create());
        this.scale = vec3.fromValues(1, 1, 1);
    }

    add(obj: Object3D) {
        this.children.push(obj);
        obj.parent = this;
    }

    lookAt() {}

    updateMatrix() {
        mat4.identity(this.matrix);
        mat4.translate(this.matrix, this.matrix, this.position);
        mat4.rotateX(this.matrix, this.matrix, this.rotation[0]);
        mat4.rotateY(this.matrix, this.matrix, this.rotation[1]);
        mat4.rotateZ(this.matrix, this.matrix, this.rotation[2]);
        mat4.multiply(this.matrix, this.shear, this.matrix);
        mat4.scale(this.matrix, this.matrix, this.scale);
    }

    updateMatrixWorld() {
        this.updateMatrix();
        if (this.parent) {
            mat4.mul(this.matrixWorld, this.parent.matrixWorld, this.matrix);
        } else {
            mat4.copy(this.matrixWorld, this.matrix);
        }
    }
}

export function makeShear(out: mat4, ref: number, dir: number, ratio: number) {
    mat4.identity(out);
    out[ref * 4 + dir] = ratio;
}

export enum ColorMode {
    FRONT = 0,
    TEXTURE = 1,
    BASIC = 2,
}

export class Model3D extends Object3D {
    data: ModelData;
    numItems: number;

    colorMode: ColorMode;
    color: vec3 = vec3.fromValues(255, 255, 255);
    texture: WebGLTexture | null = null;

    declare parent: Model3D | null;
    declare children: Model3D[];

    // ka: number = 0.2;
    kd: number = 0.6;
    ks: number = 0.25;
    cosDeg: number=5;

    disabledInput: Set<string> = new Set();

    constructor(
        name: string,
        data: ModelData,
        colorType: ColorMode = ColorMode.FRONT,
        texture: WebGLTexture | null = null
    ) {
        super(name);
        this.data = data;
        this.colorMode = colorType;
        this.texture = texture;
        this.numItems = data.vertexPositions.length / 3;

        this.setupAttributes();
    }

    declare bufferInfo: twgl.BufferInfo;
    private setupAttributes() {
        type Arrays = {
            [K in keyof Attributes]: { numComponents: number; data: Attributes[K] };
        };

        const arrays: Arrays = {
            a_vertexPosition: { numComponents: 3, data: this.data.vertexPositions },
            a_vertexNormal: { numComponents: 3, data: this.data.vertexNormals },
            a_frontColor: { numComponents: 3, data: this.data.vertexFrontcolors },
        };
        if (this.data.vertexTextureCoords)
            arrays["a_textureCoord"] = { numComponents: 2, data: this.data.vertexTextureCoords };

        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    }

    static box({
        width = 1,
        height = 1,
        depth = 1,
    }: // color = [255, 255, 255],
    {
        width?: number;
        height?: number;
        depth?: number;
        color?: vec3;
    }) {
        // prettier-ignore
        return new Model3D('box', {
            vertexPositions: [ -width / 2, -height / 2, -depth / 2, -width / 2, height / 2, -depth / 2, width / 2, -height / 2, -depth / 2, -width / 2, height / 2, -depth / 2, width / 2, height / 2, -depth / 2, width / 2, -height / 2, -depth / 2, -width / 2, -height / 2, depth / 2, width / 2, -height / 2, depth / 2, -width / 2, height / 2, depth / 2, -width / 2, height / 2, depth / 2, width / 2, -height / 2, depth / 2, width / 2, height / 2, depth / 2, -width / 2, height / 2, -depth / 2, -width / 2, height / 2, depth / 2, width / 2, height / 2, -depth / 2, -width / 2, height / 2, depth / 2, width / 2, height / 2, -depth / 2, width / 2, height / 2, depth / 2, -width / 2, -height / 2, -depth / 2, width / 2, -height / 2, -depth / 2, -width / 2, -height / 2, depth / 2, -width / 2, -height / 2, depth / 2, width / 2, -height / 2, -depth / 2, width / 2, -height / 2, depth / 2, -width / 2, -height / 2, -depth / 2, ],
            vertexNormals: [],
            vertexFrontcolors: [],
            vertexBackcolors: [],
        });
    }
}

/* --------------------------------- Camera --------------------------------- */

export class Camera extends Object3D {
    pMatrix: mat4;

    constructor() {
        super("camera");
        this.pMatrix = mat4.create();
    }
}
export class PerspectiveCamera extends Camera {
    #fovy: number;
    set fovy(v: number) {
        this.#fovy = v;
        this.update();
    }

    #aspect: number;
    set aspect(v: number) {
        this.#aspect = v;
        this.update();
    }
    #near: number;
    set near(v: number) {
        this.#near = v;
        this.update();
    }
    #far: number;
    set far(v: number) {
        this.#far = v;
        this.update();
    }

    constructor(fovy: number, aspect: number, near: number, far: number) {
        super();
        this.#fovy = fovy;
        this.#aspect = aspect;
        this.#near = near;
        this.#far = far;
    }

    update() {
        mat4.perspective(this.pMatrix, this.#fovy, this.#aspect, this.#near, this.#far);
    }
}

export class Light extends Object3D {
    intensity: number = 1;

    constructor() {
        super("light");
    }
}
