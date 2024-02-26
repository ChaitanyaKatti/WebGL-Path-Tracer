/* hdrpng.js - by Enki - https://enkimute.github.io */
!function(e,t,r){"undefined"!=typeof module&&module.exports?module.exports=r():"function"==typeof define&&define.amd?define(e,r):t[e]=r()}("HDRImage",this,function(){function t(){var e,t,r=document.createElement("canvas"),u="t",d=1,l=2.2,s=null;return r.__defineGetter__("exposure",function(){return d}),r.__defineSetter__("exposure",function(r){d=r,s&&(f(s,d,l,t.data),e.putImageData(t,0,0))}),r.__defineGetter__("gamma",function(){return l}),r.__defineSetter__("gamma",function(r){l=r,s&&(f(s,d,l,t.data),e.putImageData(t,0,0))}),r.__defineGetter__("dataFloat",function(){return h(s)}),r.__defineGetter__("dataRGBE",function(){return s}),r.toHDRBlob=function(e,t){function r(e,t,r){var a=e.createShader(r);return e.shaderSource(a,t),e.compileShader(a),a}function a(e,t,a){var n,i,o=e.createProgram();return e.attachShader(o,n=r(e,t,e.VERTEX_SHADER)),e.attachShader(o,i=r(e,a,e.FRAGMENT_SHADER)),e.linkProgram(o),e.deleteShader(n),e.deleteShader(i),o}var i=new Uint8Array(t&&t.match(/rgb9_e5/i)?n(h(s)).buffer:s.buffer),o="precision highp float;\nattribute vec3 position;\nvarying vec2 tex;\nvoid main() { tex = position.xy/2.0+0.5; gl_Position = vec4(position, 1.0); }",f="precision highp float;\nprecision highp sampler2D;\nuniform sampler2D tx;\nvarying vec2 tex;\nvoid main() { gl_FragColor = texture2D(tx,tex); }",u=this.width,d=this.height;if(u*d*4<i.byteLength)return console.error("not big enough.");var l=document.createElement("canvas");l.width=u,l.height=d;var c=l.getContext("webgl",{antialias:!1,alpha:!0,premultipliedAlpha:!1,preserveDrawingBuffer:!0}),g=c.createTexture();c.activeTexture(c.TEXTURE0),c.bindTexture(c.TEXTURE_2D,g),c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL,!0),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MAG_FILTER,c.NEAREST),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,c.NEAREST),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_S,c.CLAMP_TO_EDGE),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_T,c.CLAMP_TO_EDGE),c.texImage2D(c.TEXTURE_2D,0,c.RGBA,u,d,0,c.RGBA,c.UNSIGNED_BYTE,new Uint8Array(i.buffer));var E=a(c,o,f),T=c.getUniformLocation(E,"tx"),_=new Float32Array([-1,-1,0,1,-1,0,1,1,0,1,1,0,-1,1,0,-1,-1,0]),m=c.createBuffer();return c.enableVertexAttribArray(0),c.bindBuffer(c.ARRAY_BUFFER,m),c.bufferData(c.ARRAY_BUFFER,_,c.STATIC_DRAW),c.vertexAttribPointer(0,3,c.FLOAT,!1,0,0),c.useProgram(E),c.uniform1i(T,0),c.drawArrays(c.TRIANGLES,0,6),c.deleteTexture(g),c.deleteProgram(E),e?l.toBlob(e):void 0},r.__defineGetter__("src",function(){return u}),r.__defineSetter__("src",function(n){if(u=n,e&&e.clearRect(0,0,this.width,this.height),n.match(/\.hdr$/i))a(n,function(r,a,n){s=r,this.width=this.style.width=a,this.height=this.style.height=n,e=this.getContext("2d"),t=e.getImageData(0,0,a,n),f(r,d,l,t.data),e.putImageData(t,0,0),this.onload&&this.onload()}.bind(r));else if(n.match(/\.rgb9_e5\.png$/i)){var h=new Image;h.src=n,h.onload=function(){var r=document.createElement("canvas"),a=this.width=this.style.width=r.width=h.width,n=this.height=this.style.height=r.height=h.height,u=r.getContext("webgl"),c=u.createTexture();u.bindTexture(u.TEXTURE_2D,c),u.texImage2D(u.TEXTURE_2D,0,u.RGBA,u.RGBA,u.UNSIGNED_BYTE,h),fb=u.createFramebuffer(),u.bindFramebuffer(u.FRAMEBUFFER,fb),u.framebufferTexture2D(u.FRAMEBUFFER,u.COLOR_ATTACHMENT0,u.TEXTURE_2D,c,0);var g=new Uint8Array(a*n*4);u.readPixels(0,0,a,n,u.RGBA,u.UNSIGNED_BYTE,g),u.deleteTexture(c),u.deleteFramebuffer(fb),this.dataRAW=new Uint32Array(g.buffer),s=o(i(this.dataRAW)),e=this.getContext("2d"),t=e.getImageData(0,0,a,n),f(s,d,l,t.data),e.putImageData(t,0,0),this.onload&&this.onload()}.bind(r)}else if(n.match(/\.hdr\.png$|\.rgbe\.png/i)){var h=new Image;h.src=n,h.onload=function(){var r=document.createElement("canvas"),a=this.width=this.style.width=r.width=h.width,n=this.height=this.style.height=r.height=h.height,i=r.getContext("webgl"),o=i.createTexture();i.bindTexture(i.TEXTURE_2D,o),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,i.RGBA,i.UNSIGNED_BYTE,h),fb=i.createFramebuffer(),i.bindFramebuffer(i.FRAMEBUFFER,fb),i.framebufferTexture2D(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,o,0);var u=new Uint8Array(a*n*4);i.readPixels(0,0,a,n,i.RGBA,i.UNSIGNED_BYTE,u),i.deleteTexture(o),i.deleteFramebuffer(fb),s=u,e=this.getContext("2d"),t=e.getImageData(0,0,a,n),f(s,d,l,t.data),e.putImageData(t,0,0),this.onload&&this.onload()}.bind(r)}}),r}function r(e,t){for(var r in t)e[r]=t[r];return e}function a(e,t){var a=r(new XMLHttpRequest,{responseType:"arraybuffer"});return a.onerror=t.bind(a,!1),a.onload=function(){if(this.status>=400)return this.onerror();for(var e,r="",a=0,n=new Uint8Array(this.response);!r.match(/\n\n[^\n]+\n/g);)r+=String.fromCharCode(n[a++]);if(e=r.match(/FORMAT=(.*)$/m)[1],"32-bit_rle_rgbe"!=e)return console.warn("unknown format : "+e),this.onerror();for(var i=r.split(/\n/).reverse()[1].split(" "),o=1*i[3],h=1*i[1],f=new Uint8Array(o*h*4),u=0,d=0;h>d;d++){var l=n.slice(a,a+=4),s=[];if(2!=l[0]||2!=l[1]||128&l[2])return console.warn("HDR parse error .."),this.onerror();if((l[2]<<8)+l[3]!=o)return console.warn("HDR line mismatch .."),this.onerror();for(var c=0;4>c;c++)for(var g,E,T=c*o,_=(c+1)*o;_>T;)if(g=n.slice(a,a+=2),g[0]>128)for(E=g[0]-128;E-->0;)s[T++]=g[1];else for(E=g[0]-1,s[T++]=g[1];E-->0;)s[T++]=n[a++];for(var c=0;o>c;c++)f[u++]=s[c],f[u++]=s[c+o],f[u++]=s[c+2*o],f[u++]=s[c+3*o]}t&&t(f,o,h)},a.open("GET",e,!0),a.send(null),a}function n(e,t){for(var r,a,n,i,o,h,f=e.byteLength/12|0,t=t||new Uint32Array(f),u=0;f>u;u++)r=Math.min(32768,e[3*u]),a=Math.min(32768,e[3*u+1]),n=Math.min(32768,e[3*u+2]),i=Math.max(Math.max(r,a),n),o=Math.max(-16,Math.floor(Math.log2(i)))+16,h=Math.pow(2,o-24),511==Math.floor(i/h+.5)&&(h*=2,o+=1),t[u]=(Math.floor(r/h+.5)<<23)+(Math.floor(a/h+.5)<<14)+(Math.floor(n/h+.5)<<5)+(0|o);return t}function i(e,t){for(var r,a,n=e.byteLength>>2,t=t||new Float32Array(3*n),i=0;n>i;i++)r=e[i],a=Math.pow(2,(31&r)-24),t[3*i]=(r>>>23)*a,t[3*i+1]=(r>>>14&511)*a,t[3*i+2]=(r>>>5&511)*a;return t}function o(t,r){for(var a,n,i,o,h,f=t.byteLength/12|0,r=r||new Uint8Array(4*f),u=0;f>u;u++)a=t[3*u],n=t[3*u+1],i=t[3*u+2],o=Math.max(Math.max(a,n),i),e=Math.ceil(Math.log2(o)),h=Math.pow(2,e-8),r[4*u]=a/h|0,r[4*u+1]=n/h|0,r[4*u+2]=i/h|0,r[4*u+3]=e+128;return r}function h(e,t){for(var r,a=e.byteLength>>2,t=t||new Float32Array(3*a),n=0;a>n;n++)r=Math.pow(2,e[4*n+3]-136),t[3*n]=e[4*n]*r,t[3*n+1]=e[4*n+1]*r,t[3*n+2]=e[4*n+2]*r;return t}function f(e,t,r,a){t=Math.pow(2,void 0===t?1:t)/2,void 0===r&&(r=2.2);for(var n,i=1/r,o=e.byteLength>>2,a=a||new Uint8ClampedArray(4*o),h=0;o>h;h++)n=t*Math.pow(2,e[4*h+3]-136),a[4*h]=255*Math.pow(e[4*h]*n,i),a[4*h+1]=255*Math.pow(e[4*h+1]*n,i),a[4*h+2]=255*Math.pow(e[4*h+2]*n,i),a[4*h+3]=255;return a}function u(e,t,r,a){t=Math.pow(2,void 0===t?1:t)/2,void 0===r&&(r=2.2);for(var n=1/r,i=e.byteLength/12|0,a=a||new Uint8ClampedArray(4*i),o=0;i>o;o++)a[4*o]=255*Math.pow(e[3*o]*t,n),a[4*o+1]=255*Math.pow(e[3*o+1]*t,n),a[4*o+2]=255*Math.pow(e[3*o+2]*t,n),a[4*o+3]=255;return a}return t.floatToRgbe=o,t.rgbeToFloat=h,t.floatToRgb9_e5=n,t.rgb9_e5ToFloat=i,t.rgbeToLDR=f,t.floatToLDR=u,t});/**
 * hdrpng.js - support for Radiance .HDR and RGBE / RGB9_E5 images in PNG.
 * @author Enki
 * @desc load/save Radiance .HDR, RGBE in PNG and RGB9_E5 in PNG for HTML5, webGL, webGL2.
 */
