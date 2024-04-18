// @ts-ignore
import fragmentShader from "./glsl/main.frag";
// @ts-ignore
import vertexShader from "./glsl/main.vert";
// @ts-ignore
import objectIdVertexShader from "./glsl/drawId.vert";
// @ts-ignore
import objectIdFragmentShader from "./glsl/drawId.frag";
// @ts-ignore
import textureVertexShader from "./glsl/texture.vert";
// @ts-ignore
import textureFragmentShader from "./glsl/texture.frag";

import { gl } from "./gl-utils";

const SHADER_SOURCES = {
    mainVertex: vertexShader,
    mainFragment: fragmentShader,
    objectIdVertex: objectIdVertexShader,
    objectIdFragment: objectIdFragmentShader,
    texVertex: textureVertexShader,
    texFragment: textureFragmentShader,
};

// console.log(objectIdVertexShader)

export function getShaderSource(type: keyof typeof SHADER_SOURCES): string {
    return SHADER_SOURCES[type];
}

export function getShader(type: keyof typeof SHADER_SOURCES): WebGLShader {
    // const shaderSource: string = type === "fragment" ? fragmentShader : vertexShader;
    const shaderSource = SHADER_SOURCES[type];

    const shader = gl.createShader(type.endsWith("Fragment") ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER)!;

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        throw "!";
    }

    return shader;
}
