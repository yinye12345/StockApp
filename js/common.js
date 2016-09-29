window.baseUrl = "http://www.91flowers.cn/public";
var appversion='0.0.0';
function plusReady(){
    // 获取本地应用资源版本号
    plus.runtime.getProperty(plus.runtime.appid,function(inf){
    	appversion = inf.version;
        window.localStorage.setItem("appversion",appversion);
    });
}
if(window.plus){
    plusReady();
}else{
    document.addEventListener('plusready',plusReady,false);
}


// 检测更新
var checkUrl = window.baseUrl + "/check";
function checkUpdate(){
    plus.nativeUI.showWaiting("检测更新...");
    console.log(appversion);
    var updateUrl = window.baseUrl + "CheckUpdateApp";
    mui.post(updateUrl, {cCVersion:appversion}, function(res){
    	if(res.status == "true" ){
    		if(res.info.url != undefined){
    			downWgt(res.info.url);
    		}else{
    			console.log(res.info);
    		}
    	}else{
    		plus.nativeUI.alert("下载失败,请稍后重试！");
    	}
    	plus.nativeUI.closeWaiting();
    }, 'json');
}


// 下载wgt文件
function downWgt(wgtUrl){
    plus.nativeUI.showWaiting("下载wgt文件...");
    plus.downloader.createDownload( wgtUrl, {filename:"_doc/update/"}, function(d,status){
        if ( status == 200 ) { 
            console.log("下载wgt成功："+d.filename);
            installWgt(d.filename); // 安装wgt包
        } else {
            console.log("下载wgt失败！");
            plus.nativeUI.alert("下载wgt失败！");
        }
        plus.nativeUI.closeWaiting();
    }).start();
}


// 更新应用资源
function installWgt(path){
    plus.nativeUI.showWaiting("安装wgt文件...");
    plus.runtime.install(path,{},function(){
        plus.nativeUI.closeWaiting();
        console.log("安装wgt文件成功！");
        plus.nativeUI.alert("应用资源更新完成！",function(){
            plus.runtime.restart();
        });
    },function(e){
        plus.nativeUI.closeWaiting();
        console.log("安装wgt文件失败["+e.code+"]："+e.message);
        plus.nativeUI.alert("安装wgt文件失败["+e.code+"]："+e.message);
    });
}

//加载列表函数
function loadDataForList(url,postParam,className,template){
	var paramArr = repTempleteParamToArray(template);
	showProgressBar();
	//console.log(url);
	mui.ajax(url,{data:postParam,type:'post',timeout:10000,
		success:function(response){
			closeProgressBar();
			response = JSON.parse(response);
			if(response.status == "true"){
				//获取模板内参数
				var htmlArr = new Array();
				for(var i=0;i<response.info.length;i++){
					
					var itemHtml = template;
					for(var j=0;j<paramArr.length;j++){
						var pItem = paramArr[j].replace("{:","").replace("}",""); 
						itemHtml = itemHtml.replace(paramArr[j],response.info[i][pItem]);
					}
					htmlArr.push(itemHtml);
				}
				//console.log(htmlArr.join(' '));
				document.body.querySelector(className).innerHTML = htmlArr.join(' ');
			}else{
				document.body.querySelector(className).innerHTML = '<center style="margin-top:100px;"><p>暂无数据</p></center>';
			}
		},
		
		error:function(xhr,type,errorThrown){ 
			closeProgressBar();
			mui.toast("数据加载失败，请检查网络连接！");
			console.log(xhr.status,xhr.readyState);
		},
		dataType:'json'
	});
}

//获取模板中的参数
function repTempleteParamToArray(template){
	var patt = /\{\:([a-z]*\_?[a-z]*){0,3}\}/g;
	var res = template.match(patt);
	//console.log(res);
	return res;
}

function showProgressBar(){
	var p = document.body.querySelector(".progressbar");
	if(p != undefined){
		p.className = "progressbar mui-progressbar mui-progressbar-infinite";
	}
}

function closeProgressBar(){
	var p = document.body.querySelector(".progressbar");
	if(p != undefined){
		p.className = "progressbar";
	}
}