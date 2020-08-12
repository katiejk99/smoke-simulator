//Jacobi operation

uniform sampler2D x; //field of interest (velocity, pressure etc.)
uniform sampler2D b; //b vector (Ax = b)

uniform vec2 gridSpec; //width and height for normalization

uniform float alpha;
uniform float beta;

void main() {

    vec2 uv = gl_FragCoord.xy / gridSpec.xy; //normalized uv coordinates
       
    vec2 uv_xoffset = vec2(1.0 / gridSpec.x, 0.0);
    vec2 uv_yoffset = vec2(0.0, 1.0 / gridSpec.y);
    
    
    //Pressure of neighbors
    vec2 pl = texture2D(x, uv - uv_xoffset).xy;
    vec2 pr = texture2D(x, uv + uv_xoffset).xy;
    vec2 pb = texture2D(x, uv - uv_yoffset).xy;
    vec2 pt = texture2D(x, uv + uv_yoffset).xy;
        
    vec2 b_center = texture2D(b, uv).xy;
    
    gl_FragColor = vec4((pl + pr + pb + pt + alpha * b_center)/beta, 0.0, 1.0); //Subtract gradient from velocity
    

}


