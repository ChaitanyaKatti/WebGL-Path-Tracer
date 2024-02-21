import { Shader } from './scripts/shader.js';
import { Skybox } from './scripts/skybox.js';
import { UI } from './scripts/ui.js';


// Set up canvas and GL variables
const canvas = createCanvas();

// Get the WebGL context
const GL = createContext(canvas);

// Create shader program
const quadShader = new Shader(GL, './shaders/quad.vert', './shaders/quad.frag');
const mainShader = new Shader(GL, './shaders/quad.vert', './shaders/main.frag');

// Skybox
const skybox = new Skybox(GL, 1, './assets/skybox.png');

// Variables for mouse movement
let mousePos = [0.75, 0]; // Mouse position in normalized device coordinates, from -1 to +1
let frameCount = 0;
let FPS = 0;
let lastFrameTime = performance.now();

let cameraPos = [0, 0, 2];
let cameraLootAt = [0, 0, -1];
let pressedKeys = {};

// Create UI
const ui = new UI();
ui.addSlider('FOV', 75, 0, 179.99, 0.1);
ui.addSlider('focalDistance', 2, 0.1, 10, 0.1);
ui.addSlider('aperture', 0.1, 0.01, 1, 0.01);
ui.addText('FrameCount', 0);
ui.addFPSCounter();

// Returns canvas element 
function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = "GLCanvas";
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
}

// Returns  a WebGL context for the canvas element
function createContext(canvas) {
    // Initialize the GL context
    const GL = canvas.getContext("webgl2");
    if (!GL) {
        console.error("Unable to initialize WebGL 2.0. Your browser may not support it.");
        return;
    }
    // Canvas resize event
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        GL.viewport(0, 0, canvas.width, canvas.height);
    });
    
    // Set the viewport to the canvas size
    GL.viewport(0, 0, canvas.width, canvas.height);
    
    return GL;
}

// Handle mouse movement
function updateMouse(event) {
    // Check if mouse is clicked
    if (event.buttons != 1) return;
    else{
        frameCount = 0;
    }
    // Update mouse position
    mousePos[0] -= event.movementX / window.innerWidth / 3;
    mousePos[1] += event.movementY / window.innerHeight;
    // mousePos[0] will be used for yaw and mousePos[1] is used for pitch
    // Clamp mousePos[1] to prevent the camera from flipping
    mousePos[1] = Math.min(Math.max(mousePos[1], -0.99), 0.99); // 0.99 to prevent gimbal lock
    
    cameraLootAt[0] = Math.cos(mousePos[0] * Math.PI * 2) * Math.cos(mousePos[1] * Math.PI / 2);
    cameraLootAt[1] = Math.sin(mousePos[1] * Math.PI / 2);
    cameraLootAt[2] = Math.sin(mousePos[0] * Math.PI * 2) * Math.cos(mousePos[1] * Math.PI / 2);
    console.log(cameraLootAt);
}

function handleKeys(event){
    if(event.type === 'keydown'){
        // Regex to check if the key is a letter or Shift or Control
        const regex = /^[a-zA-Z]|Shift|$/;
        if (regex.test(event.key)) {
            pressedKeys[event.key.toLowerCase()] = true;
        }
    }
    else if(event.type === 'keyup'){
        delete pressedKeys[event.key.toLowerCase()];
    }
}

function updateCamera(){
    // If a ney is pressed then frameCount is reset
    if(Object.keys(pressedKeys).length > 0){
        frameCount = 0;
    }
    // Keyboard input
    if(pressedKeys["w"]){
        cameraPos[0] += cameraLootAt[0] * 0.02;
        cameraPos[1] += cameraLootAt[1] * 0.02;
        cameraPos[2] += cameraLootAt[2] * 0.02;
    }
    if(pressedKeys["s"]){
        cameraPos[0] -= cameraLootAt[0] * 0.02;
        cameraPos[1] -= cameraLootAt[1] * 0.02;
        cameraPos[2] -= cameraLootAt[2] * 0.02;
    }
    if(pressedKeys["a"]){
        cameraPos[0] += cameraLootAt[2] * 0.02;
        cameraPos[2] -= cameraLootAt[0] * 0.02;
    }
    if(pressedKeys["d"]){
        cameraPos[0] -= cameraLootAt[2] * 0.02;
        cameraPos[2] += cameraLootAt[0] * 0.02;
    }
    if(pressedKeys[" "]){
        cameraPos[1] += 0.02;
    }
    if(pressedKeys["shift"]){
        cameraPos[1] -= 0.02;
    }
}

