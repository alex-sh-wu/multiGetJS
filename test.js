var XMLHttpRequest = require('xhr2');
var utility = require('./utility.js');

function callAndExit(callback) {
	callback();
	process.exit(-1);
}

//currently, the file will be run as 
//
//      node app.js [OPTIONS] url
//
//therefore, there must be at least 3 parameters for the program to work
const minParameters = 3; 

if (process.argv.length < minParameters) {
	callAndExit(() => {utility.usage(process.argv[1]);})
}

var filename = "";
var parallel = false;
var currentParameterIndex = minParameters - 1;

for ( ; currentParameterIndex < process.argv.length; currentParameterIndex++) {
	if (process.argv[currentParameterIndex][0] == "-") {
		if (process.argv[currentParameterIndex] == "-o") {
			if (currentParameterIndex + 1 < process.argv.length && process.argv[currentParameterIndex + 1] != "") {
				currentParameterIndex++;
				filename = process.argv[currentParameterIndex];
			}
			else {
				callAndExit(() => {utility.usage(process.argv[1]);})
			}
		} else if (process.argv[currentParameterIndex] == "-parallel") {
			parallel = true;
		} else {
			callAndExit(() => {utility.undefinedFlag(process.argv[currentParameterIndex], process.argv[1]);})
		}
	} else {
		break;
	}
}

if (currentParameterIndex + 1 !== process.argv.length) { //if the current parameter is not the last one, throw an error
	callAndExit(() => {utility.usage(process.argv[1]);})
}

const url = process.argv[currentParameterIndex];

if (!utility.checkIfValidUrl(url)) {
	callAndExit(() => {utility.incompleteURL(url);})
}

if (filename === "") {
	filename = utility.grabFileName(url);
	if (filename === "") {
		callAndExit(() => {utility.cannotDownload();})
	}
}

utility.createFile(filename, () => {callAndExit(() => {utility.fileExists(filename);})});

var size = 4194304; //in bytes
//TODO get size of file here
utility.getFileSize(url, function(size) {
	console.log(filename);
	console.log(size)
    if (size > 0) {
		
	}
});
const chunkSize = size / 4;

var chunkRanges = [];
chunkRanges.push([0, chunkSize - 1]);
chunkRanges.push([chunkSize, (2 * chunkSize) - 1]);
chunkRanges.push([2 * chunkSize, (3 * chunkSize) - 1]);
chunkRanges.push([3 * chunkSize, size - 1]);

utility.gettingToWorkMessage (url, filename);

if (parallel) {
	var parallelDownload = require('./parallelDownload');
	parallelDownload.get(filename, url, chunkRanges);
} else {
	var serialDownload = require('./serialDownload');
	serialDownload.get(filename, url, chunkRanges);
}
