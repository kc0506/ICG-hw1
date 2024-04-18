import { gl } from "./gl-utils";

export function degToRad(degrees: number) {
    return (degrees * Math.PI) / 180;
}

export const repeat = <T>(arr: T[], n: number): T[] => Array(n).fill(arr).flat();

export function getShaderProgram(shaders: [WebGLShader, WebGLShader]): WebGLProgram {
    const [vertexShader, fragmentShader] = shaders;

    const shaderProgram = gl.createProgram()!;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error(gl.getShaderInfoLog(vertexShader));
        console.error(gl.getShaderInfoLog(fragmentShader));
        // alert("Could not initialise shaders");
        throw "!";
    }
    // gl.useProgram(shaderProgram);
    return shaderProgram;
}

export function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}
