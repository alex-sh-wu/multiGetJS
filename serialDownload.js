/* 
	Author: Alex Sin Hang Wu
*/

module.exports = {
	get: serialGet,
}

var appendToFile = require('./utility.js').appendToFile;
var deleteFile = require('./utility.js').deleteFile;
var finishedMessage = require('./utility.js').finishedMessage;
var unexpectedServerResponse = require('./utility.js').unexpectedServerResponse;
const request = require('sync-request');

function serialGet (filename, url, chunkRanges) {
	var success = true;
	for (var i = 0; i < chunkRanges.length; i++) {
		var response = request('GET', url, {
			headers: {
				Range: 'bytes='+chunkRanges[i][0]+'-'+chunkRanges[i][1],
			}
		});
		if (response.statusCode == 200 || response.statusCode == 206) {
			appendToFile(filename, response.getBody());
		} else {
			success = false;
			unexpectedServerResponse(response.statusCode);
			deleteFile(filename);
		}
	}
	if (success) {
		finishedMessage();
	}
}