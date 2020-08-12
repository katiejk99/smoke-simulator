uniform sampler2D slab;

uniform vec2 gridSpec;

uniform vec3 splatValue;
uniform vec2 center;
uniform vec2 radii;


float gaussian2D(vec2 diff, vec2 r) {
    return 0.3*exp(-dot(diff * diff, 1.0 / r));
}


void main() {
    vec2 uv = gl_FragCoord.xy / gridSpec.xy;
    vec3 baseValue = texture2D(slab, uv).xyz;
    vec3 splat = splatValue * gaussian2D(center - gl_FragCoord.xy, radii);
    gl_FragColor = vec4(baseValue + splat, 1.0);
}
