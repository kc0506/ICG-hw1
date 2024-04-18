export const canvas = document.getElementById("ICG-canvas") as HTMLCanvasElement;
export const gl: WebGL2RenderingContext =
    canvas.getContext("webgl2") || (canvas.getContext("experimental-webgl") as any);

export function getBlueTexture() {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    return texture;
}
