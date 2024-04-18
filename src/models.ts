import TEAPOT from "./model/Teapot.json";
import CSIE from "./model/Csie.json";
import TOMCAT from './model/Tomcat.json'
import KANGAROO from './model/Kangaroo.json'

export { TEAPOT, CSIE, TOMCAT, KANGAROO };

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ModelData = PartialBy<typeof TEAPOT, "vertexTextureCoords">;
