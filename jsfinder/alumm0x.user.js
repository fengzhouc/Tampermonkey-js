// ==UserScript==
// @name         jsfinder
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  From： https://github.com/Threezh1/Deconstruct/tree/main/DevTools_JSFinder
// @author       alumm0x
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    // 页面加载完了才开始执行
    window.onload = function(){
        // sleep，等待页面完全加载完成，一些模板的页面是先加载模板页面，再加载数据跟其他的，所以为了保证都加载完，所以加了等待
        function sleep (time) {
            return new Promise((resolve) => setTimeout(resolve, time));
        }
        // 获取js的源码
        function geturlContent(pathname){
            var result = ""
            var request = new XMLHttpRequest();
            request.open("GET", pathname, false);
            request.send();
            if(request.status === 200){
                result = request.responseText;
            }
            //console.log("[jsfinder] ",pathname, result)
            return result
        }
        // 从js中提取api
        function extract_url(js_content){
            console.log(js_content)
            let regex = /(?:"|')(((?:[a-zA-Z]{1,10}:\/\/|\/\/)[^"'\/]{1,}\.[a-zA-Z]{2,}[^"']{0,})|((?:\/|\.\.\/|\.\/)[^"'><,;| *()(%%$^\/\\\[\]][^"'><,;|()]{1,})|([a-zA-Z0-9_\-\/]{1,}\/[a-zA-Z0-9_\-\/]{1,}\.(?:[a-zA-Z]{1,4}|action)(?:[\?|#][^"|']{0,}|))|([a-zA-Z0-9_\-\/]{1,}\/[a-zA-Z0-9_\-\/]{3,}(?:[\?|#][^"|']{0,}|))|([a-zA-Z0-9_\-]{1,}\.(?:php|asp|aspx|jsp|json|action|html|js|txt|xml)(?:[\?|#][^"|']{0,}|)))(?:"|')/sg;
            let m;
            let result = [];
            while ((m = regex.exec(js_content)) !== null) {
                console.log(m)
                if (m.index === regex.lastIndex) { regex.lastIndex++;}
                // 把每个匹配的分组都保存下来，最后去重返回
                m.forEach((match, groupIndex) => {
                    if (match != undefined && match != "") {
                        match = match.replaceAll(/('|")/g, "");
                        // 完整api的分支
                        if (match.startsWith("http") == true){
                            let suburl = new URL(match);
                            if (suburl.host.endsWith(location.host) == true){
                                result.push(suburl.href);
                            }
                        // 相对api的分支
                        }else{
                            let url = new URL(match, location.origin);
                            if (url.host.endsWith(location.host) == true){
                                result.push(url.href);
                            }
                        }
                    }});}
            return Array.from(new Set(result));
        }

        console.log("jsfinder running.....");
        // 等待10s，等页面完全加载完了再执行代码
        sleep(5000).then(() => {
            // 这里写sleep之后需要去做的事情
            ///alert(111);
            let urls=[];
            let js_content="";
            let result_raw = [];
            // 获取当前页面所有元素
            Array.prototype.slice.call(document.getElementsByTagName('*')).forEach(element => {
                urls.push(element.src)
                urls.push(element.href)
                urls.push(element.url)
                // 这里是把直接写在页面的的js保存起来，全部追加在一个str里
                if (element.tagName == "SCRIPT") {
                    js_content += element.text
                }
            });
            // 去重
            urls = new Set(urls);
            // console.log("[jsfinder] urls: ", urls);
            // 循环处理urls
            urls.forEach(rawurl => {
                if (rawurl != undefined && rawurl != "" && typeof(rawurl) == "string" && rawurl.startsWith("http") == true){
                    let url = new URL(rawurl);
                    // 从当前域下js中提取api
                    if (url.host.endsWith(location.host) == true && url.pathname.endsWith(".js") == true) {
                        result_raw = result_raw.concat(extract_url(geturlContent(url.pathname)));
                        //var headers = new Headers();
                        //headers.append('pragma', 'no-cache');
                        //headers.append('cache-control', 'no-cache');
                        //fetch(url.pathname, {headers: headers}).then(function(response){
                        //    console.log("[jsfinder] fetch conplete, ", response)
                        //    result_raw = result_raw.concat(extract_url(response.text()));
                        //}).catch(err => console.log("[error] ", err))
                    }
                }
            });
            // 如当前页面就是js, 将当前js的内容赋予js_content
            if (location.href.endsWith(".js") == true){
                js_content += document.documentElement.outerText;
            }
            console.log("[jsfinder] Wait a moment, Processing results")
            // 等待上面fetch获取到js的响应
            sleep(1000).then(()=>{
                result_raw = result_raw.concat(extract_url(js_content));
                //console.log("[jsfinder] result_raw: ", result_raw)
                var result = [];
                result_raw.forEach(url=>{
                    // 过滤掉静态资源的url
                    if ("jpeg|png|gif|svg|js|flv|swf|css".search(new URL(url).pathname.split('.').pop().toLowerCase()) == -1){
                       result.push(url);
                    }
                })
                console.log("[jsfinder] found urls: ", Array.from(new Set(result)));
            })
        })
    }
})();