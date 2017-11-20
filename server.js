/**
 * Created by likaituan on 17/08/2017.
 */
var proxy = require('http-proxy-middleware');

let setProxy = function (app, ops) {
	let options = {
		target: ops.proxyTo
	};
	let proxyService = proxy(ops.serverPath, options);
	app.use(proxyService);
};


// 读取配置并启动
exports.start = function (app, express, ops) {
	if (typeof ops=='string') {
		ops = {webPath: ops};
	}
	let webPath = ops.webPath || '';
	app.use(`${webPath}/docs`, express.static(`${__dirname}/docs`));
	app.use(`${webPath}/test`, express.static(`${__dirname}/test`));
	app.use(`${webPath}/node_modules`, express.static(`./node_modules`));
	app.use(`${webPath}/config`, express.static(`./config`));
	app.use(`${webPath}/plugins`, express.static(`./plugins`));

	setProxy(app, ops);

	app.listen(ops.port, err => {
		var uri = 'http://localhost:' + ops.port;
		if (err) {
			console.log(err);
		} else {
			console.log(`Node Is RunAt local env: ${uri}`);
		}
	});
};