// Render loop, updates variables and matrices and draw each frame
function renderLoop(pingFBColorTexture, pingFB, pongFBColorTexture, pongFB) {
    updateCamera();
    ui.updateVariable('FrameCount', frameCount);
    quadShader.use();
    quadShader.setUniform('uFrameAccumulator', 0, 'int');
    quadShader.setUniform('uFrameCount', frameCount, 'int');

    mainShader.use();
    mainShader.setUniform('uFrameAccumulator', 0, 'int');
    mainShader.setUniform('uFrameCount', frameCount, 'int');
    mainShader.setUniform('uAspectRatio', canvas.width/canvas.height, 'float');
    mainShader.setUniform('uCameraPos', cameraPos, 'vec3');
    mainShader.setUniform('uCameraLookAt', cameraLootAt, 'vec3');
    mainShader.setUniform('uFOV', ui.variables.FOV, 'float');
    mainShader.setUniform('uFocalDistance', ui.variables.focalDistance, 'float');
    mainShader.setUniform('uAperture', ui.variables.aperture, 'float');
    
    if(frameCount % 2 == 0){// Even frame, sample from pingFB, write to pongFB    
        mainShader.use();
        GL.bindTexture(GL.TEXTURE_2D, pingFBColorTexture);
        GL.bindFramebuffer(GL.FRAMEBUFFER, pongFB);
        GL.clearColor(1.0, 0.0, 0.0, 1.0);
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
        
        quadShader.use();
        GL.bindTexture(GL.TEXTURE_2D, pongFBColorTexture);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.clearColor(0.0, 1.0, 0.0, 1.0);
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
    }
    else{// Odd frame, sample from pongFB, write to pingFB
        mainShader.use();
        GL.bindTexture(GL.TEXTURE_2D, pongFBColorTexture);
        GL.bindFramebuffer(GL.FRAMEBUFFER, pingFB);
        GL.clearColor(1.0, 0.0, 0.0, 1.0);
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
        
        quadShader.use();
        GL.bindTexture(GL.TEXTURE_2D, pingFBColorTexture);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.clearColor(0.0, 1.0, 0.0, 1.0);
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
    }


    frameCount++;
    FPS = 0.95 * FPS + 0.05 * Math.round(1000 / (performance.now() - lastFrameTime));
    lastFrameTime = performance.now();
    ui.elements['fpsCounter'].innerHTML = `FPS: ${FPS.toFixed(0)}`;
    
    // Request a next frame
    requestAnimationFrame(function () { renderLoop(pingFBColorTexture, pingFB, pongFBColorTexture, pongFB); }); // Request the next frame
}

// Main function
function main() {
    // Add event listener for mouse movement
    window.addEventListener('mousemove', updateMouse);
    window.addEventListener('keydown', handleKeys);
    window.addEventListener('keyup', handleKeys);

    // Screen space quad
    const quad = new Float32Array([
        // x, y, z, u, v
        -1, -1, 0, 0, 0,
        -1, 1, 0, 0, 1,
        1, -1, 0, 1, 0,
        1, 1, 0, 1, 1,
    ]);
    
    const vao = GL.createVertexArray();
    GL.bindVertexArray(vao);
    const vbo = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, vbo);
    
    GL.bufferData(GL.ARRAY_BUFFER, quad, GL.STATIC_DRAW);
    GL.enableVertexAttribArray(0);
    GL.vertexAttribPointer(0, 3, GL.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
    GL.enableVertexAttribArray(1);
    GL.vertexAttribPointer(1, 2, GL.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    // GL.bindVertexArray(null);
    
    const pingFBColorTexture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, pingFBColorTexture);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, canvas.width, canvas.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
    GL.bindTexture(GL.TEXTURE_2D, null);

    const pongFBColorTexture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, pongFBColorTexture);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, canvas.width, canvas.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
    GL.bindTexture(GL.TEXTURE_2D, null);


    const pingFB = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, pingFB);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, pingFBColorTexture, 0);
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);

    const pongFB = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, pongFB);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, pongFBColorTexture, 0);
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    
    window.addEventListener('resize', () => {
        frameCount = 0;
        GL.bindTexture(GL.TEXTURE_2D, pingFBColorTexture);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, canvas.width, canvas.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
        GL.bindFramebuffer(GL.FRAMEBUFFER, pingFB);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, pingFBColorTexture, 0);
        
        GL.bindTexture(GL.TEXTURE_2D, pongFBColorTexture);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, canvas.width, canvas.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
        GL.bindFramebuffer(GL.FRAMEBUFFER, pongFB);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, pongFBColorTexture, 0);
        
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    });

    // Initialize the shader program
    quadShader.init().then(() => {
        mainShader.init().then(() => {
            mainShader.use();
            mainShader.setUniform('uSkybox', 1, 'int');
            skybox.bind();

            renderLoop(pingFBColorTexture, pingFB, pongFBColorTexture, pongFB); // Start the render loop
        });
    });
}

// Run the main function
main();