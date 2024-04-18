import { mat4, vec3 } from "gl-matrix";
import { Camera, ColorMode, Model3D } from "./object3d";

import { getShaderSource } from "./shaders";
import { gl } from "./gl-utils";
import * as twgl from "twgl.js";
import { getHoverID } from "./event";
// const b = twgl.createBufferInfoFromArrays(gl,{a:[]})

export type LightShader = {
    position: vec3;
    intensity: number;
    color: vec3;
};

export type Clip = {
    axis: vec3;
    d: number;
};

export enum ShadingMode {
    FLAT = 0,
    GORAUD = 1,
    PHONG = 2,
}

export type Uniforms = {
    u_globalHoverObjectID: number;
    u_ka: number;
    // u_lightPosition: vec3;

    u_worldMatrix: mat4;
    u_modelViewMatrix: mat4;
    u_projectMatrix: mat4;

    u_currentObjectID: number;

    u_clips?: Clip[];
    u_showClipped: boolean;

    u_shadingMode: ShadingMode;
    u_lights: LightShader[];

    u_kd: number;
    u_ks: number;
    u_cosDeg: number;

    // u_lightPosition: vec3;
    u_ambientColor: vec3;

    u_colorMode: ColorMode;
    u_texture?: WebGLTexture | null;
    u_basicColor?: vec3;
};

export type Attributes = {
    a_vertexPosition: number[];
    a_frontColor: number[];
    a_vertexNormal: number[];
    a_textureCoord?: number[];
};

export type AmbientLight = {
    intensity: number;
    color: vec3;
};

type DrawModelProps = {
    ka: number;
    lightLocation: vec3;

    mode: ShadingMode;

    model: Model3D;
    camera: Camera;
    lights: LightShader[];
    clips: Clip[];
    ambientLight: AmbientLight;
    // mvMatrix: mat4;
    // pMatrix: mat4;
};

let showClipped = true;
export function getShowClipped() {
    return showClipped;
}
export function setShowClipped(v: boolean) {
    showClipped = v;
}

const programInfo = twgl.createProgramInfo(gl, [getShaderSource("mainVertex"), getShaderSource("mainFragment")]);
const outMvMatrix = mat4.create();

export function drawModel({ clips, ambientLight, lights, mode, ka, model, camera, lightLocation }: DrawModelProps) {
    const program = programInfo.program;
    gl.useProgram(program);

    twgl.setBuffersAndAttributes(gl, programInfo, model.bufferInfo);

    gl.bindTexture(gl.TEXTURE_2D, model.texture);
    // console.log(model.texture);

    model.updateMatrix();
    model.updateMatrixWorld();
    mat4.identity(outMvMatrix);
    mat4.invert(outMvMatrix, camera.matrix);
    // mat4.mul(outMvMatrix, outMvMatrix, model.matrix);
    mat4.mul(outMvMatrix, outMvMatrix, model.matrixWorld);

    const uniforms: Uniforms = {
        u_ka: ka,
        // u_globalHoverObjectID: getHoverID(),
        // u_lightPosition: lightLocation,
        u_worldMatrix: model.matrixWorld,
        u_modelViewMatrix: outMvMatrix,
        u_projectMatrix: camera.pMatrix,
        u_currentObjectID: model._id,
        u_colorMode: model.colorMode,
        u_clips: clips,
        u_showClipped: showClipped,
        u_lights: lights,
        u_shadingMode: mode,
        u_ambientColor: ambientLight.color.map((x) => x * ambientLight.intensity) as any,

        // u_kd: 0.7,
        // u_ks: 0.3,
        // u_cosDeg: 5,

        u_kd: model.kd,
        u_ks: model.ks,
        u_cosDeg: model.cosDeg,

        u_basicColor: model.color,
        u_texture: model.texture,
        // u_texture: 1,
    };
    // console.log(model.kd,)

    twgl.setUniforms(programInfo, uniforms);

    const { numItems } = model;
    gl.drawArrays(gl.TRIANGLES, 0, numItems);

    for (const next of model.children) {
        drawModel({ clips, ambientLight, lights, mode, ka, model: next, camera, lightLocation });
    }
}
