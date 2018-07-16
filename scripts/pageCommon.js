/***
 * 检查元素值是否为空并提示信息
 * @return 空时true,不为空时返回false
 */
function isEmptyWithMsg(ele, msg){
	if(!$(ele).val()){
		dmsCommon.tip({status:'warning', msg:msg});
	}
	
	return true;
}
/***
 * 判断是否存在第一个参数值和后几个参数值相等的情况
 * @param firstVal 
 * @param args 参数数组
 * @returns 若存在则返回true 其它情况返回false
 */
function equalsAny(firstVal,args){
	var returnVal = false;
	if(!firstVal)
		return false;
	$.each(args, function(index, arg){
		if(firstVal == arg){
			returnVal = true;
			
			//跳出each
			return false;
		}
	});
		
	return returnVal;
}
//判断变量是否数组
function isArray_fw(o){
	
    return Object.prototype.toString.call(o)=='[object Array]';
}
//判断是否为JSON对象
function isJsonObj_fw(o){
	
	return typeof(o) == "object" && Object.prototype.toString.call(o).toLowerCase() == "[object object]" && !o.length;  
}
//判断是否为JSON字符串
function isJsonStr_fw(o){
	try{
		if(!o)
			return false;
			
		if(typeof(JSON.parse(o)) != 'object')
			return false;

		return true;
	}catch(e){
		return false;  
	}
}
//克隆JSON
function cloneJson_fw(o){
	
	return JSON.parse(JSON.stringify(o));
}
//将Object的属性输出成Array
function objOfPropertyToArr(object) {
    var arr = [];
    	var i = 0;
    	for (var item in object) {
    		arr[i] = item;
    		i++;
    	}
    return arr;
}
//公共excel导出
function CommonExportXls(container,obj,table){
	var url=$(obj).attr('excel-url'),diy=$(obj).attr('excel-config'),options;
	var path=url?url:dmsCommon.getDmsPath()["web"]+"/common/exportXls/export";
	if(!table)table=$.trim($(obj).attr('excel-table'));
	var $table=table?$(table,container):(obj?$("table[id]:eq(0)",$(obj).closest(".panel-default")):$("table[id]:eq(0)",container));
	var dmsFuncId=$(container).data("dmsFuncId");//||$table.closest(".tab-pane")[0].id.substr(4);
	var field=[],title=[],dict=[],date=[];
	options=$table.bootstrapTable("getOptions");
	if(diy==""||diy)
		options.url=dmsCommon.getDmsPath()[$(obj).attr('data-model')]+$(obj).attr('data-url');
	var data={ sort:options.sortName||options.idField,order:options.sortOrder||"desc",offset:'0',limit:'30000'},arr=[];
	options.queryParams(data);
	if(diy){
		var cols=diy.split(";");
		$.each(cols,function(i,v){
			var col=v.split(",");
			if(col.length<2)return;
			field.push(col[0]);
			title.push(col[1]);
			dict.push(col[2]?parseInt(col[2]):0);
			date.push("");
		});
	}
	else
		$.each(options.columns[0],function(i,v){
		if('序号'==v.title)return;
		if("操作"!=$.trim(v.title))title.push(v.title);
		else return;
		field.push(v.field);
		v.codeFormat?dict.push(1):dict.push(0);
		v.dateFormat?date.push(v.dateFormat.format):date.push("");
	});
	data.tableInfo={field:field,title:title,dict:dict,date:date};
	arr=options.url.split(/\/rest|\?/);
	data.tableUrl=arr[1];
	data.requestModel=arr[0].substr(arr[0].lastIndexOf("/")+1);
	data.fileName=$(obj).attr('excel-fileName')||($.trim(($table.closest(".panel-default").find(".pannel-name:first").text()||$('a[href*='+dmsFuncId+']').text()).match(/\S+/))).replace(/列表/,"信息")||"导出信息";
	postDmsDataWithForm(path,data,container);
}
//公共打印
function HtmlPrintPdf(container,url){
	var path=url?url:dmsCommon.getDmsPath()["web"]+"/common/printPdf/print";
	var data={},type=[],arr=[],panel=[],file=$.trim($(".modal-title",container).text());
	$(".panel-body",container).filter(function(i){
		return $(".panel-body",this).length==0;
	}).each(function(i,v){
		var $tables=$("table[id]",v),parent=$(v).parent(),pannelName="信息";
		if(parent.is(".panel-default")){
			var conn=$(this).prev().is(".panel-heading")?$(this).prev():parent;
			var $panel_name=$('.pannel-name',conn);
			if($panel_name.length>0)pannelName=($.trim($panel_name[0].childNodes[0].nodeValue)||$panel_name.eq(0).text()).match(/\S+/);
		}
		else if(parent.is(".tab-pane"))pannelName=$("a[href*='"+parent[0].id+"']",container).eq(0).text().match(/\S+/);
		panel.push($.trim(pannelName?pannelName:"信息"));
		if($tables.length>0)
			$tables.each(function(i,v){
				arr.push(serlizeHtml($(v)));
				type.push(1);
			});
		else{
			arr.push(serlizeHtml($(v)));
			type.push(0);
		}
	});
	data.type=type;
	data.panel=panel;
	data.rows=arr;
	data.name=file.replace(/明细|编辑|新增/,"")||"打印单据";
	postDmsDataWithForm(path,data,container);
}
function postDmsDataWithForm(path,data,container){
	var form=$("<form method='post'></form>");
	form.attr({"target":"_blank","action":path});
	$("<input value='"+$(container).data("dmsFuncId")+"' name='dmsFuncId'/>").appendTo(form);
	$("<input value='"+dmsCommon.getCurrentToken()+"' name='urlToken'/>").appendTo(form);
	$("<input value='"+JSON.stringify(data)+"' name='data'/>").appendTo(form);
	$(container).append(form);
	form.validate({ignore:".ignore"});
	form.submit();
	form.remove();
}
function getDmsElemValue(con){
	var $input=$(con).is(":input")?$(con):$(':input:not([type="hidden"]):not("button")',con),value="";
	if($input.is('select'))
		if($input.filter("input").length==0||$input.length==2&&$input.filter('input').parent().is(".bs-searchbox")){
			value=$input.siblings("button").attr("title")||$input[0].options[$input[0].selectedIndex].text;
			return /请选择|没有选中/.test(value)?"":value;
		}
	$input=$input.not("select");
	if($input.length>0)
		switch($input[0].type){
		case "checkbox":
		case "radio":$input.filter(":checked").each(function(i,v){value+=$(v).next().text()+",";});if(value)value=value.substr(0,value.length-1);break;
		default:$input.each(function(i,v){value+=$(v)[0].value+$.trim($(v).next("span").text());});
		}
	return value;
}
//获取打印的数据
function serlizeHtml($con){
	var temp={},res={},list=[],name=[],j=0;
	if($con.is('div'))
		$(".form-group",$con).each(function(i,v){
			var text=$.trim($('label',v).eq(0).text());
			if(text){
				name[j++]=text.replace(/:|：/,"");
				temp[name[j-1]]=getDmsElemValue(v);
			}
		});
	else if($con.is('table'))
		$("tr",$con).each(function(i,v){
			var res={};
			if(!i)
				$(v.cells).each(function(i,v){
					name[i]=$.trim($(v).text());
				});
			else{
				$.each(v.cells,function(i,cell){
					var text=getDmsElemValue(cell);
					res[name[i]]=text ? text:$.trim($(cell).text());
				});
				list.push(res);
			}
		});
	if(list.length==0)
		list.push(temp);
	res.list=list;
	res.name=name;
	return res;
}
// 将Object的属性值输出成Array
function objOfValueToArr(object) {
    var arr = [];
	    var i = 0;
	    for (var item in object) {
	        arr[i] = object[item];
	        i++;
	    }
    return arr;
}
//去除数组重复元素
function uniqueArr_fw(arr){
	var newArr = [];
	$.each(arr, function(i, arrItem){
		var isExisted = false;
		$.each(newArr, function(j, newArrItem){
			if(arrItem == newArrItem){
				isExisted = true;
			}
		});
		if(!isExisted){
			newArr.push(arrItem);
		}
	});
	
	return newArr;
}
//JSON中KEY转大写
function upperJSONKey_fw(jsonObj){  
	if(!isJsonObj_fw(jsonObj)){
		return false;
	}
    for (var key in jsonObj){ 
    	if(key.toUpperCase() !== key){
    		jsonObj[""+key.toUpperCase()+""] = jsonObj[key];  
    		delete(jsonObj[key]);  
    	}
    }  
    
    return jsonObj;  
}
//JSON中KEY转小写
function lowerJSONKey_fw(jsonObj){  
	if(!isJsonObj_fw(jsonObj)){
		return false;
	}
	for (var key in jsonObj){ 
		if(key.toLowerCase() !== key){
			jsonObj[""+key.toLowerCase()+""] = jsonObj[key];  
			delete(jsonObj[key]);  
		}
	}  
	
	return jsonObj;  
}
/**
 * 定义常规函数
 * @param value
 * @param row
 * @param index
 */

/**
 * 获得多选框的值
 * @param obj 页面元素
 * @param container  页面容器
 */
function getCheckBoxVal(obj,container,type){
	var typeName = "";
	var groupCheckbox=$("input[name='"+obj+"']",container);
    for(i=0;i<groupCheckbox.length;i++){
        if(groupCheckbox[i].checked){
            var val =$("#"+obj+"val"+i,container).html();
            if(typeName == ""){
            	typeName +=  val;
			}else{
				typeName += type==1?",":"-" + val;
			}
        }
    }
	return typeName;
}
/**
 * 定义常规函数
 * @param value
 * @param row
 * @param index
 */

/**
 * 获得多选框的值
 * @param obj 页面元素
 * @param container  页面容器
 */
function getCheckBoxVal(obj,container){
	var typeName = "";
	var groupCheckbox=$("input[name='"+obj+"']",container);
    for(i=0;i<groupCheckbox.length;i++){
        if(groupCheckbox[i].checked){
            var val =$("#"+obj+"val"+i,container).html();
            if(typeName == ""){
            	typeName +=  val;
			}else{
				typeName += "," + val;
			}
        }
    }
	return typeName;
}
/**
 * 格式化日期及日期时间
 */
function formatDate(value,format) {
	if(isStringNull(value)){
		return "";
	}
	var motDate = moment(value);
	if(motDate.isValid()){
		var returnValue;
		if(format){
			returnValue = motDate.format(format);
		}else if(motDate.hour()==0&&motDate.minute()==0&&motDate.second()==0){
			returnValue = motDate.format("YYYY-MM-DD");
		}else{
			returnValue = motDate.format("YYYY-MM-DD HH:mm");
		}
		return returnValue;
	}
};

/**
 * 对日期对比
 */
function CompareDate(startDate,endDate){
  return ((new Date(startDate.replace(/-/g,"\/"))) > (new Date(endDate.replace(/-/g,"\/"))));
}

/**
 * 对数字对比
 */
function CompareNumber(upVal,dowmVal){
	if(parseInt(upVal)<parseInt(dowmVal)){
		 return false;
		}
	return true;
}

/**
 * 自定义提示
 */
function customShowErrorTip(error,element,container){
	$(element,container).attr('title', error).attr('data-original-title', error).tooltip({placement:"top",trigger:"manual",template:'<div class="tooltip" role="tooltip"><div class="tooltip-title"><i class="fa fa-warning"></i></div><div class="tooltip-inner"></div></div>'}).tooltip('show');
    //绑定事件
    $(element,container).next("div.tooltip").off("click").on("click",function(){
    	$(element,container).tooltip('destroy');
    });
}

/**
 * 对数字进行格式化
 */
function formatNumber(value,options){
	if(!isStringNull(value+"")){
		var numberFormat = new FormatNumber();
		//如果设置了类型
		if(options.numberType){
			//如果是百分比
			if(options.numberType == "percent"){
				value = value*100;
			}
			if(options.decimal){
				options.decimal = options.decimal-2;
			}
		}
		if(options.decimal){
			if($.type(value) == "string"){
				value = parseFloat(value).toFixed(options.decimal);
			}else{
				value = value.toFixed(options.decimal);
			}
		}
		
		numberFormat.init(options);
		var returnValue = numberFormat.doFormat(value+"");
		//如果设置了类型
		if(options.numberType){
			//如果是百分比
			if(options.numberType == "percent"){
				returnValue = returnValue+"%";
			}
		}
		return returnValue;
	}
};

/**
 * 对数字进行格式化
 */
function formatMaxShowLength(value,options){
	var showStr = "<span title = '{0}'>{1}</span>";
	var length = options.length;
	var formatStr = getDefineLenString(value,length);
	showStr = showStr.format([value,formatStr]);
	return showStr;
};

function getDefineLenString(str,length) {
	var l = str.length;
	var blen = 0;
	var returnStr = "";
	for(i=0; i<l; i++) {
		if ((str.charCodeAt(i) & 0xff00) != 0) {
			blen ++;
		}
		blen ++;
		if(blen<=length){
			returnStr+=str.slice(i,i+1);
		}else{
			return returnStr+"<span><strong>...</strong></span>";
		}
	}
	return returnStr;
}
/**
 * 将字符串
 * @param str
 * @param length
 * @returns
 */
function getAppendLenString(str,length) {
	var nowLenth = getChineseLength(str);
	var returnStr = str;
	if(length>nowLenth){
		for(i = 0;i<parseInt((length-nowLenth)/2);i++){
			returnStr = "&nbsp;"+returnStr+"&nbsp;";
		}
	}
	return returnStr;
}

function getValidatorChineseLength(value, element,validator) {
	switch ( element.nodeName.toLowerCase() ) {
	case "select":
		return $( "option:selected", element ).length;
	case "input":
		if ( validator.checkable( element ) ) {
			return validator.findByName( element.name ).filter( ":checked" ).length;
		}
	}
	return getChineseLength(value);
}


function getChineseLength(str){
	var l = str.length;
	var blen = 0;
	for(i=0; i<l; i++) {
		if ((str.charCodeAt(i) & 0xff00) != 0) {
			blen ++;
			blen ++;
		}
		blen ++;
	}
	return blen;
}


/**
 * 对空字符串进行转换
 */
function formatNull(value){
	if(value==undefined||$.trim(value)=="null"){
		return "";
	}
	return value;
}
/**
 * 判断字符串是否为空
 */
function isStringNull(value){
	if(value==undefined||$.trim(value)==""||$.trim(value)=="null"){
		return true;
	}
	return false;
}

/**
 * 生成guid 函数
 * @returns {String}
 */
function guid() {
   function S4() {
	 return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
   }
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

/**
 * 解析公式
 * @param formual
 */
function analysisFormual(formual){
	var reg=new RegExp ("#[^\\+\\-\\*\\/\\)\\(]+","g");
	var matchResult= formual.match(reg);
	var fieldArray = new Array();
	$.each(matchResult,function(index,itemId){
		fieldArray.push(itemId);
	});
	return fieldArray;
}

/**
 * 获得有dmsFuncId 参数的url
 * @param url
 */
function getDmsFuncIdUrl(url,urlToken,container){
	if(!isStringNull(url)){
		var newUrl = url;
		var dmsFuncId = container ? container.data("dmsFuncId") : null;
		dmsFuncId = dmsFuncId || $("#dmsPageContent .tab-pane.active").data("dmsFuncId");
		if(dmsFuncId){
			newUrl = newUrl.indexOf("?")==-1?(newUrl+"?"+"dmsFuncId="+dmsFuncId):(newUrl+"&"+"dmsFuncId="+dmsFuncId);
		}
		if(urlToken){
			newUrl = newUrl.indexOf("?")==-1?(newUrl+"?"+"urlToken="+urlToken):(newUrl+"&"+"urlToken="+urlToken);
		}
		if(window.top.dmsData){
			var tokenAccount = window.top.dmsData.account;
			newUrl = newUrl.indexOf("?")==-1?(newUrl+"?"+"tokenAccount="+tokenAccount):(newUrl+"&"+"tokenAccount="+tokenAccount);
		}
		return newUrl;
	}else{
		return url;
	}
}
/**
 * 获取元素的context
 */
function getElementContext(){
//	alert($("div.page-content-body  div.dms-add:visible,div.page-content-body div.dms-edit:visible,div.page-content-body div.dms-search:visible,div.page-content-body div.dms-delete:visible,div.modal:visible").size());
//	$("div.page-content-body  div.dms-add:visible,div.page-content-body div.dms-edit:visible,div.page-content-body div.dms-search:visible,div.page-content-body div.dms-delete:visible,div.modal.fade").each(function(i,item){
//		console.log("---------------------------------"+$(item).html());
//	});
	return $("div.page-content-body div.dms-add:visible,div.page-content-body div.dms-edit:visible,div.page-content-body div.dms-search:visible,div.page-content-body div.dms-delete:visible,div.page-content-body div.dms-detail:visible,div.modal.fade");
}
/**
 * 获得父窗口
 * @param container
 * @returns
 */
function getParentModal(container){
	return $(container).data("data-parentModal");
}

/**
 * 转换为中文大写
 * @param value
 * @returns
 */
function formatChineseNumeral(value){
//	if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(value)){
//		return "";
//	}
//	var unit = "千百拾亿千百拾万千百拾元角分", str = "";
//	value += "00";
//	var p = value.indexOf('.');
//	if (p >= 0){
//		value = value.substring(0, p) + value.substr(p+1, 2);
//	}
//	unit = unit.substr(unit.length - value.length);
//	for (var i=0; i < value.length; i++){
//		str += '零壹贰叁肆伍陆柒捌玖'.charAt(value.charAt(i)) + unit.charAt(i);
//	}
//	return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
	//update cjn
	if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(value)){
		return "";
	}
	var unit = "仟佰拾亿仟佰拾万仟佰拾圆角分", str = "";
	value += "00";
	var p = value.indexOf('.');
	if (p >= 0){
		value = value.substring(0, p) + value.substr(p+1, 2);
	}
	unit = unit.substr(unit.length - value.length);
	for (var i=0; i < value.length; i++){
		str += '零壹贰叁肆伍陆柒捌玖'.charAt(value.charAt(i)) + unit.charAt(i);
	}
	return str.replace(/零(仟|佰|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|圆)/g, "$1").replace(/(亿)万|(壹拾)/g, "$1$2").replace(/^圆零?|零分/g, "").replace(/圆$/g, "圆整");
}
/**
 * 校验pageData参数是否有值
 * @param value
 * @returns
 */
String.prototype.noPageData = function(){
	var value = this;
	var regu = /^\{\[\S+\]\}$/;
	var re = new RegExp(regu);
	if (re.test(value)) {
		return true;
	}else{
		return false;
	}
}
/**
 * 字符串格式化
 * @param args
 * @returns {String}
 */
String.prototype.format = function(args) {
	if (arguments.length>0) {
		var result = this;
		if (arguments.length == 1 && typeof (args) == "object") { 
			if($.isArray(args) == false){
				var reg=new RegExp ("\\{\\[[^(\\s|\\})]+\\]\\}","g");
				var reg2=new RegExp ("[^\\{\\[\\]\\}]+","g");
				var matchResult= result.match(reg);
				var matchKeys;
				$.each(matchResult,function(index,item){
					var matchResult2= item.match(reg2);
					//拿到对应的值
					var val = getDataByKey(matchResult2,args);
					if(val||val==""){
						matchKeys=matchKeys==undefined?{}:matchKeys;
						matchKeys[matchResult2] = val;
					}
				});
				for (var key in matchKeys) {
					var reg3=new RegExp ("(\\{\\["+key+"\\]\\})","g");
					result = result.replace(reg3, matchKeys[key]);
				}
			}else if($.isArray(args) == true){
				for (var i = 0; i < args.length; i++) {
					if(args[i]==undefined){
						return "";
					}else{
						var reg=new RegExp ("\\{["+i+"]\\}","g");
						result = result.replace(reg, args[i]);
					}
				}
			}
			
		}else {
			for (var i = 0; i < arguments.length; i++) {
				if(arguments[i]==undefined){
					return "";
				}else{
					var reg=new RegExp ("\\{["+i+"]\\}","g");
					result = result.replace(reg, arguments[i]);
				}
			}
		}
		return result;
	}else {
		return this;
	}
}; 


