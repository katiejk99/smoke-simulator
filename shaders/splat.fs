uniform sampler2D slab;

uniform vec2 gridSpec;

uniform vec3 splatValue;
uniform vec2 center;
uniform float radius;


float gaussian(vec2 diff, float r) {
    return exp(-dot(diff, diff) / r);
}


void main() {
    vec2 uv = gl_FragCoord.xy / gridSpec.xy;
    vec3 baseValue = texture2D(slab, uv).xyz;
    vec3 splat = splatValue * gaussian(center - gl_FragCoord.xy, radius);
    gl_FragColor = vec4(baseValue + splat, 1.0);
}
