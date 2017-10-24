/* 
	Author: Alex Sin Hang Wu
*/

module.exports = {
	//messages
    usage: usage,
    undefinedFlag: undefinedFlag,
	fileExists: fileExists,
	cannotDownload: cannotDownload,
	incompleteURL: incompleteURL,
	unexpectedServerResponse: unexpectedServerResponse,
	gettingToWorkMessage: gettingToWorkMessage,
	finishedMessage: finishedMessage,
	grabFileName: grabFileName,
	fileTooSmall: fileTooSmall,
	parallelDownloadOnly: parallelDownloadOnly,
	automaticFileSizeReduction: automaticFileSizeReduction,
	chunkNumberError: chunkNumberError,
	downloadSizeError: downloadSizeError,
	
	//borrowed algorithms
	checkIfValidUrl: checkIfValidUrl,
	getFileSize: getFileSize,
	
	//file operations
	createFile: createFile,
	writeToFile: writeToFile,
	appendToFile: appendToFile,
	deleteFile: deleteFile,
}

function usage (filename) {
	console.log("Usage: " + filename + " [OPTIONS] url");
	console.log("  -o string");
	console.log("        Write output to <file> instead of default");
	console.log("  -parallel");
	console.log("        Download chunks in parallel instead of sequentally");
	console.log("  -chunkNumber int");
	console.log("        Specify the number of chunks to use. The default number is 4. Must also pass in the '-parallel' flag");
	console.log("  -downloadSize int");
	console.log("        Specify the total size of the file to be downloaded");
}

function undefinedFlag (flag, filename) {
	console.log("flag provided but not defined: " + flag);
	usage(filename);
}

function warningMessage (message) {
	console.log("[WARNING] " + message);
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

function parallelDownloadOnly () {
	errorMessage("To change the number of chunks, you must also pass in a '-parallel' flag.");
}

function automaticFileSizeReduction () {
	warningMessage("The size to be downloaded is smaller than the one listed in the current settings. The size will be automatically readjusted.");
}

function chunkNumberError () {
	errorMessage("When using the '-chunkNumber' flag, you must enter in a number greater than 0");
}

function downloadSizeError () {
	errorMessage("When using the '-downloadSize' flag, you must enter in a number greater than 0");
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
	/*
	var request = require('request');
	request({
		url: url,
		method: "HEAD",
	}, (err, result) => {
		var sizeInBytes = result.headers['content-length'];
		callback(parseInt(sizeInBytes));
	});
	*/
	const http = require('http');
	const URL = require('url');
	const myURL = URL.parse(url);
	var options = {
		hostname: myURL.hostname,
		port: myURL.port,
		path: myURL.pathname,
		method: 'HEAD',
	};
	http.get(options, response => {
		var sizeInBytes = parseInt(response.headers['content-length']);
		callback(sizeInBytes);
	});
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
	fs.writeFile(filename, content, (err) => {
		if(err) {
			console.log(err);
		} else {
			callBack();
		}
	});
}

function appendToFile (filename, content, callBack = () => {}) {
	var fs = require('fs');
	fs.appendFileSync(filename, content);
	callBack();
}

function deleteFile (filename, callBack = () => {}) {
	var fs = require('fs');
	fs.unlink(destination, (err) => {
		if(err) {
			console.log(err);
		} else {
			callBack();
		}
	});
}