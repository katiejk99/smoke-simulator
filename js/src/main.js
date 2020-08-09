

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
        (function() {
            var fr = new XMLHttpRequest();
            fr.open("GET", url, true);
            fr.onreadystatechange = function() {
                if (fr.readyState === XMLHttpRequest.DONE) {
                    if (fr.status === 200 || fr.status === 0) {
                        files.set(name, fr.responseText);
                    }
                    filesToLoad -= 1;
                    if (filesToLoad === 0) {
                        callback(files);
                    }
                }
            }
            fr.send();
        })();
    }
}

function init(loadedFiles) {
    var slabOp = new SlabOps(loadedFiles);
    console.log(slabOp.advect);
}

loadFiles('shaders', REQUIRED_SHADER_FILES, init);