(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition();
  else if (typeof define == 'function' && define.amd) define(name, definition);
  else context[name] = definition();
}('HDRImage', this, function () {
  /**
   * HDRImage - wrapper that exposes default Image like interface for HDR imgaes. (till extending HTMLCanvasElement actually works ..)
   * @returns {HDRImage} a html HDR image element
   */
  function HDRImage() {
    var res = document.createElement('canvas'), HDRsrc='t',HDRexposure=1.0,HDRgamma=2.2,HDRdata=null,context,HDRD;
    res.__defineGetter__('exposure',function(){return HDRexposure});
    res.__defineSetter__('exposure',function(val){ HDRexposure=val; if (HDRdata) { rgbeToLDR(HDRdata,HDRexposure,HDRgamma,HDRD.data); context.putImageData(HDRD,0,0); }});
    res.__defineGetter__('gamma',function(){return HDRgamma});
    res.__defineSetter__('gamma',function(val){ HDRgamma=val; if (HDRdata) { rgbeToLDR(HDRdata,HDRexposure,HDRgamma,HDRD.data); context.putImageData(HDRD,0,0); }});
    res.__defineGetter__('dataFloat',function(){ return rgbeToFloat(HDRdata); });
    res.__defineGetter__('dataRGBE',function(){ return HDRdata; });
    res.toHDRBlob = function(cb,m,q) {
      // Array to image.. slightly more involved.  
        function createShader(gl, source, type) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        }
        function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
            var program = gl.createProgram(),vs,fs;
            gl.attachShader(program, vs=createShader(gl, vertexShaderSource, gl.VERTEX_SHADER));
            gl.attachShader(program, fs=createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER));
            gl.linkProgram(program); gl.deleteShader(vs); gl.deleteShader(fs);
            return program;
        };
        var ar = (m && m.match(/rgb9_e5/i)) ? new Uint8Array( floatToRgb9_e5(rgbeToFloat(HDRdata)).buffer ) : new Uint8Array(HDRdata.buffer);
        var vs2='precision highp float;\nattribute vec3 position;\nvarying vec2 tex;\nvoid main() { tex = position.xy/2.0+0.5; gl_Position = vec4(position, 1.0); }';
        var fs2='precision highp float;\nprecision highp sampler2D;\nuniform sampler2D tx;\nvarying vec2 tex;\nvoid main() { gl_FragColor = texture2D(tx,tex); }';
        var x = this.width, y = this.height;
        if (x*y*4 < ar.byteLength) return console.error('not big enough.');
        var c = document.createElement('canvas');
        c.width=x; c.height=y;
        var gl = c.getContext('webgl',{antialias:false,alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true});

        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);  gl.bindTexture(gl.TEXTURE_2D, texture);  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, x, y, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(ar.buffer));

        var program = createProgram(gl, vs2, fs2), uniformTexLocation = gl.getUniformLocation(program, 'tx');

        var positions = new Float32Array([-1, -1, 0, 1, -1, 0, 1,  1, 0, 1,  1, 0, -1,  1, 0, -1, -1, 0 ]), vertexPosBuffer=gl.createBuffer();
        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.useProgram(program);
        gl.uniform1i(uniformTexLocation, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        gl.deleteTexture(texture);
        gl.deleteProgram(program);

        if (cb) return c.toBlob(cb); 
    }
    res.__defineGetter__('src',function(){return HDRsrc});
    res.__defineSetter__('src',function(val){
      HDRsrc=val;
      context&&context.clearRect(0,0,this.width,this.height);
      if (val.match(/\.hdr$/i)) loadHDR(val,function(img,width,height){
        HDRdata = img;
        this.width  = this.style.width  = width;
        this.height = this.style.height = height;
        context = this.getContext('2d');
        HDRD = context.getImageData(0,0,width,height);
        rgbeToLDR(img,HDRexposure,HDRgamma,HDRD.data);
        context.putImageData(HDRD,0,0);
        this.onload&&this.onload(); 
      }.bind(res));
      else if (val.match(/\.rgb9_e5\.png$/i)) {
        var i = new Image();
        i.src = val;
        i.onload = function() {
          var c = document.createElement('canvas'), x=this.width=this.style.width=c.width=i.width, y=this.height=this.style.height=c.height=i.height, gl=c.getContext('webgl');

          var texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, i);
           
          fb = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
          gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

          var res = new Uint8Array(x*y*4);
          gl.readPixels(0,0,x,y,gl.RGBA,gl.UNSIGNED_BYTE,res);

          gl.deleteTexture(texture);
          gl.deleteFramebuffer(fb);
          
          this.dataRAW = new Uint32Array(res.buffer);
          HDRdata = floatToRgbe(rgb9_e5ToFloat(this.dataRAW));
          context = this.getContext('2d');
          HDRD = context.getImageData(0,0,x,y);
          rgbeToLDR(HDRdata,HDRexposure,HDRgamma,HDRD.data);
          context.putImageData(HDRD,0,0);
          this.onload&&this.onload(); 
        }.bind(res);
      } else if (val.match(/\.hdr\.png$|\.rgbe\.png/i)) {
        var i = new Image();
        i.src = val;
        i.onload = function() {
          var c = document.createElement('canvas'), x=this.width=this.style.width=c.width=i.width, y=this.height=this.style.height=c.height=i.height, gl=c.getContext('webgl');

          var texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, i);
           
          fb = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
          gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

          var res = new Uint8Array(x*y*4);
          gl.readPixels(0,0,x,y,gl.RGBA,gl.UNSIGNED_BYTE,res);

          gl.deleteTexture(texture);
          gl.deleteFramebuffer(fb);
          
          HDRdata = res;
          context = this.getContext('2d');
          HDRD = context.getImageData(0,0,x,y);
          rgbeToLDR(HDRdata,HDRexposure,HDRgamma,HDRD.data);
          context.putImageData(HDRD,0,0);
          this.onload&&this.onload(); 
        }.bind(res);
      }
    });
    return res;
  }  
  
  function m(a,b) { for (var i in b) a[i]=b[i]; return a; };
    
  /** Load and parse a Radiance .HDR file. It completes with a 32bit RGBE buffer.
    * @param {URL} url location of .HDR file to load.
    * @param {function} completion completion callback.
    * @returns {XMLHttpRequest} the XMLHttpRequest used to download the file.
    */
  function loadHDR( url, completion ) {
    var req = m(new XMLHttpRequest(),{responseType:"arraybuffer"});
    req.onerror = completion.bind(req,false);
    req.onload  = function() {
      if (this.status>=400) return this.onerror();
      var header='',pos=0,d8=new Uint8Array(this.response),format;
    // read header.  
      while (!header.match(/\n\n[^\n]+\n/g)) header += String.fromCharCode(d8[pos++]);
    // check format. 
      format = header.match(/FORMAT=(.*)$/m)[1];
      if (format!='32-bit_rle_rgbe') return console.warn('unknown format : '+format),this.onerror();
    // parse resolution
      var rez=header.split(/\n/).reverse()[1].split(' '), width=rez[3]*1, height=rez[1]*1;
    // Create image.
      var img=new Uint8Array(width*height*4),ipos=0;
    // Read all scanlines
      for (var j=0; j<height; j++) {
        var rgbe=d8.slice(pos,pos+=4),scanline=[];
        if (rgbe[0]!=2||(rgbe[1]!=2)||(rgbe[2]&0x80)) {
          var len=width,rs=0; pos-=4; while (len>0) {
            img.set(d8.slice(pos,pos+=4),ipos); 
            if (img[ipos]==1&&img[ipos+1]==1&&img[ipos+2]==1) {
              for (img[ipos+3]<<rs; i>0; i--) {
                img.set(img.slice(ipos-4,ipos),ipos);
                ipos+=4;
                len--
              }
              rs+=8;
            } else { len--; ipos+=4; rs=0; }
          }
        } else {
          if ((rgbe[2]<<8)+rgbe[3]!=width) return console.warn('HDR line mismatch ..'),this.onerror();
          for (var i=0;i<4;i++) {
              var ptr=i*width,ptr_end=(i+1)*width,buf,count;
              while (ptr<ptr_end){
                  buf = d8.slice(pos,pos+=2);
                  if (buf[0] > 128) { count = buf[0]-128; while(count-- > 0) scanline[ptr++] = buf[1]; } 
                               else { count = buf[0]-1; scanline[ptr++]=buf[1]; while(count-->0) scanline[ptr++]=d8[pos++]; }
              }
          }
          for (var i=0;i<width;i++) { img[ipos++]=scanline[i]; img[ipos++]=scanline[i+width]; img[ipos++]=scanline[i+2*width]; img[ipos++]=scanline[i+3*width]; }
        }  
      }
      completion&&completion(img,width,height);
    }
    req.open("GET",url,true);
    req.send(null);
    return req;
  }

  /** Convert a float buffer to a RGB9_E5 buffer. (ref https://www.khronos.org/registry/OpenGL/extensions/EXT/EXT_texture_shared_exponent.txt)
    * @param {Float32Array} Buffer Floating point input buffer (96 bits/pixel).
    * @param {Uint32Array} [res] Optional output buffer with 32 bit RGB9_E5 per pixel.
    * @returns {Uint32Array} A 32bit uint32 array in RGB9_E5
    */
  function floatToRgb9_e5(buffer,res) {
    var r,g,b,v,maxColor,ExpShared,denom,s,l=(buffer.byteLength/12)|0, res=res||new Uint32Array(l);
    for (var i=0;i<l;i++) {
      r=Math.min(32768.0,buffer[i*3]); g=Math.min(32768.0,buffer[i*3+1]); b=Math.min(32768.0,buffer[i*3+2]);
      maxColor = Math.max(Math.max(r,g),b);
      ExpShared = Math.max(-16,Math.floor(Math.log2(maxColor))) + 16;
      denom = Math.pow(2,ExpShared-24);
      if (Math.floor(maxColor/denom+0.5) == 511) { denom *= 2; ExpShared += 1; }
      res[i] = (Math.floor(r/denom+0.5)<<23)+(Math.floor(g/denom+0.5)<<14)+(Math.floor(b/denom+0.5)<<5)+ (ExpShared|0);
    }
    return res;
  }

  /** Convert an RGB9_E5 buffer to a Float buffer.
    * @param {Uint32Array} Buffer in RGB9_E5 format. (Uint32 buffer).
    * @param {Float32Array} [res] Optional float output buffer.
    * @returns {Float32Array} A Float32Array.
    */
  function rgb9_e5ToFloat(buffer,res) {
    var v,s,l=buffer.byteLength>>2, res=res||new Float32Array(l*3);
    for (var i=0;i<l;i++) {
      v = buffer[i]; s = Math.pow(2,(v&31)-24);
      res[i*3]   =  (v>>>23)*s;
      res[i*3+1] = ((v>>>14)&511)*s;
      res[i*3+2] = ((v>>>5)&511)*s;
    }
    return res;
  }

  /** Convert a float buffer to a RGBE buffer.
    * @param {Float32Array} Buffer Floating point input buffer (96 bits/pixel).
    * @param {Uint8Array} [res] Optional output buffer with 32 bit RGBE per pixel.
    * @returns {Uint8Array} A 32bit uint8 array in RGBE
    */
  function floatToRgbe(buffer,res) {
    var r,g,b,v,s,l=(buffer.byteLength/12)|0, res=res||new Uint8Array(l*4);
    for (var i=0;i<l;i++) {
      r = buffer[i*3]; g = buffer[i*3+1]; b = buffer[i*3+2];
      v = Math.max(Math.max(r,g),b); e = v==0.5?0:Math.ceil(Math.log2(v)); s = Math.pow(2,e-8);
      res[i*4]   = (r/s)|0;
      res[i*4+1] = (g/s)|0;
      res[i*4+2] = (b/s)|0;
      res[i*4+3] = (e+128);
    }
    return res;
  }
  
  /** Convert an RGBE buffer to a Float buffer.
    * @param {Uint8Array} buffer The input buffer in RGBE format. (as returned from loadHDR)
    * @param {Float32Array} [res] Optional result buffer containing 3 floats per pixel.
    * @returns {Float32Array} A floating point buffer with 96 bits per pixel (32 per channel, 3 channels).
    */
  function rgbeToFloat(buffer,res) {
    var s,l=buffer.byteLength>>2, res=res||new Float32Array(l*3);
    for (var i=0;i<l;i++) {
      s = Math.pow(2,buffer[i*4+3]-(128+8));
      res[i*3]=buffer[i*4]*s;
      res[i*3+1]=buffer[i*4+1]*s;
      res[i*3+2]=buffer[i*4+2]*s;
    }
    return res;
  }
  
  /** Convert an RGBE buffer to LDR with given exposure and display gamma.
    * @param {Uint8Array} buffer The input buffer in RGBE format. (as returned from loadHDR)
    * @param {float} [exposure=1] Optional exposure value. (1=default, 2=1 step up, 3=2 steps up, -2 = 3 steps down)
    * @param {float} [gamma=2.2]  Optional display gamma to respect. (1.0 = linear, 2.2 = default monitor)
    * @param {Array} [res] res Optional result buffer.
    */
  function rgbeToLDR(buffer,exposure,gamma,res) {
    exposure = Math.pow(2,exposure===undefined?1:exposure)/2;
    if (gamma===undefined) gamma = 2.2;
    var one_over_gamma=1/gamma,s,l=buffer.byteLength>>2, res=res||new Uint8ClampedArray(l*4);
    for (var i=0;i<l;i++) {
      s = exposure * Math.pow(2,buffer[i*4+3]-(128+8));
      res[i*4]  =255*Math.pow(buffer[i*4]*s,one_over_gamma);
      res[i*4+1]=255*Math.pow(buffer[i*4+1]*s,one_over_gamma);
      res[i*4+2]=255*Math.pow(buffer[i*4+2]*s,one_over_gamma);
      res[i*4+3]=255;
    }
    return res;
  }

  /** Convert an float buffer to LDR with given exposure and display gamma.
    * @param {Float32Array} buffer The input buffer in floating point format. 
    * @param {float} [exposure=1] Optional exposure value. (1=default, 2=1 step up, 3=2 steps up, -2 = 3 steps down)
    * @param {float} [gamma=2.2]  Optional display gamma to respect. (1.0 = linear, 2.2 = default monitor)
    * @param {Array} [res] res Optional result buffer.
    */
  function floatToLDR(buffer,exposure,gamma,res) {
    exposure = Math.pow(2,exposure===undefined?1:exposure)/2;
    if (gamma===undefined) gamma = 2.2;
    var one_over_gamma=1/gamma,s,l=(buffer.byteLength/12)|0, res=res||new Uint8ClampedArray(l*4);
    for (var i=0;i<l;i++) {
      res[i*4]  =255*Math.pow(buffer[i*3]*exposure,one_over_gamma);
      res[i*4+1]=255*Math.pow(buffer[i*3+1]*exposure,one_over_gamma);
      res[i*4+2]=255*Math.pow(buffer[i*3+2]*exposure,one_over_gamma);
      res[i*4+3]=255;
    }
    return res;
  }
  
  
  // Float/RGBE conversions.
  HDRImage.floatToRgbe = floatToRgbe;
  HDRImage.rgbeToFloat = rgbeToFloat;

  // Float/RGB9_E5 conversions.
  HDRImage.floatToRgb9_e5 = floatToRgb9_e5;
  HDRImage.rgb9_e5ToFloat = rgb9_e5ToFloat; 

  // x to LDR conversion.
  HDRImage.rgbeToLDR   = rgbeToLDR;
  HDRImage.floatToLDR  = floatToLDR;
  
  
  return HDRImage;
}));