module.exports = {
    usage: usage,
    undefinedFlag: undefinedFlag,
	errorMessage: errorMessage,
	fileExists: fileExists,
	cannotDownload: cannotDownload,
	incompleteURL: incompleteURL,
	unexpectedServerResponse: unexpectedServerResponse,
	checkIfValidUrl: checkIfValidUrl,
	gettingToWorkMessage: gettingToWorkMessage,
	finishedMessage: finishedMessage,
	grabFileName: grabFileName,
	getFileSize: getFileSize,
	fileTooSmall: fileTooSmall,
	createFile: createFile,
	writeToFile: writeToFile,
	appendToFile: appendToFile
}

function usage (filename) {
	console.log("Usage: " + filename + " [OPTIONS] url");
	console.log("  -o string");
	console.log("        Write output to <file> instead of default");
	console.log("  -parallel");
	console.log("        Download chunks in parallel instead of sequentally");
}

function undefinedFlag (flag, filename) {
	console.log("flag provided but not defined: " + flag);
	usage(filename);
}

function errorMessage (message) {
	console.log("[ERROR] " + message);
}

function fileExists (filename) {
	errorMessage("File '" + filename + "' exists");
}

function cannotDownload () {
	errorMessage("Could not write file ''");
}

function incompleteURL (url) {
	errorMessage("Incomplete url: " + url);
}

function unexpectedServerResponse (response) {
	errorMessage("Unexpected response from server: " + response);
}

function fileTooSmall () {
	errorMessage("Please download a bigger file.");
}

function checkIfValidUrl (str) {
	//this algorithm is borrowed from the second highest rated response at https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
	var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
		'(\\#[-a-z\\d_]*)?$','i'); // fragment locator
	return pattern.test(str);
}

function gettingToWorkMessage (url, filename, numberOfChunks = 4) {
	console.log("Downloading first " + numberOfChunks + " chunks of '" + url + "' to '" + filename + "'");
}

function finishedMessage () {
	console.log("....done");
}

function grabFileName (url) {
	var result;
	var fileNameEndingIndex = url.length - 1;
	var fileNameStartingIndex = fileNameEndingIndex;
	while (url[fileNameStartingIndex] !== '/') {
		fileNameStartingIndex--;
	}
	result = url.substr(fileNameStartingIndex + 1, fileNameEndingIndex - fileNameStartingIndex);
	return result;
}

function getFileSize(url, callback) {
	var XMLHttpRequest = require('xhr2');
	//this algorithm is borrowed from the highest rated response at https://stackoverflow.com/questions/17416274/ajax-get-size-of-file-before-downloading
    var xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, true); // Notice "HEAD" instead of "GET",
                                 //  to get only the header
    xhr.onreadystatechange = function() {
        if (this.readyState == this.DONE) {
            callback(parseInt(xhr.getResponseHeader("Content-Length")));
        }
    };
    xhr.send();
}

function createFile (filename, failedCallback) {
	var fs = require('fs');
	if (fs.existsSync(filename)) {
		failedCallback();
	}
	fs.writeFileSync(filename, ""); //create file
}

function writeToFile (filename, content, callBack = () => {}) {
	var fs = require('fs');
	fs.writeFile(filename, content, function(err) {
		if(err) {
			console.log(err);
		} else {
			callBack();
		}
	});
}

function appendToFile (filename, content, callBack = () => {}) {
	var fs = require('fs');
	fs.appendFile(filename, content, function(err) {
		if(err) {
			console.log(err);
		} else {
			callBack();
		}
	});
}