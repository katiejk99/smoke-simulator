uniform sampler2D sampler;

uniform vec2 gridSize;
uniform vec2 gridOffset;
uniform float scale;

void main()
{
    vec2 uv = (gl_FragCoord.xy + gridOffset.xy) / gridSize.xy;
    gl_FragColor = vec4(scale * texture2D(sampler, uv).xyz, 1.0);
}
