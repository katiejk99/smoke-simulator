uniform sampler2D s;

uniform vec2 gridSize;
uniform vec2 gridOffset;
uniform float scale;

void main()
{
    vec2 uv = (gl_FragCoord.xy + gridOffset.xy) / gridSize.xy;
    gl_FragColor = vec4(scale * texture2D(s, uv).xyz, 1.0);
}