String.prototype.html2Escape = function() {
	var sHtml = this;
	return sHtml.replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;','×':'&times;','√':'&radic;','“':'&ldquo;','”':'&rdquo;','—':'&mdash;','·':'&middot;',
			'±':'&plusmn;','Φ':'&Phi;'}[c];});
};

String.prototype.escape2Html = function () {
	var str = this;
	var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"','times':'×','radic':'√','ldquo':'“','rdquo':'”','mdash':'—','middot':'·',
			'plusmn':'±','Phi':'Φ'};
	return str.replace(/&(lt|gt|nbsp|amp|quot|times|radic|ldquo|rdquo|mdash|middot|plusmn|Phi);/ig,function(all,t){return arrEntities[t];});
}
/**  
 * 乘法运算，避免数据相乘小数点后产生多位数和计算精度损失。  
 * @param num1被乘数 | num2乘数  
 */  
function numAccMul(num1, num2) {  
    var baseNum = 0;  
    try {  
        baseNum += num1.toString().split(".")[1].length;  
    } catch (e) {  
    }  
    try {  
        baseNum += num2.toString().split(".")[1].length;  
    } catch (e) {  
    }  
    return Number(num1.toString().replace(".", ""))  
            * Number(num2.toString().replace(".", ""))  
            / Math.pow(10, baseNum);  
}; 
//加法   
Number.prototype.add = function(arg){   
    var r1,r2,m;   
    try{r1=this.toString().split(".")[1].length}catch(e){r1=0}   
    try{r2=arg.toString().split(".")[1].length}catch(e){r2=0}   
    m=Math.pow(10,Math.max(r1,r2))   
    
    return (this.mul(m) + arg.mul(m)) / m;   
}  

//减法   
Number.prototype.sub = function (arg){   
	
    return this.add(-arg);   
}   

//乘法   
Number.prototype.mul = function (arg)   
{   
    var m=0,s1=this.toString(),s2=arg.toString();   
    try{m+=s1.split(".")[1].length}catch(e){}   
    try{m+=s2.split(".")[1].length}catch(e){}   
    
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)   
}   

//除法   
Number.prototype.div = function (arg){   
    var t1=0,t2=0,r1,r2;   
    try{t1=this.toString().split(".")[1].length}catch(e){}   
    try{t2=arg.toString().split(".")[1].length}catch(e){}   
    with(Math){   
        r1=Number(this.toString().replace(".",""))   
        r2=Number(arg.toString().replace(".",""))  
        
        return (r1/r2)*pow(10,t2-t1);   
    }   
}
//重写Number中定义的toFixed方法，解决原方法在不同浏览器精度的问题。
Number.prototype.toFixed = function(fractionDigits){
	var num = this.mul(Math.pow(10, fractionDigits));
	if(this >= 0){
		num = num.add(0.5);
	}else{
		num = num.sub(0.5);
	}
	changenum = (parseInt(num)/Math.pow(10, fractionDigits)).toString();
	var index = changenum.indexOf(".");
	if(index < 0 && fractionDigits > 0){
		changenum = changenum + ".";
		for(i=0; i<fractionDigits; i++){
			changenum = changenum + "0";
		}
	}else{
		index = changenum.length - index;
		for(i=0; i<(fractionDigits-index)+1; i++){
			changenum = changenum+"0";
		}
	}
	
    return changenum;  
}  
/***
 * 扩展正则test方法
 * PS：匹配成功后执行自定义函数，匹配失败返回false
 */
RegExp.prototype.testExtendFunction = function(str, func){
	if(this.test(str)){
		return func();
	}else{
		return false;
	}
}
/**
 * 根据key 从JSON 对象中获得对应的值
 */
function getDataByKey(key,data){
	var val;
	key = key+"";
	if(key!=undefined&&key.indexOf(".")!=-1){
		var keys = key.split(".");
		$.each(keys,function(index,item){
			if(index ==0){
				val = (data[item]==undefined?(data[item.toLowerCase()]==undefined?data[item.toUpperCase()]:data[item.toLowerCase()]):data[item]);
			}else{
				val = (val[item]==undefined?(val[item.toLowerCase()]==undefined?val[item.toUpperCase()]:val[item.toLowerCase()]):val[item]);
			}
			if(val==undefined){
				return false;
			}
		});
	}else{
		val = (data[key]==undefined?(data[key.toLowerCase()]==undefined?data[key.toUpperCase()]:data[key.toLowerCase()]):data[key]);
	}
	return val;
}
/**
 * 将指定容器中的组件的值转化为JSON 对象
 * @param container
 * @param serializeObj
 * @param filterFunction
 */
function dmsFormToJson(container,serializeObj,filterFunction){
	
	var inputArray = $('input[type="text"],input[type="hidden"],input[type="password"],textarea',container);
	if(filterFunction){
		inputArray = inputArray.filter(filterFunction);
	}
	inputArray.each(function(index,item) {
		var name = $(item).attr("data-inputName")!=undefined?$(item).attr("data-inputName"):$(item).attr("name");
		var value = $.trim($(item).val());
		//如果字段不为空，则赋值
		if(value&&!isStringNull(value)){
			serializeObj[name] = value;
		}
	});
	
	inputArray = $('input[type="radio"]:checked',container);
	if(filterFunction){
		inputArray = inputArray.filter(filterFunction);
	}
	inputArray.each(function(index,item) {
		var name = $(item).attr("data-inputName")!=undefined?$(item).attr("data-inputName"):$(item).attr("name");
		var value = $(item).val();
		if(value&&!isStringNull(value)){
			serializeObj[name] = value;
		}
	});
	
	inputArray = $('select',container);
	if(filterFunction){
		inputArray = inputArray.filter(filterFunction);
	}
	
	inputArray.each(function(index,item) {
		var name = $(item).attr("data-inputName")!=undefined?$(item).attr("data-inputName"):$(item).attr("name");
		if($(item).hasClass("bs-select")){
			var values = $(item).selectpicker('val');
			if(values){
				if($(item).attr("multiple")){
					serializeObj[name] = new Array();
					$.each(values,function(j,valueSelected){
						serializeObj[name].push(valueSelected);
					});
				}else{
					if(!isStringNull(values)){
						serializeObj[name] = values;
					}
				}
			}
		}else{
			var value = $('option:selected',item).val();
			if(value&&!isStringNull(value)){
				serializeObj[name] = value;
			}
		}
	});
	
	inputArray = $('input[type="checkbox"]',container);
	if(filterFunction){
		inputArray = inputArray.filter(filterFunction);
	}
	inputArray.each(function(index,item) {
		var name = $(item).attr("data-inputName")!=undefined?$(item).attr("data-inputName"):$(item).attr("name");
		if(serializeObj[name]==undefined){
			if($(item).attr("data-isArrayCheckbox")=="true"||$('input[type="checkbox"][name="'+name+'"],input[type="checkbox"][data-inputName="'+name+'"]',container).size()>1){
				serializeObj[name] = new Array();
			}else{
				if($(item).is(':checked')){
					serializeObj[name] = $(item).val();
				}
				return true;
			}
		}
		if($(item).is(':checked')){
			serializeObj[name].push($(item).val());
		}
	});
}
/**
 * 处理页面上的日常操作功能集合
 */
