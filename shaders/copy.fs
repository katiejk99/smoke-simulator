uniform sampler2D slab;
uniform vec2 gridSpec;

void main() {
    vec2 uv = gl_FragCoord.xy / gridSpec.xy; 
    gl_FragColor = texture2D(slab, uv);
}
