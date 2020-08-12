
// Load a list of files in a given path. Holds until all files are loaded.
// Returns a map of fileNames to their loaded texts.
function loadFiles(path, fileNames) {
    var files = new Map();
    var filesToLoad = fileNames.length;
    for (var i = 0; i < fileNames.length; i += 1) {
        var name = fileNames[i];
        var url = path + '/' + name;
        var fr = new FileReader();
        fr.onload = function() {
            files[name] = fr.result;
            filesToLoad -= 1;
        }
        fr.readAsText(url);
    }
    while (filesToLoad > 0) {}
    return files;
}