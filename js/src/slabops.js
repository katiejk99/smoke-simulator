//const { TetrahedronGeometry, GridHelper } = require("../ext/three");

// Slab class
function Slab(width, height, fs, uniforms) {
    this.name = name;
    this.slab = new THREE.WebGLRenderTarget(width, height, {depthBuffer: false, stencilBuffer: false, type: THREE.FloatType});
    this.temp = this.slab.clone();

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
    this.temp = this.slab;
    this.slab = tmp;
}

Slab.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);


var SLABOPS_SHADER_NAMES = {advect: 'test.fs'};

var SLABOPS_REQUIRED_SHADER_FILES = [SLABOPS_SHADER_NAMES.advect];

// Add default values?
var SlabOps = function(shaderFiles, renderer, slabWidth, slabHeight) {
    this.renderer = renderer;
    // Create the uniforms for each slab
    // We just set the types for the uniforms for now. We'll update the values during step()
    this.uniforms = {
        advect: {
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
        }
    };

    // Create the slabs
    this.slabs = {
        advect: new Slab(slabWidth, slabHeight, shaderFiles.get(SLABOPS_SHADER_NAMES.advect), this.uniforms.advect)
    };
}

SlabOps.prototype = {
    constructor: SlabOps,

    step: function() {
        this.advect(this.slabs.advect);
    },

    advect: function(slabToAdvect) {
        // Advection
        this.uniforms.advect.velocity.value = this.slabs.advect.slab.texture;
        this.uniforms.advect.advected.value = slabToAdvect.slab.texture;
        this.renderer.setRenderTarget(slabToAdvect.temp);
        //this.renderer.setRenderTarget(null);
        this.renderer.render(this.slabs.advect.scene, Slab.camera);
        slabToAdvect.swap();
    }

    
}


