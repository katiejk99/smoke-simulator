//Gradient operation

uniform sampler2D p; //pressure field
uniform sampler2D w; //velocity

uniform float gridScale; //dX
uniform vec2 gridSpec; //width and height for normalization

void main() {

    vec2 uv = gl_FragCoord.xy / gridSpec.xy; //normalized uv coordinates
    
    vec2 uv_xoffset = vec2(1.0 / gridSpec.x, 0.0);
    vec2 uv_yoffset = vec2(0.0, 1.0 / gridSpec.y);
    
    
    //Pressure of neighbors
    float l = texture2D(p, uv - uv_xoffset).x;
    float r = texture2D(p, uv + uv_xoffset).x;
    float b = texture2D(p, uv - uv_yoffset).x;
    float t = texture2D(p, uv + uv_yoffset).x;
    
    float scale = 0.5 / gridScale; // (1 / 2dX);
    
    vec2 gradient = scale * vec2(r - l, t - b);
    
    vec2 v = texture2D(w, uv).xy; //Vector of velocity;
    
    gl_FragColor = vec4(v - gradient, 0.0, 1.0); //Subtract gradient from velocity

}

