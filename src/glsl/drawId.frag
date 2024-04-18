#version 300 es

// uniform int uSelectedInstanceID;
uniform int uCurrentObjectID;
layout(location = 0) out int objectID;
// layout(location = 1) out vec4;

void main(void) {
    // gl_FragColor = fragcolor;
    // gl_FragColor=vec4(0.95, 0.0, 0.0, 1.0);
    objectID = 100;
}