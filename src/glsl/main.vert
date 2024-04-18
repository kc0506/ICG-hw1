#version 300 es

in vec3 a_vertexPosition;
in vec3 a_frontColor;
in vec3 a_vertexNormal;
in vec2 a_textureCoord;

uniform mat4 u_worldMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectMatrix;

uniform vec3 u_ambientColor;
struct Light {
    vec3 position;
    vec3 color;
    float intensity;
};
uniform Light[5] u_lights;

uniform int u_colorMode;
uniform sampler2D u_texture;
uniform vec3 u_basicColor;

uniform int u_shadingMode;
uniform float u_ka;
uniform float u_kd;
uniform float u_ks;
uniform float u_cosDeg;

out vec4 v_fragColor;
flat out vec4 f_fragcolor;

out vec4 v_normal;
out vec4 v_worldPosition;
out vec4 v_mvPosition;

vec3 calcLighting(vec3 position, vec3 normal, vec3 color) {

    vec3 gouraud = vec3(0, 0, 0);
    for(int i = 0; i < 5; i++) {
        Light light = u_lights[i];
        if(light.intensity == 0.0f) {
            continue;
        }

        vec3 L = normalize(light.position - position);

        vec3 N = normalize(normal);
        vec3 V = -normalize(position);
        vec3 H = normalize(L + V);

        vec3 Id = light.color * light.intensity * max(dot(L, N), 0.f);
        vec3 diffuse = u_kd * Id;

        vec3 Is = light.color * light.intensity * pow(max(dot(H, N), 0.f), u_cosDeg);
        vec3 specular = u_ks * Is;

        if(dot(L, N) < 0.f) {
            specular = vec3(0.f, 0.f, 0.f);
        }
        // specular = vec3(0.f, 0.f, 0.f);

        gouraud += color * diffuse + specular;
    }
    return gouraud + u_ka * color * u_ambientColor;
}

vec3 getColor() {

    vec3 color;
    switch(u_colorMode) {
        case 0:  // Front color
            color = a_frontColor;
            break;
        case 1:  // Texture color
            color = texture(u_texture, a_textureCoord).rgb;
            break;
        case 2:  // Basic color
            color = u_basicColor;
            break;
    }
    return color;
}

void main(void) {

    vec3 color = getColor();

    v_worldPosition = u_worldMatrix * vec4(a_vertexPosition, 1.0f);
    v_mvPosition = (u_modelViewMatrix * vec4(a_vertexPosition, 1.0f));
    v_normal = u_modelViewMatrix * vec4(a_vertexNormal, 0.f);

    vec3 gouraud = calcLighting(v_mvPosition.xyz, v_normal.xyz, color);
    v_fragColor = vec4(gouraud, 1.0f);

    // v_fragColor = vec4(color, 1);

    gl_Position = u_projectMatrix * v_mvPosition;
}
