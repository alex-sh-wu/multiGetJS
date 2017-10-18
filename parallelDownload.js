/* 
	Author: Alex Sin Hang Wu
*/

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
	function downloadChunk (filename, url, chunkRange) {
		return new Promise(function (fulfill) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (e) {
				if (xhr.readyState === 4) {
					if (xhr.status !== 206 && xhr.status !== 200) {
						unexpectedServerResponse(xhr.status);
					} else {
						fulfill(xhr.responseText);
					}
				}
			}
			xhr.open('GET', url, true); 
			xhr.setRequestHeader('Range', 'bytes='+chunkRange[0]+'-'+chunkRange[1]);
			xhr.overrideMimeType("text\/plain; charset=x-user-defined"); //this is to ensure the data is interpreted as plaintext instead of assuming it is in utf8
			xhr.send();
		});
	}
	
	var chunkArray = [];
	for (var i = 0; i < chunkRanges.length; i++) {
		chunkArray.push(downloadChunk(filename, url, chunkRanges[i]));
	}
	
	Promise.all(chunkArray).then(function (result) {
		for (var i = 0; i < chunkArray.length; i++) {
			if (i + 1 === chunkArray.length) {
				appendToFile(filename, result[i], () => {finishedMessage();});
			} else {
				appendToFile(filename, result[i]);
			}
		}
	})
}