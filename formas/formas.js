const canvas = document.getElementById("canvas");
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
const polygonBuffer = gl.createBuffer();
const polygonColorBuffer = gl.createBuffer();

function drawPolygon(posX, posY, lados, raio, cor){
    const vertices = [];

    vertices.push(posX, posY);

    for(let i = 0; i <= lados; i++){
        const angulo = (2 * Math.PI * i /lados) + (Math.PI/2);

        const x = posX + Math.cos(angulo) * raio;
        const y = posY + Math.sin(angulo) * raio;

        vertices.push(x, y);
    }

    const verticesArray = new Float32Array(vertices);

        //cores
    const colors = [];

    const totalVertices = lados + 2;

    for (let i = 0; i < totalVertices; i++) {
        colors.push(
            cor[0],
            cor[1],
            cor[2]
        );
    }

    const colorsArray = new Float32Array(colors);

    //buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, polygonBuffer);

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

    gl.bindBuffer(gl.ARRAY_BUFFER, polygonColorBuffer);
    
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

    gl.drawArrays(
        gl.TRIANGLE_FAN,
        0,
        verticesArray.length / 2
    );
}

//--------------
//clear
//--------------
gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

//desenho
drawPolygon(0.0, 0.0, 5, 0.2, [1.0, 1.0, 0.0, 1.0]); //pentagono
drawPolygon(0.3, 0.7, 6, 0.2, [1.0, 0.0, 1.0, 1.0]); //hexagono
drawPolygon(-0.3, -0.7, 7, 0.2, [0.0, 0.0, 1.0, 1.0]); //heptagono
drawPolygon(0.3, -0.7, 8, 0.2, [0.0, 1.0, 0.0, 1.0]); //octogono
drawPolygon(-0.3, 0.7, 9, 0.2, [1.0, 0.5, 0.32, 1.0]); //seja lá qual foi o nome da forma de 9 lados
drawPolygon(0.7, 0.0, 10, 0.2, [0.7, 1.0, 0.0, 1.0]); //decágono(?)
drawPolygon(-0.7, 0.0, 11, 0.2, [0.0, 0.7, 0.43, 1.0]); //11 lados