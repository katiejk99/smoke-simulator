//const { TetrahedronGeometry, GridHelper } = require("../ext/three");

// Slab class
function Slab(width, height, fs, uniforms) {
    this.state = new THREE.WebGLRenderTarget(width, height, {
        depthBuffer: false,
        stencilBuffer: false,
        type: THREE.FloatType // This is necessary! If left to the default UnsignedByteBuffer, the texture will zero any negative fragment values.
    });
    this.temp = this.state.clone();

    // Create the environment for the slab
    var geometry = new THREE.PlaneBufferGeometry(2 * (width - 2) / width, 2 * (height - 2) / height); // Plane is almost 2x2, we make it slightly smaller for boundary conditions
    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: fs,
        // We're dealing with 2D images, so we don't need to worry about depth.
        // This is not strictly necessary, but it saves computation time.
        depthWrite: false,
        depthTest: false,
        // Blending option. Leaving this to default shouldn't change anything, but turning it off should save computation time.
        blending: THREE.NoBlending
    });

    // Create the scene and add the the plane
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.Mesh(geometry, material));
}

Slab.prototype.swap = function () {
    var tmp = this.temp;
    this.temp = this.state;
    this.state = tmp;
}

Slab.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

Slab.defaultGeometry = new THREE.PlaneBufferGeometry(2, 2);


var SLABOPS_SHADER_NAMES = {
    advect: 'Advection.fs',
    divergence: 'Divergence.fs',
    pressure: 'JacobiVectors.fs',
    gradient: 'Gradient.fs',
    splat: 'splat.fs',
    buoyancy: 'buoyancy.fs',
    copy: 'sampleRGB.fs'
};

var SLABOPS_REQUIRED_SHADER_FILES = [
    SLABOPS_SHADER_NAMES.advect,
    SLABOPS_SHADER_NAMES.divergence,
    SLABOPS_SHADER_NAMES.pressure,
    SLABOPS_SHADER_NAMES.gradient,
    SLABOPS_SHADER_NAMES.splat,
    SLABOPS_SHADER_NAMES.buoyancy,
    SLABOPS_SHADER_NAMES.copy
];

// Add default values?
var SlabOps = function(shaderFiles, renderer, slabWidth, slabHeight) {
    this.renderer = renderer;
    this.slabSize = {width: slabWidth, height: slabHeight};
    this.gridScale = 1;
    this.numPressureIterations = 30;
    var gridSpecValue = new THREE.Vector2(this.slabSize.width, this.slabSize.height);


    // Create the uniform and slab object for each slab type
    // Advection
    this.advect = {};
    this.advect.uniforms = {
        velocity: {
            type: 't'
        },
        advected: {
            type: 't'
        },
        gridSpec: {
            type: 'v2',
            value: gridSpecValue
        },
        gridScale: {
            type: 'f',
            value: this.gridScale
        },
        time: {
            type: 'f',
            value: 1
        },
        dissipation: {
            type: 'f',
            value: 1
        }
    };

    this.advect.slab =  new Slab(this.slabSize.width, this.slabSize.height, shaderFiles.get(SLABOPS_SHADER_NAMES.advect), this.advect.uniforms);

    // Divergence
    this.divergence = {};
    this.divergence.uniforms = {
        w: {
            type: 't'
        },
        gridSpec: {
            type: 'v2',
            value: gridSpecValue
        },
        gridScale: {
            type: 'f',
            value: this.gridScale
        }
    };

    this.divergence.slab = new Slab(this.slabSize.width, this.slabSize.height, shaderFiles.get(SLABOPS_SHADER_NAMES.divergence), this.divergence.uniforms);

    // Pressure
    this.pressure = {};
    this.pressure.uniforms = {
        x: {
            type: 't'
        },
        b: {
            type: 't'
        },
        gridSpec: {
            type: 'v2',
            value: gridSpecValue
        },
        alpha: {
            type: 'f',
            value: -this.gridScale * this.gridScale
        },
        beta: {
            type: 'f',
            value: 4
        }
    };

    this.pressure.slab = new Slab(this.slabSize.width, this.slabSize.height, shaderFiles.get(SLABOPS_SHADER_NAMES.pressure), this.pressure.uniforms);

    // Gradient
    this.gradient = {};
    this.gradient.uniforms = {
        p: {
            type: 't'
        },
        w: {
            type: 't'
        },
        gridSpec: {
            type: 'v2',
            value: gridSpecValue
        },
        gridScale: {
            type: 'f',
            value: this.gridScale
        }
    };

    this.gradient.slab = new Slab(this.slabSize.width, this.slabSize.height, shaderFiles.get(SLABOPS_SHADER_NAMES.gradient), this.gradient.uniforms);

    // Buoyancy = Density + Temperature
    this.buoyancy = {};
    this.buoyancy.uniforms = {
        v: {
            type: 't'
        },
        b: {
            type: 't'
        },
        gridSpec: {
            type: 'v2',
            value: gridSpecValue
        },
        densityScale: {
            type: 'f',
            value: 1
        },
        tempScale: {
            type: 'f',
            value: 1
        },
        ambientTemp: {
            type: 'f',
            value: 0
        },
        time: {
            type: 'f',
            value: 1
        }
    }

    this.buoyancy.slab = new Slab(this.slabSize.width, this.slabSize.height, shaderFiles.get(SLABOPS_SHADER_NAMES.buoyancy), this.buoyancy.uniforms);

    // Splat
    this.splat = {};
    this.splat.uniforms = {
        slab: {
            type: 't'
        },
        gridSpec: {
            type: 'v2',
            value: gridSpecValue
        },
        splatValue: {
            type: 'v3'
        },
        center: {
            type: 'v2'
        },
        radii: {
            type: 'vec2',
        }
    }

    this.splat.slab = new Slab(this.slabSize.width, this.slabSize.height, shaderFiles.get(SLABOPS_SHADER_NAMES.splat), this.splat.uniforms);

    // Ink
    this.ink = {};
    this.ink.uniforms = {
        slab: {
            type: 't'
        },
        gridSpec: {
            type: 'v2',
            value: gridSpecValue
        },
        bias: {
            type: 'f',
            value: 0
        },  
        scale: {
            type: 'f',
            value: 1
        }
    };
    this.ink.slab = new Slab(this.slabSize.width, this.slabSize.height, shaderFiles.get(SLABOPS_SHADER_NAMES.copy), this.ink.uniforms);
}

