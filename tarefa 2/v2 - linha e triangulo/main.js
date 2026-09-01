const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


const canvasCoordinates =
    document.getElementById("canvasCoordinates");

const webglCoordinates =
    document.getElementById("webglCoordinates");

const colorBox =
    document.getElementById("colorBox");

const colorName =
    document.getElementById("colorName");

//vértices
let vertices = new Float32Array([0.0, 0.0, 0.0, 0.0]);

//cores
let colors = new Float32Array([0.0, 0.0, 1.0]);

//tamanho
let pointSizes_aux = 10.0;

//modo inicial
let mode = "line";

let clickedPoints = [];

//buffers
const verticesBuffer = gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    verticesBuffer
);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);


const colorsBuffer = gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    colorsBuffer
);


const pointSizesBuffer = gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    pointSizesBuffer
);

//shaders
const vertexShaderSource = `#version 300 es

in vec2 aPosition;
in vec3 aColor;
in float aPointSize;

out vec3 vColor;

void main() {

    gl_Position = vec4(
        aPosition,
        0.0,
        1.0
    );

    gl_PointSize = aPointSize;

    vColor = aColor;
}
`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vColor;

out vec4 outColor;

void main() {

    outColor = vec4(
        vColor,
        1.0
    );
}
`;

//compilação
function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(
        shader,
        source
    );

    gl.compileShader(shader);

    if (!gl.getShaderParameter(
        shader,
        gl.COMPILE_STATUS
    )) {

        const error =
            gl.getShaderInfoLog(shader);

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

//programa
const program = gl.createProgram();

gl.attachShader(
    program,
    vertexShader
);

gl.attachShader(
    program,
    fragmentShader
);

gl.linkProgram(program);


if (!gl.getProgramParameter(
    program,
    gl.LINK_STATUS
)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}

//atributos
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


const pointSizeLocation =
    gl.getAttribLocation(
        program,
        "aPointSize"
    );

    gl.bindBuffer(
    gl.ARRAY_BUFFER,
    verticesBuffer
);

gl.enableVertexAttribArray(
    positionLocation
);

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
    colorsBuffer
);

gl.enableVertexAttribArray(
    colorLocation
);

gl.vertexAttribPointer(
    colorLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);


gl.bindBuffer(
    gl.ARRAY_BUFFER,
    pointSizesBuffer
);

gl.enableVertexAttribArray(
    pointSizeLocation
);

gl.vertexAttribPointer(
    pointSizeLocation,
    1,
    gl.FLOAT,
    false,
    0,
    0
);

//bresenham
function bresenham(x0, y0, x1, y1) {

    const pixels = [];

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);

    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;

    let err = dx - dy;

    while (true) {

        pixels.push([x0, y0]);

        if (x0 === x1 && y0 === y1) {
            break;
        }

        const e2 = 2 * err;

        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }

        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }

    return pixels;
}

//linha
function drawLine(x0, y0, x1, y1) {

    const pixels = bresenham(x0, y0, x1, y1);


    const vertexData = [];


    for (const pixel of pixels) {

        const px = pixel[0];
        const py = pixel[1];


        const webglX = (px / canvas.width) * 2 - 1;


        const webglY = -((py / canvas.height) * 2 - 1);


        vertexData.push(webglX, webglY);
    }


    vertices = new Float32Array(vertexData);

    updateBuffers();
}

function drawTriangle(x0, y0, x1, y1, x2, y2) {

    const line1 = bresenham(x0, y0, x1, y1);


    const line2 = bresenham(x1, y1, x2, y2);


    const line3 = bresenham(x2, y2, x0, y0);


    const pixels = [...line1, ...line2, ...line3];


    const vertexData = [];


    for (const pixel of pixels) {

        const px = pixel[0];
        const py = pixel[1];


        const webglX = (px / canvas.width) * 2 - 1;


        const webglY = -((py / canvas.height) * 2 - 1);


        vertexData.push(webglX, webglY);
    }


    vertices = new Float32Array(vertexData);

    updateBuffers();
}

//buffers
function updateBuffers() {

    const numPoints =
        vertices.length / 2;


    // ------------------------------
    // VÉRTICES
    // ------------------------------

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        verticesBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertices,
        gl.STATIC_DRAW
    );


    // ------------------------------
    // CORES
    // ------------------------------

    const colorData = [];


    for (
        let i = 0;
        i < numPoints;
        i++
    ) {

        colorData.push(
            colors[0],
            colors[1],
            colors[2]
        );
    }


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        colorsBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(colorData),
        gl.STATIC_DRAW
    );


    // ------------------------------
    // TAMANHO
    // ------------------------------

    const pointSizeData = [];


    for (
        let i = 0;
        i < numPoints;
        i++
    ) {

        pointSizeData.push(
            pointSizes_aux
        );
    }


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        pointSizesBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(pointSizeData),
        gl.STATIC_DRAW
    );
}

//cena
function drawScene() {

    gl.clear(
        gl.COLOR_BUFFER_BIT
    );

    gl.useProgram(program);


    gl.drawArrays(
        gl.POINTS,
        0,
        vertices.length / 2
    );
}

//mouse
canvas.addEventListener(
    "mousedown",
    mouseClick,
    false
);

function mouseClick(event) {

    const x = event.offsetX;
    const y = event.offsetY;


    // Mostrar coordenadas
    canvasCoordinates.textContent =
        `Canvas: (${x}, ${y})`;


    const webglX =
        (x / canvas.width) * 2 - 1;


    const webglY =
        -((y / canvas.height) * 2 - 1);


    webglCoordinates.textContent =
        `WebGL: (${webglX.toFixed(3)}, ${webglY.toFixed(3)})`;


    // Adicionar clique
    clickedPoints.push({
        x: x,
        y: y
    });


    if (mode === "line") {

        if (clickedPoints.length === 2) {

            const p1 = clickedPoints[0];
            const p2 = clickedPoints[1];


            drawLine(
                p1.x,
                p1.y,
                p2.x,
                p2.y
            );


            // Preparar para próxima reta
            clickedPoints = [];
        }
    }

    else if (mode === "triangle") {

        if (clickedPoints.length === 3) {

            const p1 = clickedPoints[0];
            const p2 = clickedPoints[1];
            const p3 = clickedPoints[2];


            drawTriangle(
                p1.x,
                p1.y,
                p2.x,
                p2.y,
                p3.x,
                p3.y
            );


            // Preparar para próximo triângulo
            clickedPoints = [];
        }
    }


    drawScene();
}

//teclado
document.addEventListener(
  "keydown",
  keyboardClick,
  false
);

function keyboardClick(event) {

  switch(event.key) {
      case "r":
      case "R":
        mode = "line";
        clickedPoints = [];
        break;
      case "t":
      case "T":
        mode = "triangle";
        clickedPoints = [];
        break;
      case "ArrowUp":
        pointSizes_aux += 5.0;
        pointSizes = new Float32Array([pointSizes_aux])
        break;
      case "ArrowDown":
        pointSizes_aux -= 5.0;
        if (pointSizes_aux < 1.0) {
          pointSizes_aux = 1.0;
        }
        pointSizes = new Float32Array([pointSizes_aux])
        break;
      case "0":
          colors = new Float32Array([
              1.0, 1.0, 1.0
          ]);
          colorBox.style.backgroundColor = "white";
          break;

      case "1":
          colors = new Float32Array([
              1.0, 0.0, 0.0
          ]);
          colorBox.style.backgroundColor = "red";
          break;

      case "2":
          colors = new Float32Array([
              0.0, 1.0, 0.0
          ]);
          colorBox.style.backgroundColor = "green";
          break;

      case "3":
          colors = new Float32Array([
              0.0, 0.0, 1.0
          ]);
          colorBox.style.backgroundColor = "blue";
          break;

      case "4":
          colors = new Float32Array([
              1.0, 1.0, 0.0
          ]);
          colorBox.style.backgroundColor = "yellow";
          break;

      case "5":
          colors = new Float32Array([
              1.0, 0.0, 1.0
          ]);
          colorBox.style.backgroundColor = "magenta";
          break;

      case "6":
          colors = new Float32Array([
              0.0, 1.0, 1.0
          ]);
          colorBox.style.backgroundColor = "cyan";
          break;

      case "7":
          colors = new Float32Array([
              1.0, 0.5, 0.0
          ]);
          colorBox.style.backgroundColor = "orange";
          break;

      case "8":
          colors = new Float32Array([
              0.5, 0.0, 1.0
          ]);
          colorBox.style.backgroundColor = "purple";
          break;

      case "9":
          colors = new Float32Array([
              1.0, 0.4, 0.7
          ]);
          colorBox.style.backgroundColor = "pink";
          break;

      default:
          return;
  }

  updateBuffers();

  // Redesenhar
  drawScene();
}

//config. inicial
gl.clearColor(
    0.1,
    0.1,
    0.1,
    1.0
);


// Linha inicial:
// (0,0) -> (0,0)
// Azul

colors =
    new Float32Array([
        0.0,
        0.0,
        1.0
    ]);


colorBox.style.backgroundColor =
    "blue";


updateBuffers();

drawScene();