uniform sampler2D slab;
uniform vec3 maxColor;
uniform vec3 minColor;
uniform float scale;
uniform float bias;
uniform vec2 gridSpec;

void main() {
    vec2 uv = gl_FragCoord.xy / gridSpec.xy;
    float t = clamp(texture2D(slab, uv).y * scale + bias, 0.0, 1.0);
    gl_FragColor = vec4(clamp(maxColor * t + minColor * (1.0 - t), 0.0, 1.0), 1.0);
}
