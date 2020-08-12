#define PI 3.1415926535897932384626433832795

uniform sampler2D slab;

uniform vec2 gridSpec;
uniform float bias;
uniform float scale;

// Found this here: https://news.ycombinator.com/item?id=21156680
vec3 coolhue2(float h){
    float h6 = 6.*h;
    return clamp(
        vec3(
            2. - abs(h6 - 4.),
            abs(h6 - 3.) - 1.,
        	2. - abs(h6 - 2.)
    ), 0.0, 1.0);
}

// https://github.com/hughsk/glsl-hsv2rgb/blob/master/index.glsl
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main() {
    vec2 uv = gl_FragCoord.xy / gridSpec.xy;
    vec2 vec = texture2D(slab, uv).xy;
    float v = clamp(length(vec) * scale + bias, 0.0, 1.0);
    float h = (atan(vec.y, vec.x)) / (2.0 * PI);
    gl_FragColor = vec4(hsv2rgb(vec3(h, 1.0, v)), 1.0);
}
