void main() {

    vec2 uv = gl_FragCoord.xy;
    gl_FragColor = vec4((uv / 256.0) - 0.5, 0.0, 1.0);
}
