/**
 * Created by likaituan on 27/04/2017.
 */

$(function(){
    window.log = console.log;

    // 模拟数据
    window.simulateData = function (cat, index){
        var item = data[cat].methods[index];
        var itemName = item.interfaceName;
        var form = document.forms[itemName];
        var elements = form.elements;
        item.args.forEach(arg => {
            if(elements[arg.argName]) {
                elements[arg.argName].value = getSimulate(arg.argType, arg.argRange, arg.argName, arg.argDefault);
            }
        });
    };

    // 模拟提交
    window.simulateSubmit = function (cat, index){
        var itemName = data[cat].methods[index].interfaceName;
        var form = document.forms[itemName];
        var elements = Array.from(form.elements);
        var params = {};
        for(var i in elements) {
            if(elements.hasOwnProperty(i) && elements[i].name) {
                params[elements[i].name] = elements[i].value;
            }
        }
        var ops = {
            headers : {
                token: localStorage.token || ''
            },
            dataType: "json",
            type: 'post',
            data: params
        };
        $.ajax(`/service/${itemName}`, ops).then(
            ret => {
                var code = JSON.stringify(ret,null,4);
                var objCode = $(form).find("code");
                objCode.html(code);
                hljs.highlightBlock(objCode[0]);
                if (/login|register/.test(itemName) && ret.data && ret.data.token) {
                    localStorage.token = ret.data.token;
                }
            },
            err => log({err})
        );
    };

    $.get('caad-data.json').then(
        data => {
            if (data.title) {
                document.title = data.title;
            }
            window.data = data.interfaces;
            document.body.innerHTML = getTemplate(data.interfaces);
            $('pre code').each(function(i, block) {
                hljs.highlightBlock(block);
            });
        },
        err => alert(err)
    );
});
