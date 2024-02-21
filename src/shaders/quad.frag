#version 300 es
precision highp float;

uniform sampler2D uFrameAccumulator;
uniform int uFrameCount;

in vec2 vTexCoord;
out vec4 fragColor;

void main()
{   
//    This shades the quad with the accumulated color
    vec4 color = texture(uFrameAccumulator, vTexCoord);
    fragColor = color;
}
