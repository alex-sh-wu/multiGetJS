/* 
	Author: Alex Sin Hang Wu
*/

module.exports = {
	get: parallelGet,
}

var Promise = require('promise');
var appendToFile = require('./utility.js').appendToFile;
var deleteFile = require('./utility.js').deleteFile;
var finishedMessage = require('./utility.js').finishedMessage;
var unexpectedServerResponse = require('./utility.js').unexpectedServerResponse;
const http = require('http');
const URL = require('url');

function parallelGet (filename, url, chunkRanges) {	
	function downloadChunk (filename, url, chunkRange) {
		return new Promise(function (fulfill) {
			const myURL = URL.parse(url);
			var options = {
				hostname: myURL.hostname,
				port: myURL.port,
				path: myURL.pathname,
				method: 'GET',
				headers: {
					range: 'bytes='+chunkRange[0]+'-'+chunkRange[1],
				}
			};
			http.get(options, (response) => {
				// write to file while we receive data
				var chunks = [];
				var chunksLength = 0;
				response.on("data", function(chunk) {
					chunks.push(chunk);
					chunksLength += Buffer.byteLength(chunk);
				});
				
				response.on("end", function() {
					chunks = Buffer.concat(chunks, chunksLength);
					fulfill(chunks);
				});
			}).on('error', function(err) { // Handle errors
				deleteFile(filename);
				unexpectedServerResponse(err.message);
			});
		});
	}
	var chunkArray = [];
	for (var i = 0; i < chunkRanges.length; i++) {
		chunkArray.push(downloadChunk(filename, url, chunkRanges[i]));
	}
	
	Promise.all(chunkArray).then(function (result) { //waits for all the chunks to be downloaded, and then it writes to the files
		for (var i = 0; i < chunkArray.length; i++) {
			if (i + 1 === chunkArray.length) {
				appendToFile(filename, result[i], () => {finishedMessage();});
			} else {
				appendToFile(filename, result[i]);
			}
		}
	})
}