var dmsCommon = function() {
	//定义通用动态数据（目前包括登录信息）
	var commonDataMap;
	var navigatorInfo;
	var currentToken;
	var pageLanguage;
	var tabLabelsFlag = true; //标签页功能默认开启
	
	//定义系统路径
	var DMS_PATH={
		root:"/qtmotor",
		demo:"/qtmotor/demo/rest",
		manage:"/qtmotor/manage/rest",
		report:"/qtmotor/report/rest",
		web:"/qtmotor/web/rest",
		business:"/qtmotor/business/rest"
	};
	
	//定义向上查找的DOM的范围
	var DMS_CLOSEST_DIV="div.dms-add,div.dms-edit,div.dms-search,div.dms-delete,div.dms-detail";
	
	/**
	 * 初始化常规数据
	 */
	function getCommonData(){
		//刷新token
		refreshToken();
		//进行ajax 请求
		dmsCommon.ajaxRestRequest({
			url:dmsCommon.getDmsPath()["web"]+"/common/commonDatas",
			type:'GET',
			async:false,
			sucessCallBack:function(data){
				commonDataMap = data;
			}
		});
		
		//进行定时刷新
		refreshTokenInterval();
	};
	
	/**
	 * 刷新token 值
	 */
	function refreshToken(){
		//多语言切换刷新
		var _currentToken = $.cookie('currentToken');
		if(_currentToken){
			currentToken = _currentToken;
			$.cookie('currentToken', '', {
				path : dmsCommon.getDmsPath()["root"],
				expires : -1
			});
		}else{
			//进行ajax 请求
			dmsCommon.ajaxRestRequest({
				url:dmsCommon.getDmsPath()["web"]+"/common/login/refreshToken",
				type:'GET',
				async:false,
				sucessCallBack:function(data){
					currentToken = data;
				}
			});
		}
	}
	
	/**
	 *  每5分钟刷新一次token 值
	 */
	function refreshTokenInterval(){
		setInterval(refreshToken,5*60*1000);
	}

	// 当菜单发生变化时执行初始化
	var initFunc = function(container) {
		//开启标签页功能时不执行初始化菜单栏
		if(tabLabelsFlag) return;
		initPageBar(container); // 初始化菜单栏
	};
	// 初始化菜单栏--导航栏
	var initPageBar = function(container) {
		//如果容器为主页面
		if($(container).attr("id") == "dmsPageContent"){
			var menuContainer = $('.page-sidebar ul');
			var activeLi = menuContainer.children('li.active:not(.start)');
			var bars;
			if ($(activeLi).size() > 0) {
				bars = new Array();
				$(activeLi).each(function(index, element) {
					var funcName = $(element).children("a").text();
					//将菜单放入数组中
					bars.push(funcName);
				});
			} 
			//显示菜单
			showPageBar(bars);
		}
	};
	
	/**
	 * 显示菜单栏
	 */
	var showPageBar = function(bars){
		var pageBarArray = new Array();
		pageBarArray.push('<ul class="page-breadcrumb">');
		pageBarArray.push('<li><a href="index.html">首页</a>');
		
		if(bars&&$(bars).size()>0){
			pageBarArray.push('<i class="fa fa-angle-right"></i></li>');
			$.each(bars,function(index, element){
				if (index < ($(bars).size() - 1)) {
					pageBarArray.push('<li><span>'+ element+ '</span><i class="fa fa-angle-right"></i></li>');
				} else {
					pageBarArray.push('<li><span>' + element + '</span></li>');
				}
			});
		}else{
			pageBarArray.push('</li>');
		}
		pageBarArray.push('</ul>');
		
		//删除原菜单栏
		$("div.page-content-wrapper > div.page-content > div.page-bar").html(pageBarArray.join(""));
	}
	
	/**
	 * 添加标签页
	 */
	var addPageBar = function(bar){
		//打开标签的参数不可缺少
		if(bar && bar.menuId && bar.url && bar.text){
			var tabs = $(".page-content > .page-bar > .nav-pills");
			//首次触发时创建容器和resize事件
			if(!tabs.length){
				tabs = $('<ul class="nav nav-pills">').appendTo("div.page-content-wrapper > div.page-content > div.page-bar").tabdrop();
				$("#dmsPageContent").on("resize", function(){
					$(".page-content > .page-bar").width($(this).width() - 20);
				}).trigger("resize");
			}
			var menuId = bar.menuId;
			var url = bar.url;
			var text = bar.text;
			var tab = tabs.find("a[href=\\#tab_"+menuId+"]").closest("li");
			var page = $("#dmsPageContent > #tab_"+menuId);
			//判断标签是否已经存在
			if(!tab.length){
//				var len = 0;
//				tabs.find("li").each(function(){
//					len += $(this).width();
//				});
//				if(len > $(window.document).width() - 300){
//					handelBootstrapToastr({status:"info",msg:"页面数量已达到上限，请先关闭部分页面。",timeOut:"4000"});
//					return;
//				}
				//创建标签和页面容器
				tab = $('<li><a href="#tab_'+menuId+'" data-toggle="tab"><i class="fa fa-file-o"></i>'+text+'</a><img src="../assets/pages/img/s.gif" width="8" height="8" /></li>').appendTo(tabs);
				page = $('<div class="tab-pane active" id="tab_'+menuId+'"></div>').appendTo("#dmsPageContent");
				if(menuId == 1){
					tab.addClass("home").find("i").removeClass("fa-file-o").addClass("fa-home");
					tab.addClass("home").find("img").remove();
				}
				//关闭按钮和事件
				tab.find("img").click(function(){
					if(tab.hasClass("active")){
						tab.prev().find("a").tab('show');
					}
					tab.remove();
					page.remove();
				});
				//双击事件
				tab.dblclick(function(){
					if(menuId != 1){
						tab.find("img").trigger("click");
					}
				});
				//切换标签时菜单联动
				tab.find("a").on('shown.bs.tab', function (e) {
					dmsIndex.changeActiveMenuClass(menuId);
				})
				
				//执行页面请求
	        	ajaxPageRequest({
	        		url: url,
	        		container: page,//定义容器
	        		success: function(html){
	        			//还原查询条件
	        			dmsIndex.changeFuncCacheData(menuId);
	        		},
	        		complete:function(xmlRequest, statusCode){
	        			
	        		}
	        	});
			}
			//显示标签
			tab.find("a").tab('show');
			//计算是否超出宽度
			$("#dmsPageContent").trigger("resize");
		}
	}
	
	/**
	 * 处理日期控件
	 */
	var handleDatePickers =  function(container) {
		if (jQuery().datepicker) {
			$('div.date-picker',container).each(function(index,item){
				//默认配置
				var defaultOption = {
					rtl : App.isRTL(),
					orientation : "auto",
					autoclose : true,
					format: "yyyy-mm-dd",
					todayBtn: "linked",
					todayHighlight:true,
					singleDatePicker:true,
					language: "zh-CN",
					clearBtn:false
				};
				var defineOption = {};
				
				//定义日历控件的位置
				if($(item).attr("data-orientation")){
					defineOption.orientation = $(item).attr("data-orientation");
				}
				
				//合并属性
				var options = $.extend(true,{},defaultOption,defineOption);
				var datepickerEl = $(this).datepicker(options);
				//如果设置了默认当天
				var defaultToday = $(this).attr("data-defaultToday");
				if(defaultToday&&defaultToday=="true"){
					var currInput = $(this).find('input');
					var currVal = $(currInput).val();
					var currDate = moment().format("YYYY-MM-DD");
					if(isStringNull(currVal)){
						$(currInput).val(currDate);
					}
				}
				//更新时间
				$(this).datepicker("update");
				
				//绑定chageDate事件
				$(this).on("changeDate",function(event){
					event.preventDefault();
					//执行focus 功能
					focusElement($("input:first",this));
					$(this).datepicker("hide");
					$("input:first",this).trigger("changeDate.dms");
				});
			});
			
			//月份的日期控件
			$('div.month-picker',container).each(function(index,item){
				//默认配置
				var defaultOption = {
					rtl : App.isRTL(),
					orientation : "auto",
					autoclose : true,
					format: "yyyy-mm",
					singleDatePicker:true,
					language: "zh-CN",
					clearBtn:false,
					todayBtn:false,
					minViewMode:"months"
				};
				var defineOption = {};
				//定义日历控件的位置
				if($(item).attr("data-orientation")){
					defineOption.orientation = $(item).attr("data-orientation");
				}
				//合并属性
				var options = $.extend(true,{},defaultOption,defineOption);
				
				var datepickerEl = $(this).datepicker(options);
				//如果设置了默认当天
				var defaultToday = $(this).attr("data-defaultToday");
				if(defaultToday&&defaultToday=="true"){
					var currInput = $(this).find('input');
					var currVal = $(currInput).val();
					var currDate = moment().format("YYYY-MM");
					if(isStringNull(currVal)){
						$(currInput).val(currDate);
					}
				}
				//更新时间
				$(this).datepicker("update");
				
				//绑定chageDate事件
				$(this).on("changeDate",function(event){
					event.preventDefault();
					//执行focus 功能
					focusElement($("input:first",this));
					$(this).datepicker("hide");
				});
			});
			
			//月份的日期控件
			$('div.year-picker',container).each(function(index,item){
				//默认配置
				var defaultOption = {
					rtl : App.isRTL(),
					orientation : "auto",
					autoclose : true,
					format: "yyyy",
					singleDatePicker:true,
					language: "zh-CN",
					clearBtn:false,
					todayBtn:false,
					minViewMode:"years"
				};
				var defineOption = {};
				//定义日历控件的位置
				if($(item).attr("data-orientation")){
					defineOption.orientation = $(item).attr("data-orientation");
				}
				//合并属性
				var options = $.extend(true,{},defaultOption,defineOption);
				
				var datepickerEl = $(this).datepicker(options);
				//如果设置了默认当天
				var defaultToday = $(this).attr("data-defaultToday");
				if(defaultToday&&defaultToday=="true"){
					var currInput = $(this).find('input');
					var currVal = $(currInput).val();
					var currDate = moment().format("YYYY");
					if(isStringNull(currVal)){
						$(currInput).val(currDate);
					}
				}
				//更新时间
				$(this).datepicker("update");
				
				//绑定chageDate事件
				$(this).on("changeDate",function(event){
					event.preventDefault();
					//执行focus 功能
					focusElement($("input:first",this));
					$(this).datepicker("hide");
				});
			});
			//$('body').removeClass("modal-open"); // fix bug when inline
		}
	};
	
	var handleDateRangePickers = function (container) {
		if (!jQuery().datetimepicker) {
			return;
		}
		//默认配置
		var defaultConfig = {
			isRTL: App.isRTL(),
			format: "yyyy-mm-dd",
			autoclose: true,
			clearBtn: false,
			forceParse: false,
			timePicker: false,
			todayBtn: "linked",
			language: "zh-CN",
			pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left"),
			todayHighlight: true,
			minuteStep: 5,
			timePickerIncrement:10,
			timePicker12Hour: false
		};

		//启用日期时间函数
		$('div.input-daterange',container).each(function(){
			var dateRangeObj = this;
			$(dateRangeObj).find("input.form-control").each(function(index, item){
				var dateTimeObj = this;
				var defionOptions = {};
				
				//定义日历控件的位置
				if($(item).attr("data-pickerPosition")){
					defionOptions.pickerPosition = $(item).attr("data-pickerPosition");
				}
				//是否时分模式
				var timePicker = $(dateRangeObj).attr("data-timePicker");
				if(timePicker&&timePicker=="true"){
					defionOptions.timePicker = true;
					defionOptions.format = "yyyy-mm-dd hh:ii";
					
					if($(dateTimeObj).attr("data-dateEndDate")=="now"){
						defionOptions.endDate = moment().format("YYYY-MM-DD HH:mm");
					}
					if($(dateTimeObj).attr("data-dateStartDate")=="now"){
						defionOptions.startDate = moment().format("YYYY-MM-DD HH:mm");
					}
					$(dateTimeObj).datetimepicker($.extend(true,{},defaultConfig,defionOptions));
				}else{
					if($(dateTimeObj).attr("data-dateEndDate")=="now"){
						defionOptions.endDate = moment().format("YYYY-MM-DD");
					}
					if($(dateTimeObj).attr("data-dateStartDate")=="now"){
						defionOptions.startDate = moment().format("YYYY-MM-DD");
					}
					$(dateTimeObj).datepicker($.extend(true,{},defaultConfig,defionOptions));
				}
				
				//如果设置了默认当前时间
				var defaultToday = $(dateTimeObj).attr("data-defaultNow");
				if(defaultToday&&defaultToday=="true"){
					var currInput = $(dateTimeObj);
					var currVal = $(currInput).val();
					var currDate = moment().format("YYYY-MM-DD");
					if(timePicker&&timePicker=="true"){
						currDate = moment().format("YYYY-MM-DD HH:mm");
					}
					if(isStringNull(currVal)){
						$(currInput).val(currDate);
					}
				}
				
				//更新时间
				if(timePicker&&timePicker=="true"){
					$(dateTimeObj).datetimepicker("update");
					$(dateTimeObj).datetimepicker().on("changeDate", function(e) {
						var index = $(dateRangeObj).find("input.form-control").index(dateTimeObj);
						if(index == 0){
							$(dateRangeObj).find("input.form-control:eq(1)").datetimepicker("setStartDate", $(dateTimeObj).val());
						}else{
							$(dateRangeObj).find("input.form-control:eq(0)").datetimepicker("setEndDate", $(dateTimeObj).val());
						}
					});
				}else{
					$(dateTimeObj).datepicker("update");
					$(dateTimeObj).datepicker().on("changeDate", function(e) {
						var index = $(dateRangeObj).find("input.form-control").index(dateTimeObj);
						if(index == 0){
							$(dateRangeObj).find("input.form-control:eq(1)").datepicker("setStartDate", $(dateTimeObj).val());
						}else{
							$(dateRangeObj).find("input.form-control:eq(0)").datepicker("setEndDate", $(dateTimeObj).val());
						}
					});
				}
			});
			$(dateRangeObj).find("button.input-clear").on("click.datepicker", function(){
				clearDivElement($(dateRangeObj));
				$(dateRangeObj).find("input.form-control:eq(1)").datetimepicker("setStartDate", false);
				$(dateRangeObj).find("input.form-control:eq(0)").datetimepicker("setEndDate", false);
			});
		});
	}
	
	var _handleDateRangePickers = function (container) {
		
		if (!jQuery().daterangepicker) {
			return;
		}
		//默认配置
		var defaultOptions = {
				opens: 'left',
				showDropdowns: true,
				showWeekNumbers: true,
				timePicker: false,
				timePickerIncrement: 1,
				timePicker12Hour: true,
				autoUpdateInput:false,
				autoApply:true,
//				ranges: {
//					'今天': [moment(), moment()],
//					'昨天': [moment().subtract(1,'days'), moment().subtract(1,'days')],
//					'最近7天': [moment().subtract(6,'days'), moment()],
//					'最近30天': [moment().subtract(29,'days'), moment()],
//					'本月': [moment().startOf('month'), moment().endOf('month')],
//					'上月': [moment().subtract(1,'month').startOf('month'), moment().subtract(1,'month').endOf('month')]
//				},
				buttonClasses: ['btn'],
				applyClass: 'blue',
				cancelClass: 'default',
				format: 'YYYY-MM-DD',
				separator: ' to ',
				locale: {
					format: 'YYYY-MM-DD',
					applyLabel: '确定',
					cancelLabel:'取消',
					fromLabel: '从',
					toLabel: '至',
					customRangeLabel: '自定义',
					daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
					monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
					firstDay: 1
					}
				};
		var defaultFunction = function (start, end,item) {
			$('input:first',item).val(start.format('YYYY-MM-DD'));
			$('input:last',item).val(end.format('YYYY-MM-DD'));
		};
		
		$('div.input-daterange',container).each(function(index,item){
			var defionOptions = {
				format : "YYYY-MM-DD",
				locale : {
					format: 'YYYY-MM-DD'
				}
			};
			
			if($(item).attr("data-opens")){
				defionOptions.opens = $(item).attr("data-opens");
			}
			
			if($(item).attr("data-timePicker")){
				defionOptions.timePicker = $(item).attr("data-timePicker") === "true";
				defionOptions.timePickerIncrement = 10;
				defionOptions.timePicker12Hour = false;
				defionOptions.format = "YYYY-MM-DD HH:mm";
				defionOptions.locale = {
					format: 'YYYY-MM-DD HH:mm',
					applyLabel: '确定',
					cancelLabel:'取消',
					fromLabel: '从',
					toLabel: '至',
					customRangeLabel: '自定义',
					daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
					monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
					firstDay: 1
				};
			}
			
			//如果是弹出页面
			if($(item).closest("#modelContainerDiv").size()>0){
				defionOptions.showDropdowns = false;
			};
			
			//定义最多显示多少天
			if($(item).attr("data-maxDays")){
				defionOptions.dateLimit={days:(parseInt($(item).attr("data-maxDays")-1))};
			}
			//定义默认显示多少天，如果不写，则代表是30天
			if($(item).attr("data-defaultDays")){
				defionOptions.startDate = moment().subtract(parseInt($(item).attr("data-defaultDays"))-1,'days');
				defionOptions.endDate = moment();
			}
			
			//定义默认当月
			if($(item).attr("data-defaultCurrMonth")=="true"){
				defionOptions.startDate = moment().startOf('month');
				defionOptions.endDate = moment().endOf('month');
			}
			
			//更新日期
			if(defionOptions.startDate){
				$('input:first',item).val(defionOptions.startDate.format(defionOptions.locale.format));
			}
			if(defionOptions.endDate){
				 $('input:last',item).val(defionOptions.endDate.format(defionOptions.locale.format));
			}
			
//			//如果开始日期与结束日期都没有指定
//			if(!defionOptions.startDate&&!defionOptions.endDate){
//				defionOptions.startDate = moment().subtract(1,'month').startOf('month');
//				defionOptions.endDate = moment(); 
//			}
			
			var options = $.extend(true,{},defaultOptions,defionOptions);
			$(item).daterangepicker(options).on("apply.daterangepicker",function(event,dateRangePicker){
				 $('input:first',item).val(dateRangePicker.startDate.format(defionOptions.locale.format));
				 $('input:last',item).val(dateRangePicker.endDate.format(defionOptions.locale.format));
				 //执行focus 功能
				 focusElement($('input:last',item));
			});
			
//			$(item).on('click', function(){
//				if ($(item).is(":visible") && $('body').hasClass("modal-open") == false) {
//					$('body').addClass("modal-open");
//				}
//			});
			
		});		
//		$('body').addClass("modal-open");
		// this is very important fix when daterangepicker is used in modal. in modal when daterange picker is opened and mouse clicked anywhere bootstrap modal removes the modal-open class from the body element.
		// so the below code will fix this issue.
//		$('#defaultrange_modal').on('click', function(){
//			if ($('#daterangepicker_modal').is(":visible") && $('body').hasClass("modal-open") == false) {
//				$('body').addClass("modal-open");
//			}
//		});
	}
	
/**
 * 未来日期
 */		
var futureDateRangePickers = function (container) {
		
		if (!jQuery().daterangepicker) {
			return;
		}
		//默认配置
		var defaultOptions = {
				opens: 'left',
				showDropdowns: true,
				showWeekNumbers: true,
				timePicker: false,
				timePickerIncrement: 1,
				timePicker12Hour: true,
				autoUpdateInput:false,
				autoApply:true,
//				ranges: {
//					'今天': [moment(), moment()],
//					'明天': [moment().subtract(-1,'days'),moment().subtract(-1,'days')],
//					'未来7天': [moment(),moment().subtract(-6,'days')],
//					'未来14天': [moment(),moment().subtract(-13,'days')],
//					'未来30天': [ moment(),moment().subtract(-29,'days')],
//					'本月': [moment().startOf('month'), moment().endOf('month')]
//					//'上月': [moment().subtract(1,'month').startOf('month'), moment().subtract(1,'month').endOf('month')]
//				},
				buttonClasses: ['btn'],
				applyClass: 'blue',
				cancelClass: 'default',
				format: 'YYYY-MM-DD',
				separator: ' to ',
				locale: {
					format: 'YYYY-MM-DD',
					applyLabel: '确定',
					cancelLabel:'取消',
					fromLabel: '从',
					toLabel: '至',
					customRangeLabel: '自定义',
					daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
					monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
					firstDay: 1
					}
				};
		var defaultFunction = function (start, end,item) {
			$('input:first',item).val(start.format('YYYY-MM-DD'));
			$('input:last',item).val(end.format('YYYY-MM-DD'));
		};
		
		$('div.input-datefuture',container).each(function(index,item){
			var defionOptions = {};
			
			if($(item).attr("data-opens")){
				defionOptions.opens = $(item).attr("data-opens");
			}
			
			//如果是弹出页面
			if($(item).closest("#modelContainerDiv").size()>0){
				defionOptions.showDropdowns = false;
			};
			
			//定义最多显示多少天
			if($(item).attr("data-maxDays")){
				defionOptions.dateLimit={days:(parseInt($(item).attr("data-maxDays")-1))};
			}
			//定义默认显示多少天，如果不写，则代表是30天
			if($(item).attr("data-defaultDays")){
				defionOptions.startDate = moment();
				defionOptions.endDate = moment().add(parseInt($(item).attr("data-defaultDays"))-1,'days');
				
			}
			
			//定义默认当月
			if($(item).attr("data-defaultCurrMonth")=="true"){
				defionOptions.startDate = moment().startOf('month');
				defionOptions.endDate = moment().endOf('month');
			}
			
			//更新日期
			if(defionOptions.startDate){
				$('input:first',item).val(defionOptions.startDate.format('YYYY-MM-DD'));
			}
			if(defionOptions.endDate){
				 $('input:last',item).val(defionOptions.endDate.format('YYYY-MM-DD'));
			}
			
			var options = $.extend(true,{},defaultOptions,defionOptions);
			$(item).daterangepicker(options).on("apply.daterangepicker",function(event,dateRangePicker){
				 $('input:first',item).val(dateRangePicker.startDate.format('YYYY-MM-DD'));
				 $('input:last',item).val(dateRangePicker.endDate.format('YYYY-MM-DD'));
				 //执行focus 功能
				 focusElement($('input:last',item));
			});
		});		
	}
	
	/**
	 * 处理日期时间控件
	 */
	var handleDatetimePicker = function (container) {
		if (!jQuery().datetimepicker) {
			return;
		}
		//默认配置
		var defaultConfig = {
			isRTL: App.isRTL(),
			format: "yyyy-mm-dd hh:ii",
			autoclose: true,
			clearBtn:false,
			forceParse:false,
			todayBtn: "linked",
			language: "zh-CN",
			pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left"),
			minuteStep: 5
		};
		
		//启用日期时间函数
		$("div.datetime",container).each(function(index,item){
			var dateTimeObj = this;
			var defionOptions = {};
			if($(dateTimeObj).attr("data-dateEndDate")=="now"){
				defionOptions.endDate = moment().format("YYYY-MM-DD HH:mm");
			}else if($(dateTimeObj).attr("data-dateEndDate")!=null){
				var endDate = $(dateTimeObj).attr("data-dateEndDate");
				var intDate = parseInt(endDate);
				if(intDate.toString()=='NaN'){
					defionOptions.endDate = endDate;
				}else{
					defionOptions.endDate=moment(intDate).format("YYYY-MM-DD HH:mm");
				}
				
			}
			if($(dateTimeObj).attr("data-dateStartDate")=="now"){
				defionOptions.startDate = moment().format("YYYY-MM-DD HH:mm");
			}else if($(dateTimeObj).attr("data-dateStartDate")!=null){
				var startDate = $(dateTimeObj).attr("data-dateStartDate");
				var intDate = parseInt(startDate);
				if(intDate.toString()=='NaN'){
					defionOptions.startDate = startDate;
				}else{
					defionOptions.startDate=moment(intDate).format("YYYY-MM-DD HH:mm");
				}
			}
			//定义日历控件的位置
			if($(item).attr("data-pickerPosition")){
				defionOptions.pickerPosition = $(item).attr("data-pickerPosition");
			}
			
			var options = $.extend(true,{},defaultConfig,defionOptions);
			$(dateTimeObj).datetimepicker(options);
			//如果设置了默认当前时间
			var defaultToday = $(dateTimeObj).attr("data-defaultNow");
			if(defaultToday&&defaultToday=="true"){
				var currInput = $(dateTimeObj).find('input');
				var currVal = $(currInput).val();
				var currDate = moment().format("YYYY-MM-DD HH:mm");
				if(isStringNull(currVal)){
					$(currInput).val(currDate);
				}
			}
			//更新时间
			$(dateTimeObj).datetimepicker("update");
		});
		
//		$('body').removeClass("modal-open"); // fix bug when inline picker is used in modal
	}
	
	//处理时间控件
	var handleTimePickers = function (container) {
		if (!jQuery().timepicker) {
			return;
		}
		//定义默认配置
		var defaultOptions = {
			autoclose: true,
			minuteStep: 30,
			showSeconds: false,
			showMeridian: false,
			defaultTime:"12:00"
		}
		//时间控件初始化
		$('.timepicker',container).each(function(index,item){
			var defionOptions = {};
			//如果设置了默认当前时间
			var defaultNow = $(this).attr("data-defaultNow");
			if(defaultNow&&defaultNow=="true"){
				defionOptions.defaultTime="current";
			}
			var options = $.extend(true,{},defaultOptions,defionOptions);
			//初始化时间控件
			$(item).timepicker(options).on("changeTime.timepicker",function(timeObject){
		   		var timeObjectElement = $(timeObject.target);
		   		var timeValue = $(timeObjectElement).val();
		   		var timeValueObj = timeObject.time;
		   		if(timeValueObj.hours<10){
		   			$(timeObjectElement).val("0"+timeValueObj.value);
		   		}
			});
		});

		//当点击旁边的按钮时，
		$('.timepicker',container).parent('.input-group').on('click', '.input-group-btn button:first', function(e){
			e.preventDefault();
			$(this).closest('div.input-group').find('.timepicker').timepicker('showWidget');
		});
	}
	
	/**
	 * 处理下拉组件
	 */
	var handelSelects = function(container) {
		//加载下拉框
		if(jQuery().selectpicker){
			var defaultConfig = {
				iconBase: 'fa',
				tickIcon: 'fa-check',
				noneSelectedText:"请选择"
			};
			$('select.bs-select',container).each(function(index,item){
				var selectItem = $(item);
				$(selectItem).selectpicker(defaultConfig);
				if($(selectItem).is(":disabled")){
					$(selectItem).closest("div.bs-select").attr("disabled","disabled");
				}
			});
		}
	};
	
	/**
	 * 处理IonRangeSlider 
	 */
	var handelIonRangeSlider = function(container){
		//加载下拉框
		if(jQuery().ionRangeSlider){
			var defaultConfig = {
			};
			$('input.ionRangeSlider',container).each(function(index,item){
				var sliderItem = $(item);
				var sliderConfig = $(sliderItem).attr("data-sliderConfig");
				//如果存在配置信息
				if(sliderConfig){
					var sliderConfigObj = $.parseJSON(sliderConfig);
					var valueArray = new Array();
					$.each(sliderConfigObj,function(key,value){
						valueArray.push(value);
					});
					//触发ionSlider
					$(sliderItem).ionRangeSlider({values:valueArray});
				}
			});
		}
	}
	
	/**
	 * 处理日期控件
	 */
	var handelComponent = function(container) {
		handleDatePickers(container); //处理日期控件
		handleDatetimePicker(container);//处理日期范围控件
		handleDateRangePickers(container);//处理日期范围控件
		futureDateRangePickers(container);
		handleTimePickers(container);//处理时间控件
		handelSelects(container); //处理下拉框
		handelIonRangeSlider(container); //处理IonRangeSlider
	};
	
	
	
	/**
	 * 获得按钮的名称
	 */
	function getBtnName(obj){
		var btnName = $.trim($(obj).text()); 
		
		if(btnName==undefined||btnName==""){
			btnName = $(obj).attr("title");
		}
		if(btnName==undefined||btnName==""){
			btnName = $(obj).attr("data-original-title");
		}
		return btnName;
	}
	
	
	/**
	 * 弹出确认框
	 */
	function confirmElement(confirmationObj,confirmText,confirmEvent,onCancleEvent,btnCancelHide){
		
		//如果已经初始化，则不进行初始化操作
		if($(confirmationObj).attr("data-isInit")=="true"){
			return false;
		}
		var defaultOption = {
			container: 'body', 
			btnOkClass: 'btn btn-sm btn-success', 
			btnCancelClass: 'btn btn-sm btn-info',
			title:confirmText,
			btnCancelLabel:"取消",
			btnCancelHide: btnCancelHide,
			btnOkLabel:"确认",
			placement:$(confirmationObj).attr("data-placement") || "top",
			onShow:function(event,element){
				if($(confirmationObj).isDisabled()){
					event.preventDefault();
					return false;
				}
			},
			onCancel:function(event, element){
				//触发click事件
				$(confirmationObj).trigger("dms.onCancel");
				
				//取消事件
				if(onCancleEvent){
					onCancleEvent(confirmationObj);
				}
			},
			onConfirm:function(event, element){
				event.preventDefault();
				var confirmTip = $("#"+$(element).attr("aria-describedby"));
				var confirmOkBtn = $("a.btn-success",confirmTip);
				if(!confirmOkBtn.attr("disabled")){
					confirmOkBtn.attr("disabled","disabled");
				}else{
					return false;
				}
				//触发click事件
				$(confirmationObj).trigger("dms.onConfirm");
				
				//执行confirma 操作
				if(confirmEvent){
					confirmEvent(confirmationObj);
				}
			}
		};
		
		//生成confirm 框
		$(confirmationObj).confirmation(defaultOption);
		
		//展示完毕后
		$(confirmationObj).on("shown.bs.confirmation",function(e){
			var element = this;
			var confirmTip = $("#"+$(element).attr("aria-describedby"));
			var confirmOkBtn = $("a.btn-success",confirmTip);
			confirmOkBtn.removeAttr("disabled");
		});
		
		//更新为已初始化
		$(confirmationObj).attr("data-isInit","true");
		
	}
	
	
	/**
	 * boostrap 弹出框，如:是否要新增
	 */
	var handleBootstrapConfirmation = function(container) {
		if (!$().confirmation) {
			return;
		};
		var activeOkBtn;
		$.each($('[data-toggle=confirmation]',container),function(i,confirmationObj){
			//获得按钮名称
			var btnText = getBtnName(confirmationObj);
			var confirmText = $(confirmationObj).attr("data-confirmText") || "";
			//创建confirm 事件
			confirmElement(confirmationObj,confirmText||("是否确认"+btnText+"?"),function(confirmObj){
				if(($(confirmObj).attr("data-fileUploadBtn")=="true"||$(confirmObj).attr("data-method")=="importData")&&$("input[type=file]",container).size()>0){
					$(confirmObj).trigger("dms.upload");
				}else{
					ajaxRest(confirmObj,container);
				}
			});
			
			//设置title;
			if($(confirmationObj).attr("title")==undefined||$(confirmationObj).attr("title")==""){
				$(confirmationObj).attr("title",btnText);
			}
		});
	};
	
	/**
	 * 执行表单验证
	 */
	function validateForm(formObj){
		//如果校验不通过，则返回不再执行
		if (formObj) {
			if(!$(formObj).validate().form()){
				return false;
			}
		}
		return true;
	}
	
	
	/**
	 * 对于查询页面执行focus 功能
	 */
	function focusElement(focusElement){
		//如果是第一次则不执行
//		if($(focusElement).attr("isFirstFocus")==undefined||$(focusElement).attr("isFirstFocus")=="true"){
//			return;
//		}
		//如果是查询页面
		if($(focusElement).closest("div.dms-search").size()>0){
			$(focusElement).focus();
			$(focusElement).attr("isFirstFocus","false");
		}
	}
	
	/**
	 * 处理操作信息框
	 */
	var handelBootstrapToastr = function(option){
		toastr.options = {
				  "closeButton": true,
				  "debug": false,
				  "positionClass": "toast-top-center",
				  "onclick": null,
				  "showDuration": "1000",
				  "hideDuration": "1000",
				  "timeOut": "2000",
				  "extendedTimeOut": "1000",
				  "showEasing": "swing",
				  "hideEasing": "linear",
				  "showMethod": "fadeIn",
				  "hideMethod": "fadeOut"
		};
		//覆盖默认属性
		toastr.options =  $.extend(true,toastr.options,option);
		var $toast = toastr[option.status](option.msg, "操作结果");
	};

 	/**
 	 * 处理form 表单处理逻辑
 	 */
	var handlePanpelTools = function(container) {
		$(".panel > .panel-heading > .pannel-tools > .collapse, .panel > .panel-heading > .pannel-tools > .expand",container).on('click', function(e){
			e.preventDefault();
			var el = $(this).closest(".panel").children(".panel-body");
			if ($(this).hasClass("collapse")) {
				$(this).removeClass("collapse").addClass("expand");
				$(this).html('<i class="fa fa-chevron-down"></i>');
				el.slideDown(200);
			} else {
				$(this).removeClass("expand").addClass("collapse");
				$(this).html('<i class="fa fa-chevron-up"></i>');
				el.slideUp(200);
			}
		});
		//默认折叠
		$(".panel > .panel-heading > .pannel-tools > .collapse",container).each(function(index,item){
			var el = $(item).closest(".panel").children(".panel-body");
			$(item).html('<i class="fa fa-chevron-up"></i>');
			el.slideUp(200);
		});
		
		
	};
	
	/**
	 * 绑定页面button 按钮
	 */
	function bindPageButtonEvent(container){
		//对重置按钮进行事件绑定
		$('div.dms-search',container).find("div.query-btn i.fa-undo").parent().each(function() {
			var btn = this;
			var formObj = $(btn).closest("form");
			//记忆form 表单的默认值
			//如果是在弹出页面
			var memoryContainer;
			if($(btn).closest($("#modelContainerDiv")).size()>0){
				memoryContainer = $("#modelContainerDiv");
			}else{
				memoryContainer = container;
			}
			memorySearchCondition(btn,memoryContainer,"memoryDefaultSearchData");
			//绑定重置按钮
			$(btn).on('click', function(e) {
				resetForm(this,container);
				//日期控件重置
				var dateInput = formObj.find('.input-group.input-daterange');
				if(dateInput.length){
					$.each(dateInput.find('input'), function(i, ele){
						$(ele).datepicker('clearDates');
					});
				}
			});
		}).closest(".panel-body").each(function(i){
//			return;
			if(window["enable_collapse"] && i==0){
				var panel = $(this);
				$(this).css({
					"position":"relative"
				});
				var panel_height;
				panel.after($("<span data-collapse='true' style='width:80px;height:9px;display:inline-block;border:1px solid #B8D0D6;background:#FFF;position:absolute;left:50%;margin:-4px 0 0 -40px;cursor:pointer;'><i style='width:9px;height:5px;display:inline-block;background:url(../assets/global/img/ico_collapse.png) 0px 0px no-repeat;position:absolute;left:50%;top:1px;margin-left:-5px;' /></span>").click(function(){
					var _cbtn = $(this);
					if(!panel.data("_collapse")){
						panel_height = panel.height();
						panel.slideUp(200, function(){
							_cbtn.css("margin-top", "0px").find("i").css("background-position", "0px -4px");
							panel.data("_collapse", true);
							$(window).trigger("resize");
						});
					}else{
						panel.slideDown(200, function(){
							_cbtn.css("margin-top", "-4px").find("i").css("background-position", "0px 0px");
							panel.data("_collapse", false);
							$(window).trigger("resize");
						});
					}
				}));
			}
		});
		
		/**
		 * 绑定清空按钮事件
		 */
		$("button.input-clear,div.date button.date-reset, input.timepicker ~ span.input-group-btn button.date-reset",container).on("click",function(event){
			var clearBtn = $(this);
			var inputGroup = $(clearBtn).closest("div.input-group");
			//清空元素
			clearDivElement(inputGroup);
		});
	}
	
	function searchFormCollapse(container){
		$("span[data-collapse]", container).click();
	}
	
	/**
	 * 清空div 内的元素
	 */
	function clearDivElement(divContinaer){
		
		if($(divContinaer).hasClass("input-daterange")){
			$("input",divContinaer).each(function(index,item){
				valChange(item,"");
			});
//			$(divContinaer).data("daterangepicker").setStartDate(-Infinity);
//			$(divContinaer).data("daterangepicker").setEndDate(Infinity);
//			$(divContinaer).trigger("change");
		}else{
			$("input",divContinaer).each(function(index,item){
				valChange(item,"");
			});
		}
	}
	
	/**
	 * 绑定查询页面的事件
	 */
	var handleFormStatic = function(container) {
		
		//初始化弹出框
		initModel(container);
		//初始化页面
		initHtmlPage(container);
		//初始化tab 页
		initTab(container);
		
		//初始化字段值(自动计算)
		initPageFileldValue(container);
		
		//绑定DMS 绑定事件
		initDmsClickEvent(container);
	};
	
	/**
	 * 绑定点击事件
	 */
	function initDmsClickEvent(container){
		//对重置按钮进行事件绑定
		$("a[data-onclickEvent='true'],a[data-onclickEvent1='true'],a[data-onclickEvent2='true'],a[data-onclickEvent3='true'],a[data-onclickEvent4='true'],button[data-onclickEvent='true'],button[data-onclickEvent1='true'],button[data-onclickEvent2='true']",container).each(function() {
			$(this).off('click').on('click', function(e) {
				var that = this;
				if($(that).isDisabled()){
					return false;
				}
				//如果在这个按钮上绑定了验证条件
				if($(that).attr("data-validate")=="true"){
					//获得按钮对应的Form表单
					var formObj = getBtnWithForm($(that));
					//执行表单校验
					if(!validateForm(formObj)){
						return;
					}
				}
				//绑定DMS 点击事件
				$(that).trigger("dms.click");
			});
		});
		
		//对界面的ajax请求进行事件绑定
		$(DMS_CLOSEST_DIV,container).find("a.ajaxrest").each(function() {
			var btn = $(this);
			$(btn).on('click', function() {
				//如果是附件或是文件导入类型
				if(($(btn).attr("data-fileUploadBtn")=="true"||$(btn).attr("data-method")=="importData")&&$("input[type=file]",container).size()>0){
					$(btn).trigger("dms.upload");
				}else{
					ajaxRest(btn,container);
				}
			});
		});
	}
	/**
	 * 初始化页面值,自动计算
	 */
	function initPageFileldValue(container){
		
		$("[data-autoValue]",container).each(function(index,item){
			var formual = $(item).attr("data-autoValue");
			bindAutoValueEvent(item,formual,container);
		});
		
		$("[data-autoValueDigits]",container).not('[data-autoValue]').each(function(index, item){			//自动四舍五入，暂只支持input
			var digits = $(item).attr("data-autoValueDigits");
			$(this).off('blur.dms').on('blur.dms', function(){
				value = $(this).val()*1 || 0;
				if(value%1){
					$(this).val(value.toFixed(parseInt(digits)));
				}	
			});
		});
		
		$("[data-autoPinYin]",container).each(function(index,item){
			var convertField = $(item).attr("data-autoPinYin");
			bindAutoPinYinEvent(item,convertField,container);
		});
		
		$("[data-autoSyncValue]",container).each(function(index,item){
			var convertField = $(item).attr("data-autoSyncValue");
			//绑定同步事件
			bindChangeEvent($(convertField,container),function(obj){
				setDmsValue($(item),$(obj).val());
			});
		});
	}
	
	/**
	 * 定义执行计算的逻辑
	 */
	var calcAmount = function(item,fieldArray,container,obj){
		var flag = true;
		var valueArray = new Array();
		$(fieldArray).each(function(index,item){
			var value = $(item,container).val();
			//如果为空
			if(!$(item,container).validateElement()){
				flag = false;
				return false;
			}
			//如果为空
			if(isStringNull(value)){
				value = "0";
			}
			valueArray.push(value);
		});
		//如果数据校验成功
		if(flag){
			var result = $(item).attr("data-autoValue");
			$.each(fieldArray,function(index,item){
				var value = valueArray[index];
				if(value.indexOf("-")!=-1){
					value="("+value+")"
				}
				result = result.replace(item, value);
			});
			//进行四舍五入
			var value = eval(result);
			var digits = $(item).attr("data-autoValueDigits");
			if(digits){
				value = value.toFixed(parseInt(digits));
			}
			$(item).valChange(value);
			//如果item 不是input 属性
			if(!$(item).is(":input")){
				$("input",$(item).parent()).valChange(value);
			}
		}
	}
	/**
	 * 绑定自动值计算逻辑
	 */
	function bindAutoPinYinEvent(item,convertField,container){
		$(item).attr("disabled","disabled");
		//绑定事件
		bindChangeEvent($(convertField,container),function(obj){
			$(item).val($(obj).toPinyin());
		});
	}
	/**
	 * 绑定自动值计算逻辑
	 */
	function bindAutoValueEvent(item,formual,container,afterEvent){
		//如果并标记为不disabled
		if($(item).attr("data-notDisabled")==undefined || $(item).attr("data-notDisabled")!="true"){
			$(item).attr("disabled","disabled");
		}
		var fieldArray = analysisFormual(formual);
		//绑定事件
		bindElementChangeEvent(fieldArray,function(obj){
			calcAmount(item,fieldArray,container,obj);
			//如果存在自动计算后的逻辑，则执行后续逻辑
			if(afterEvent){
				afterEvent(item);
			}
		},container);
	}
	/**
	 * off 绑定事件
	 */
	function unBindAutoValueEvent(fieldOperator,formula,container){
		container = (container==undefined?getElementContext():container);
		$(fieldOperator).removeAttr("disabled");
		var reg=new RegExp ("#[^\\+\\-\\*\\/\\)\\(]+","g");
		var matchResult= formula.match(reg);
		var fieldArray = new Array();
		$.each(matchResult,function(index,itemId){
			fieldArray.push(itemId);
		});
		//绑定事件
		unbindElementChangeEvent(fieldArray,container);
	
	}
	
	/**
	 * 绑定元素变更事件
	 */
	function bindElementChangeEvent(fieldArray,callBack,container){
		//循环绑定事件
		$(fieldArray).each(function(index,item){
			var fieldObject;
			if($.type(item)=="string"){
				fieldObject = $(item,container==undefined?getElementContext():container);
			}else{
				fieldObject = item;
			}
			//绑定变更事件
			bindChangeEvent(fieldObject,callBack);
		});
	}
	
	/**
	 * 绑定元素变更事件
	 */
	function unbindElementChangeEvent(fieldArray,container){
		//循环绑定事件
		$(fieldArray).each(function(index,item){
			var fieldObject;
			if($.type(item)=="string"){
				fieldObject = $(item,container==undefined?getElementContext():container);
			}else{
				fieldObject = item;
			}
			//绑定变更事件
			unbindChangeEvent(fieldObject);
		});
	}
	
	/**
	 * 绑定变更事件
	 */
	function bindChangeEvent(fieldObject,callBack){
		//如果是数组
		if($.isArray(fieldObject)){
			bindElementChangeEvent(fieldObject,callBack);
			return;
		}
		
		if($(fieldObject).attr("type")=="text"||$(fieldObject).attr("type")=="hidden"||$(fieldObject).is('textarea')){
			$(fieldObject).on("input change",function(e){
				callBack(this,e);
			});
			return;
		}
		if($(fieldObject).is('select')){
			$(fieldObject).on("change",function(e){
				callBack(this,e);
			});
			return;
		}
		if($(fieldObject).attr("type")=="checkbox"||$(fieldObject).attr("type")=="radio"){
			$(fieldObject).on("click",function(e){
				callBack(this,e);
			});
			return;
		}
	}
	
	/**
	 * 绑定变更事件
	 */
	function unbindChangeEvent(fieldObject){
		//如果是数组
		if($.isArray(fieldObject)){
			unbindElementChangeEvent(fieldObject);
			return;
		}
		if($(fieldObject).attr("type")=="text"||$(fieldObject).attr("type")=="hidden"||$(fieldObject).is('textarea')){
			$(fieldObject).off("input");
			return;
		}
		if($(fieldObject).is('select')){
			$(fieldObject).off("change");
			return;
		}
		if($(fieldObject).attr("type")=="checkbox"||$(fieldObject).attr("type")=="radio"){
			$(fieldObject).off("click");
			return;
		}
	}
	
	/**
	 * 绑定变更事件
	 */
	function valChange(fieldObject,val,isTriggerChange){
		if($(fieldObject).attr("type")=="text"||$(fieldObject).attr("type")=="hidden"||$(fieldObject).is('textarea')){
			$(fieldObject).val((val+"").escape2Html());
			if(isTriggerChange==undefined||isTriggerChange==true){
				$(fieldObject).trigger("input");
			}
			return;
		}
		if($(fieldObject).is('select')){
			$(fieldObject).selectpicker('val',val);
			if(isTriggerChange==undefined||isTriggerChange==true){
				$(fieldObject).trigger("change");
			}
			return;
		}
		
		if($(fieldObject).is('span')){
			$(fieldObject).text((val+"").escape2Html());
			return;
		}
	}
	/**
	 * 初始化父表格
	 */
	function initParentTable(container){
		$("div[data-parentTable]",container).each(function(index,item){
			var tableId = $(item).attr("data-parentTable");
			var strs= new Array(); //定义一数组 
			strs=tableId.split(",");	
			var extendParentOptions = {
					onDblClickRow:function(rowData,trElement){
						//初始化页面内容
						initPageContent(rowData,item);
					}
			};
			for(var i=0;i<strs.length;i++){
				$("#"+strs[i],getElementContext()).bootstrapTable('refreshOptions',extendParentOptions,false);
			}
		});
	}
	
	/**
	 * 清理页面缓存
	 */
	function cleanPageCache(){
		$("div.daterangepicker").remove();
	}
	
	function getRequest(url) {
		var theRequest = new Object();
		if(!url) return;
		if (url.indexOf("?") != -1) {
			var str = url.substr(url.indexOf("?")+1);
			strs = str.split("&");
			for (var i = 0; i < strs.length; i++) {
				theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
			}
		}
		return theRequest;
	}
	
	/**
	 * 初始化html 页面
	 */
	function initHtmlPage(container){
		
		var ajaxifyEvent = function (e){
			if($(this).isDisabled()){
				return false;
			}
			e.preventDefault();
			App.scrollTop();
			
			//清理页面缓存
			cleanPageCache();
			
			var url = $(this).attr("href");
			var pageContentBody = $('div#dmsPageContent div.tab-pane.active');
			if (App.getViewPort().width < Layout.getResBreakpointMd() && $('.page-sidebar').hasClass("in")) { // close the menu on mobile view while laoding a page 
				$('.page-header .responsive-toggler').click();
			}
			
			var tableFlag = $(this).attr('data-tableFlag');
			//执行打开窗口前事件
			if(tableFlag&&tableFlag=="true"){
				$(this).trigger("initTableData.dms");
			}
			
			var beforeShowEvent = $(this).attr('data-beforeShowEvent');
			//执行打开窗口前事件
			if(beforeShowEvent&&beforeShowEvent=="true"){
				var result = {status:true};
				$(this).trigger("beforeShow.dms",[result]);
				if(!(result.status)){
					return ;
				}
			}
			
			var pageData = $.extend({"dmsFuncId":container.data("dmsFuncId")}, getRequest(url), $(this).data('pageData'));
			
			//记录查询界面查询条件
			var autoMemorySearchData = $(this).attr('data-autoMemorySearchData');
			if(autoMemorySearchData != 'false'){
				memorySearchCondition($(this),pageContentBody,"memorySearchData");
			}
			//判断是否是明细界面
			var isDetailFlag = $(this).attr("data-isDetailFlag");
			//执行页面请求
			ajaxPageRequest({
				url:url,
				container:pageContentBody,//定义容器
				pageData:pageData,
				success:function(html){
					//如果是明细界面，则将界面元素标记为只读
					if(isDetailFlag&&isDetailFlag=="true"){
						$("div.dms-edit",pageContentBody).attr("data-isDetailFlag",true);
					}
				},
				complete:function(xmlRequest, statusCode){
					//还原查询条件
					revertSearchFormCondition(pageContentBody,url,"memorySearchData");
				}
			});
		};
		/**
		 * 处理ajaxify 请求，对于主页面
		 */
		 $('a.ajaxify',container).off('click.dms').on('click.dms',ajaxifyEvent);
		 
		 var printfyEvent = function (e){
			 if($(this).isDisabled()){
 				return false;
 			}
			var mode ="popup";
			var close = mode == "popup";
			var extraCss = "../assets/layouts/layout/css/PrintArea_A4.css";
			var print = "div.PrintArea" ;
			var keepAttr = [];
			keepAttr.push("class");
			keepAttr.push("id");
			keepAttr.push("style");
			var headElements = '<meta charset="utf-8" />,<meta http-equiv="X-UA-Compatible" content="IE=edge"/>';
			var options = { mode : mode,  popHt : 768, popWd : 675, popClose : true, extraCss : extraCss, retainAttr : keepAttr, extraHead : headElements };
			$(print,container).printArea( options );
		 }
		 $('a.printfy',container).on('click',printfyEvent);
	}
	
	/**
	 * 记录查询条件
	 */
	function memorySearchCondition(btn,pageContainer,dataName){
		if(dataName!="memoryDefaultSearchData"||$(pageContainer).data(dataName)==undefined){
			var searchDiv = $(btn).closest("div.dms-search");
			if(searchDiv.size()>0){
				var formObj = $("form:first",searchDiv);
				$(pageContainer).data(dataName,$(formObj).serializeFormJson());
			}
		}
	}
	/**
	 * 重置查询页面的查询条件
	 */
	var revertSearchFormCondition = function(pageContainer,url,dataName){
		var searchDiv = $(pageContainer).children("div.dms-search");
		if(searchDiv.size()>0){
			var searchForm = $("form:first",searchDiv);
			//设置查询条件
			setSearchFormCondition(searchForm,$(pageContainer).data(dataName));
		}
	}
	
	/**
	 * 设置明细页面的只读
	 */
	function setDetailPageReadOnly(container,filterFunction){
		var editContainer = $("div.dms-edit",container);
		if(editContainer.size()==0){
			editContainer = $(container).closest("div.dms-edit");
		}
		var isDetailFlag = editContainer.attr("data-isDetailFlag");
		//只读属性
		if(isDetailFlag&&isDetailFlag=="true"){
			setContainerReadOnly(container,filterFunction);
		}
	}
	/**
	 * 将页面上的元素改为只读
	 */
	function setContainerReadOnly(container,filterFunction){
		//文本输入框
		var inputArray = $('input[type!="hidden"],textarea,select,a:not([data-goback],[data-dismiss],[data-tokens],[data-toggle="tab"],.expand)',container);
		
		//设置元素的只读
		setElementsReadOnly(inputArray,filterFunction);
	}
	
	/**
	 * 将页面上的元素改为只读
	 */
	function removeContainerReadOnly(container,filterFunction){
		//文本输入框
		var inputArray = $('input[type!="hidden"],textarea,select,a:not([data-goback],[data-dismiss],[data-toggle="tab"],.expand)',container);
		
		//设置元素的只读
		removeElementsReadOnly(inputArray,filterFunction);
	}
	
	/**
	 * 设置元素的只读
	 */
	function setElementsReadOnly(inputArray,filterFunction){
		//设置过滤函数
		if(filterFunction){
			inputArray = inputArray.filter(filterFunction);
		}
		//循环过滤
		inputArray.each(function(index,item){
			setElementReadOnly(item);
		});
	}
	
	/**
	 * 设置元素的只读
	 */
	function removeElementsReadOnly(inputArray,filterFunction){
		//设置过滤函数
		if(filterFunction){
			inputArray = inputArray.filter(filterFunction);
		}
		//循环过滤
		inputArray.each(function(index,item){
			removeElementReadOnly(item);
		});
	}
	
	/**
	 * 定义只读元素的初始化
	 */
	function initElementReadOnly(container){
		$(".dmsDisabled",container).each(function(index,item){
			if($(item).is("div")){
				setContainerReadOnly(item);
			}else{
				setElementReadOnly(item);
			}
		});
	}
	
	/**
	 * 将元素标记为只读
	 */
	function setElementReadOnly(element){
		var obj = element;
		var isExcludeReadOnly = $(obj).attr("data-isExcludeReadOnly");
		//如果是排除的元素，则不执行隐藏
		if(isExcludeReadOnly&&isExcludeReadOnly=="true"){
			return;
		}
		//移除required 属性
		if($(obj).hasClass("required")){
			$(obj).attr("data-removeClass","required");
			$(obj).removeClass("required");
		}
		
		if($(obj).is('select')){
			if($(obj).hasClass("bs-select")){
				$(obj).attr("disabled","disabled");
				$(obj).closest("div.bs-select").addClass("disabled");
				$("button",$(obj).closest("div.bs-select")).addClass("disabled");
				$(obj).closest("div.bs-select").removeClass("required");
			}else{
				$(obj).attr("disabled","disabled");
			}
		}else if($(obj).attr("type")=="checkbox"){
				$(obj).attr("disabled","disabled");
				
		}else if($(obj).attr("type")=="radio"){
			$(obj).attr("disabled","disabled");
			
		}else if($(obj).attr("type")=="text"||$(obj).attr("type")=="hidden"||$(obj).is('textarea')){
			if($(obj).hasClass("ionRangeSlider")){
				$(obj).data("ionRangeSlider").appendDisableMask();
			}else{
				$(obj).attr("readonly","readonly");
				//隐藏按钮
				$(":not(input,textarea,span.input-group-addon,[data-isExcludeReadOnly='true'])",$(obj).parent()).hide();
				var objParentGroup = $(obj).parent("div.input-group");
				if($(objParentGroup).size()>0){
					$(objParentGroup).attr("data-removeClass",$(objParentGroup).attr("class").replace("input-group",""));
					objParentGroup.removeClass(function(){
						 return $(this).attr("data-removeClass");
					});//删除除了input-group的样式之外的样式
				}
			}
		}else if($(obj).is('a')){
			$(obj).hide();
		}else if($(obj).attr("type")=="file"){
			if($(obj).closest("div.file-input").size()>0){
				$("div.input-group-btn",$(obj).closest("div.file-input")).hide();
			}else{
				$(obj).attr("disabled","disabled");
			}
		}
	}
	
	/**
	 * 将元素标记为只读
	 */
	function removeElementReadOnly(element){
		var obj = element;
		var isExcludeReadOnly = $(obj).attr("data-isExcludeReadOnly");
		//如果是排除的元素，则不执行隐藏
		if(isExcludeReadOnly&&isExcludeReadOnly=="true"){
			return;
		}
		//移除required 属性
		//移除required 属性
		if($(obj).attr("data-removeClass")){
			$(obj).addClass($(obj).attr("data-removeClass"));
			$(obj).removeAttr("data-removeClass");
		}
		
		if($(obj).is('select')){
			if($(obj).hasClass("bs-select")){
				$(obj).removeAttr("disabled");
				$(obj).closest("div.bs-select").removeClass("disabled");
				$("button",$(obj).closest("div.bs-select")).removeClass("disabled");
			}else{
				$(obj).removeAttr("disabled");
			}
		}else if($(obj).attr("type")=="checkbox"){
			$(obj).removeAttr("disabled");
				
		}else if($(obj).attr("type")=="radio"){
			$(obj).removeAttr("disabled");
			
		}else if($(obj).attr("type")=="text"||$(obj).attr("type")=="hidden"||$(obj).is('textarea')){
			$(obj).removeAttr("disabled");
			$(obj).removeAttr("readonly");
			//隐藏按钮
			$(":not(input)",$(obj).parent()).show();
			var objParentGroup = $(obj).parent(".input-group");
			objParentGroup.addClass(objParentGroup.attr("data-removeClass"));
			objParentGroup.removeAttr("data-removeClass");//删除所有的样式
		}else if($(obj).is('a')){
			$(obj).show();
		}
	}
	
	/**
	 * 将元素标记为非必填
	 */
	function removeElementsRequired(inputArray,filterFunction){
		//设置过滤函数
		if(filterFunction){
			inputArray = inputArray.filter(filterFunction);
		}
		//循环过滤
		inputArray.each(function(index,item){
			removeElementRequired(item);
		});
	}
	
	//移除required 属性
	function removeElementRequired(element){
		var obj = element;
		//移除required 属性
		$(obj).removeClass("required");
		
		if($(obj).is('select')){
			if($(obj).hasClass("bs-select")){
				$(obj).closest("div.bs-select").removeClass("required");
			}
		}
	}
	
	/**
	 * 将元素标记为必填
	 */
	function addElementsRequired(inputArray,filterFunction){
		//设置过滤函数
		if(filterFunction){
			inputArray = inputArray.filter(filterFunction);
		}
		//循环过滤
		inputArray.each(function(index,item){
			addElementRequired(item);
		});
	}
	
	//添加required 属性
	function addElementRequired(element){
		var obj = element;
		//添加required 属性
		$(obj).addClass("required");
		
		if($(obj).is('select')){
			if($(obj).hasClass("bs-select")){
				$(obj).closest("div.bs-select").addClass("required");
			}
		}
	}
	
	/**
	 * 将元素标记为必填
	 */
	function setElementsRequired(inputArray,filterFunction){
		//设置过滤函数
		if(filterFunction){
			inputArray = inputArray.filter(filterFunction);
		}
		//循环过滤
		inputArray.each(function(index,item){
			setElementRequired(item);
		});
	}
	
	function setElementRequired(element){
		var obj = element;
		//移除required 属性
		$(obj).addClass("required");
		
		if($(obj).is('select')){
			if($(obj).hasClass("bs-select")){
				$(obj).closest("div.bs-select").addClass("required");
			}
		}
	}
	
	//初始化弹出框
	function initModel(container){
		var modelEvent = function(e){
			var el = $(this);
			
			var currentModal = $(el).closest(".modal-content");
			
			if(el.isDisabled()){
				return false;
			}
			e.preventDefault();
			
			var modalSize = $("#modelContainerDiv").data("data-modalSize");
			if(modalSize==undefined){
				modalSize = 0;
			}
			modalSize = modalSize+1;
			$("#modelContainerDiv").append('<div id="ajax-modal'+modalSize+'" class="modal fade draggable-modal" tabindex="-1" aria-hidden="true" ><div class="modal-dialog" ><div class="modal-content" > </div></div></div>')
			
			var $modal = $('#ajax-modal'+modalSize);
			var defineWidth = el.attr('data-width');
			if(defineWidth){
				$(".modal-dialog",$modal).addClass(defineWidth);
				$modal.addClass("bs-"+defineWidth);
			}else{
				$(".modal-dialog",$modal).addClass("modal-md");
				$modal.addClass("bs-modal-md");
			}
			
			var tableFlag = el.attr('data-tableFlag');
			//执行打开窗口前事件
			if(tableFlag&&tableFlag=="true"){
				$(el).trigger("initTableData.dms");
			}
			
			var beforeShowEvent = el.attr('data-beforeShowEvent');
			//执行打开窗口前事件
			if(beforeShowEvent&&beforeShowEvent=="true"){
				var result = {status:false};
				$(el).trigger("beforeShow.dms",[result]);
				if(!(result.status)){
					return ;
				}
			}
			var url = el.attr('data-url');
			var pageData = $.extend({"dmsFuncId":container.data("dmsFuncId")}, getRequest(url), el.data('pageData'));
			
			//绑定关闭事件
			$modal.on('hidden.bs.modal', function () {
				setTimeout(function(){
					$modal.remove();
				},100);
			});
				
			var modelContainer = $(".modal-content",$modal);
			modelContainer.data("dmsFuncId", container.data("dmsFuncId"));
			$modal.draggable({
				handle: ".modal-header"
			});
			
			//判断是否是明细按钮
			var isDetailFlag = $(el).attr("data-isdetailflag");
			//执行页面请求
			ajaxPageRequest({
				url:url,
				container:modelContainer,//定义容器
				pageData:pageData,
				complete:function(xmlRequest, statusCode){
					var modalShowOption = {};
					if(isDetailFlag != "true" && $('>div.dms-add, >div.dms-edit', modelContainer).size() > 0){
						modalShowOption.backdrop = "static";
					}
					$modal.modal(modalShowOption);
					//设置父窗口
					if(currentModal!=undefined){
						$(modelContainer).data("data-parentModal",currentModal);
					}
					$("#modelContainerDiv").data("data-modalSize",modalSize);
					
					//如果是明细界面，则将界面元素标记为只读
					if(isDetailFlag&&isDetailFlag=="true"){
						$("div.dms-edit",modelContainer).attr("data-isDetailFlag",true);
					}
				}
			});
		};
		
		//初始化弹出框
		$('[data-toggle="modal"]',container).off('click.dms').on('click.dms',modelEvent);
	}
	
	/**
	 * 初始化tab 页
	 */
	function initTab(container){
		//初始化tab页
		$("a[data-toggle=\"tab\"]:not([data-target])",container).on('click', function(event){
			var tabElement = $(this);
			var tabId= $(tabElement).attr("href");
			var contentBody = $(tabId,container);
			
//			$(tabElement).on('shown.bs.tab', function (e) {
//				alert("intoddd");
//			});
			//页面信息
			var url = contentBody.attr('data-url');
			var pageData = $.extend(getRequest(url), $(tabElement).data('pageData'));
			//判断是否是明细界面
			var isDetailFlag = container.find("div.dms-edit:first").attr("data-isDetailFlag");
			
			if(url&&(contentBody.attr("data-loaded")==undefined||contentBody.attr("data-loaded")=="false")){
				//执行页面请求
				ajaxPageRequest({
					url:url,
					container:contentBody,//定义容器
					pageData:pageData,
					complete:function(xmlRequest, statusCode){
						contentBody.attr("data-loaded","true");
						$(tabElement).trigger("initTab.dms");
						
						//如果是明细界面，则将界面元素标记为只读
						if(isDetailFlag&&isDetailFlag=="true"){
							$("div.dms-edit",contentBody).attr("data-isDetailFlag",true);
						}
					}
				});
			}else{
				//触发tab的click 事件
				$(tabElement).trigger("dms.click");
			}
			//增加样式
			$("a[data-toggle=\"tab\"]",$(contentBody).closest("ul.nav-tabs")).each(function(index,item){
				  var tabIdChild= $(item).attr("href");
	  			  $(tabIdChild).removeClass("active");
	  			  $(tabIdChild).removeClass("in");
			});
			$(contentBody).addClass("active").addClass("in");
		});
		
		//触发活动页
		$(".nav-tabs",container).each(function(index,tab){
			var initActiveTab = $("li.active >a ",tab);
			//如果一次性全部加载
			if($(tab).attr("data-initFirst")!=undefined&&$(tab).attr("data-initFirst")=="true"){
				
				//绑定初始化事件
				$("li >a ",tab).on("initTab.dms",function(event){
					var notInitPane = $.grep($("div.tab-content>div.tab-pane",$(tab).parent()),function(pane,j){
						return $(pane).attr('data-url')&&($(pane).attr("data-loaded")==undefined||$(pane).attr("data-loaded")=="false");
					});
					//如果没有未加载的panpel,再次点击一次
					if($(notInitPane).size()==0){
						$(initActiveTab).click();
					}else{
						var notInitPaneOne = $(notInitPane).get(0);
						$("a[href='#"+$(notInitPaneOne).attr("id")+"']",tab).click();
					}
				});
			}
			$(initActiveTab).click();
		});
	}
	
	/**
	 * 通过ajax 方式加载数据
	 */
	var handleFormAjax = function(container) {
		//对界面的ajax请求进行事件绑定
		$('div.ajaxrest.dms-edit',container).each(function() {
			var url = $(this).attr("data-url");
			if(url){
				var elment = this;
				var model = $(this).attr("data-model"); 
				var pageInitCallBack = $(this).attr("data-pageInitCallBack"); 
				url = dmsCommon.getDmsPath()[model]+url;
				var initContainer = $(this);
				//进行ajax 请求
				ajaxRestRequest({
					url:url,
					type:"GET",
					sucessCallBack:function(response){
						initPageContent(response,initContainer);
						if(pageInitCallBack&&pageInitCallBack=="true"){
							$(elment).trigger("callBack.dms",[response, container]);
						}
					}
				});
			}
		});
		
		
		//对界面的ajax请求进行事件绑定
		$('input[data-valueUrl],select[data-valueUrl],textarea[data-valueUrl],span[data-valueUrl]',container).each(function(index,obj) {
			var dataValueUrl = $(obj).attr("data-valueUrl");
			//数据值的URL
			if(dataValueUrl){
				//确定使用的参数类型
				var dataValueType = $(obj).attr("data-valueType");
				var dataAjaxSync = $(obj).attr("data-ajaxSync");
				var dataValueModel ;
				if("parameter"==dataValueType){
					dataValueModel = "manage";
				}else{
					dataValueModel = $(obj).attr("data-valueModel");
				}
				
				var parentDiv = $(obj).closest(dmsCommon.DMS_CLOSEST_DIV);
				var cacheData = $(parentDiv).data(dataValueUrl);
				if(cacheData != undefined){
					//执行初始化数据
					initParameterValue(obj,cacheData);
				}else{
					//进行ajax 请求
					ajaxRestRequest({
						url:dmsCommon.getDmsPath()[dataValueModel]+dataValueUrl,
						type:'GET',
						async:dataAjaxSync=="true"?false:true,
						sucessCallBack:function(data){
							//缓存数据
							$(parentDiv).data(dataValueUrl,data);
							//执行初始化数据
							initParameterValue(obj,data);
						}
					});
				}
			}
		});	
	};
	
	function initParameterValue(obj,data){
		//确定使用的参数类型
		var dataValueType = $(obj).attr("data-valueType");
		var returnValue;
		//如果使用参数类型
		if("parameter"==dataValueType){
			returnValue = data["paramValue"];
		}else{
			returnValue = JSON.stringify(data);
		}
		//如果是下拉框或是checkBox或是radio
		if($(obj).is("select")||$(obj).attr("type")=="checkbox"||$(obj).attr("type")=="radio"){
			$(obj).attr("data-value",returnValue);
			//执行数据初始化
			dmsDict.initData(obj);
		}else{
			setDmsValue(obj,returnValue);
		}
		
		//设置dataValueUrl 为空
		$(obj).attr("data-valueUrl","");
		//触发回调函数
		if($(obj).attr("data-callBack")){
			$(obj).trigger("callBack.dms",returnValue);
		}
	}
	
	/**
	 * 处理所有与附件相关的功能
	 */
	var handelAllFile = function(container){
		handelFileDataUpload(container);
		handelFileAttacheUpload(container);
	};
	
	//处理文件上传功能--数据导入
	var handelFileDataUpload = function(container){
		//查找页面上的上传按钮
		$('a[data-method="importData"]',container).each(function(index,obj){
			//设置禁用
			$(obj).attr("disabled","disabled");
			
			//封装请求对象
			var requestObj = requestRestFormObj(obj,container);
			
			var fileUploadObjOption = $.extend(true,{},{
				 uploadUrl: getDmsFuncIdUrl(requestObj.url,null,container),
				 language:"zh",
				 fileActionSettings:{
					 layoutTemplates:"<div></div>",
				 },
				 showPreview:false,
				 showUpload:false,
				 showUploadedThumbs:false,
				 browseOnZoneClick:false,
				 enctype: 'multipart/form-data',
				 allowedFileExtensions : ['xls', 'xlsx'],
				 browseClass: "btn btn-primary", 
				 maxFileSize: 10240,
				 uploadExtraData:function(previewId, index){
					 return $.extend(true,$(requestObj.formObj).serializeFormJson(),{urlToken:currentToken});
				 }
			 });
			//文件上传初始化
			$('input[type="file"].importData',container).fileinput(fileUploadObjOption)
				.on("fileuploaderror",function(e,outData, msg){
					var statusCode = outData.jqXHR.status;
					//执行处理逻辑
					statusCodeHandel(requestObj,true)[statusCode](outData.jqXHR);
					var fileInputObj = this;
					$(fileInputObj).data('fileinput').unlock(true);
					//结束请求
					ajaxRestEnd(requestObj);
				}).on("fileloaded",function(e,file, previewId, i, reader){
					$(obj).removeAttr("disabled");
					var fileInputObj = this;
					//绑定单击事件
					$(obj).off("dms.upload").on('dms.upload', function() {
						if(requestBeforeValidate(obj,container)){
							//开始ajax 请求
							ajaxRestStart(requestObj);
							//执行上传
							$(fileInputObj).data('fileinput').upload();
						}
					});
				}).on("fileuploaded",function(e,outData){
					var statusCode = outData.jqXHR.status;
					//执行处理逻辑
					statusCodeHandel(requestObj,true)[statusCode](outData.jqXHR);
					//结束请求
					ajaxRestEnd(requestObj);
					
				});
		});
	};
	
	
	//处理文件上传功能--数据导入
	var handelFileAttacheUpload = function(container){
		var importFiles = $('input[type="file"].importFiles',container);
		//如果存在需要提交的按钮
		if(importFiles&&$(importFiles).size()>0){
			//文件上传初始化
			importFiles.each(function(fileindex,fileInput){
				var defineOption={};
				if($(fileInput).attr('data-limitFileType')){
					defineOption['allowedFileExtensions'] = $(fileInput).attr('data-limitFileType').split(',');
				}
				var fileBillid = $(fileInput).attr("data-billId");
				var fileBillType = $(fileInput).attr("data-billType");
				
				//如果不是在表格里的fileInput
				var isTable = $(fileInput).closest("table").size()>0;
				if(!isTable){
					if(fileBillid&&fileBillType){
						//进行ajax 请求
						ajaxRestRequest({
							url:dmsCommon.getDmsPath()["web"]+"/basedata/download/billFiles/"+fileBillType+"/"+fileBillid,
							type:"GET",
							sucessCallBack:function(response){
								var initialPreview = response.initialPreview;
								//改变URL 的值
								$.each(response.initialPreview,function(previewIndex,priviewUrl){
									response.initialPreview[previewIndex] = getDmsFuncIdUrl(dmsCommon.getDmsPath()["web"]+priviewUrl,currentToken,container);
								});
								$.each(response.initialPreviewConfig,function(previewIndex,priviewConifg){
									var previewConfig = response.initialPreviewConfig[previewIndex];
									previewConfig.url = getDmsFuncIdUrl(dmsCommon.getDmsPath()["web"]+previewConfig.url,currentToken,container);
								});
								var defineNewOption = $.extend({},defineOption,response,true);
								initFileInputWithPriview(fileInput,defineNewOption,container);
							}
						});
					}else{
						initFileInputWithPriview(fileInput,defineOption,container);
					}
				}else{
					defineOption.minFileCount = 0;
					defineOption.maxFileCount = 1;
					//如果存在对应的单据信息
					if(fileBillid&&fileBillType){
						//进行ajax 请求
						ajaxRestRequest({
							url:dmsCommon.getDmsPath()["web"]+"/basedata/download/billFiles/"+fileBillType+"/"+fileBillid,
							type:"GET",
							sucessCallBack:function(response){
								var initialPreview = response.initialPreview;
								if(response.initialPreviewConfig&&$(response.initialPreviewConfig).size()==1){
									defineOption.initialCaption = "<a>"+response.initialPreviewConfig[0].caption+"</a>";
								}
								var defineNewOption = $.extend({},defineOption,response,true);
								initFileInputWithoutPriview(fileInput,defineNewOption,container);
							}
						});
					}else{
						//加载没有预览界面
						initFileInputWithoutPriview(fileInput,defineOption,container);
					}
				}
			});
		}
	};
	
	
	/**
	 * 初始化附件信息,没有preview
	 */
	var initFileInputWithoutPriview = function(fileInput,defineOption,container){
		//定义查找范围
		var fileParentContainer = $(fileInput).parent();
		var inputFileName = $(fileInput).attr("data-inputName");
		var fileIdInputElement = $("input[name='"+inputFileName+"']:hidden",fileParentContainer);
		//如果是上次已经上传的文件
		if(defineOption.initialPreviewConfig&&defineOption.initialPreviewConfig[0]&&defineOption.initialPreviewConfig[0].key){
			$(fileIdInputElement).val(defineOption.initialPreviewConfig[0].key);
		}
		
		
		//定义默认属性
		var fileUploadObjDefaultOption = $.extend(true,{},{
			 uploadUrl: getDmsFuncIdUrl(dmsCommon.getDmsPath()["web"] + "/basedata/upload",null,container),
			 language:"zh",
			 showClose:false,
			 showPreview:false,
			 showUpload:false,
			 showUploadedThumbs:true,
			 browseOnZoneClick:true,
			 overwriteInitial: true,
			 initialPreviewAsData: true,
			 enctype: 'multipart/form-data',
			 browseClass: "btn btn-primary", 
			 maxFileSize: 10240,
			 layoutTemplates:{
				 modal:'<div class="modal-dialog modal-lg" role="document">\n' +
					'  <div class="modal-content">\n' +
					'	<div class="modal-header">\n' +
					'	  <div class="kv-zoom-actions pull-right">{close}</div>\n' +
					'	  <h3 class="modal-title">{heading} <small><span class="kv-zoom-title"></span></small></h3>\n' +
					'	</div>\n' +
					'	<div class="modal-body">\n' +
					'	  <div class="floating-buttons"></div>\n' +
					'	  <div class="kv-zoom-body file-zoom-content"></div>\n' + '{prev} {next}\n' +
					'	</div>\n' +
					'  </div>\n' +
					'</div>\n',
				 actions:'<div class="file-actions">\n' +
					'	<div class="file-footer-buttons">\n' +
					'		 {delete} {zoom} {other}' +
					'	</div>\n' +
					'	{drag}\n' +
					'	<div class="file-upload-indicator" title="{indicatorTitle}">{indicator}</div>\n' +
					'	<div class="clearfix"></div>\n' +
					'</div>'
			 },
			 allowedFileExtensions : ['xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'csv','pdf', 'zip', '7z', 'rar', 'jpg', 'jpeg', 'bmp', 'gif', 'png'],
			 minFileCount:1,
			 maxFileCount:20,
			 uploadExtraData:function(previewId, index){
				 return {urlToken:currentToken};
			 }
		 });
		//合并属性
		var options = $.extend({},fileUploadObjDefaultOption,defineOption);
		$(fileInput).fileinput(options)
		.on("filecleared",function(e,previewId, i){
			var fileInputObj = this;
			$(fileIdInputElement).val("");
			$(fileInputObj).removeAttr("data-isComplete");
			$("div.file-caption",fileParentContainer).off("click");
		}).on("fileuploaderror",function(e,outData, msg){
			if(msg){
				handelBootstrapToastr({status:"error",msg:msg,timeOut:"4000"});
				return;
			}
			//执行处理逻辑
			var fileInputObj = this;
			//获得返回的状态码
			var statusCode = outData.jqXHR.status;
			
			//封装请求对象
			var triggerBtn = $(fileInputObj).data("triggerBtn");
			var requestObj = requestRestFormObj(triggerBtn,container);
			
			var statusCodeHandelObj = statusCodeHandel(requestObj,true);
			//如果此状态吗存在处理逻辑
			if(statusCodeHandelObj[statusCode]){
				statusCodeHandelObj[statusCode](outData.jqXHR);
				return;
			}else{
				//报错
				handelBootstrapToastr({status:"error",msg:"</br>文件过大或请求超时，请删除重试",timeOut:"4000"});
			}
		}).on("fileloaded",function(e,file, previewId, i, reader){
			var fileInputObj = this;
			$(fileIdInputElement).val("");
			$(fileInputObj).removeAttr("data-isComplete");
		}).on("fileuploaded",function(e,outData,thumbId,i){
			var fileInputObj = this;
			
			var triggerBtn = $(fileInputObj).data("triggerBtn");
			
			//更新FileId 的值
			if(outData){
				var fileIdReturn = outData.jqXHR.responseJSON.fileUploadId;
				var inputFileName = $(fileInputObj).attr("data-inputName");
				$(fileIdInputElement).val(fileIdReturn);
				$(fileInputObj).attr("data-isComplete","true");
			}
			
			//执行ajax请求
			if((!$(fileInputObj).data('fileinput')._errorsExist())&&(!$(fileInputObj).data('fileinput').isError)){
				//如果都已经处理完毕
				if(isCanPostRequest(container)){
					//重置提交请求标识
					revertFileUploadFlag(container);
					//提交请求
					ajaxRest(triggerBtn,container);
				}
			}
		});
		
		//绑定文件名称单击事件
		$("div.file-caption",fileParentContainer).each(function(k,caption){
			var fileCaptionDiv = $(this);
			var key;
			if(options.initialPreviewConfig&&options.initialPreviewConfig[0]){
				key = options.initialPreviewConfig[0].key;
			}
			var billType = $(fileInput).attr("data-billType");;
			//增加下载样式
			$(fileCaptionDiv).addClass("download");
			if(key){
				$(fileCaptionDiv).on("click",function(event){
					if($(fileCaptionDiv).find("i").size()>0){
						//执行下载
						downLoadWithoutForm(fileCaptionDiv,dmsCommon.getDmsPath()["web"]+"/basedata/download/billFilesDownload/"+billType+"/"+key,null,container);
					}
				});
			}
		});
		
		
		//设置disable 隐藏
		if($(fileInput).attr("disabled")){
			$("div.input-group-btn",fileParentContainer).hide();
		}
		
		
		//绑定单击事件
		//提交按钮
		var submitBtn = $('a[data-fileUploadBtn="true"]',container);
		//如果不存在此按钮
		if(submitBtn==undefined||$(submitBtn).size()==0){
			submitBtn = $('a[data-fileUploadBtn="true"]',container.closest(DMS_CLOSEST_DIV));
		}
		$(submitBtn).on('dms.upload', function() {
			var triggerBtn = $(this);
			//设置触发按钮
			$(fileInput).data("triggerBtn",triggerBtn);
			//进行判断
			if((!$(fileInput).data('fileinput')._errorsExist())&&(!$(fileInput).data('fileinput').isError)&&requestBeforeValidate(triggerBtn,container)){
				var fileInputDataObj =  $(fileInput).data('fileinput');
				if(fileInputDataObj){
					if(fileInputDataObj.getFilesCount()>0&&isStringNull($(fileIdInputElement).val())){
						fileInputDataObj.upload();
					}else{
						//执行上传,如果没有需要上传的文件
						$(fileInput).attr("data-isComplete","true");
						$(fileInput).trigger("fileuploaded");
					}
				}
			}
		});
	}
	
	/**
	 * 判断附件是否已经处理完毕
	 */
	function isCanPostRequest(container){
		//执行ajax 请求
		var formContaner = $(container).closest(DMS_CLOSEST_DIV);
		var notSucessFiles = $.grep($("input[type=file]",formContaner),function(fileObj,j){
			return $(fileObj).attr("data-isComplete")==undefined||$(fileObj).attr("data-isComplete")!="true";
		});
		if($(notSucessFiles).size()==0){
			return true;
		}else{
			return false;
		}
	}
	
	/**
	 * 重置文件上传Flag
	 */
	function revertFileUploadFlag(container){
		//执行ajax 请求
		var formContaner = $(container).closest(DMS_CLOSEST_DIV);
		var notSucessFiles = $.each($("input[type=file]",formContaner),function(j,fileObj){
			$(fileObj).removeAttr("data-isComplete");
		});
	}
	
	/**
	 * 初始化附件信息
	 */
	var initFileInputWithPriview = function(fileInput,defineOption,container){
		//定义查找范围
		var fileParentContainer = $(fileInput).parent();
		//定义默认属性
		var fileUploadObjDefaultOption = $.extend(true,{},{
			 uploadUrl: getDmsFuncIdUrl(dmsCommon.getDmsPath()["web"] + "/basedata/upload",null,container),
			 language:"zh",
			 fileActionSettings:{
				 layoutTemplates:"<div></div>",
			 },
			 showClose:false,
			 showPreview:true,
			 showUpload:false,
			 showUploadedThumbs:true,
			 browseOnZoneClick:true,
			 overwriteInitial: false,
			 initialPreviewAsData: true,
			 enctype: 'multipart/form-data',
			 browseClass: "btn btn-primary", 
			 maxFileSize: 10240,
			 maxFilePreviewSize:10240, //最大10M
			 previewSettings: {
				image: {width: "160px", height: "95px"},
				text: {width: "160px", height: "95px"},
				pdf: {width: "160px", height: "95px"}
			 },
			 layoutTemplates:{
				 modal:'<div class="modal-dialog modal-lg" role="document">\n' +
					'  <div class="modal-content">\n' +
					'	<div class="modal-header">\n' +
					'	  <div class="kv-zoom-actions pull-right">{close}</div>\n' +
					'	  <h3 class="modal-title">{heading} <small><span class="kv-zoom-title"></span></small></h3>\n' +
					'	</div>\n' +
					'	<div class="modal-body">\n' +
					'	  <div class="floating-buttons"></div>\n' +
					'	  <div class="kv-zoom-body file-zoom-content"></div>\n' + '{prev} {next}\n' +
					'	</div>\n' +
					'  </div>\n' +
					'</div>\n',
				 actions:'<div class="file-actions">\n' +
					'	<div class="file-footer-buttons">\n' +
					'		 {delete} {zoom} {other}' +
					'	</div>\n' +
					'	{drag}\n' +
					'	<div class="file-upload-indicator" title="{indicatorTitle}">{indicator}</div>\n' +
					'	<div class="clearfix"></div>\n' +
					'</div>'
			 },
			 allowedFileExtensions : ['xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'csv','pdf', 'zip', '7z', 'rar', 'jpg', 'jpeg', 'bmp', 'gif', 'png'],
			 previewFileIconSettings: {
				'doc': '<i class="fa fa-file-word-o text-primary"></i>',
				'xls': '<i class="fa fa-file-excel-o text-success"></i>',
				'ppt': '<i class="fa fa-file-powerpoint-o text-danger"></i>',
//				'jpg': '<i class="fa fa-file-photo-o text-warning"></i>',
				'pdf': '<i class="fa fa-file-pdf-o text-danger"></i>',
				'zip': '<i class="fa fa-file-archive-o text-muted"></i>',
				'txt': '<i class="fa fa-file-text-o text-info"></i>'
			 },
			 previewFileExtSettings: {
				'doc': function(ext) {
					return ext.match(/(doc|docx)$/i);
				},
				'xls': function(ext) {
					return ext.match(/(xls|xlsx|csv)$/i);
				},
				'ppt': function(ext) {
					return ext.match(/(ppt|pptx)$/i);
				},
				'jpg': function(ext) {
					return ext.match(/(jp?g|png|gif|bmp)$/i);
				},
				'zip': function(ext) {
					return ext.match(/(zip|rar|tar|gzip|gz|7z)$/i);
				},
				'txt': function(ext) {
					return ext.match(/(txt|ini|md)$/i);
				},
				'pdf': function(ext) {
					return ext.match(/(pdf)$/i);
				}
			 },
			 minFileCount:0,
			 maxFileCount:20,
			 uploadExtraData:function(previewId, index){
				 return {urlToken:currentToken};
			 }
		 });
		//合并属性
		var options = $.extend({},fileUploadObjDefaultOption,defineOption);
		$(fileInput).fileinput(options)
		.on("fileremoved",function(e,previewId, i){
			var fileInputObj = this;
			
		}).on("fileerror",function(e,params, msg){
			console.log("into fileerror");
		}).on("fileuploaderror",function(e,outData, msg){
			var statusCode = outData.jqXHR.status;
			//执行处理逻辑
			var fileInputObj = this;
			//报错
			handelBootstrapToastr({status:"error",msg:"</br>文件过大或请求超时，请删除重试",timeOut:"4000"});
			
		}).on("fileloaded",function(e,file, previewId, i, reader){
			var fileInputObj = this;
//			//绑定单击事件
//			$(obj).off("dms.upload").on('dms.upload', function() {
//				if((!$(fileInputObj).data('fileinput')._errorsExist())&&(!$(fileInputObj).data('fileinput').isError)&&requestBeforeValidate(obj,container)){
//					var fileInputDataObj =  $(fileInputObj).data('fileinput');
//					//执行上传,如果有需要上传的文件
//					if(fileInputDataObj.getFilesCount()>0){
//						$(fileInputObj).data('fileinput').upload();
//					}else{
//						//执行上传,如果没有需要上传的文件
//						var fileCount = $("div.file-preview-frame",fileParentContainer).size();
//						if(fileCount>=$(fileInputObj).data('fileinput').minFileCount&&fileCount<=$(fileInputObj).data('fileinput').maxFileCount){
//							$(fileInputObj).trigger("filebatchuploadcomplete");
//						}
//					}
//				}
//			});
		}).on("fileuploaded",function(e,outData,thumbId,i){
			//更新FileId 的值
			var fileIdReturn = outData.jqXHR.responseJSON.fileUploadId;
			var fileInputObj = this;
			//绑定返回值
			$("#"+thumbId,fileParentContainer).data("fileId",fileIdReturn);
		}).on("filebatchuploadcomplete",function(e,outData){
			var fileInputObj = this;
			//执行ajax请求
			if((!$(fileInputObj).data('fileinput')._errorsExist())&&(!$(fileInputObj).data('fileinput').isError)){
				//循环preview---已经存在文件
				var filesIdValue="";
				
				var existsFileIdArray = new Array();
				$("div.file-initial-thumbs > div.file-preview-frame button.kv-file-remove",fileParentContainer).each(function(j,preview){
					existsFileIdArray.push($(preview).data("key"));
				});
				if(existsFileIdArray.length>0){
					filesIdValue += existsFileIdArray.join(",;");
				}
				//拼接分隔符
				filesIdValue+="##@";
				
				//循环preview---新上传的文件
				var fileIdArray = new Array();
				$("div.file-live-thumbs > div.file-preview-frame",fileParentContainer).each(function(j,preview){
					fileIdArray.push($(preview).data("fileId"));
				});
				if(fileIdArray.length>0){
					filesIdValue += fileIdArray.join(",;");
				}
				
				var fileId = $(fileInputObj).attr("id");
				var fileName = $(fileInputObj).attr("data-inputName");
				
				$("<input type='hidden' id = '"+fileId+moment().format("x")+"' value='"+filesIdValue+"' name='"+fileName+"'/>").appendTo($(fileInputObj).parent());
				//删除data信息
				$(fileInputObj).removeData("fileIds");
				
				//执行ajax 请求
				var triggerBtn = $(fileInputObj).data("triggerBtn");
				ajaxRest(triggerBtn,container);
			}
		});
		
		
		//绑定文件名称单击事件
		$("div.file-footer-caption",fileParentContainer).each(function(k,caption){
			var fileCaptionDiv = $(this);
			var key;
			if(options.initialPreviewConfig&&options.initialPreviewConfig[k]){
				key = options.initialPreviewConfig[k].key;
			}
			var billType = $(fileInput).attr("data-billType");;
			
			//增加下载样式
			$(fileCaptionDiv).addClass("download");
			if(key){
				$(fileCaptionDiv).on("click",function(event){
					//执行下载
					downLoadWithoutForm(fileCaptionDiv,dmsCommon.getDmsPath()["web"]+"/basedata/download/billFilesDownload/"+billType+"/"+key,null,container);
				});
			}
		});
		
		
		//绑定单击事件
		//提交按钮
		var submitBtn = $('a[data-fileUploadBtn="true"]',container);
		//如果不存在此按钮
		if(submitBtn==undefined||$(submitBtn).size()==0){
			submitBtn = $('a[data-fileUploadBtn="true"]',container.closest(DMS_CLOSEST_DIV));
		}
		//绑定单击事件
		$(submitBtn).off('dms.upload').on('dms.upload', function() {
			var triggerBtn = $(this);
			//设置触发按钮
			$(fileInput).data("triggerBtn",triggerBtn);
			
			if((!$(fileInput).data('fileinput')._errorsExist())&&(!$(fileInput).data('fileinput').isError)&&requestBeforeValidate(triggerBtn,container)){
				var fileInputDataObj =  $(fileInput).data('fileinput');
				if(fileInputDataObj){
					if(fileInputDataObj.getFilesCount()>0){
						fileInputDataObj.upload();
					}else{
						//执行上传,如果没有需要上传的文件
						var fileCount = $("div.file-preview-frame",fileParentContainer).size();
						if(fileCount>=$(fileInput).data('fileinput').minFileCount&&fileCount<=$(fileInput).data('fileinput').maxFileCount){
							//执行上传,如果没有需要上传的文件
							$(fileInput).trigger("filebatchuploadcomplete");
						}else{
							handelBootstrapToastr({status:"error",msg:"</br>最少上传"+$(fileInput).data('fileinput').minFileCount+"张附件",timeOut:"4000"});
						}
					}
				}
			}
		});
	}

	/**
	 * 初始化页面信息
	 */
	function initPageContent(response,container,isClear){
		var argsArray = new Array();
		argsArray.push(response);
		argsArray.push("data-fieldName");
		argsArray.push(isClear);
		$('input[data-fieldName],select[data-fieldName]:not([parent]),textarea[data-fieldName],span[data-fieldName],pre[data-fieldName]',container).each(function(index,item) {
			updateObjectByValue(this,container,true,getEditPageValue,argsArray);
		});
		
		//获得焦点
		if($(container).closest("div.dms-search").size()>0){
			setTimeout(function(){
				focusElement($("input[data-fieldName][type!='hidden']:last",container));
			},100);
		}
	}
	
	/**
	 * 重新刷新页面
	 */
	function refreshPageByUrl(url,container){
		 var pageData = $(container).data("pageData");
		 //执行页面请求
		ajaxPageRequest({
			url:url,
			container:container,//定义容器
			pageData:pageData,
			complete:function(xmlRequest, statusCode){
			}
		});
	}
	/**
	 * 获得修改页面的值
	 * @param obj
	 * @param data
	 * @param fieldDefineName
	 * @returns
	 */
	function getEditPageValue(obj,data,fieldDefineName,isClear){
		//定义数值变量
		var fieldName = $(obj).attr("data-fieldName");
		//拿到对应的值
		var val = getDataByKey(fieldName,data);
		if(isClear==undefined||isClear==true){
			val=val==undefined?"":val;
		}
		return val;
	}
	
	/**
	 * 更新字段的值
	 */
	function updateObjectByValue(obj,container,isInit,getValueFN,getValueArgs){
		//添加数组对象
		var getValueArgsNew = $.merge([obj],getValueArgs);
		//调用获取数值的方法
		var val = getValueFN.call(this,getValueArgsNew[0],getValueArgsNew[1],getValueArgsNew[2],getValueArgsNew[3]);
		//进行元素判断，并进行更新
		//如果是下拉框
		if($(obj).is('select')||$(obj).attr("type")=="checkbox"||$(obj).attr("type")=="radio"){
			//如果是select 下拉框
			if($(obj).is('select')){
				//更新父属性
				updateValueByParent(obj,container,getValueFN,getValueArgs);
			}
			//初始化数据
			$(obj).attr("data-value",val);
			//进行更新
			if(isInit){
				dmsDict.initData(obj);
			}
		}else{
			//设置dms值
			setDmsValue(obj,val);
		}
	}
	
	/**
	 * 根据parent进行赋值
	 */
	function updateValueByParent(parentObj,container,getValueFN,getValueArgs){
		var parentId = $(parentObj).attr("id");
		$("[parent='"+parentId+"']",container).each(function(i,obj){
			updateObjectByValue(obj,container,false,getValueFN,getValueArgs);
		});
	}
	
	/**
	 * 加载tree 结构
	 */
	function initTree(treeObj,option,container){
		var defaultOption = {
			core:	{
				data:{
					url:getDmsFuncIdUrl(option.url,currentToken,container),
					data:option.dataFunc
				}
			},
			types : {  
				"default" : {  
					icon : "fa fa-folder icon-state-warning icon-lg"  
				},  
				file : {  
					icon : "fa fa-file icon-state-warning icon-lg"  
				 }
			}, 
			plugins : ["changed","types"]
		};
		
		var jsTree = $(treeObj).jstree(defaultOption);
		if(option.loadedFunc){
			$(treeObj).on("loaded.jstree",function(e,data){
				option.loadedFunc(e,data);
			});
		}
	}
	
	/**
	 * 下载数据
	 */
	function downLoadRequest(option,container){
		var url = option.url;
		var formObj = option.formObj;
		var copyForm = $(formObj).clone();
		$(copyForm).hide();
		$(copyForm).prependTo($(formObj).parent());
		
		//处理Form表单中的数组
		handelFormArray(copyForm,formObj);
		//增加dmsFuncId
		var dmsFuncId = container.data("dmsFuncId");
		$("<input type='hidden' id = 'dmsFuncId' value='"+dmsFuncId+"' name='dmsFuncId'/>").appendTo($(copyForm));
		//添加urlToken 值
		$("<input type='hidden' id = 'urlToken' value='"+currentToken+"' name='urlToken'/>").appendTo($(copyForm));
		//修改Form表单的URL
		$(copyForm).attr("action",url);
		$(copyForm).attr("target","_blank");
		$(copyForm).find('[disabled]').prop('disabled', false);
		copyForm.submit();
		//删除copyForm
		$(copyForm).remove();
	}
	/**
	 * 下载数据
	 */
	function downLoadWithoutForm(obj,url,param,container){
		var copyForm = $("<form> </from>");
		$(copyForm).hide();
		//将Form 增加到页面上
		$(copyForm).prependTo($(obj).closest(DMS_CLOSEST_DIV));
		
		//循环参数,判断参数
		if(param){
			$.each(param,function(key,value){
				$("<input type='hidden' id = '"+key+"' value='"+value+"' name='"+key+"'/>").appendTo($(copyForm));
			});
		}
		//增加dmsFuncId
		var dmsFuncId = container.data("dmsFuncId");
		$("<input type='hidden' id = 'dmsFuncId' value='"+dmsFuncId+"' name='dmsFuncId'/>").appendTo($(copyForm));
		
		//添加urlToken 值
		$("<input type='hidden' id = 'urlToken' value='"+currentToken+"' name='urlToken'/>").appendTo($(copyForm));
		
		//修改Form表单的URL
		$(copyForm).attr("action",url);
		$(copyForm).attr("target","_blank");
		copyForm.submit();
		//删除copyForm
		$(copyForm).remove();
	}
	
	/**
	 * 将form 表单中的数组改为“，” 分隔的数据
	 */
	function handelFormArray(copyForm,formObj){
		var selects = $("div.form-group input[type='checkbox']:gt(0):first,div.form-group select",formObj);
		/**
		 * 进行循环判断
		 */
		$(selects).each(function(index,item){
			//如果是下拉框
			if($(item).is("select")){
				var values = $(item).selectpicker('val');
				if(values){
					var containerDiv = $("#"+$(item).attr("id"),copyForm).parent();
					containerDiv.empty();
					
					var valueStr;
					if($.isArray(values)){
						valueStr = values.join(",");
					}else{
						valueStr = values;
					}
					$("<input type='hidden' id = '"+$(item).attr("id")+"' value='"+valueStr+"' name='"+$(item).attr("name")+"'/>").appendTo(containerDiv);
				}
			}
			
			//如果是checkBox
			if($(item).attr("type")=="checkbox"){
				var name = $(item).attr("name");
				var checkedBoxs = $("input[type='checkbox'][name='"+name+"']:checked",$(item).closest("div"));
				if(checkedBoxs&&checkedBoxs.size()>0){
					//加载数组数据
					var values = new Array();
					$(checkedBoxs).each(function(j,checked){
						values[j] = $(checked).val();
					});
					var containerDiv = $("#"+$(item).attr("id"),copyForm).closest("div");
					//清空Div
					containerDiv.empty();
					//生成Form表单数据
					$("<input type='hidden' id = '"+name+"' value='"+values.join(",")+"' name='"+name+"'>").appendTo(containerDiv);
				}
			}
		})
	}
	
	//执行ajaxRest 请求
	var ajaxRest = function(obj,container){
		
		//在执行请求时，执行校验，如果为false,则不进行ajax 请求
		if($(obj).attr("data-validate")!="false"&&!requestBeforeValidate(obj,container)){
			return false;
		}
		var beforeRequest = $(obj).attr("data-beforeRequest");
		//业务操作前事件绑定
		if(beforeRequest&&beforeRequest=="true"){
			var result = {status:false};
			$(obj).trigger("beforeRequest.dms",[result]);
			if(!result.status){
				return false;
			}
		}
		//封装请求对象
		var requestObj = requestRestFormObj(obj,container);
		var beforeSubmit = $(obj).attr("data-beforeSubmit");
		if(beforeSubmit && beforeSubmit == "true"){
			$(obj).trigger("beforeSubmit.dms",[requestObj]);
		}
		if(requestObj){
			var method = requestObj.type;
			if(method&&method=="downLoad"){
				//进行ajax 请求
				downLoadRequest(requestObj,container);
			}else if(method&&method=="print"){
				//打印
				HtmlPrintPdf(container);
			}else if(method&&method=="export"){
				//导出excel
				CommonExportXls(container,obj);
			}else{
				//进行ajax 请求
				ajaxRestRequest(requestObj);
			}
		}
	};
	
	/**
	 * 执行请求执行前的处理
	 */
	var requestBeforeValidate = function(obj,container){
		//获得按钮对应的Form表单
		var formObj = getBtnWithForm(obj);
		//执行表单校验
		if(!validateForm(formObj)){
			return false;
		}
		return true;
	}
	
	//获得请求的对象
	var requestRestFormObj = function(obj,container){
		var requestObj;
		var url = $(obj).attr("data-url");
		if(url){
			requestObj = {};
			//获得按钮对应的Form表单
			var formObj = getBtnWithForm(obj);
			//重新获取URL值
			url = $(obj).attr("data-url");
			var btnName = getBtnName(obj);
			var method = $(obj).attr("data-method"); //默认"get"
			var model = $(obj).attr("data-model"); 
			url = dmsCommon.getDmsPath()[model]+url;
			var callBack = $(obj).attr("data-callBack");
			var errorCallBack = $(obj).attr("data-errorCallBack");
			var data;
			
			if(formObj){
				if(method&&method.toUpperCase()=="GET"){
					var params = $(formObj).serialize();
					url = url.indexOf("?")==-1?(url+"?"+params):(url+"&"+params);
				}else{
					data = $(formObj).serializeFormJson();
				}
			}
			
			requestObj.url = url;
			requestObj.formObj = formObj;
			requestObj.type = method;
			requestObj.btnName = btnName;
			requestObj.data = JSON.stringify(data);
			requestObj.btn = obj;
			//定义回调函数
			requestObj.sucessCallBack = function(response){
				if(callBack){
					if(callBack=="true"){
						$(obj).trigger("callBack.dms",[response,container]);
					}else{
						eval(callBack)(response);
					}
				}
			};
			
			//定义错误回调
			if(errorCallBack&&errorCallBack=="true"){
				requestObj.errorCallBack = function(response){
					$(obj).trigger("errorCallBack.dms",[response,container]);
				};
			}
		}
		return requestObj;
	};
	
	//获得请求的对象
	var requestSimpleRestFormObj = function(obj,container){
		var requestObj = {};
		//获得按钮对应的Form表单
		var formObj = getBtnWithForm(obj);
		//重新获取URL值
		var btnName = getBtnName(obj);
		
		requestObj.formObj = formObj;
		requestObj.btnName = btnName;
		requestObj.btn = obj;
		return requestObj;
	};
	
	/**
	 * 获得按钮对应的Form表单
	 */
	function getBtnWithForm(btnObj){
		var formObjArray = $(btnObj).closest("form");
		//如果校验不通过，则返回不再执行
		if ($(formObjArray).size()>0 ) {
			return $(formObjArray).get(0);
		}else{
			var formArray = $(btnObj).closest(dmsCommon.DMS_CLOSEST_DIV).find("form:first");
			if(formArray&&formArray.size()>0){
				return formArray.get(0);
			}else{
				return undefined;
			}
		}
	}
	
	/**
	 * 重置表单信息
	 */
	var resetForm = function(resetBtn,container) {
		var searchForm = $(resetBtn).closest("form");
		var memoryData;
		//如果是在弹出页面
		if($(resetBtn).closest($("#modelContainerDiv")).size()>0){
			memoryData = $("#modelContainerDiv").data("memoryDefaultSearchData");
		}else{
			memoryData = container.data("memoryDefaultSearchData");
		}
		//设置查询条件
		setSearchFormCondition(searchForm,memoryData);
	};
	
	/**
	 * 获得修改页面每个元素的值
	 */
	function getMemorySearchValue(element,memoryData,fieldDefineName){
		var fieldName = $(element).attr("name");
		var val;
		//如果不为空
		if(memoryData){
			val = memoryData[fieldName]==undefined?"":memoryData[fieldName];
		}
		//如果元素是个数组，则用","分隔
		if(val&&$.isArray(val)){
			return val.join(",");
		}else{
			return val;
		}
	}
	/**
	 * 设置查询界面查询条件
	 */
	function setSearchFormCondition(container,memoryData){
		//定义参数
		var argsArray = new Array();
		argsArray.push(memoryData);
		argsArray.push("");
		//执行元素遍历，对每个元素设置值
		$('input[type!="checkbox"][type!="radio"][id],input[type!="checkbox"][type!="radio"][name],select:not([parent]),select[data-parentInit="true"],textarea,div.form-group input[type="radio"]:first,div.form-group input[type="checkbox"]:first',container).each(function(index,item) {
			//MODIFY BY MBH 20180410 FOR 【防止页面影藏元素条件因为重置后被清空】
			if(item.type!="hidden"){
				updateObjectByValue(this,container,true,getMemorySearchValue,argsArray);
			}
			if($(item).attr('data-clear')=='true'){
				updateObjectByValue(this,container,true,getMemorySearchValue,argsArray);
			}
		});
	}
	
	/**
	 * ajax 请求开始处理
	 */
	function ajaxRestStart(option){
		//如果存在按钮
		if(option.btn){
			$(option.btn).attr("disabled", "disabled");
		}
		App.startPageLoading({animate:true});
	}
	/**
	 * ajax 请求结束处理
	 */
	function ajaxRestEnd(option){
		App.stopPageLoading();
		if(option.btn){
			$(option.btn).removeAttr("disabled");
		}
	}
	/**
	 * 常规的ajax-rest请求处理
	 */
	var ajaxRestRequest = function(option) {
		//请求开始处理
		ajaxRestStart(option);
		var newUrl = option.url;
		$.ajax({
			url : getDmsFuncIdUrl(newUrl,currentToken),
			type : option.type,
			data : option.data,
			dataType : "json",
			async : option.async!=undefined?option.async:true,
			cache : false,
//			timeout : 120 * 1000,
			beforeSend:function(xhr) {
				xhr.setRequestHeader("Accept", "application/json;charset=UTF-8");
				xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				if(option.beforeSend){
					option.beforeSend(xhr);
				};
			},
			dataFilter : function() {
				if(option.dataFilter){
					option.dataFilter(response, dataType);
				}
			},
			success:function(data, textStatus, jqXHR){
				//结束ajax请求
				ajaxRestEnd(option);
			},
			error:function(XMLHttpRequest, textStatus, errorThrown){
				//结束ajax请求
				ajaxRestEnd(option);
			},
			complete : function(xmlRequest, statusCode) {
				//进行超时处理
				if(statusCode=="timeout"){
					statusCodeHandel(option,true)["timeout"]();
				}
				
				if(option.complete){
					option.complete(xmlRequest, statusCode);
				}
			},
			statusCode : statusCodeHandel(option,true)
		});
	};
	
	/**
	 * 常规的ajax-page请求处理
	 */
	var ajaxPageRequest = function(option) {
		//定义容器
		var container = option.container;
		//开始ajax处理
		ajaxRestStart(option);
		$.ajax({
			type: "GET",
			dataType: "html",
			cache: false,
			url: option.url,
			success: function (res) {
				if(option.pageData||commonDataMap){
					var pageData = $.extend({},option.pageData,commonDataMap);
					container.html(res.format(pageData));
					//将tab面绑定pageData
					$("a[data-toggle=\"tab\"]:not([data-target])",container).data("pageData",pageData);
					//在容器绑定页面数据
					$(container).data("pageData",pageData);
				}else{
					container.html(res);
				}
				$(container).data("pageUrl",option.url);
				
				//多语言处理
				var i18nFields = [];
				var i18nLables = $("label.control-label,a.btn,div.pannel-name,div.modal-title", container);
				//字段上传Begin
				i18nLables.each(function(){
					var text = $.trim($(this).text());
					if(text && text.length){
						i18nFields.push(text);
					}
				});
//				ajaxRestRequest({
//					url : dmsCommon.getDmsPath()["web"] + "/basedata/i18n",
//					type : 'PUT',
//					data : JSON.stringify({
//						type : 'label',
//						page : option.url,
//						fields : i18nFields
//					})
//				});
				//字段上传End
				if(pageLanguage == "en_US"){
					i18nLables.each(function(){
						var html = $(this).html();
						var text = $.trim($(this).text());
						if(text && text.length){
							var trans = i18n(text);
							$(this).html(html.replace(text, trans));
						}
					});
				}
				
				//如果有自己定义的success 事件
				if(option.success){
					option.success(res);
				}
				
				//初始化页面
				pageInit(container);
			},
			complete : function(xmlRequest, statusCode) {
				//结束ajax 处理
				ajaxRestEnd(option);
				
				if(option.complete){
					option.complete(xmlRequest, statusCode);
				}
				//触发onload 事件
				$(document).trigger("onload.dms",[container]);
				
				//执行自己的onload 之后的初始化
				afterInit(container,function(idex){
					return $(this).closest("table.table").size()==0;
				});
				
				//固定内容高度
				Layout.fixContentHeight();
			},
			error: function (xhr, ajaxOptions, thrownError) {
				pageContentBody.html('<h4>Could not load the requested content.</h4>');
			},
			statusCode : statusCodeHandel(option,false)
		});
		
	};

	var enUnicode = function(str){
		var res = [];  
		for ( var i=0; i<str.length; i++ ) {  
			res[i] = ( "00" + str.charCodeAt(i).toString(16) ).slice(-4);  
		}  
		return "\\u" + res.join("\\u");
	}
	
	var deUnicode = function(str){
		str = str.replace(/\\/g, "%");  
		return unescape(str);  
	}
	
	var i18n = function(text){
		try{
			var unicode = enUnicode(text);
			var trans = $.i18n.prop(unicode);
			return trans;
		}catch(e){
			console.warn("[i18n] "+text+" 多语言解析失败");
			return text
		}
	}
	
	/**
	 * 定义状态码处理函数
	 */
	function fileUploadStatusCodeHandel(option,isRest){
		return {
			200:function(response, stausText, xhr){
				//常规ajax 请求函数
				commonAjaxSuccessCallback(response,option,isRest);
			},
			201:function(response, stausText, xhr){
				//常规ajax 请求函数
				commonAjaxSuccessCallback(response,option,isRest);
			},
			204:function(response, stausText, xhr){
				//常规ajax 请求函数
				commonAjaxSuccessCallback(response,option,isRest);
			},
			400 : function(response, stausText, xhr) {
				commonAjaxErrorCallback(response,option,isRest);
			},
			404 : function(response, stausText, xhr) {
				
			},
			401 : function(response, stausText, xhr) {
				window.location.href = DMS_PATH["root"]+"/html/login.html";
				return;
			},
			403 : function(response, stausText, xhr) {
				handelBootstrapToastr({status:"error",msg:"</br>没有操作此功能的权限",timeOut:"4000"});
				return;
			},
			405 : function(response, stausText, xhr) {
				handelBootstrapToastr({status:"error",msg:"</br>请勿同时登录多个账户，即将自动登出。",timeOut:"4000"});
				setTimeout(function(){
					window.top.location.href = "/szqdms/logout.jsp";
				}, 3000);
				return;
			},
			500 : function(response, stausText, xhr) {
				commonAjaxErrorCallback(response,option,isRest);
			},
			"timeout" : function(response, stausText, xhr){
				handelBootstrapToastr({status:"error",msg:"</br>操作请求超时，最大时间：30s",timeOut:"4000"});
			}
		};
	};
	
	/**
	 * 定义状态码处理函数
	 */
	function statusCodeHandel(option,isRest){
		return {
			200:function(response, stausText, xhr){
				//常规ajax 请求函数
				commonAjaxSuccessCallback(response,option,isRest);
			},
			201:function(response, stausText, xhr){
				//常规ajax 请求函数
				commonAjaxSuccessCallback(response,option,isRest);
			},
			204:function(response, stausText, xhr){
				//常规ajax 请求函数
				commonAjaxSuccessCallback(response,option,isRest);
			},
			400 : function(response, stausText, xhr) {
				commonAjaxErrorCallback(response,option,isRest);
			},
			404 : function(response, stausText, xhr) {
				
			},
			401 : function(response, stausText, xhr) {
				if(window["enable_autorest"] === true && window.top.dmsData){
					var dmsData = window.top.dmsData || {};
					ajaxRestRequest({
						url : dmsCommon.getDmsPath()["web"] + "/common/login",
						type : 'GET',
						data : {"username":dmsData.account,"md5pwd":dmsData.auth,"password":""},
						sucessCallBack : function(data) {
							ajaxRestRequest(option);
						}
					});
				}else if(option.status401CallBack){
					option.status401CallBack(response, stausText);
				}else{
					if(window["enable_autorest"] === true){
						window.top.location.href = "/szqdms/logout.jsp";
					}else{
						window.location.href = DMS_PATH["root"]+"/html/login.html";
					}
				}
				return;
			},
			403 : function(response, stausText, xhr) {
				handelBootstrapToastr({status:"error",msg:"</br>没有操作此功能的权限",timeOut:"4000"});
				return;
			},
			405 : function(response, stausText, xhr) {
				handelBootstrapToastr({status:"error",msg:"</br>请勿同时登录多个账户，即将自动登出。",timeOut:"4000"});
				setTimeout(function(){
					window.top.location.href = "/szqdms/logout.jsp";
				}, 3000);
				return;
			},
			500 : function(response, stausText, xhr) {
				commonAjaxErrorCallback(response,option,isRest);
			},
			"timeout" : function(response, stausText, xhr){
				handelBootstrapToastr({status:"error",msg:"</br>操作请求超时，最大时间：30s",timeOut:"4000"});
			}
		};
	};
	/**
	 * 常规ajax 请求正常处理函数
	 */
	function commonAjaxSuccessCallback(response,option,isRest){
		if(option.sucessCallBack){
			if(response&&response.responseText&&(response.responseText).length>0){
				option.sucessCallBack($.parseJSON(response.responseText));
			}else{
				option.sucessCallBack({});
			}
		}
		if(isRest&&option.btnName&&(option.type).toUpperCase()!="GET"){
			handelBootstrapToastr({status:"success",msg:"</br>"+option.btnName+"成功"});
		}
	}
	/**
	 * 常规ajax 请求失败处理函数
	 */
	function commonAjaxErrorCallback(response,option,isRest){
		var jsonResponse = $.parseJSON(response.responseText);
		if(isRest&&option.btnName){
			handelBootstrapToastr({status:"error",msg:"</br>"+option.btnName+"失败:"+"</br></br>"+(jsonResponse.errorMsg+""),timeOut:"4000"});
		}
		//定义回调函数
		if(option.errorCallBack){
			if(response&&response.responseText&&(response.responseText).length>0){
				option.errorCallBack($.parseJSON(response.responseText)["errorData"]);
			}else{
				option.errorCallBack({});
			}
		}
	}
	
	/**
	 * 初始化系统数据
	 */
	var initSystemData = function(){
		getCommonData(); //获取系统常规数据
		dmsDict.getDictData();//获取Dict 数据
		dmsIndex.showMenus(); //显示菜单
	}
	/**
	 * 定义初始化方法
	 */
	var init = function(container){
		dmsDict.init(container); //初始化字典信息
		handelComponent(container); //处理日期组件
		handleBootstrapConfirmation(container); //处理确认框
		handleFormStatic(container); //处理表单信息
		handelAllFile(container);////处理所有与导入文件相关的功能
		dmsIndex.handelButtonAcl(container); //处理按钮权限
	}

	/**
	 * 页面初始化
	 */
	var pageInit = function(container){
		//通用初始化
		init(container);
		initFunc(container); //处理导航菜单
		handlePanpelTools(container); //处理portlet
		//动态数据，放在最后
		handleFormAjax(container); //处理弹出框
	}
	
	/**
	 * 页面初始化后操作，在调用当前业务自己的初始化操作后
	 */
	var afterInit = function(container,filterFunction){
		
		//绑定页面按钮事件
		bindPageButtonEvent(container);
		
		//初始化父表格
		initParentTable(container);
		
		//初始化操作
		dmsValidate.init(container);
		
		//设置只读属性(不包括表格中的信息)
		setDetailPageReadOnly(container,filterFunction);
		
		//设置只读属性
		initElementReadOnly(container);
	}
	
	/**
	 * 设置元素的值
	 */
	var setDmsValue = function(obj,objValue,isTriggerChange){
		if($(obj).is('select')){
			//设置默认值
			objValue = objValue==undefined?"":objValue;
			if($(obj).hasClass("bs-select")){
				//对多选操作进行处理
				if($(obj).attr("multiple")!=undefined){
					var disableFlag = false;
//					$(obj).selectpicker('val',objValue);
					if($(obj).hasClass("disabled")||$(obj).attr("disabled")){
						disableFlag = true;
						var objParent = $(obj).closest("div.bs-select").parent();
						$("select,button,div",objParent).removeAttr("disabled");
						$("select,button,div",objParent).removeClass("disabled");
					}
					//设置选中的值
					$(obj).selectpicker('deselectAll');
					var objValueArray = objValue.split(",");
					$.each(objValueArray,function(index,item){
						if(item){
							var index = $("option[value='"+item+"']",obj).index();
							if(index>=0){
								$("li:eq("+index+") a",$(obj).data('selectpicker').$menuInner).click();
							}
						}
					});
					//再增加disabled 属性
					if(disableFlag){
						//设置元素的只读
						setElementReadOnly(obj);
					}
					
				}else{
					$(obj).selectpicker('val',objValue);
				}
			}else{
				$(obj).val(objValue);
			}
			//触发onechage 事件
			if(isTriggerChange==undefined||isTriggerChange==true){
				$(obj).trigger("change");
			}
		}else{
			if(objValue!=undefined){
				if($(obj).attr("type")=="checkbox"){
					objValue = objValue+"";
					var checkBoxValues = objValue.split(",");
					var checkBoxContainer = $(obj).parent().is('label')?$(obj).closest("div.checkbox-list").parent():$(obj).parent();
					
					//还原checkbox 选项
					$("input[type=checkbox]",checkBoxContainer).prop("checked",false);
					//默认值选择
					if(!isStringNull(objValue)&&checkBoxValues){
						$.each(checkBoxValues,function(z,checkBoxValue){
							$("input[type=checkbox][value="+checkBoxValue+"]",checkBoxContainer).prop("checked",true);
						});
					}
				}else if($(obj).attr("type")=="radio"){
					if(!isStringNull(objValue)){
						$("input[type='radio'][value="+objValue+"]",$(obj).parents("div.radio-list:first")).prop("checked",true);
					}else{
						$("input[type='radio']",$(obj).parents("div.radio-list:first")).prop("checked",false);
					}
				}else if($(obj).attr("type")=="text"||$(obj).attr("type")=="hidden"||$(obj).is('textarea')){
					var parentRemoveClass = $(obj).parent().attr("data-removeClass");
					//格式化日期
					if($(obj).parent().hasClass("date")||parentRemoveClass&&parentRemoveClass.indexOf("date ")!=-1){
						objValue = formatDate(objValue, $(obj).attr("data-date-format"));
						$(obj).valChange(objValue,isTriggerChange);
						$(obj).parent().attr("data-date",objValue);
						//更新时间
						if($(obj).parent().hasClass("date-picker")||parentRemoveClass&&parentRemoveClass.indexOf("date-picker")!=-1){
							objValue = formatDate(objValue);
							$(obj).valChange(objValue,isTriggerChange);
							$(obj).parent().attr("data-date",objValue);
							$(obj).parent().datepicker("update");
						}else if($(obj).parent().hasClass("datetime")||parentRemoveClass&&parentRemoveClass.indexOf("datetime")!=-1){
							objValue = formatDate(objValue);
							$(obj).valChange(objValue,isTriggerChange);
							$(obj).parent().attr("data-date",objValue);
							$(obj).parent().datetimepicker("update");
						}else if($(obj).parent().hasClass("month-picker")||parentRemoveClass&&parentRemoveClass.indexOf("month-picker")!=-1){
							objValue = formatDate(objValue,'YYYY-MM');
							$(obj).valChange(objValue,isTriggerChange);
							$(obj).parent().attr("data-date",objValue);
							$(obj).parent().datepicker("update");
						}else if($(obj).parent().hasClass("year-picker")||parentRemoveClass&&parentRemoveClass.indexOf("year-picker")!=-1){
							objValue = formatDate(objValue,'YYYY')+" ";
							$(obj).valChange(objValue,isTriggerChange);
							$(obj).parent().attr("data-date",objValue);
							$(obj).parent().datepicker("update");
						}
					//更新日期范围组件	 
					}else if($(obj).parent().hasClass("input-daterange")||parentRemoveClass&&parentRemoveClass.indexOf("input-daterange")!=-1){
						$(obj).valChange(objValue);
						if(objValue==""){
							return;
							//objValue = moment().format("YYYY-MM-DD");
						}
						var index = $("input[type='text']",$(obj).parent()).index(obj);
						if(index==1){
							$(obj).data("datepicker").setStartDate(objValue);
						}
						if(index==0){
							$(obj).data("datepicker").setEndDate(objValue);
						}
					}else if($(obj).hasClass("ionRangeSlider")){
						var sliderConfig = $(obj).attr("data-sliderConfig");
						//如果存在配置信息
						if(sliderConfig){
							var sliderConfigObj = $.parseJSON(sliderConfig);
							var indexNum = -1;
							var fromNum = -1;
							$.each(sliderConfigObj,function(key,value){
								indexNum++;
								if(key == objValue){
									fromNum = indexNum;
									return false;
								}
							});
							//触发ionSlider
							if(fromNum!=-1){
								$(obj).data("ionRangeSlider").update({from:fromNum});
							}
						}
						
					}else{
						$(obj).valChange(objValue,isTriggerChange);
					}
				}else if($(obj).is('span')){
					if($(obj).attr("data-date-format")){
						objValue = formatDate(objValue,$(obj).attr("data-date-format"));
					}
					if($(obj).attr("data-chinese-numeral")){
						objValue = formatChineseNumeral(objValue);
					}
					$(obj).text((objValue+"").escape2Html());
				}else if($(obj).is('pre')){
					$(obj).text((objValue+"").escape2Html());
				}
			}
		}
	}
	
	/**
	 * 自动更新查询页面的查询条件
	 */
	var autoInitSearchCondition = function(container){
		var form = $("form:first",container);
		var memorySearchData = container.data("memorySearchData");
		if(memorySearchData){
			$.each(memorySearchData,function(key,value){
				$("<input type='hidden' id = '"+key+"' value='"+value+"' name='"+key+"'/>").appendTo($(form));
			});
		}
	}
	
	var openModal = function(options){
		var container = options.container;
		var currentModal = $(container).closest(".modal-content");
		
		var modalSize = $("#modelContainerDiv").data("data-modalSize");
		if(modalSize==undefined){
			modalSize = 0;
		}
		modalSize = modalSize+1;
		$("#modelContainerDiv").append('<div id="ajax-modal'+modalSize+'" class="modal fade draggable-modal" tabindex="-1" aria-hidden="true" ><div class="modal-dialog" ><div class="modal-content" > </div></div></div>')
		
		var $modal = $('#ajax-modal'+modalSize);
		var defineWidth = options.width;
		if(defineWidth){
			$(".modal-dialog",$modal).addClass(defineWidth);
			$modal.addClass("bs-"+defineWidth);
		}else{
			$(".modal-dialog",$modal).addClass("modal-md");
			$modal.addClass("bs-modal-md");
		}
		
		var url = options.url;
		var pageData = $.extend(getRequest(url), options.pageData);
		
		//绑定关闭事件
		$modal.on('hidden.bs.modal', function () {
			setTimeout(function(){
				$modal.remove();
			},100);
		});
			
		var modelContainer = $(".modal-content",$modal);
		$modal.draggable({
			handle: ".modal-header"
		});
		
		//判断是否是明细按钮
		var isDetailFlag = options.isDetailFlag;
		//执行页面请求
		ajaxPageRequest({
			url:url,
			container:modelContainer,//定义容器
			pageData:pageData,
			complete:function(xmlRequest, statusCode){
				$modal.modal();
				//设置父窗口
				if(currentModal!=undefined){
					$(modelContainer).data("data-parentModal",currentModal);
				}
				$("#modelContainerDiv").data("data-modalSize",modalSize);
				
				//如果是明细界面，则将界面元素标记为只读
				if(isDetailFlag&&isDetailFlag=="true"){
					$("div.dms-edit",modelContainer).attr("data-isDetailFlag",true);
				}
			}
		});
	}
	
	/**
	 * 定义返回值
	 */
	return {
		DMS_CLOSEST_DIV:DMS_CLOSEST_DIV,
		// 执行初始化
		init : function(container) {
			init(container);
		},
		afterInit:function(container){
			afterInit(container);
		},
		// 执行页面初始化
		pageInit : function(container) {
			pageInit(container);
		},
		// 重置Form 表单
		resetForm : function(restBtn) {
			resetForm(resetBtn);
		},
		searchFormCollapse : function(container) {
			searchFormCollapse(container);
		},
		getDmsPath: function() {
			return DMS_PATH;
		},
		initSystemData:function(){
			initSystemData();
		},
		statusCodeHandel:function(option,isRest){
			return statusCodeHandel(option,isRest);
		},
		getRequest: function(url) {
			return getRequest(url);
		},
		ajaxPageRequest:function(option){
			ajaxPageRequest(option);
		},
		ajaxRestRequest : function(option){
			ajaxRestRequest(option);
		},
		setCurrentToken : function(data){
			currentToken = data;
		},
		getCurrentToken : function(){
			return currentToken;
		},
		setTabLabelsFlag : function(flag){
			tabLabelsFlag = flag;
		},
		getTabLabelsFlag : function(){
			return tabLabelsFlag;
		},
		handleFormStatic:function(container){
			handleFormStatic(container);
		},
		handleDatePickers:function(container){
			handleDatePickers(container);
		},
		handelSelects:function(container){
			handelSelects(container);
		},
		tip:function(option){
			handelBootstrapToastr(option);
		},
		initHtmlContent:function(response,container,isClear){
			initPageContent(response,container,isClear);
		},
		bindChangeEvent:function(fieldObject,callBack){
			bindChangeEvent(fieldObject,callBack);
		},
		valChange:function(fieldObject,val,isTriggerChange){
			valChange(fieldObject,val,isTriggerChange);
		},
		unBindAutoValueEvent:function(fieldOperator,formula,container){
			unBindAutoValueEvent(fieldOperator,formula,container);
		},
		bindAutoValueEvent:function(fieldOperator,formula,container,afterEvent){
			bindAutoValueEvent(fieldOperator,formula,container,afterEvent);
		},
		setContainerReadOnly:function(container,filterFunction){
			setContainerReadOnly(container,filterFunction);
		},
		revertSearchFormCondition:function(pageContainer,url,dataName){
			revertSearchFormCondition(pageContainer,url,dataName);
		},
		setDmsValue : function(obj,objValue,isTriggerChange){
			setDmsValue(obj,objValue,isTriggerChange);
		},
		validateForm:function(formObj){
			return validateForm(formObj);//对表格执行校验
		},
		requestSimpleRestFormObj:function(obj,container){
			return requestSimpleRestFormObj(obj,container);
		},
		refreshPageByUrl:function(url,container){
			refreshPageByUrl(url,container);
		},
		showPageBar:function(bars){
			showPageBar(bars);
		},
		addPageBar:function(bar){
			addPageBar(bar);
		},
		setElementsReadOnly:function(selector,filterFunction){
			setElementsReadOnly(selector,filterFunction);
		},
		removeElementsReadOnly:function(selector,filterFunction){
			removeElementsReadOnly(selector,filterFunction);
		},
		removeContainerReadOnly:function(selector,filterFunction){
			removeContainerReadOnly(selector,filterFunction);
		},
		setElementsRequired:function(selector,filterFunction){
			setElementsRequired(selector,filterFunction);
		},
		removeElementsRequired:function(selector,filterFunction){
			removeElementsRequired(selector,filterFunction);
		},
		addElementsRequired:function(selector,filterFunction){
			addElementsRequired(selector,filterFunction);
		},
		cleanPageCache:function(){
			cleanPageCache();
		},
		confirmElement:function(confirmObj,confirmText,onConfirmEvent,onCancleEvent,btnCancelHide){
			confirmElement(confirmObj,confirmText,onConfirmEvent,onCancleEvent,btnCancelHide);
		},
		getLoginInfo:function(userInfoField){
			if(userInfoField){
				return commonDataMap.userInfo[userInfoField];
			}else{
				return commonDataMap.userInfo;
			}
		},
		getSystemParamInfo:function(paramType,paramCode){
			if(paramType!=undefined&&paramCode!=undefined){
				return commonDataMap.systemParam[paramType][paramCode];
			}
			if(paramType!=undefined){
				return commonDataMap.systemParam[paramType];
			}
			return commonDataMap.systemParam;
		},
		setCommonData:function(data){
			commonDataMap = data;
		},
		getCommonData:function(){
			return commonDataMap;
		},
		openModal:function(container){
			openModal(container);
		},
		initTree:function(treeObj,option){
			initTree(treeObj,option);
		},
		getDmsFuncIdUrl:function(url){
			return getDmsFuncIdUrl(url,currentToken);
		},
		getMomorySearchData:function(container){
			return container.data("memorySearchData");
		},
		autoInitSearchCondition:function(container){
			autoInitSearchCondition(container);
		},
		setPageLanguage:function(lang){
			pageLanguage = lang;
		},
		getPageLanguage:function(){
			return pageLanguage;
		},
		enUnicode:function(str){
			return enUnicode(str);
		},
		deUnicode:function(str){
			return deUnicode(str);
		},
		i18n:function(text){
			return i18n(text);
		},
		handelAllFile:function(container){
			return handelAllFile(container);
		}
	};

}();

/**
 * 定制自定义函数
 * @param $
 */
(function($) {
	
	$.fn.serializeFormJson = function() {
		var serializeObj = {};
		var form = this;
		
		//对常规表单进行封装
		dmsFormToJson(form,serializeObj,function(idex){
			return $(this).closest("table.table").size()==0 && $(this).closest("[data-formTable]").size()==0;
		});
		//对表格进行封装
		$('table.table[id]',form).each(function(index,item){
			var id = $(item).attr("id");
			serializeObj[id] = new Array();
			$("tbody>tr",item).each(function(indexTr,trItem){
				var tableChildObj = {};
				dmsFormToJson(trItem,tableChildObj);
				var blankFlag = true;
				$.each(tableChildObj,function(name,value){
					blankFlag = false;
				});
				if(!blankFlag){
					serializeObj[id].push(tableChildObj);
				}
			});
		});
		$('[data-formTable]',form).each(function(index,item){
			var fromTableName = $(item).attr("data-formTable");
			serializeObj[fromTableName] = new Array();
			
			$("div.form-group",item).each(function(indexForm,formObj){
				var tableChildObj = {};
				serializeObj[fromTableName].push(tableChildObj);
				dmsFormToJson(formObj,tableChildObj);
			});
		});
		
		return serializeObj;
	};
	
	//绑定dmsTable 获取对象方式
	$.fn.dmsTable = function() {
		var table = this;
		return table.data("tableObject");
	};
	
	//初始化页面内容
	$.fn.initHtmlContent = function(data,isClear){
		var container = this;
		dmsCommon.initHtmlContent(data,container,isClear);
	};
	//绑定事件
	$.fn.bindChange = function(callBack){
		var fieldObject = this;
		dmsCommon.bindChangeEvent(fieldObject,callBack);
	};
	//字段赋值并触发chage事件
	$.fn.valChange = function(val,isTriggerChange){
		var fieldObject = this;
		dmsCommon.valChange(fieldObject,val,isTriggerChange);
	};
	
	$.fn.bindEnterEvent = function(callBack){
		var fieldObject = this;
		$(fieldObject).on('keydown', function(event) {
			if ((event.keyCode|| event.which) == "13") {
				event.preventDefault();
				//回车执行查询
				callBack(fieldObject);
			}
		});
	};
	
	/**
	 * 绑定自动计算事件
	 */
	$.fn.bindAutoValueEvent = function(formula,container,afterEvent){
		var fieldOperator = this;
		var oldAutoValue = $(fieldOperator).attr("data-autoValue");
		if(!isStringNull(oldAutoValue)){
			dmsCommon.unBindAutoValueEvent(fieldOperator,oldAutoValue,container);
			$(fieldOperator).removeAttr("data-autoValue");
		}
		if(!isStringNull(formula)){
			//重新绑定事件
			$(fieldOperator).attr("data-autoValue",formula);
			dmsCommon.bindAutoValueEvent(this,formula,container,afterEvent);
		}
	};
	
	//绑定dmsTable 获取对象方式
	$.fn.isDisabled = function() {
		var el = this;
		if($(el).attr("disabled")=="disabled"){
			return true;
		}
		if($(el).hasClass("disabled")){
			return true;
		}
		if($(el).attr("disabled")=="true"){
			return true;
		}
		return false;
	};
	
	//绑定dmsTable 获取对象方式
	$.fn.validateElement = function() {
		var el = this;
//		return $(el).closest("form").validate().element(el);
		return true;
	};
	
	/**
	 * 设置字段的值，包括各种情况
	 */
	$.fn.setDmsValue = function(objValue,isTriggerChange){
		var obj = this;
		dmsCommon.setDmsValue(obj,objValue,isTriggerChange);
	};
	
	/**
	 * 定义只读
	 * filterFunction:可以不写：是用来过滤容器中的元素
	 */
	$.fn.setContainerReadOnly = function(filterFunction){
		var container = $(this);
		//设置只读
		dmsCommon.setContainerReadOnly(container,filterFunction);
		return container;
	}
	
	$.fn.setNotTableContainerReadOnly = function(){
		var container = $(this);
		//设置只读
		dmsCommon.setContainerReadOnly(container,function(idex){
			return $(this).closest("table.table").size()==0;
		});
	}
	
	$.fn.setElementReadOnly = function(filterFunction){
		var selector = $(this);
		//设置只读
		dmsCommon.setElementsReadOnly(selector,filterFunction);
		return selector;
	}
	
	$.fn.setElementRequired = function(filterFunction){
		var selector = $(this);
		//设置只读
		dmsCommon.setElementsRequired(selector,filterFunction);
		return selector;
	}
	
	/**
	 * 定义只读
	 * filterFunction:可以不写：是用来过滤容器中的元素
	 */
	$.fn.removeContainerReadOnly = function(filterFunction){
		var container = $(this);
		//设置只读
		dmsCommon.removeContainerReadOnly(container,filterFunction);
		return container;
	}
	
	$.fn.removeElementReadOnly = function(filterFunction){
		var selector = $(this);
		//设置只读
		dmsCommon.removeElementsReadOnly(selector,filterFunction);
		return selector;
	}
	
	$.fn.removeElementRequired = function(filterFunction){
		var selector = $(this);
		//去除必填
		dmsCommon.removeElementsRequired(selector,filterFunction);
		return selector;
	}
	
	$.fn.addElementRequired = function(filterFunction){
		var selector = $(this);
		//设置必填
		dmsCommon.addElementsRequired(selector,filterFunction);
		return selector;
	}
	
	/**
	 * 弹出确认框
	 */
	$.fn.confirm = function(confirmText,onConfirmEvent,onCancleEvent,btnCancelHide){
		var confirmObj = $(this);
		$(confirmObj).removeAttr("data-isInit");
		dmsCommon.confirmElement(confirmObj,confirmText,onConfirmEvent,onCancleEvent,btnCancelHide);
		$(confirmObj).data("bs.confirmation").show();
		var destoryFlag = false;
		$(confirmObj).on("hide.bs.confirmation",function(e){
			if(!destoryFlag){
				setTimeout(function(){
					$(confirmObj).confirmation("destroy");
					destoryFlag = true;
				},100);
			}
		});
		return confirmObj;
	}
	/**
	 * 初始化树形结构
	 */
	$.fn.initTree = function(option){
		var treeObj = $(this);
		dmsCommon.initTree(treeObj,option);
	}
	
	/**
	 * 设置ajax请求参数,最大执行时间：30s
	 */
	$.ajaxSetup({
	   timeout: 15 * 60 * 1000,
	   cache:false
	});
	
})(jQuery);
