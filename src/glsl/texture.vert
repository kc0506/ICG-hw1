#version 300 es
// #pragma vscode_glsllint_stage: vert

in vec3 aVertexPosition;
in vec2 aTexCoord;

out vec2 vTexcoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

void main() {
    vec4 v = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0f);
    gl_Position = v;

    vTexcoord = aTexCoord;
}