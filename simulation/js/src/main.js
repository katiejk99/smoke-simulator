

/*var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( 1000, 1000);
document.body.appendChild( renderer.domElement );
renderer.domElement.style.width = window.innerWidth;
renderer.domElement.style.height = window.innerHeight;
var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;
var tmp_w = 1000;
var tmp_h = 1000;

var animate = function () {
    requestAnimationFrame( animate );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
};

animate();*/

// Load a list of files in a given path. Executes `callback` upon completion with the map of file names to text as an argument
function loadFiles(path, fileNames, callback) {
    var files = new Map();
    var filesToLoad = fileNames.length;
    if (filesToLoad === 0) {
        callback(filesToLoad);
    }
    for (var i = 0; i < fileNames.length; i += 1) {
        var name = fileNames[i];
        var url = path + '/' + name;
        (function(fileName) {
            var fr = new XMLHttpRequest();
            fr.open("GET", url, true);
            fr.onreadystatechange = function() {
                if (fr.readyState === XMLHttpRequest.DONE) {
                    if (fr.status === 200 || fr.status === 0) {
                        files.set(fileName, fr.responseText);
                    }
                    filesToLoad -= 1;
                    if (filesToLoad === 0) {
                        callback(files);
                    }
                }
            }
            fr.send();
        })(name);
    }
}



function init(loadedFiles) {
    // Create Renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create SlabOps, Colorizer
    var slabOp = new SlabOps(loadedFiles, renderer, 512, 256); // FIXME: grid size
    //renderer.setSize(256, 256, false);
    var colorizer = new Colorizer(loadedFiles, Slab.camera, Slab.defaultGeometry);
    var mouseHandler = new MouseHandler();

    // Default values
    var slabParams = {
        ink: 'Ink',
        advect: 'Velocity',
        density: 'Density',
        temperature: 'Temperature',
        divergence: 'Divergence',
        pressure: 'Pressure'
    };
    var guiParams = {
        'Slab': slabParams.ink,
        'Radius': 10,
        inkGuiParams: {
            'Ink Color': '#FF7F00'
        },
        temperatureGuiParams: {
            "Rel. Temp": 0.3,
            'Min. Color': '#007FFF',
            'Max. Color': '#FF7F00'
        },
        densityGuiParams: {
            "Rel. Density": 0.2,
            'Min. Color': '#000000',
            'Max. Color': '#FFFFFF'
        },
        pressureGuiParams: {
            "Num. Iterations": slabOp.numPressureIterations,
            'Min. Color': '#000000',
            'Max. Color': '#FFFFFF'
        }
    };

    // Init GUI
    var gui = new dat.GUI();
    var slabController = gui.add(guiParams, "Slab", [slabParams.ink, slabParams.density, slabParams.temperature, slabParams.advect, slabParams.divergence, slabParams.pressure]);
    gui.add(guiParams, "Radius", 1, 100, 1);
    gui.addFolder("Ink").addColor(guiParams.inkGuiParams, 'Ink Color');
    var temperatureGui = gui.addFolder("Temperature");
    temperatureGui.add(guiParams.temperatureGuiParams, "Rel. Temp", -1, 1, 0.05);
    temperatureGui.addColor(guiParams.temperatureGuiParams, "Min. Color").onChange(function() {updateColorizer()});
    temperatureGui.addColor(guiParams.temperatureGuiParams, "Max. Color").onChange(function() {updateColorizer()});
    var densityGui = gui.addFolder("Density");
    densityGui.add(guiParams.densityGuiParams, "Rel. Density", -1, 1, 0.05);
    densityGui.addColor(guiParams.densityGuiParams, "Min. Color").onChange(function() {updateColorizer()});
    densityGui.addColor(guiParams.densityGuiParams, "Max. Color").onChange(function() {updateColorizer()});
    var pressureGui = gui.addFolder("Pressure");
    pressureGui.add(guiParams.pressureGuiParams, "Num. Iterations", 0, 80, 1).onChange(function() {slabOp.numPressureIterations = guiParams.pressureGuiParams['Num. Iterations']});
    pressureGui.addColor(guiParams.pressureGuiParams, "Min. Color").onChange(function() {updateColorizer()});
    pressureGui.addColor(guiParams.pressureGuiParams, "Max. Color").onChange(function() {updateColorizer()});


    var colorizerRenderFunction = null;
    var updateColorizer = function() {
        switch(slabController.getValue()) {
            case slabParams.ink:
                colorizer.setRange(0, 1);
                colorizerRenderFunction = function(renderer) {
                    return colorizer.renderIdentity(renderer, slabOp.ink.slab);
                }
                break;
            case slabParams.density:
                colorizer.setColorRange(guiParams.densityGuiParams['Min. Color'], guiParams.densityGuiParams['Max. Color']);
                colorizer.setRange(-2, 2);
                colorizerRenderFunction = function(renderer) {
                    return colorizer.renderScalarR(renderer, slabOp.buoyancy.slab);
                }
                break;
            case slabParams.temperature:
                colorizer.setColorRange(guiParams.temperatureGuiParams['Min. Color'], guiParams.temperatureGuiParams['Max. Color']);
                colorizer.setRange(-2, 2);
                colorizerRenderFunction = function(renderer) {
                    return colorizer.renderScalarG(renderer, slabOp.buoyancy.slab);
                }
                break;
            case slabParams.advect:
                colorizer.setRange(0, 5);
                colorizerRenderFunction = function(renderer) {
                    return colorizer.render2D(renderer, slabOp.advect.slab);
                }
                break;
            case slabParams.divergence:
                // Set color range
                colorizer.setRange(-5, 5);
                colorizerRenderFunction = function(renderer) {
                    return colorizer.renderScalarR(renderer, slabOp.divergence.slab);
                }
            break;
            case slabParams.pressure:
                // Set color range
                colorizer.setRange(-3, 3);
                colorizerRenderFunction = function(renderer) {
                    return colorizer.renderScalarR(renderer, slabOp.pressure.slab);
                }
            break;
        }
    }
    updateColorizer();
    slabController.onChange(updateColorizer);


    var animate = function() {
        requestAnimationFrame(animate);
        if (mouseHandler.leftClick) {
            var splatPosition = mouseHandler.position.clone();
            splatPosition.x = splatPosition.x / renderer.domElement.clientWidth - 1;
            splatPosition.y = splatPosition.y / renderer.domElement.clientHeight * -1 + 1;
            // splatPosition.y *= -1;
            // Add splats
            var radius = guiParams["Radius"] / 100;
            var inkColor = new THREE.Color(guiParams.inkGuiParams['Ink Color']);
            slabOp.splatSlab(slabOp.buoyancy.slab, splatPosition, new THREE.Vector3(guiParams.densityGuiParams['Rel. Density'], guiParams.temperatureGuiParams["Rel. Temp"], 0), radius);
            slabOp.splatSlab(slabOp.ink.slab, splatPosition, new THREE.Vector3(inkColor.r, inkColor.g, inkColor.b), radius);
        }
        slabOp.step();
        colorizerRenderFunction(renderer);
        //colorizer.renderIdentity(renderer, slabOp.ink.slab);
        //colorizer.render2D(renderer, slabOp.advect.slab);
    }
    animate();
}

loadFiles('shaders', SLABOPS_REQUIRED_SHADER_FILES.concat(COLOR_REQUIRED_SHADER_FILES), init);
