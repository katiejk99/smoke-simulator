void main() {

    vec2 uv = gl_FragCoord.xy;
    //gl_FragColor = vec4((uv / 256.0), 0.0, 1.0);
    if (uv.x < 128.0) {
        gl_FragColor = vec4(2.0, 0.0005, 0.0, 1.0);
    } else {
        gl_FragColor = vec4(-2.0, -0.0005, 0.0, 1.0);
    }
    //gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
}
