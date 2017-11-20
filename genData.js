/**
 * Created by likaituan on 27/04/2017.
 */
var fs = require('fs');

let genJson = function (file, list) {
	let json = require(file);
	list.forEach(item => {
		let key = item.url.split('/')[2];
		json.interfaces[key] && json.interfaces[key].methods.push(item);
	});
	return json;
};

let genJsonByFlow = function (file, list) {
	let json = require(file);
	let count = Object.values(json.interfaces).map(x=>x.methods.length).reduce((a,b)=>a+b);
	console.log(`\ntarget interface: ${count}`);
	console.log(json.interfaces);
	let isUse = {};
	Object.values(json.interfaces).forEach(stepItem => {
		stepItem.methods = stepItem.methods.map(url => {
			let item = list.filter(x => x.url == url)[0];
			if (!item) {
				console.log(`${url} is no exits!`);
				process.exit();
			}
			isUse[item.url] = true;
			return item;
		});
		stepItem.count = stepItem.methods.length;
	});
	let noUseList = list.filter(x => !isUse[x.url]);
	if (noUseList.length > 0) {
		console.log({noUseList});
		process.exit();
	}
	return json;
};

let genData = function (dir, path, list) {
	fs.readdirSync(dir).forEach(item => {
		let newDir = `${dir}/${item}`;
		let newPath = `${path}/${item.replace('.js','').replace(/\./g,'/')}`;
		let stat = fs.statSync(newDir);
		if (stat.isDirectory()) {
			return genData(newDir, newPath, list);
		}
		genItem(newDir, newPath, list);
	});
};

let enumList = {};

// 获取数据
let genItem = function (file, path, list) {
	// console.log({file});
    var code = fs.readFileSync(file).toString();

    var funRe = /\/\/\s*(.+)\nexports\.(\w+)\s*=\s*(?:async)?\s*function\s*\(.+?\)\s*\{([\s\S]+?)\n\};/g;
    code.replace(funRe, function(_, title, name, content){
	    // console.log({title, name});
        var args = [];
	    let argRe = /req(?:\.(len|bit|format|range)\(\'(.+?)\'\))?\.(?:(?:(_)?(\w+)\(\'(.+?)\'\))|(?:(_)?data\.(\w+)))(?:\s*\|\|\s*(.+?))?,?;?\s*(?:\/\/\s*(.+))?\s*$/mg;
	    let o = {};
	    let index = 0;
	    content.replace(argRe, function(_, rangeType, range, isOptional, argType, argName, isOptional2, argName2, defaultValue, argTitle){
		    // console.log({argType, argName, argName2, defaultValue, argTitle});
		    let item = {};
		    item.type = argType || 'var';
		    item.name = argName || argName2;
		    item.rangeType = rangeType;
		    item.title = argTitle || '';
		    item.defaultValue = defaultValue || '';
		    item.isRequired = !isOptional && !isOptional2 ? 'required' : 'optional';


		    if (item.rangeType === 'format') {
			    item.range = 'format: ' + range;
		    }
		    if (item.rangeType === 'len') {
			    item.range = 'len: ' + range.split(',').join(' - ')
		    }
		    if (item.rangeType === 'bit') {
			    item.range = 'bit: ' + range.split(',').join(' - ')
		    }
		    if (item.rangeType === 'range') {
			    item.range = 'range: ' + range.split(',').join(' - ')
		    }

		    if (!rangeType && item.type === 'string') {
			    item.rangeType = 'len';
			    item.range = 'len: 1-128';
		    }
		    if (!rangeType && item.type === 'boolean') {
			    item.rangeType = 'boolean';
			    item.range = 'true/false';
		    }
		    if (!rangeType && item.type === 'date') {
			    item.rangeType = 'date';
			    item.range = 'format: dd-mm-yyyyy';
		    }
		    if (!rangeType && item.type === 'enum') {
			    item.rangeType = 'enum';
			    item.range = enumList[item.name] || [];
		    }

			if (!o[item.name]) {
				args.push(item);
				o[item.name] = item;
			} else if (item.title) {
				o[item.name].title = item.title;
			}
	    });
	    //process.exit();

	    let url = `${path}/${name}`;
	    let ret = {url, title:title||'', args};
	    // 先写死
	    if (url === '/service/contract/getContract' || url === '/service/contract/getSign') {
		    ret.isBin = true;
	    }
        list.push(ret);
    });
};

let getRe = function (x) {
	let re, flag;
	let range = x.range || '';
	if (x.type === 'enum') {
		re = '(?:' + range.join('|') + ')';
	}
	if (x.type === 'boolean') {
		re = '(?:true|false)';
	}
	if (!re) {
		if (x.type === 'string') {
			flag = "\\w";
		}
		if (x.type === 'number') {
			flag = "\\d";
		}
		let [rangeType, rangeVal] = range.split(': ');
		if (rangeType === 'len') {
			re = `${flag}\{${rangeVal.replace('-',',')}\}`;
		}
	}
	return "^" + re + "$";
};

let genValidate = function (dir, list) {
	let file = `${dir}/validate-full.js`;
	let json = {};
	list.forEach(item => {
		let subItem = json[item.url] = {};
		item.args.map(x => {
			subItem[x.name] = {
				isRequired: x.isRequired === 'required',
				re: getRe(x)
			};
		});
	});
	json = JSON.stringify(json, null, 4);
	json = json.replace(/\"(\^.+?\$)\"/g, (_,x)=>new RegExp(x));
	fs.writeFileSync(file, `module.exports = ${json};`);
};

module.exports = function (ops) {
	let docsRoot = ops.docsRoot;
	let interfaceRoot = ops.interfaceRoot;
	let interfacePath = ops.interfacePath;
	enumList = require(`${interfaceRoot}/config/enum.js`);

	var list = [];
	genData(`${interfaceRoot}/interfaces`, interfacePath, list);
		console.log(`\nsource interface: ${list.length}`);
		console.log(list.map(x=>x.url).join('\n'));
	genValidate(`${interfaceRoot}/config`, list);

	let json = genJsonByFlow(`${docsRoot}/config/flow.json`, list);
	json = JSON.stringify(json, null, 4);
	fs.writeFileSync(`${docsRoot}/config/caad.json`, json);
};