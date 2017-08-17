/**
 * Created by likaituan on 17/08/2017.
 */

// 读取配置并启动
exports.start = function (app, express, ops) {
	if (typeof ops=='string') {
		ops = {path: ops};
	}
	app.use(ops.path, express.static(`./node_modules/caad/docs`));
	app.use(`${ops.path}/caad-data.json`, express.static(`./caad-data.json`));
};