module.exports = {
	get: parallelGet,
}

var Promise = require('promise');
var writeToFile = require('./utility.js').writeToFile;
var appendToFile = require('./utility.js').appendToFile;
var finishedMessage = require('./utility.js').finishedMessage;
var unexpectedServerResponse = require('./utility.js').unexpectedServerResponse;
var XMLHttpRequest = require('xhr2');

function parallelGet (filename, url, chunkRanges) {
	
	console.log(filename);
	console.log(url);
	console.log(chunkRanges);
	
	function downloadChunk (filename, url, chunkRange) {
		return new Promise(function (fulfill) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (e) {
				if (xhr.readyState === 4) {
					if (xhr.status !== 206) {
						unexpectedServerResponse(xhr.status);
					} else {
						fulfill(xhr.responseText);
					}
				}
			}
			xhr.open('GET', url, true); 
			xhr.setRequestHeader('Range', 'bytes='+chunkRange[0]+'-'+chunkRange[1]);
			xhr.overrideMimeType("text\/plain; charset=x-user-defined");
			xhr.send();
		});
	}
	
	var chunkArray = [];
	for (var i = 0; i < chunkRanges.length; i++) {
		chunkArray.push(downloadChunk(filename, url, chunkRanges[i]));
	}
	
	Promise.all(chunkArray).then(function (result) {
		appendToFile(filename, result[0], () => {});
		appendToFile(filename, result[1], () => {});
		appendToFile(filename, result[2], () => {});
		appendToFile(filename, result[3], () => {finishedMessage();});
	})
}