export class Camera {
    constructor(fov, orbitCam = false) {
        // this.GL = GL;
        this.fov = fov;
        this.resolution = [window.innerWidth, window.innerHeight];
        this.aspect = this.resolution[0] / this.resolution[1];
        this.aperture = 0.1;
        this.focusDistance = 10;
        this.render = true;

        this.position = [0, 0, 1.5];
        this.yaw = Math.PI; // Looking along -Z axis
        this.pitch = Math.PI / 2; // Viewing perpendicular to Y axis

        this.speed = 0.01;

        // Orbit camera variables
        this.orbitCam = orbitCam; // Boolean to toggle between orbit and FPV camera
        this.orbitRadius = 1.5;
        this.center = [0, 0, 0];

        this.wheelCameraListener = (event) => {
            this.orbitRadius -= event.deltaY * 0.01;
            this.orbitRadius = Math.max(this.orbitRadius, 0.1);
        }
        document.addEventListener('wheel', this.wheelCameraListener); // False to make sure the event is not captured by the canvas
        window.addEventListener('resize', () => {
            this.resolution = [window.innerWidth, window.innerHeight];
            this.aspect = window.innerWidth / window.innerHeight;
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === "r") {
                this.toggleRender();
            }
        });

        // Initialize update() function
        if (orbitCam) {
            this.update = this.updateOrbitCam;

        } else {
            this.update = this.updateFPV;
        }
    }


    // First person camera
    updateFPV(mousePos, keys) {
        this.updateOrientationFPV(mousePos, keys);
        this.updatePositionFPV(mousePos, keys);
    }
    updateOrientationFPV(mousePos, keys) {
        this.yaw = (1.75- mousePos[0]) * Math.PI % (2 * Math.PI); // angle around the Y axis, in ZX plane, zero yaw is facing along Z axis
        this.pitch = (1 - mousePos[1]) * Math.PI / 2; // angle between Y axis and position vector, zero pitch is facing along Y axis
    }
    updatePositionFPV(mousePos, keys) {
        if (keys["w"]) { // Forward
            this.position[0] += this.speed * Math.sin(this.yaw) * Math.sin(this.pitch);
            this.position[1] += this.speed * Math.cos(this.pitch);
            this.position[2] += this.speed * Math.cos(this.yaw) * Math.sin(this.pitch);
        }
        if (keys["s"]) { // Backward
            this.position[0] -= this.speed * Math.sin(this.yaw);// * Math.sin(this.pitch);
            this.position[1] -= this.speed * Math.cos(this.pitch);
            this.position[2] -= this.speed * Math.cos(this.yaw);// * Math.sin(this.pitch);
        }
        if (keys["a"]) { // Left
            this.position[0] += this.speed * Math.cos(this.yaw);
            this.position[2] -= this.speed * Math.sin(this.yaw);
        }
        if (keys["d"]) { // Right
            this.position[0] -= this.speed * Math.cos(this.yaw);
            this.position[2] += this.speed * Math.sin(this.yaw);
        }
        if (keys[" "]) { // Up
            this.position[1] += this.speed;
        }
        if (keys["shift"]) { // Down
            this.position[1] -= this.speed;
        }
    }


    // Orbit camera
    updateOrbitCam(mousePos, keys) {
        this.updateOrientationOrbitCam(mousePos, keys);
        this.updatePositionOrbitCam(mousePos, keys);
    }
    updateOrientationOrbitCam(mousePos, keys) {
        this.yaw = (1.75 - mousePos[0]) * Math.PI % (2 * Math.PI); // angle around the Y axis, in ZX plane, zero yaw is facing along Z axis
        this.pitch = (1 - mousePos[1]) * Math.PI / 2; // angle between Y axis and position vector, zero pitch is facing along Y axis
    }
    updatePositionOrbitCam(mousePos, keys) {
        const positionYaw = this.yaw + Math.PI; // The camera is always looking at the center, so positional Yaw is the opposite of viewing Yaw
        const positionPitch = Math.PI - this.pitch; // Same for pitch

        // Update center position
        if (keys["w"]) { // Forward
            this.center[0] += this.speed * Math.sin(this.yaw);
            this.center[2] += this.speed * Math.cos(this.yaw);
        }
        if (keys["s"]) { // Backward
            this.center[0] -= this.speed * Math.sin(this.yaw);
            this.center[2] -= this.speed * Math.cos(this.yaw);
        }
        if (keys["a"]) { // Left
            this.center[0] += this.speed * Math.cos(this.yaw);
            this.center[2] -= this.speed * Math.sin(this.yaw);
        }
        if (keys["d"]) { // Right
            this.center[0] -= this.speed * Math.cos(this.yaw);
            this.center[2] += this.speed * Math.sin(this.yaw);
        }
        if (keys[" "]) { // Up
            this.center[1] += this.speed;
        }
        if (keys["shift"]) { // Down
            this.center[1] -= this.speed;
        }

        // Update camera position
        this.position[0] = this.center[0] + this.orbitRadius * Math.sin(positionYaw) * Math.sin(positionPitch);
        this.position[1] = this.center[1] + this.orbitRadius * Math.cos(positionPitch);
        this.position[2] = this.center[2] + this.orbitRadius * Math.cos(positionYaw) * Math.sin(positionPitch);
    }



    toggleOrbitCam() {
        if (this.orbitCam) {
            this.update = this.updateFPV;
            this.orbitCam = false;
        } else {
            // Make sure the camera is looking along the same FPV direction
            this.center[0] = this.position[0] + this.orbitRadius * Math.sin(this.yaw) * Math.sin(this.pitch);
            this.center[1] = this.position[1] + this.orbitRadius * Math.cos(this.pitch);
            this.center[2] = this.position[2] + this.orbitRadius * Math.cos(this.yaw) * Math.sin(this.pitch);
            this.update = this.updateOrbitCam;
            this.orbitCam = true;
        }
    }

    toggleRender(){
        this.render = !this.render;
    }


    // Getters
    getLookAt() {
        return [Math.sin(this.yaw) * Math.sin(this.pitch),
                Math.cos(this.pitch),
                Math.cos(this.yaw) * Math.sin(this.pitch)];
    }
    getPosition() {
        return this.position;
    }
}