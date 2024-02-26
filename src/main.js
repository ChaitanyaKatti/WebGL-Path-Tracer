"use strict";
import { Shader } from './scripts/shader.js';
import { Skybox } from './scripts/skybox.js';
import { UI } from './scripts/ui.js';
import { Camera } from './scripts/camera.js';
import { HDRTexture } from './scripts/texture.js';

// Set up canvas and GL variables
const canvas = createCanvas();

// Get the WebGL context
const GL = createContext(canvas);

// Create shader program
const quadShader = new Shader(GL, './shaders/quad.vert', './shaders/quad.frag');
const mainShader = new Shader(GL, './shaders/quad.vert', './shaders/main.frag');

// Skybox
// const skybox = new Skybox(GL, 1, './assets/skybox.png');
const skybox = new HDRTexture(GL, 1, './assets/little_paris_eiffel_tower_1k.hdr');

// Variables for mouse movement
let mousePos = [0.75, 0]; // Mouse position in normalized device coordinates, from -1 to +1
let frameCount = 0;

const camera = new Camera(50, true);
let pressedKeys = {};

// Create UI
const ui = new UI();
ui.addSlider('FOV', 75, 0, 179.99, 0.1, (event) => {
    camera.fov = event.target.value;
    frameCount = 0;
});
// ui.addSlider('focusDistance', 2, 0.1, 10, 0.1, (event) => {
//     camera.focusDistance = event.target.value;
//     frameCount = 0;
// });
// ui.addSlider('aperture', 0.1, 0.01, 1, 0.1, (event) => {
//     camera.aperture = event.target.value;
//     frameCount = 0;
// });
// ui.addSlider('exposure', 1, -3, 3, 0.1, (event) => {
//     // skybox.image.exposure = event.target.value;
//     frameCount = 0;
// });
ui.addSlider('ResolutionScale', 0.5, 0.1, 1.0, 0.1, (event) => {
    canvas.width = window.innerWidth * event.target.value;
    canvas.height = window.innerHeight * event.target.value;
    GL.viewport(0, 0, canvas.width, canvas.height);
    frameCount = 0;
});
ui.addCheckbox('OrbitCam', camera.orbitCam, (event) => {
    camera.toggleOrbitCam();
    frameCount = 0;
});
ui.addCheckbox('denoise', true);
ui.addTextHint('Press R to toggle rendering');
ui.addText('FrameCount', 0);

// Returns canvas element 
function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = "GLCanvas";
    document.body.appendChild(canvas);
    canvas.width = 0.5*window.innerWidth;
    canvas.height = 0.5*window.innerHeight;
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
    mousePos[0] -= event.movementX / window.innerWidth;
    mousePos[1] += event.movementY / window.innerHeight;
    // mousePos[0] will be used for yaw and mousePos[1] is used for pitch
    // Clamp mousePos[1] to prevent the camera from flipping
    mousePos[1] = Math.min(Math.max(mousePos[1], -0.99), 0.99); // 0.99 to prevent gimbal lock
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

