/**
 * Created by likaituan on 27/04/2017.
 */

var getNumber = function(count) {
    return new Array(count).fill(1).join('');
};

var getString = function(count) {
    return new Array(count).fill('a').join('');
};

var getData = function(dataType, range){
    range = range.split('-')[0];
    if (dataType === 'Number') {
        return getNumber(+range);
    }
    if (dataType === 'String') {
        return getString(+range);
    }
};

// 模拟数据
let simulateDataList = {
	email: '1@qq.com',
	password: '123456',
	version: '1.0',

	platform: 'android',
};

var getSimulate = function(dataType, range, key, defaultValue) {
    if (defaultValue) {
        return defaultValue;
    }
    if (dataType === 'Date') {
        return new Date().toISOString().split('T')[0];
    }
    if (range) {
        if (/\[(.+?)\]\-\[(.+?)\]/.test(range)) {
            return getData(dataType, RegExp.$1) + '-' + getData(dataType, RegExp.$2);
        }
        if (/\{(.+?)(,.+)?\}/.test(range)) {
            return RegExp.$1;
        }
        return getData(dataType, range);
    }
    return simulateDataList[key] || '';
};
