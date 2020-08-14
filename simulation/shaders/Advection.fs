uniform sampler2D velocity;
uniform sampler2D advected;

uniform vec2 gridSpec;
uniform float gridScale;

uniform float time;
uniform float dissipation;


vec3 lerp(sampler2D s, vec2 position) {
    vec2 prev;
    vec2 next;
    
    prev.xy = floor(position - 0.5) + 0.5;
    next.xy = prev.xy + 1.0;
    
    vec2 uv1 = prev / gridSpec.xy;
    vec2 uv2 = next / gridSpec.xy;
    
    vec3 s11 = texture2D(s, uv1.xy).xyz;
    vec3 s22 = texture2D(s, uv2.xy).xyz;
    vec3 s12 = texture2D(s, vec2(uv1.x, uv2.y)).xyz;
    vec3 s21 = texture2D(s, vec2(uv2.x, uv1.y)).xyz;
    
    vec2 advect = position - prev.xy;

    return mix(mix(s11, s21, advect.x), mix(s12, s22, advect.x), advect.y);

}


void main() {

    vec2 uv = gl_FragCoord.xy / gridSpec.xy;
    float scale = 1.0 / gridScale;

    // trace point back to previous position in time
    vec2 xprev = gl_FragCoord.xy - time * scale * texture2D(velocity, uv).xy;

    gl_FragColor = vec4(dissipation * lerp(advected, xprev), 1.0);
}
