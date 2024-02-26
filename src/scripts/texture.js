export class HDRTexture {
    constructor(GL, index, path) {
        this.GL = GL;
        this.path = path;
        this.index = index;
        this.texture = GL.createTexture();
        this.image = new HDRImage();
        
        this.image.src = this.path;
        
        this.image.onload = () => {
            this.image.exposure = 1.0;
            this.image.gamma = 2.2;
            this.loadFromSource();
        }
    }

    loadFromSource() {
        const GL = this.GL;
        // Flip the image's Y axis to match the WebGL texture coordinate space
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
        // Bind the texture object to the target (TEXTURE_2D) of the active texture unit.
        GL.activeTexture(GL.TEXTURE0 + this.index);
        GL.bindTexture(GL.TEXTURE_2D, this.texture);

        // Send the image data to the texture object
        // var width = this.image.width;
        // var height = this.image.height;
        console.log(this.image.width, this.image.height);
        console.log(this.image.dataRGBE.buffer);

        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, this.image.width, this.image.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, this.image.dataRGBE);
        // console.log(this.image.dataRAW);
        // GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGB9_E5, width, height, 0, GL.RGB, GL.FLOAT, new Float32Array(this.image.dataRAW.buffer));  

        // Mipmapping
        GL.generateMipmap(GL.TEXTURE_2D);
        // Texture filtering
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        // UV wrapping
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.REPEAT); // u
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.MIRRORED_REPEAT); // v
        // Unbind the texture object
        GL.bindTexture(GL.TEXTURE_2D, null);
    }


    bind() {
        this.GL.activeTexture(this.GL.TEXTURE0 + this.index);
        this.GL.bindTexture(this.GL.TEXTURE_2D, this.texture);
        this.GL.activeTexture(this.GL.TEXTURE0);
    }
}