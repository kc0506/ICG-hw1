#version 300 es

precision mediump float;

in vec2 vTexcoord;

out vec4 outColor;

uniform sampler2D uTexture;

void main() {
    outColor = texture(uTexture, vTexcoord);
    // outColor = texture(uTexture, vec2(1, 1));
}
