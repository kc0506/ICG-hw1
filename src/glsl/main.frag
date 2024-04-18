#version 300 es
#extension GL_OES_standard_derivatives : enable

precision highp float;

// in vec3 v_fragColor;

in vec4 v_fragColor;
flat in vec4 f_fragcolor;

in vec4 v_mvPosition;
in vec4 v_worldPosition;
in vec4 v_normal;

struct Clip {
    vec3 axis;
    // float minD;
    // float maxD;
    float d;
};

uniform Clip[3] u_clips;
uniform int u_currentObjectID;
uniform int u_globalHoverObjectID;

// uniform int u_shadingMode;
uniform highp int u_shadingMode;

layout(location = 0) out vec4 outColor;
layout(location = 1) out int outObjectID;

uniform vec3 u_ambientColor;
struct Light {
    vec3 position;
    vec3 color;
    float intensity;
};
uniform Light[5] u_lights;

uniform float u_ka;
uniform float u_kd;
uniform float u_ks;
uniform float u_cosDeg;

uniform bool u_showClipped;

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

        gouraud += color * diffuse + specular;
    }
    return gouraud + u_ka * color * u_ambientColor;
}

void main(void) {

    switch(u_shadingMode) {

        case 0:
            vec3 dx = dFdx(v_mvPosition.xyz);
            vec3 dy = dFdy(v_mvPosition.xyz);
            vec3 normal = normalize(cross(dx, dy));
            outColor = vec4(calcLighting(v_mvPosition.xyz, normal, v_fragColor.xyz), 1);
            break;
        case 1:  // Gouraud
            outColor = v_fragColor;
            break;
        case 2:  // Phong
            outColor = vec4(calcLighting(v_mvPosition.xyz, v_normal.xyz, v_fragColor.xyz), 1);
            break;
    }

    // * Clipping
    bool flag = false;
    for(int i = 0; i < 3; i++) {
        Clip clip = u_clips[i];
        float d = dot(v_worldPosition.xyz / v_worldPosition.w, clip.axis);
        if(clip.d > 0.f)
            if(d > clip.d || d < -clip.d)
                flag = true;
    }

    if(u_currentObjectID ==  u_globalHoverObjectID)
        outColor.a = 1.5f;

    if(flag) {
        if(u_showClipped)
            outColor.a *= 0.5f;
        else
            outColor = vec4(0, 0, 0, 1);
    }

    outObjectID = u_currentObjectID;
}
