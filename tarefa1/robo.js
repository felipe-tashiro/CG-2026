(() => {
const canvas = document.getElementById("canvasRobo");
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
const circleBuffer = gl.createBuffer();
const circleColorBuffer = gl.createBuffer();

const rectBuffer = gl.createBuffer();
const rectColorBuffer = gl.createBuffer();

//funções
const segmentos = 50;

//substiruindo a função de círculo por uma de arco
function drawArc(posX, posY, raio, anguloInicial, anguloFinal, cor) {

    const vertices = [];

    // centro
    vertices.push(posX, posY);

    for (let i = 0; i <= segmentos; i++) {

        const angulo =
            anguloInicial +
            (anguloFinal - anguloInicial) *
            i / segmentos;

        const x =
            posX + Math.cos(angulo) * raio;

        const y =
            posY + Math.sin(angulo) * raio;

        vertices.push(x, y);
    }

    const verticesArray =
        new Float32Array(vertices);


    // -------------------------
    // cores
    // -------------------------

    const colors = [];

    const totalVertices = segmentos + 2;

    for (let i = 0; i < totalVertices; i++) {

        colors.push(
            cor[0],
            cor[1],
            cor[2]
        );
    }

    const colorsArray =
        new Float32Array(colors);


    // -------------------------
    // buffer dos vértices
    // -------------------------

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        circleBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesArray,
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


    // -------------------------
    // buffer das cores
    // -------------------------

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        circleColorBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        colorsArray,
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


    // -------------------------
    // desenho
    // -------------------------

    gl.drawArrays(
        gl.TRIANGLE_FAN,
        0,
        verticesArray.length / 2
    );
}

//retangulo
function drawRectangle(posX, posY, largura, altura, cor){
    const metadeAlt = altura/2;
    const metadeLarg = largura/2;

    const vertices = new Float32Array([
        posX - metadeLarg, posY + metadeAlt,
        posX + metadeLarg, posY + metadeAlt,
        posX - metadeLarg, posY - metadeAlt,
        posX + metadeLarg, posY - metadeAlt
    ]);

    //cores
    const colors = new Float32Array([
        cor[0], cor[1], cor[2],
        cor[0], cor[1], cor[2],
        cor[0], cor[1], cor[2],
        cor[0], cor[1], cor[2]
    ]);

    //buffers
    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        rectBuffer,
        gl.STATIC_DRAW
    )

    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertices,
        gl.STATIC_DRAW
    )

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        rectColorBuffer,
    )

    gl.bufferData(
        gl.ARRAY_BUFFER,
        colors,
        gl.STATIC_DRAW
    )

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

//--------------
//clear
//--------------
gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

drawRectangle(0.0, -0.1, 0.2, 0.4, [0.3, 0.3, 0.3, 1.0]); //pescoço?
drawRectangle(-0.140, -0.9, 0.2, 0.3, [0.3, 0.3, 0.3, 1.0]);//perna esq
drawRectangle(0.140, -0.9, 0.2, 0.3, [0.3, 0.3, 0.3, 1.0]);//perna dir
drawRectangle(-0.3, -0.35, 0.3, 0.5, [0.3, 0.3, 0.3, 1.0]); //braço esq.
drawRectangle(0.3, -0.35, 0.3, 0.5, [0.3, 0.3, 0.3, 1.0]); //braço dir.
drawArc(-0.4, -0.6, 0.1, 0, 2*Math.PI, [0.6, 0.6, 0.6, 1.0]); //mão esq.
drawArc(0.4, -0.6, 0.1, 0, 2*Math.PI, [0.6, 0.6, 0.6, 1.0]); //mão dir.
drawRectangle(0.0, -0.4, 0.7, 0.7, [0.5, 0.5, 0.5, 1.0]); //corpo
drawRectangle(0.0, 0.456, 0.05, 0.5, [0.3, 0.3, 0.3, 1.0]); //antena
drawArc(0.0, 0.7, 0.1, 0, 2*Math.PI, [0.6, 0.6, 0.6, 1.0]); //bola da antena
drawRectangle(0.0, 0.3, 0.5, 0.5, [0.6, 0.6, 0.6, 1.0]); //cabeça
drawRectangle(0.0, 0.3, 0.07, 0.04, [0.4, 0.4, 0.4, 1.0]); //nariz
drawRectangle(0.0, 0.175, 0.3, 0.04, [1.0, 1.0, 0.0, 1.0]); //boca
drawArc(-0.135, 0.4, 0.02, 0, 2*Math.PI, [1.0, 1.0, 0.0, 1.0]); //olho esquerdo
drawArc(0.135, 0.4, 0.02, 0, 2*Math.PI, [1.0, 1.0, 0.0, 1.0]); //olho direito
drawRectangle(0.0, -0.357, 0.45, 0.4, [0.0, 1.0, 0.7, 1.0]); //painel no corpo

})();