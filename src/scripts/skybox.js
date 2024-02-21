export class Skybox {
    constructor(GL, index, skyboxPath) {
        this.GL = GL;
        this.index = index;
        this.skyboxPath = skyboxPath;
        this.skyboxTexture = this.loadTexture();
    }

    loadTexture() {
        try {
            const image = new Image();
            image.src = this.skyboxPath;

            const faces = [
                this.GL.TEXTURE_CUBE_MAP_POSITIVE_X,
                this.GL.TEXTURE_CUBE_MAP_NEGATIVE_X,
                this.GL.TEXTURE_CUBE_MAP_POSITIVE_Y,
                this.GL.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                this.GL.TEXTURE_CUBE_MAP_POSITIVE_Z,
                this.GL.TEXTURE_CUBE_MAP_NEGATIVE_Z
            ];

            const texture = this.GL.createTexture();
            
            image.onload = () => {
                let width = image.width / 4;
                let height = image.height / 3;
                // this.GL.pixelStorei(this.GL.UNPACK_FLIP_Y_WEBGL, true);
                this.GL.activeTexture(this.GL.TEXTURE0 + this.index);
                this.GL.bindTexture(this.GL.TEXTURE_CUBE_MAP, texture);
                for (let i = 0; i < faces.length; i++) {
                    const subImage = toCubeMapImage(image, i);
                    this.GL.texImage2D(faces[i], 0, this.GL.RGBA, width, height, 0, this.GL.RGBA, this.GL.UNSIGNED_BYTE, subImage);
                }
                this.GL.generateMipmap(this.GL.TEXTURE_CUBE_MAP); // Enable mipmapping
                this.GL.texParameteri(this.GL.TEXTURE_CUBE_MAP, this.GL.TEXTURE_MIN_FILTER, this.GL.LINEAR_MIPMAP_LINEAR);
                this.GL.texParameteri(this.GL.TEXTURE_CUBE_MAP, this.GL.TEXTURE_MAG_FILTER, this.GL.LINEAR);
                this.GL.texParameteri(this.GL.TEXTURE_CUBE_MAP, this.GL.TEXTURE_WRAP_S, this.GL.CLAMP_TO_EDGE);
                this.GL.texParameteri(this.GL.TEXTURE_CUBE_MAP, this.GL.TEXTURE_WRAP_T, this.GL.CLAMP_TO_EDGE);
                this.GL.texParameteri(this.GL.TEXTURE_CUBE_MAP, this.GL.TEXTURE_WRAP_R, this.GL.CLAMP_TO_EDGE);
                this.GL.bindTexture(this.GL.TEXTURE_CUBE_MAP, null);
            }
            return texture;
        } catch (error) {
            console.error("Error loading skybox texture:", error);
        }
    }

    bind() {
        this.GL.activeTexture(this.GL.TEXTURE0 + this.index);
        this.GL.bindTexture(this.GL.TEXTURE_CUBE_MAP, this.skyboxTexture);
        this.GL.activeTexture(this.GL.TEXTURE0);
    }
}


function toCubeMapImage(image, faceIndex) {
    // Return a image with the correct face of the cube map
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    
    const width = image.width / 4;
    const height = image.height / 3;
    
    const x = width * (faceIndex === 0 ? 2 : faceIndex === 1 ? 0 : faceIndex === 2 ? 1 : faceIndex === 3 ? 1 : faceIndex === 4 ? 1 : 3);
    const y = height * (faceIndex === 0 ? 1 : faceIndex === 1 ? 1 : faceIndex === 2 ? 0 : faceIndex === 3 ? 2 : faceIndex === 4 ? 1 : 1);
    
    // console.log(x, y, width, height);

    return ctx.getImageData(x, y, width, height);
}  
