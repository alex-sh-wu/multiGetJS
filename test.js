/* 
	Author: Alex Sin Hang Wu
*/

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
const defaultNumberOfChunks = 4;
const defaultDownloadSize = 4194304; //in bytes

if (process.argv.length < minParameters) {
	callAndExit(() => {utility.usage(process.argv[1]);})
}

var filename = "";
var parallel = false;
var numberOfChunks = defaultNumberOfChunks;
var size = defaultDownloadSize; //in bytes
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
		} else if (process.argv[currentParameterIndex] == "-chunkNumber") {
			if (currentParameterIndex + 1 < process.argv.length && process.argv[currentParameterIndex + 1] != "") {
				currentParameterIndex++;
				numberOfChunks = parseInt(process.argv[currentParameterIndex]);
			}
			else {
				callAndExit(() => {utility.usage(process.argv[1]);})
			}
		} else if (process.argv[currentParameterIndex] == "-downloadSize") {
			if (currentParameterIndex + 1 < process.argv.length && process.argv[currentParameterIndex + 1] != "") {
				currentParameterIndex++;
				size = parseInt(process.argv[currentParameterIndex]);
			}
			else {
				callAndExit(() => {utility.usage(process.argv[1]);})
			}
		} else {
			callAndExit(() => {utility.undefinedFlag(process.argv[currentParameterIndex], process.argv[1]);})
		}
	} else {
		break;
	}
}

if (numberOfChunks !== defaultNumberOfChunks && !parallel) {
	callAndExit(() => {utility.parallelDownloadOnly();})
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

var chunkRanges = [];

utility.getFileSize(url, function(filesize) {
	//error checking
    if (isNaN(filesize)) {
		callAndExit(() => {utility.incompleteURL(url);})
	}
	
	if (filesize < size) {
		utility.automaticFileSizeReduction();
	}
	size = Math.min(filesize, size); //readjust size in case the file size is smaller than the default size
	
	if (size < numberOfChunks) {
		callAndExit(() => {utility.fileTooSmall();})
	}
	
	//create new file
	utility.createFile(filename, () => {callAndExit(() => {utility.fileExists(filename);})}); //create the file to write in
	
	const chunkSize = Math.floor(size / numberOfChunks);
	
	for (var i = 0; i < numberOfChunks; i++) {
		if (i === 0) {
			chunkRanges.push([0, chunkSize - 1]);
		}
		else if (i + 1 === numberOfChunks) {
			chunkRanges.push([i * chunkSize, size - 1]);
		}
		else {
			chunkRanges.push([i * chunkSize, ((i + 1) * chunkSize) - 1]);
		}
	}
	
	utility.gettingToWorkMessage (url, filename, numberOfChunks);
	
	if (parallel) {
		var parallelDownload = require('./parallelDownload');
		parallelDownload.get(filename, url, chunkRanges);
	} else {
		var serialDownload = require('./serialDownload');
		serialDownload.get(filename, url, chunkRanges);
	}
});
