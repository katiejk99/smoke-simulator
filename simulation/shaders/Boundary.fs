uniform sampler2D read;

uniform vec2 gridSpec;
uniform vec2 gridOffset;
uniform float gridScale;

void main()
{
    vec2 uv = (gl_FragCoord.xy + gridOffset.xy) / gridSpec.xy;
    gl_FragColor = vec4(gridScale * texture2D(read, uv).xyz, 1.0);
}
