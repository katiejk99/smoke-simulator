//const { Vector2 } = require("../ext/three");

var COLOR_SHADER_NAMES = {v2D: 'vector2D_color.fs'}
var COLOR_REQUIRED_SHADER_FILES = [COLOR_SHADER_NAMES.v2D];

function Colorizer(shaderFiles, camera, geometry) {
    this.camera = camera;
    
    this.color2D = {
        uniforms: {
            slab: {type: 't'},
            gridSpec: {
                type: 'v2',
                value: new THREE.Vector2()
            },
            maxMag: {
                type: 'f',
                value: 1
            }
        },
        scene: new THREE.Scene()
    };
    this.color2D.scene.add(new THREE.Mesh(geometry,
        new THREE.ShaderMaterial({
            uniforms: this.color2D.uniforms,
            fragmentShader: shaderFiles.get(COLOR_SHADER_NAMES.v2D),
            depthWrite: false,
            depthTest: false,
            blending: THREE.NoBlending
        })));
}

Colorizer.prototype = {
    constructor: Colorizer,

    render2D: function(renderer, slab) {
        this.color2D.uniforms.slab.value = slab.texture;
        renderer.setRenderTarget(null);
        renderer.getSize(this.color2D.uniforms.gridSpec.value);
        renderer.render(this.color2D.scene, this.camera);
    }
}