uniform sampler2D slab;
uniform float scale;
uniform float bias;
uniform vec2 gridSpec;

void main() {
    vec2 uv = gl_FragCoord.xy / gridSpec.xy; 
    gl_FragColor = vec4(clamp(texture2D(slab, uv).xyz * scale + bias, 0.0, 1.0), 1.0);
}
