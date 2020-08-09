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


var SLABOPS_SHADER_NAMES = {advect: 'advect.fs', test: 'test.fs'};

var SLABOPS_REQUIRED_SHADER_FILES = [
    SLABOPS_SHADER_NAMES.advect,
    SLABOPS_SHADER_NAMES.test
];

// Add default values?
var SlabOps = function(shaderFiles, renderer, slabWidth, slabHeight) {
    this.renderer = renderer;


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
            value: new THREE.Vector2(slabWidth, slabHeight)
        },
        gridScale: {
            type: 'f',
            value: 1
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

    this.advect.slab =  new Slab(slabWidth, slabHeight, shaderFiles.get(SLABOPS_SHADER_NAMES.advect), this.advect.uniforms);

    // Test
    this.test = {};
    this.test.uniforms = {};
    this.test.slab =  new Slab(slabWidth, slabHeight, shaderFiles.get(SLABOPS_SHADER_NAMES.test), this.test.uniforms);

    this.count = 0;
}

SlabOps.prototype = {
    constructor: SlabOps,

    step: function() {
        if (this.count < 1) {
            this.count += 1;
            this.renderer.setRenderTarget(this.advect.slab.state);
            //this.renderer.setRenderTarget(null);
            this.renderer.render(this.test.slab.scene, Slab.camera);
        } 
        this.advectSlab(this.advect.slab);
    },

    advectSlab: function(slab) {
        // Advection
        this.advect.uniforms.velocity.value = this.advect.slab.state.texture;
        this.advect.uniforms.advected.value = slab.state.texture;
        this.renderer.setRenderTarget(slab.temp);
        //this.renderer.setRenderTarget(null);
        this.renderer.render(this.advect.slab.scene, Slab.camera);
        slab.swap();
    }

    
}


