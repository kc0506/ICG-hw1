
// - camera pan

// import type { mat3, mat4, vec3 } from "gl-matrix";

import { Camera, Model3D, PerspectiveCamera, makeShear } from "./object3d";
import { AmbientLight, Clip, LightShader, ShadingMode, getShowClipped, setShowClipped } from "./drawPhongModel";


import "./index.css";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

// @ts-ignore
import { IconCube } from "@tabler/icons-react";
import { ScrollArea } from "./components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";
import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { vec3 } from "gl-matrix";

function Range({
   onChange,
   ...props
}: {
   onChange: (value: number) => void;
   min: number;
   max: number;
   defaultValue: number;
}) {
   // const [value, setValue] = useState(0);

   return (
      <div>
         <input type="range" onChange={(e) => onChange(parseFloat(e.target.value))} {...props} className="w-full" />
         {/* <Slider type="range" value={value} onValueChange={(value) => { onChange(value); setValue(value); }} {...props} className="w-full" /> */}
      </div>
   );
}

function AxisRanges({
   target,
   toRad = false,
   names = 'xyz',
   length = 3,
   min, max,
   defaultValue,
   ...props
}: {
   toRad?: boolean;
   target: vec3 | number[];
   max: number;
   min: number;
   names?: string | string[];
   length?: number;
   defaultValue: vec3 | number[] | number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue'>) {
   const [cnt, setCnt] = useState(0);


   return (
      <div className="flex gap-2">
         {Array.from(Array(length)).map((_, idx) => {
            return (
               <div key={`axis-${idx}`}>
                  <div className=" font-normal text-xs text-slate-600 flex justify-between ">
                     <p>{names[idx]}</p>
                     <p>{target[idx].toFixed(2)}</p>
                  </div>
                  <Range
                     {...props}
                     onChange={(v) => {
                        if (toRad) v = (Math.PI * v) / 180;
                        target[idx] = v;
                        setCnt(cnt + 1);
                     }}
                     min={
                        typeof min === 'number' ? min : min[idx]
                     }
                     max={
                        typeof max === 'number' ? max : max[idx]
                     }
                     defaultValue={
                        typeof defaultValue === 'number'
                           ? defaultValue
                           : defaultValue[idx]
                     }
                  />
               </div>
            )
         })}
      </div>
   );
}

function ModelPanel(props: { model: Model3D }) {

   const [refAxis, setRefAxis] = useState(0);
   const [shearAxis, setShearAxis] = useState(1);
   const [shearValue, setShearValue] = useState(0);

   const { model } = props;
   makeShear(model.shear, refAxis, shearAxis, shearValue);

   const coeffcients = useRef([model.kd, model.ks, model.cosDeg]);

   useEffect(() => {
      let unmount = false;
      function f() {
         const arr = coeffcients.current;
         model.kd = arr[0];
         model.ks = arr[1];
         model.cosDeg = arr[2];
         if (!unmount) requestAnimationFrame(f);
      }
      f();
      return () => { unmount = true; }
   }, []);



   return (
      <>
         <Card>
            <Accordion type="single" collapsible>
               <AccordionItem value="item-1">
                  <AccordionTrigger className="py-0 pr-6">
                     <CardHeader className="hover:no-underline">
                        <CardTitle className="text-base flex flex-row gap-2">
                           <IconCube /> {model.name} #{model._id}
                        </CardTitle>
                     </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent>
                     <CardContent className=" gap-4 flex flex-col ">
                        <div>
                           <h3 className=" font-semibold text-sm  text-slate-800 mb-2 ">Translation</h3>
                           <AxisRanges target={model.position} min={-50} max={50} defaultValue={0} />
                           <div className="h-0 border-b border-b-slate-300 mt-4 "></div>
                        </div>
                        {!model.disabledInput.has('rotation') && < div >
                           <h3 className=" font-semibold text-sm  text-slate-800 mb-2 ">Rotation</h3>
                           <AxisRanges target={model.rotation} min={-180} max={180} defaultValue={0} toRad />
                           <div className="h-0 border-b border-b-slate-300 mt-4 "></div>
                        </div>}
                        <div>
                           <h3 className=" font-semibold text-sm  text-slate-800 mb-2 ">Scale</h3>
                           <AxisRanges target={model.scale} min={0.1} max={100} defaultValue={1} step={1} />
                           <div className="h-0 border-b border-b-slate-300 mt-4 "></div>
                        </div>
                        <div>
                           <h3 className=" font-semibold text-sm  text-slate-800 mb-2 ">Shear</h3>

                           <div className=" flex flex-row justify-evenly">
                              <div>
                                 <div className="font-normal text-xs text-slate-600 flex justify-between ">
                                    <p>Ref Axis</p>
                                 </div>
                                 <Select value={`${refAxis}`} onValueChange={v => setRefAxis(parseInt(v))}>
                                    <SelectTrigger className="w-[80px] h-[32px]" >
                                       <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="0">x</SelectItem>
                                       <SelectItem value="1">y</SelectItem>
                                       <SelectItem value="2">z</SelectItem>
                                    </SelectContent>
                                 </Select>
                              </div>
                              <div >
                                 <div className=" font-normal text-xs text-slate-600 flex justify-between ">
                                    <p>Shear Axis</p>
                                 </div>
                                 <Select defaultValue="1" value={`${shearAxis}`} onValueChange={v => setShearAxis(parseInt(v))}>
                                    <SelectTrigger className="w-[80px] h-[32px]" >
                                       <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="0">x</SelectItem>
                                       <SelectItem value="1">y</SelectItem>
                                       <SelectItem value="2">z</SelectItem>
                                    </SelectContent>
                                 </Select>
                              </div>
                              <div>
                                 <div className=" font-normal mb-2 text-xs text-slate-600 flex justify-between ">
                                    <p>Shear ratio</p>
                                    <p>{shearValue}</p>
                                 </div>
                                 <input type="range"
                                    value={shearValue}
                                    onChange={(e) => setShearValue(parseFloat(e.target.value))}
                                    // {...props}
                                    min={0}
                                    max={2}
                                    defaultValue={0}
                                    step={0.1}
                                    className="w-full"
                                 />
                              </div>
                              <div className="h-0 border-b border-b-slate-300 mt-4 "></div>
                           </div>
                        </div>
                        <div>
                           <h3 className=" font-semibold text-sm  text-slate-800 mb-2 ">Shading Coefficients</h3>
                           <AxisRanges names={['kd', 'ks', 'cosDeg']} target={coeffcients.current} min={[0, 0, 0]} max={[1, 1, 10]} defaultValue={[model.kd, model.ks, model.cosDeg]} step={0.1} />
                           <div className="h-0 border-b border-b-slate-300 mt-4 "></div>
                        </div>
                     </CardContent>
                  </AccordionContent>
               </AccordionItem>
            </Accordion>
         </Card >
         {
            model.children.map((child, i) => (
               <ModelPanel key={i} model={child} />
            ))
         }
      </>
   );
}


// @ts-ignore
import { IconBulb, IconBrightnessUp } from '@tabler/icons-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Checkbox } from "./components/ui/checkbox";

function PointLightPanel({ light, idx }: { light: LightShader, idx: number }) {

   const intensity = useRef([light.intensity]);
   useEffect(() => {
      let unmount = false;
      function f() {
         light.intensity = intensity.current[0];
         if (!unmount) requestAnimationFrame(f);
      }
      f();
      return () => { unmount = true; }
   }, []);


   return (
      <>
         <Card>
            <Accordion type="single" collapsible>
               <AccordionItem value="item-1">
                  <AccordionTrigger className="py-0 pr-6">
                     <CardHeader className="hover:no-underline">
                        <CardTitle className="text-base flex flex-row gap-2">
                           <IconBulb />Point Light #{idx}
                        </CardTitle>
                     </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent>
                     <CardContent className=" gap-4 flex flex-col ">
                        <div>
                           <h3 className=" font-semibold text-sm  text-slate-800 mb-2 ">Color</h3>
                           <AxisRanges target={light.color} min={0} max={1} step={0.05} defaultValue={light.color} />
                           <div className="h-0 border-b border-b-slate-300 mt-4 "></div>
                        </div>
                        <div>
                           <h3 className=" font-semibold text-sm  text-slate-800 mb-2 ">Intensity</h3>
                           <AxisRanges target={intensity.current} length={1} min={0} max={5} defaultValue={light.intensity} step={0.2} />
                           <div className="h-0 border-b border-b-slate-300 mt-4 "></div>
                        </div>
                        <div>
                           <h3 className=" font-semibold text-sm  text-slate-800 mb-2 ">Position</h3>
                           <AxisRanges target={light.position} min={-50} max={50} defaultValue={light.position} />
                           <div className="h-0 border-b border-b-slate-300 mt-4 "></div>
                        </div>
                     </CardContent>
                  </AccordionContent>
               </AccordionItem>
            </Accordion>
         </Card>
      </>
   )
}

function AmbientLightPanel({ light }: { light: AmbientLight }) {
   // const [cnt, setCnt] = useState(0);

   const intensity = useRef([light.intensity]);
   useEffect(() => {
      let unmount = false;
      function f() {
         light.intensity = intensity.current[0];
         if (!unmount) requestAnimationFrame(f);
      }
      f();
      return () => { unmount = true; }
   }, []);

   return <Card>
      <Accordion type="single" collapsible>
         <AccordionItem value="item-1">
            <AccordionTrigger className="py-0 pr-6">
               <CardHeader className="hover:no-underline">
                  <CardTitle className="text-base flex flex-row gap-2">
                     <IconBrightnessUp />Ambient Light  </CardTitle>
               </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
               <CardContent className=" gap-4 flex flex-col ">
                  <div>
                     <h3 className=" font-semibold text-sm  text-slate-800 mb-2 ">Color</h3>
                     <AxisRanges target={light.color} min={0} max={1} defaultValue={light.color} step={0.05} />
                     <div className="h-0 border-b border-b-slate-300 mt-4 "></div>
                  </div>
                  <div>
                     <h3 className=" font-semibold text-sm  text-slate-800 mb-2 ">Intensity</h3>
                     <AxisRanges target={intensity.current} length={1} min={0} max={5} defaultValue={light.intensity} step={0.1} />
                     <div className="h-0 border-b border-b-slate-300 mt-4 "></div>
                  </div>
               </CardContent>
            </AccordionContent>
         </AccordionItem>
      </Accordion>
   </Card>
}

function CameraPanel(props: { clips: number[], camera: PerspectiveCamera }) {

   const { camera, clips } = props;

   const [checked, setChecked] = useState(getShowClipped());

   return <>
      <Card>
         <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
               <AccordionTrigger className="py-0 pr-6">
                  <CardHeader className="hover:no-underline">
                     <CardTitle className="text-base flex flex-row gap-2">
                        <IconCube /> Camera (Perspective)
                     </CardTitle>
                  </CardHeader>
               </AccordionTrigger>
               <AccordionContent>
                  <CardContent className=" gap-4 flex flex-col ">
                     <div>
                        <h3 className=" font-semibold text-sm  text-slate-800 mb-2 ">Translation</h3>
                        <AxisRanges target={camera.position} min={-50} max={50} defaultValue={0} />
                        <div className="h-0 border-b border-b-slate-300 mt-4 "></div>
                     </div>
                     <div>
                        <h3 className=" font-semibold text-sm  text-slate-800 mb-2 ">Rotation</h3>
                        <AxisRanges target={camera.rotation} min={-180} max={180} defaultValue={0} toRad />
                        <div className="h-0 border-b border-b-slate-300 mt-4 "></div>
                     </div>
                     <div>
                        <h3 className=" flex flex-row justify-between font-semibold text-sm  text-slate-800 mb-2 ">
                           <p>Clips</p>
                           <p className=" flex flex-row  items-center gap-2">
                              <Checkbox onCheckedChange={checked => {
                                 setChecked(checked)
                                 setShowClipped(checked)
                              }} checked={checked} />
                              show clipped
                           </p>
                        </h3>
                        <AxisRanges target={clips} min={0} max={100} defaultValue={clips} />
                        <div className="h-0 border-b border-b-slate-300 mt-4 "></div>
                     </div>
                  </CardContent>
               </AccordionContent>
            </AccordionItem>
         </Accordion>
      </Card>
   </>
}





export function App({ clips, camera, scene, lights, updateShadingMode }: {
   scene: Model3D, lights: [AmbientLight, ...LightShader[]],
   updateShadingMode: (mode: ShadingMode) => void,
   clips: number[],
   camera: PerspectiveCamera,
}) {
   const [shadingMode, setShadingMode] = useState<ShadingMode>(ShadingMode.GORAUD);
   const [ambientLight, ...pointLights] = lights;

   return (
      <div className=" overflow-scroll  h-full ml-4 mr-6 pr-4  border-r border-r-slate-300">
         <h1 className=" my-8 font-black text-xl">Computer Graphics Homework 1</h1>

         <Tabs defaultValue="objects" className="w-[400px] h-[800px]">
            <div className=" w-full flex  justify-between">
               <TabsList>
                  <TabsTrigger value="objects">Objects</TabsTrigger>
                  <TabsTrigger value="lights">Lights</TabsTrigger>
                  <TabsTrigger value="camera">Camera</TabsTrigger>
               </TabsList>
               <Select
                  value={`${shadingMode}`} onValueChange={v => {
                     setShadingMode(parseInt(v));
                     updateShadingMode(parseInt(v));
                  }}>

                  <SelectTrigger className="w-[120px]" >
                     <SelectValue defaultValue={'0'} />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="0">Flat</SelectItem>
                     <SelectItem value="1">Gouraud</SelectItem>
                     <SelectItem value="2">Phong</SelectItem>
                  </SelectContent>
               </Select>
            </div>
            <TabsContent value="objects" className=" h-full ">
               <ScrollArea className="  flex flex-col gap-4 h-full">
                  <ModelPanel model={scene} />
                  <div className="h-[32px]"></div>
               </ScrollArea>
            </TabsContent>
            <TabsContent value="lights" className="h-full">
               <ScrollArea className="flex flex-col gap-4 h-full">
                  <AmbientLightPanel light={ambientLight} />
                  {
                     pointLights.map((light, i) => (
                        <PointLightPanel key={i} light={light} idx={i + 1} />
                     ))
                  }
               </ScrollArea>
            </TabsContent>
            <TabsContent value="camera">
               <CameraPanel camera={camera} clips={clips} />
            </TabsContent>
         </Tabs >
      </div >
   );
}
