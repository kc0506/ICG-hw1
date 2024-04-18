
function drawModel(model: Model3D) {
    /* ----------------------------- Draw Object ID ----------------------------- */

    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        // gl.clearBufferiv(gl.COLOR, 0, new Int16Array([-1, -1, -1, -1]));
        gl.clearBufferiv(gl.COLOR, 0, new Int16Array([0, 0, 0, 0]));
        gl.useProgram(drawIdShaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(model.data.vertexPositions),
            gl.STATIC_DRAW
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
        gl.vertexAttribPointer(
            shaderInfo.vertexPositionAttribute,
            shaderInfo.attributeItemSize.vertexPositionAttribute,
            gl.FLOAT,
            false,
            0,
            0
        );
        // gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(
            gl.getUniformLocation(drawIdShaderProgram, "uMVMatrix"),
            false,
            camera.pMatrix
        );
        gl.uniformMatrix4fv(
            gl.getUniformLocation(drawIdShaderProgram, "uPMatrix"),
            false,
            outMvMatrix
        );
        // console.log("id:", model.id);
        gl.uniform1i(gl.getUniformLocation(drawIdShaderProgram, "uCurrentObjectID"), model.id);
        gl.vertexAttribPointer(
            0,
            shaderInfo.attributeItemSize.vertexPositionAttribute,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.drawArrays(gl.TRIANGLES, 0, numItems);

        console.log(getSelectedObjectID(x, y));
    }
    gl.useProgram(shaderProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
