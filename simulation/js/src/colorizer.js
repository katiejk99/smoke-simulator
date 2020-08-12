//const { Vector2 } = require("../ext/three");

var COLOR_SHADER_NAMES = {
    v2D: 'colorVec2_HSV.fs',
    scalarR: 'colorR_RGB.fs',
    scalarG: 'colorG_RGB.fs',
    copy: 'sampleRGB.fs'
}
var COLOR_REQUIRED_SHADER_FILES = [
    COLOR_SHADER_NAMES.v2D,
    COLOR_SHADER_NAMES.scalarR,
    COLOR_SHADER_NAMES.scalarG,
    COLOR_SHADER_NAMES.copy];

function Colorizer(shaderFiles, camera, geometry) {
    this.camera = camera;

    // Values for scalar colorization
    this.bias = 0;
    this.scale = 1;
    this.minColor = new THREE.Vector3(0, 0, 0);
    this.maxColor = new THREE.Vector3(1, 1, 1);

    // sample RGB with scaling and biasing
    this.colorIdentity = {
        uniforms: {
            slab: {
                type: 't'
            },
            gridSpec: {
                type: 'v2',
                value: new THREE.Vector2()
            },
            bias: {
                type: 'f'
            },
            scale: {
                type: 'f'
            }
        },
        scene: new THREE.Scene()
    };
    this.colorIdentity.scene.add(new THREE.Mesh(geometry,
        new THREE.ShaderMaterial({
            uniforms: this.colorIdentity.uniforms,
            fragmentShader: shaderFiles.get(COLOR_SHADER_NAMES.copy),
            depthWrite: false,
            depthTest: false,
            blending: THREE.NoBlending
        })));
    
    // vec2 -> HSV
    this.color2D = {
        uniforms: {
            slab: {type: 't'},
            gridSpec: {
                type: 'v2',
                value: new THREE.Vector2()
            },
            bias: {
                type: 'f'
            },
            scale: {
                type: 'f'
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

    // Sample R, scale and bias, lerp between two colors
    this.colorScalarR = {
        uniforms: {
            slab: {
                type: 't'
            },
            gridSpec: {
                type: 'v2',
                value: new THREE.Vector2()
            },
            bias: {
                type: 'f'
            },
            scale: {
                type: 'f'
            },
            minColor: {
                type: 'vec3'
            },
            maxColor: {
                type: 'vec3'
            }
        },
        scene: new THREE.Scene()
    };
    this.colorScalarR.scene.add(new THREE.Mesh(geometry,
        new THREE.ShaderMaterial({
            uniforms: this.colorScalarR.uniforms,
            fragmentShader: shaderFiles.get(COLOR_SHADER_NAMES.scalarR),
            depthWrite: false,
            depthTest: false,
            blending: THREE.NoBlending
        })));

    // Sample G, scale and bias, lerp between two colors
    this.colorScalarG = {
        uniforms: {
            slab: {
                type: 't'
            },
            gridSpec: {
                type: 'v2',
                value: new THREE.Vector2()
            },
            bias: {
                type: 'f'
            },
            scale: {
                type: 'f'
            },
            minColor: {
                type: 'vec3'
            },
            maxColor: {
                type: 'vec3'
            }
        },
        scene: new THREE.Scene()
    };
    this.colorScalarG.scene.add(new THREE.Mesh(geometry,
        new THREE.ShaderMaterial({
            uniforms: this.colorScalarG.uniforms,
            fragmentShader: shaderFiles.get(COLOR_SHADER_NAMES.scalarG),
            depthWrite: false,
            depthTest: false,
            blending: THREE.NoBlending
        })));
}

Colorizer.prototype = {
    constructor: Colorizer,

    setRange: function(minValue, maxValue) {
        this.scale = 1 / (maxValue - minValue);
        this.bias = -minValue * this.scale;
    },

    setColorRange: function(minColor, maxColor) {
        minColor = new THREE.Color(minColor);
        this.minColor = new THREE.Vector3(minColor.r, minColor.g, minColor.b);
        maxColor = new THREE.Color(maxColor);
        this.maxColor = new THREE.Vector3(maxColor.r, maxColor.g, maxColor.b);
    },

    render2D: function(renderer, slab) {
        this.color2D.uniforms.slab.value = slab.state.texture;
        this.color2D.uniforms.bias.value = this.bias;
        this.color2D.uniforms.scale.value = this.scale;
        renderer.setRenderTarget(null);
        renderer.getSize(this.color2D.uniforms.gridSpec.value);
        renderer.render(this.color2D.scene, this.camera);
    },

    renderIdentity: function(renderer, slab) {
        this.colorIdentity.uniforms.slab.value = slab.state.texture;
        this.colorIdentity.uniforms.bias.value = this.bias;
        this.colorIdentity.uniforms.scale.value = this.scale;
        renderer.setRenderTarget(null);
        renderer.getSize(this.colorIdentity.uniforms.gridSpec.value);
        renderer.render(this.colorIdentity.scene, this.camera);
    },

    renderScalarR: function(renderer, slab) {
        this.colorScalarR.uniforms.slab.value = slab.state.texture;
        this.colorScalarR.uniforms.bias.value = this.bias;
        this.colorScalarR.uniforms.scale.value = this.scale;
        this.colorScalarR.uniforms.minColor.value = this.minColor;
        this.colorScalarR.uniforms.maxColor.value = this.maxColor;
        renderer.setRenderTarget(null);
        renderer.getSize(this.colorScalarR.uniforms.gridSpec.value);
        renderer.render(this.colorScalarR.scene, this.camera);
    },

    renderScalarG: function(renderer, slab) {
        this.colorScalarG.uniforms.slab.value = slab.state.texture;
        this.colorScalarG.uniforms.bias.value = this.bias;
        this.colorScalarG.uniforms.scale.value = this.scale;
        this.colorScalarG.uniforms.minColor.value = this.minColor;
        this.colorScalarG.uniforms.maxColor.value = this.maxColor;
        renderer.setRenderTarget(null);
        renderer.getSize(this.colorScalarG.uniforms.gridSpec.value);
        renderer.render(this.colorScalarG.scene, this.camera);
    }
}