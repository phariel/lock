var fs = require("fs");
var when = require("when");
var pt = require("prompt");
var lock = require("./lock-lib/lock-basic");

var PATH_ORIGIN = "./file_origin/";
var PATH_LOCK = "./file_lock/";
var PATH_UNLOCK = "./file_unlock/";
var CHOOSE_STEP = "Choose your operation: 1.Lock 2.Unlock";
var COMPLETE_LOCK = "Lock complete!";
var COMPLETE_UNLOCK = "Unlock complete!";


function getFileList(path) {
	return when.promise(function (resolve, reject) {
		fs.readdir(path, function (err, files) {
			if (err) {
				reject(err);
			} else {
				resolve(files);
			}
		});
	});
}

function fileLock(file) {
	return when.promise(function (resolve, reject) {
		fs.readFile(PATH_ORIGIN + file, 'utf8', function (err, data) {
			if (err) {
				reject(err);
			} else {
				console.warn(data);
				resolve(lock.lock(data));
			}
		});
	});
}

function fileUnlock(file) {
	return when.promise(function (resolve, reject) {
		fs.readFile(PATH_LOCK + file, 'utf8', function (err, data) {
			if (err) {
				reject(err);
			} else {
				console.warn(data);
				resolve(lock.unlock(data));
			}
		});
	});
}

function fileOutput(path, filename, data) {
	switch (path) {
		case PATH_LOCK:
			filename += ".lock";
			break;
		case PATH_UNLOCK:
			if (filename.indexOf(".lock") > -1) {
				filename = filename.split(".lock")[0];
			}
	}
	return when.promise(function (resolve, reject) {
		fs.writeFile(path + filename, data, 'utf8', function (err) {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});

}

function lock() {
	getFileList(PATH_ORIGIN).then(function (files) {
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
			fileLock(filename).then(function (data) {
				fileOutput(PATH_LOCK, filename, data).then(function () {
					console.warn(COMPLETE_LOCK);
				});
			});
		});
	});
}

function unlock() {
	getFileList(PATH_LOCK).then(function (files) {
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
			fileUnlock(filename).then(function (data) {
				fileOutput(PATH_UNLOCK, filename, data).then(function () {
					console.warn(COMPLETE_UNLOCK);
				});
			});
		});
	});
}

function main() {
	var data = {
		properties: {
			step: {
				message: CHOOSE_STEP,
				required: true
			}
		}
	};

	pt.start();
	pt.get(data, function (err, result) {
		if (err) return;
		switch (result.step) {
			case "1":
				lock();
				break;
			case "2":
				unlock();
				break;
		}
	});
}

main();


