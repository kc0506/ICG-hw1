// todo
// - gizmos
// - camera pan

import { vec3 } from "gl-matrix";
// import type { mat3, mat4, vec3 } from "gl-matrix";

import { Camera, ColorMode, Model3D, PerspectiveCamera } from "./object3d";
import { CSIE, KANGAROO, TEAPOT, TOMCAT } from "./models";
import { AmbientLight, Clip, LightShader, ShadingMode, drawModel } from "./drawPhongModel";
import { canvas, gl } from "./gl-utils";
// import { createTexture } from "./texture";
import { createFramebufferObject } from "./objectID";
import { dispatchEvents as dispatchEvents, setupEventListeners } from "./event";

import * as twgl from "twgl.js";

/* ---------------------------------- WebGL --------------------------------- */

const fbo: WebGLFramebuffer = createFramebufferObject(canvas);
let camera: Camera;

const clipDist = [100, 100, 100];

async function start() {
   gl.clearColor(ka, ka, ka, 1.0);
   gl.enable(gl.DEPTH_TEST);

   // camera = new PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 100.0);
   camera = new PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 200.0);
   vec3.set(camera.position, 0, 0, 100);
   setupEventListeners(canvas);

   const root = createRoot(document.getElementById("panel")!);
   root.render(<App {...{
      scene, lights: [ambientLight, ...lights], camera: camera as any,
      updateShadingMode(m) { mode = m; },
      clips: clipDist,
   }} />);

   tick();
}

/* ---------------------------------- Draw ---------------------------------- */

const ka = 0.1;
const lightPosition = new Float32Array([0, 0, -200]);


const ambientLight: AmbientLight = { intensity: 0.3, color: vec3.fromValues(1, 1, 1) };


const lights: LightShader[] = [
   // new Light(),
   // new Light(),
   // new Light(),
   { position: vec3.fromValues(0, 0, 15), intensity: 1.5, color: vec3.fromValues(1, 1, 1) },
   { position: vec3.fromValues(10, 0, 15), intensity: 1.5, color: vec3.fromValues(1, 0, 0) },
   { position: vec3.fromValues(10, 5, 3), intensity: 1, color: vec3.fromValues(0, 1, 0) },
   // { position: vec3.fromValues(10, 0, 15), intensity: 0.5, color: vec3.fromValues(1, 1, 1) },
];

// let mode: ShadingMode = ShadingMode.FLAT;
let mode: ShadingMode = ShadingMode.GORAUD;
// let mode: ShadingMode = ShadingMode.PHONG;

