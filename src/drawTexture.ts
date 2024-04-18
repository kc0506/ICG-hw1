import { mat4 } from "gl-matrix";
import { Camera, Model3D, Object3D } from "./object3d";
import { getShader } from "./shaders";
import { getShaderProgram } from "./utils";
import { gl } from "./gl-utils";
import { createTexture } from "./texture";

type DrawTextureProps = {
    // ka: number;
    // lightLocation: vec3;

    model: Object3D;
    camera: Camera;
    texture: WebGLTexture | null;
    // mvMatrix: mat4;
    // pMatrix: mat4;
};

const TEXTURE_PROGRAM = getShaderProgram([getShader("texVertex"), getShader("texFragment")]);

const vertexPositionBuffer = gl.createBuffer()!;
const vertexTextureCoordBuffer = gl.createBuffer()!;

const outMvMatrix = mat4.create();

export function drawTexture({ model, camera, texture }: DrawTextureProps) {
    const program = TEXTURE_PROGRAM;
    gl.useProgram(program);
    gl.bindTexture(gl.TEXTURE_2D, texture);


    {
        const location = gl.getAttribLocation(program, "aVertexPosition");
        gl.enableVertexAttribArray(location);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, BOX_GEOMETRY, gl.STATIC_DRAW);
        gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
    }
    {
        const location = gl.getAttribLocation(program, "aTexCoord");
        gl.enableVertexAttribArray(location);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, BOX_TEXCOORDS, gl.STATIC_DRAW);
        gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    }

    mat4.identity(outMvMatrix);
    mat4.invert(outMvMatrix, camera.getMatrix());
    mat4.mul(outMvMatrix, outMvMatrix, model._getMatrix());

    {
        let location = gl.getUniformLocation(program, "uMVMatrix");
        gl.uniformMatrix4fv(location, false, outMvMatrix);

        location = gl.getUniformLocation(program, "uPMatrix");
        gl.uniformMatrix4fv(location, false, camera.pMatrix);

        location = gl.getUniformLocation(program, "uTexture");
        gl.uniform1i(location, 1);
    }

    const numItems = BOX_GEOMETRY.length / 3;
    if (BOX_GEOMETRY.length / 3 !== BOX_TEXCOORDS.length / 2) throw "!";

    gl.drawArrays(gl.TRIANGLES, 0, numItems);

    // const v = vec4.fromValues(...model.data.vertexPositions.slice(-1, -4), 1);
    // vec4.transformMat4(v, vec4.fromValues(...model.position, 1), outMvMatrix);
    // vec4.transformMat4(v, v, camera.pMatrix);
    // console.log(v);

    /* ----------------------------- Draw Object ID ----------------------------- */

    // gl.useProgram(shaderProgram);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

const BOX_GEOMETRY = new Float32Array([
    -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,

    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5,

    -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,

    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5,

    -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,

    0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
]);

const BOX_TEXCOORDS = new Float32Array([
    0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

    0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1,

    0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

    0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1,

    0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

    0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1,
]);