// Render loop, updates variables and matrices and draw each frame
function renderLoop(pingFBColorTexture, pingFB, pongFBColorTexture, pongFB) {
    // If any key is pressed, reset the frame count
    // if (Object.keys(pressedKeys).length > 0) {
    //     frameCount = 0;
    // }
    if (camera.render == false) {
        frameCount = 0;
    }
    
    // Update the camera
    camera.update(mousePos, pressedKeys);
    // Update the UI
    ui.updateVariable('FrameCount', frameCount);

    quadShader.use();
    quadShader.setUniform('uFrameAccumulator', 0, 'int');
    quadShader.setUniform('uFrameCount', frameCount, 'int');
    quadShader.setUniform('uResolution', [canvas.width, canvas.height], 'vec2');
    quadShader.setUniform('uDenoise', ui.variables.denoise, 'bool');

    mainShader.use();
    mainShader.setUniform('uFrameAccumulator', 0, 'int');
    mainShader.setUniform('uFrameCount', frameCount, 'int');
    mainShader.setUniform('uTime', performance.now() * 0.001, 'float');
    mainShader.setUniform('uAspectRatio', canvas.width/canvas.height, 'float');
    mainShader.setUniform('uCameraPos', camera.getPosition(), 'vec3');
    mainShader.setUniform('uCameraLookAt', camera.getLookAt(), 'vec3');
    // mainShader.setUniform('uCameraResolution', camera.getUp(), 'vec3');
    mainShader.setUniform('uFOV', camera.fov, 'float');
    mainShader.setUniform('uFocusDistance', camera.focusDistance, 'float');
    mainShader.setUniform('uAperture', camera.aperture, 'float');
    mainShader.setUniform('uSeed', Math.random(), 'float');
    mainShader.setUniform('uExposure', ui.variables.exposure, 'float');

    if(frameCount % 2 == 0){// Even frame, sample from pingFB, write to pongFB    
        mainShader.use();
        GL.bindTexture(GL.TEXTURE_2D, pingFBColorTexture);
        GL.bindFramebuffer(GL.FRAMEBUFFER, pongFB);
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
        
        quadShader.use();
        GL.bindTexture(GL.TEXTURE_2D, pongFBColorTexture);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
    }
    else{// Odd frame, sample from pongFB, write to pingFB
        mainShader.use();
        GL.bindTexture(GL.TEXTURE_2D, pongFBColorTexture);
        GL.bindFramebuffer(GL.FRAMEBUFFER, pingFB);
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
        
        quadShader.use();
        GL.bindTexture(GL.TEXTURE_2D, pingFBColorTexture);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
    }

    if(pressedKeys['f']){
        // Download the image
        var a = document.createElement('a');
        a.href = canvas.toDataURL();
        a.download = 'image.png';
        a.click();
    }

    frameCount++;
    
    // Request a next frame
    requestAnimationFrame(function () { renderLoop(pingFBColorTexture, pingFB, pongFBColorTexture, pongFB); }); // Request the next frame
}

function resizeCallback(pingFBColorTexture, pingFB, pongFBColorTexture, pongFB){
    frameCount = 0;
    GL.bindTexture(GL.TEXTURE_2D, pingFBColorTexture);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, canvas.width, canvas.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
    GL.bindFramebuffer(GL.FRAMEBUFFER, pingFB);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, pingFBColorTexture, 0);

    GL.bindTexture(GL.TEXTURE_2D, pongFBColorTexture);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, canvas.width, canvas.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
    GL.bindFramebuffer(GL.FRAMEBUFFER, pongFB);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, pongFBColorTexture, 0);
    
    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
}

// Main function
function main() {
    // Add event listener for mouse movement
    window.addEventListener('mousemove', updateMouse);
    ui.preventMouseEvents(updateMouse); // Prevent mouse events when hovering over the UI
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

    // const pingFBDepthBuffer = GL.createRenderbuffer();
    // GL.bindFramebuffer(GL.FRAMEBUFFER, pingFB);
    // GL.bindRenderbuffer(GL.RENDERBUFFER, pingFBDepthBuffer);
    // GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT24, canvas.width, canvas.height);
    // GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, pingFBDepthBuffer);
    // GL.bindRenderbuffer(GL.RENDERBUFFER, null);

    // const pongFBDepthBuffer = GL.createRenderbuffer();
    // GL.bindFramebuffer(GL.FRAMEBUFFER, pongFB);
    // GL.bindRenderbuffer(GL.RENDERBUFFER, pongFBDepthBuffer);
    // GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT24, canvas.width, canvas.height);
    // GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, pongFBDepthBuffer);
    // GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    // GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    
    window.addEventListener('resize', () => {
        resizeCallback(pingFBColorTexture, pingFB, pongFBColorTexture, pongFB);
    });
    ui.elements['ResolutionScale'].input.addEventListener('input', () => {
        resizeCallback(pingFBColorTexture, pingFB, pongFBColorTexture, pongFB);
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