uniform sampler2D v; // Velocity slab
uniform sampler2D b; // Buoyancy slab

uniform vec2 gridSpec;
uniform float densityScale;
uniform float tempScale;
uniform float ambientTemp;
uniform float time;


// We assume density and temperature are on the same slab.
void main() {
    vec2 uv = gl_FragCoord.xy / gridSpec.xy;
    vec2 dt = texture2D(b, uv).xy;
    float f = -densityScale * dt.x + tempScale * (dt.y - ambientTemp);
    vec3 vel = texture2D(v, uv).xyz;
    vel.y = vel.y + f * time;
    gl_FragColor = vec4(vel, 1.0);
}
