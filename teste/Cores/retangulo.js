(() => {
const canvas = document.getElementById("canvasRet");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

//----------------------
// Shaders
//----------------------
//vertex
const vertexShaderSource = `#version 300 es
in vec2 aPosition;
in vec3 aColor;

out vec3 vColor;

void main(){
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColor = aColor;
}
`;

//fragment
const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vColor;

out vec4 outColor;

void main() {
    outColor = vec4(vColor, 1.0);
}

`;

//--------------------
//compilação
//--------------------
function createShader(gl, type, source){
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}

const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);

//-----------------
//programa
//-----------------
const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}

//--------------------
//atributos
//--------------------
const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getAttribLocation(
        program,
        "aColor"
    );

gl.useProgram(program);
gl.enableVertexAttribArray(positionLocation);
gl.enableVertexAttribArray(colorLocation);



//-----------------
//Buffers
//-----------------

const rectBuffer = gl.createBuffer();
const rectColorBuffer = gl.createBuffer();

//funções
function drawRect(posX, posY, altura, largura, cor){
    const meioAlt = altura/2;
    const meioLar = largura/2;

    const vertices = new Float32Array([
        posX - meioLar, posY + meioAlt,
        posX - meioLar, posY - meioAlt,
        posX + meioLar, posY + meioAlt,
        posX + meioLar, posY - meioAlt,
    ]);

    const cores = new Float32Array([
        cor[0], cor[1], cor[2],
        cor[1], cor[0], cor[2],
        cor[1], cor[2], cor[0],
        cor[0], cor[0], cor[2]
    ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, rectBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertices,
        gl.STATIC_DRAW
    );

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, rectColorBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        cores,
        gl.STATIC_DRAW
    );

    gl.vertexAttribPointer(
        colorLocation,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.drawArrays(
        gl.TRIANGLE_STRIP,
        0,
        4
    );
}

//clear
gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

//desenho
drawRect(0.0, 0.0, 0.9, 1.8, [1.0, 0.0, 0.0, 1.0]);

})();