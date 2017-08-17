/**
 * Created by likaituan on 17/08/2017.
 */

var getTemplate = function (data){
	//console.log(Object.entries(data));
	return `
    <div class="box">
        <div>
            <h3>温馨提示:</h3>
            <ul>
                <li>所有请求方式: post</li>
                <li>所有请求地址: /service/{interfaceName}</li>
                <li>最新返回结果: 请以模拟提交为准</li>
            </ul>
        </div>
        ${Object.entries(data).map(([cat,Item])=>{//console.log(cat,Item);
		return `
        <div class="cat-item">
            <h2>---------- ${Item.title} ----------</h2>
            ${Item.methods.map((item,itemIndex) =>{return `
            <div class="method-item">
                <form name="${item.interfaceName}">
                <div style="background:#aaa;">
                    <span>${item.interfaceName}</span> --- <b>${item.interfaceTitle}</b>
                </div>
                <p>参数列表:</p>
                ${item.args && item.args.length > 0 ? `
                <table border="1">
                    <tr>
                        <th>Field Name</th>
                        <th>Field Type</th>
                        <th>Field Range</th>
                        <th>Is Require</th>
                        <th>Describe</th>
                        <th>Default Value</th>
                    </tr>
                    ${item.args.map(arg=>{return `
                    <tr>
                        <td>${arg.argName}</td>
                        <td>${arg.argType}</td>
                        <td>${arg.argRange || ''}</td>
                        <td>${arg.isRequire}</td>
                        <td>${arg.argTitle}</td>
                        <td><input type="text" name="${arg.argName}" value="${arg.argDefault || ''}" /></td>
                    </tr>
                    `;}).join('')}
                </table>
                ` : `
                <i>no params</i>
                `}
                <p class="buttons">
                    ${item.args && item.args.length>0 ? `
                    <input type="button" onclick="simulateData('${cat}', ${itemIndex})" value="模拟数据" />
                    `: ''}
                    <input type="button" onclick="simulateSubmit('${cat}', ${itemIndex})" value="模拟提交" />
                </p>
                <p>返回结果:</p>
                <pre><code class="lang-javascript">${JSON.stringify(item.res,null,4)}</code></pre>
                </form>
            </div>
            `;}).join('') || '<p style="color:red;">开发中, 待完善...</p>'}
        </div>
        `;}).join('')}
    </div>
    `;
};