var fs = require('fs');
var routers = {};

exports.prefixPath = '';

// 读取配置并启动
exports.start = function (app, ops) {
	this.prefixPath = ops.forward;
	this.readPath(ops.dir, ops.path);
	app.all(`${ops.path}/*`, this.runTime);
};

// 递归读取路径
exports.readPath = function (localPath, webPath) {
	fs.readdirSync(localPath).forEach(file => {
		var newFile = `${localPath}/${file}`;
		var isDir = fs.statSync(newFile).isDirectory();
		if (isDir) {
			return this.readPath(newFile, `${webPath}/${file}`);
		}
		var methods = require(newFile);
		Object.entries(methods).forEach( ([key, fun]) =>{
			routers[key] = fun;
		});
	});
};

// 运行时
exports.runTime = function (req, res) {
	var key = req.params[0];
	var fun = routers[key];
	if (!fun) {
		return res.status(404).end('no this router!');
	}
	var params = req.query;
	var session = {};
	var ops = {};
	var o = fun(params, session, req, res, ops);
	if (o.forward) {
		var url = `${exports.prefixPath}${o.forward.url}`;
		console.log(`forward to ${url} by ${o.forward.type || 'get'}`);
		if (o.success) {
			if (typeof(o.success)==='function') {
				o.success('ok');
			} else {
				res.end(o.success);
			}
		}
	}
};