const { TetrahedronGeometry } = require("../ext/three");

// Slab class
function Slab(width, height, options) {
    this.name = name;
    this.slab = new THREE.WebGLRenderTarget(width, height, options);
    this.temp = this.slab.clone();
}

Slab.prototype.swap = function () {
    var tmp = this.temp;
    this.temp = this.slab;
    this.slab = tmp;
}


var SHADER_NAMES = {advect: "Advection.fs"};

var REQUIRED_SHADER_FILES = [SHADER_NAMES.advect];

// Add default values?
var SlabOps = function(shaderFiles) {
    this.advect = shaderFiles.get(SHADER_NAMES.advect);
}

SlabOps.prototype = {
    constructor: SlabOps,
    step: function(renderer) {
    }
}


