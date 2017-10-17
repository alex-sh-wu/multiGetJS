module.exports = {
	get: serialGet,
}

var writeToFile = require('./utility.js').writeToFile;
var appendToFile = require('./utility.js').appendToFile;
var finishedMessage = require('./utility.js').finishedMessage;
var unexpectedServerResponse = require('./utility.js').unexpectedServerResponse;
var XMLHttpRequest = require('xhr2');

//unfortunately, synchronous GET's were not supported by this library, so I had to nest asynchronous calls

function serialGet (filename, url, chunkRanges) {
	console.log("serial");
	console.log(filename);
	console.log(url);
	console.log(chunkRanges);

	var xhr3 = new XMLHttpRequest();
	xhr3.onreadystatechange = function (e) {
		if (xhr3.readyState === 4) {
			if (xhr3.status !== 206) {
				unexpectedServerResponse(xhr3.status);
			} else {
				appendToFile(filename, xhr3.responseText, () => {finishedMessage();});
			}
		}
	}
	xhr3.open('GET', url, true); 
	xhr3.setRequestHeader('Range', 'bytes='+chunkRanges[3][0]+'-'+chunkRanges[3][1]);
	xhr3.overrideMimeType("text\/plain; charset=x-user-defined");

	var xhr2 = new XMLHttpRequest();
	xhr2.onreadystatechange = function (e) {
		if (xhr2.readyState === 4) {
			if (xhr2.status !== 206) {
				unexpectedServerResponse(xhr2.status);
			} else {
				appendToFile(filename, xhr2.responseText, () => {xhr3.send();});
			}
		}
	}
	xhr2.open('GET', url, true);
	xhr2.setRequestHeader('Range', 'bytes='+chunkRanges[2][0]+'-'+chunkRanges[2][1]);
	xhr2.overrideMimeType("text\/plain; charset=x-user-defined");

	var xhr1 = new XMLHttpRequest();
	xhr1.onreadystatechange = function (e) {
		if (xhr1.readyState === 4) {
			if (xhr1.status !== 206) {
				unexpectedServerResponse(xhr1.status);
			} else {
				appendToFile(filename, xhr1.responseText, () => {xhr2.send();});
			}
		}
	}
	xhr1.open('GET', url, true);
	xhr1.setRequestHeader('Range', 'bytes='+chunkRanges[1][0]+'-'+chunkRanges[1][1]);
	xhr1.overrideMimeType("text\/plain; charset=x-user-defined");

	var xhr0 = new XMLHttpRequest();
	xhr0.onreadystatechange = function (e) {
		if (xhr0.readyState === 4) {
			if (xhr0.status !== 206) {
				unexpectedServerResponse(xhr0.status);
			} else {
				appendToFile(filename, xhr0.responseText, () => {xhr1.send();});
				
			}
		}
	}
	xhr0.open('GET', url, true);
	xhr0.setRequestHeader('Range', 'bytes='+chunkRanges[0][0]+'-'+chunkRanges[0][1]);
	xhr0.overrideMimeType("text\/plain; charset=x-user-defined");
	xhr0.send();

}