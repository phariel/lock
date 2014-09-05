var fs = require("fs");
var when = require("when");
var pt = require("prompt");

var INPUT_PATH = "./input/";
var OUTPUT_PATH = "./output/";
var COMPLETE_LOCK = "Lock complete!";

function getFileList() {
	return when.promise(function (resolve, reject) {
		fs.readdir(INPUT_PATH, function (err, files) {
			if (err) {
				reject(err);
			} else {
				resolve(files);
			}
		});
	});
}

function stringToUnicode(buffer) {
	var result = "";
	for (var i = 0; i < buffer.length; i++) {
		result += "\\u" + ("000" + buffer[i].charCodeAt(0).toString(16)).substr(-4);
	}
	return result;
}

function fileToUnicode(file) {
	return when.promise(function (resolve, reject) {
		fs.readFile(INPUT_PATH + file, 'utf8', function (err, data) {
			if (err) {
				reject(err);
			} else {
				console.warn(data);
				resolve(stringToUnicode(data));
			}
		});
	});
}

function fileOutput(filename, data) {
	return when.promise(function (resolve, reject) {
		fs.writeFile(OUTPUT_PATH + filename + '.lock', data, 'utf8', function (err) {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});

}

function main() {
	getFileList().then(function (files) {
		var str = "";
		files.forEach(function (v, i) {
			str += i + 1 + '. ' + v + '\n';
		});

		var data = {
			properties: {
				file: {
					message: str,
					required: true
				}
			}
		};

		pt.start();
		pt.get(data, function (err, result) {
			if (err) return;
			var filename = files[parseInt(result.file, 10) - 1];
			fileToUnicode(filename).then(function (data) {
				fileOutput(filename, data).then(function () {
					console.warn(COMPLETE_LOCK);
				});
			});
		});
	});
}

main();