SlabOps.prototype = {
    constructor: SlabOps,

    step: function() {
        this.advectSlab(this.ink.slab);
        this.advectSlab(this.buoyancy.slab);
        this.advectSlab(this.advect.slab);
        this.buoySlab(this.advect.slab);
        this.projectSlab(this.advect.slab);
    },

    advectSlab: function(slab) {
        // Advection
        this.advect.uniforms.velocity.value = this.advect.slab.state.texture;
        this.advect.uniforms.advected.value = slab.state.texture;
        this.renderer.setRenderTarget(slab.temp);
        //this.renderer.setRenderTarget(null);
        this.renderer.render(this.advect.slab.scene, Slab.camera);
        slab.swap();
    },

    projectSlab: function(slab) {
        // Divergence
        this.divergence.uniforms.w.value = slab.state.texture;
        this.renderer.setRenderTarget(this.divergence.slab.temp);
        this.renderer.render(this.divergence.slab.scene, Slab.camera);
        this.divergence.slab.swap();

        // Pressure
        this.pressure.uniforms.b.value = this.divergence.slab.state.texture;
        this.renderer.setRenderTarget(this.pressure.slab.state);
        this.renderer.clear();
        for (var i = 0; i < this.numPressureIterations; i += 1) {
            this.pressure.uniforms.x.value = this.pressure.slab.state.texture;
            this.renderer.setRenderTarget(this.pressure.slab.temp);
            this.renderer.render(this.pressure.slab.scene, Slab.camera);
            this.pressure.slab.swap();
        }

        // Gradient
        this.gradient.uniforms.p.value = this.pressure.slab.state.texture;
        this.gradient.uniforms.w.value = slab.state.texture;
        this.renderer.setRenderTarget(slab.temp);
        this.renderer.render(this.gradient.slab.scene, Slab.camera);
        slab.swap();
    },

    splatSlab: function(slab, uv, value, radius) {
        this.splat.uniforms.center.value = new THREE.Vector2(this.slabSize.width * uv.x, this.slabSize.height * uv.y);
        this.splat.uniforms.splatValue.value = value;
        this.splat.uniforms.radii.value = new THREE.Vector2(radius * this.slabSize.width, radius * this.slabSize.height);
        this.splat.uniforms.slab.value = slab.state.texture;
        this.renderer.setRenderTarget(slab.temp);
        //this.renderer.setRenderTarget(null);
        this.renderer.render(this.splat.slab.scene, Slab.camera);
        slab.swap();
    },

    buoySlab: function(slab) {
        this.buoyancy.uniforms.v.value = slab.state.texture;
        this.buoyancy.uniforms.b.value = this.buoyancy.slab.state.texture;
        this.renderer.setRenderTarget(slab.temp);
        this.renderer.render(this.buoyancy.slab.scene, Slab.camera);
        slab.swap();
    }

    
}


