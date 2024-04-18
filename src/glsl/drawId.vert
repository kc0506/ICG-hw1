#version 300 es
// #pragma vscode_glsllint_stage: vert

// uniform int uObjectID;

layout(location = 0) in vec3 aVertexPosition;
// layout(location = 1) in vec3 aFrontColor;
// layout(location = 2) in vec3 aVertexNormal;


uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

void main() {
    // gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0f);
    gl_Position = vec4(0, 0, 0, 1);
    // gl_Position = vec4(1, 1, 1, 1);
}