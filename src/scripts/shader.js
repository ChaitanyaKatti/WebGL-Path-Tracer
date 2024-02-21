export class Shader {
    constructor(GL, vsSourcePath, fsSourcePath) {
        this.GL = GL;
        this.vsSourcePath = vsSourcePath;
        this.fsSourcePath = fsSourcePath;
        this.program = null;
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.vsSource = null;
        this.fsSource = null;
        this.frameCount = 0;
    }

    async init() {
        await this.fetchShadersSource();
        this.createShaderProgram();
    }

    async fetchShadersSource() {
        try {
            const vsResponse = await fetch(this.vsSourcePath);
            const fsResponse = await fetch(this.fsSourcePath);

            if (!vsResponse.ok || !fsResponse.ok) {
                throw new Error('Failed to fetch shader sources');
            }
            this.vsSource = await vsResponse.text();
            this.fsSource = await fsResponse.text();

        } catch (error) {
            console.error('Error loading shaders:', error);
            throw error;
        }
    }

    createShader(type, source) {
        const shader = this.GL.createShader(type);
        this.GL.shaderSource(shader, source);
        this.GL.compileShader(shader);

        if (!this.GL.getShaderParameter(shader, this.GL.COMPILE_STATUS)) {
            throw new Error('Shader Compilation Error : ' + this.GL.getShaderInfoLog(shader));
        }

        return shader;
    }

    createShaderProgram() {
        const vertexShader = this.createShader(this.GL.VERTEX_SHADER, this.vsSource);
        const fragmentShader = this.createShader(this.GL.FRAGMENT_SHADER, this.fsSource);

        this.program = this.GL.createProgram();

        this.GL.attachShader(this.program, vertexShader);
        this.GL.attachShader(this.program, fragmentShader);

        this.GL.linkProgram(this.program);
        if (!this.GL.getProgramParameter(this.program, this.GL.LINK_STATUS)) {
            throw new Error("Shader Linking Error : " + this.GL.getProgramInfoLog(this.program))
        };
    }

    use() {
        this.GL.useProgram(this.program);
    }

    setUniform(name, value, type) {
        const location = this.GL.getUniformLocation(this.program, name);
        // Use correct type of uniform, bool int or float
        switch (type) {
            case 'float':
                this.GL.uniform1f(location, value); break;
            case 'bool':
                this.GL.uniform1i(location, value); break;
            case 'uint':
                this.GL.uniform1ui(location, value); break;
            case 'int':
                this.GL.uniform1i(location, value); break;
            case 'vec2':
                this.GL.uniform2fv(location, value); break;
            case 'vec3':
                this.GL.uniform3fv(location, value); break;
            case 'vec4':
                this.GL.uniform4fv(location, value); break;
            case 'mat3':
                this.GL.uniformMatrix3fv(location, false, value); break;
            case 'mat4':
                this.GL.uniformMatrix4fv(location, false, value); break;
            case 'struct':
                for (const key in value) {
                    this.setUniform(`${name}.${key}`, value[key].value, value[key].type);
                }
                break;
            default:
                console.error(`Type not yet implemented : '${type}' for uniform : '${name}'`);
        }
    }
}