// const gridTexture = createTexture();
function drawScene() {
   gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

   gl.clearBufferfv(gl.DEPTH, 0, new Float32Array([1.0]));
   gl.clearBufferfv(gl.COLOR, 0, new Float32Array([0, 0, 0, 0]));
   gl.clearBufferiv(gl.COLOR, 1, new Int16Array([0, 0, 0, 0]));

   gl.enable(gl.DEPTH_TEST);
   gl.enable(gl.CULL_FACE);
   gl.viewport(0, 0, canvas.width, canvas.height);

   if (camera instanceof PerspectiveCamera) (camera.aspect = canvas.width / canvas.height), camera.update();
   camera.updateMatrix();

   const clips: Clip[] = [
      { axis: [1, 0, 0], d: clipDist[0] },
      { axis: [0, 1, 0], d: clipDist[1] },
      { axis: [0, 0, 1], d: clipDist[2] },
      // { axis: [1, 1, 0], d: 20 },
   ]


   drawModel({ clips, ambientLight, mode, lights, ka, model: scene, camera, lightLocation: lightPosition });

   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
   if (camera instanceof PerspectiveCamera) camera.aspect = canvas.width / canvas.height;
   gl.viewport(0, 0, canvas.width, canvas.height);
   const { intensity } = ambientLight;
   const color = ambientLight.color.map(x => x * intensity * ka) as any

   gl.clearColor(color[0], color[1], color[2], 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



   drawModel({ clips, ambientLight, mode, lights, ka, model: scene, camera, lightLocation: lightPosition });
}

function tick() {
   // * Camera
   // vec3.set(camera.rotation, 0, Math.PI / 4, 0);
   // vec3.set(camera.rotation, Math.PI / 2, 0, 0);
   // vec3.set(camera.rotation, 0, 0, Math.PI / 4);
   // vec3.set(camera.rotation, 0, Math.PI / 5, 0);
   // vec3.zero(camera.rotation);
   // vec3.set(lightPosition, 0, 0, 15);

   dispatchEvents(fbo, scene);
   drawScene();

   requestAnimationFrame(tick);
}

document.body.onload = start;


const scene = new Model3D('scene', { vertexPositions: [], vertexFrontcolors: [], vertexNormals: [], vertexBackcolors: [] });
scene.showInPanel = false;

const teapot1 = new Model3D('teapot1', TEAPOT, ColorMode.TEXTURE, twgl.createTexture(gl, { src: '/textures/galvanizedTexture.jpg' }));
teapot1.onmouseenter = function () {
   canvas.style.cursor = "pointer";
};
teapot1.ontick = function () {
   // console.log("tick");
   if (this.isHover) vec3.lerp(this.scale, this.scale, [1.1, 1.1, 1.1], 0.3);
   else vec3.lerp(this.scale, this.scale, [1, 1, 1], 0.3);
};
teapot1.onmouseleave = (function () {
   return () => {
      canvas.style.cursor = "default";
   };
})()
scene.add(teapot1);
vec3.set(teapot1.position, 0, -30, 0);
vec3.set(teapot1.rotation, 0, 0, Math.PI / 4)

const teapot2 = new Model3D('teapot2', TEAPOT);
// scene.add(teapot2)
// vec3.set(models[1].position, 20, 0, 10);

const ry1 = Math.random(), rz1 = Math.random();
teapot2.ontick = function () {
   const k = 500
   let now = Date.now() / k;
   now = now % (Math.PI * 2)
   // vec3.set(teapot2.rotation, now, now + ry1, now + rz1);
   vec3.set(teapot2.rotation, now, 0, now + rz1);
}
scene.add(teapot2)


// const p = new Model3D({ vertexPositions: [], vertexFrontcolors: [], vertexNormals: [], vertexBackcolors: [] });
const csie1 = new Model3D('csie1', CSIE);
// p.add(model);
vec3.set(csie1.scale, 20, 20, 20);
vec3.set(csie1.position, 0, 40, 0);
// scene.add(csie1)
teapot2.add(csie1)
const ry = Math.random(), rz = Math.random();
csie1.ontick = function () {
   const k = 1000
   let now = Date.now() / k;
   now = now % (Math.PI * 2)
   vec3.set(csie1.rotation, now, now + ry, now + rz);
}
csie1.disabledInput.add('rotation')



const csie2 = new Model3D('csie2', CSIE);
scene.add(csie2)

vec3.set(csie2.scale, 20, 20, 20);
vec3.set(csie2.position, -50, 0, 24);
vec3.set(csie2.rotation, -Math.PI / 2.7, 0, 0)


const teapot3 = new Model3D('teapot3', TEAPOT, ColorMode.BASIC)
vec3.set(teapot3.color, 0.7, 0.3, 0.2);
vec3.set(teapot3.position, 50, 0, 10);
scene.add(teapot3)


// const kangaroo = new Model3D('kangaroo', KANGAROO);
// const tomcat = new Model3D('tomcat', TOMCAT);


teapot1.colorMode = ColorMode.TEXTURE;

import teapotTexture from "/textures/galvanizedTexture.jpg";
import { createRoot } from "react-dom/client";
import { App } from "./panel";
// model.texture = getBlueTexture();
teapot1.texture = twgl.createTexture(gl, { src: teapotTexture });

// model.colorMode = ColorMode.BASIC;
// vec3.set(model.color, 0.5, 0.1, 0);

// const csie = new Model3D(CSIE);
// model.add(csie);
// vec3.scale(csie.scale, csie.scale, 20);

// updateTrans();


/* ----------------------------------- UI ----------------------------------- */