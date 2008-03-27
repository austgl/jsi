/*
 * JavaScript Integration Framework
 * License LGPL(您可以在任何地方免费使用,但请不要吝啬您对框架本身的改进)
 * http://www.xidea.org/project/jsi/
 * 
 * This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General 
 * Public License as published by the Free Software Foundation; either version 2.1 of the License, or (at your option) 
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied 
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more 
 * details.
 *
 * @author jindw
 * @version $Id: boot.js,v 1.3 2008/02/25 05:21:27 jindw Exp $
 */


/**
 * 方便调试的支持
 */
if(":debug"){
    var $JSI= {
    };
    /**
     * 调试友好支持
     */
    (function(){
        //compute scriptBase
        var rootMatcher = /(^\w+:((\/\/\/\w\:)|(\/\/[^\/]*))?)/;
        //var rootMatcher = /^\w+:(?:(?:\/\/\/\w\:)|(?:\/\/[^\/]*))?/;
        var homeFormater = /(^\w+:\/\/[^\/#\?]*$)/;
        //var homeFormater = /^\w+:\/\/[^\/#\?]*$/;
        var urlTrimer = /[#\?].*$/;
        var dirTrimer = /[^\/\\]*([#\?].*)?$/;
        var forwardTrimer = /[^\/]+\/\.\.\//;
        var base = document.location.href.
                replace(homeFormater,"$1/").
                replace(dirTrimer,"");
        var baseTags = document.getElementsByTagName("base");
        var scripts = document.getElementsByTagName("script");
        /*
         * 计算绝对地址
         * @public
         * @param <string>url 原url
         * @return <string> 绝对URL
         * @static
         */
        function computeURL(url){
            var purl = url.replace(urlTrimer,'').replace(/\\/g,'/');
            var surl = url.substr(purl.length);
            //prompt(rootMatcher.test(purl),[purl , surl])
            if(rootMatcher.test(purl)){
                return purl + surl;
            }else if(purl.charAt(0) == '/'){
                return rootMatcher.exec(base)[0]+purl + surl;
            }
            purl = base + purl;
            while(purl.length >(purl = purl.replace(forwardTrimer,'')).length){
                //alert(purl)
            }
            return purl + surl;
        }
        //处理HTML BASE 标记
        if(baseTags){
            for(var i=baseTags.length-1;i>=0;i--){
                var href = baseTags[i].href;
                if(href){
                    base = computeURL(href.replace(homeFormater,"$1/").replace(dirTrimer,""));
                    break;
                }
            }
        }

        //IE7 XHR 强制ActiveX支持
        if(this.ActiveXObject && this.XMLHttpRequest && location.protocol=="file:"){
            this.XMLHttpRequest = null;
        }
        
        var script = scripts[scripts.length-1];
        //mozilla bug
        while(script.nextSibling && script.nextSibling.nodeName.toUpperCase() == 'SCRIPT'){
            script = script.nextSibling;
        }
        var scriptBase = (script.getAttribute('src')||"/scripts/boot.js").replace(/[^\/\\]+$/,'');
        $JSI.scriptBase = computeURL(scriptBase);
    })();
}else{
    /*
     * JSI2.5 起，为了避免scriptBase 探测。节省代码量，我们使用写死的方法。
     * 如果您的网页上使用了如base之类的标签，那么，为了摸平浏览器的差异，你可能需要再这里明确指定scriptBase的准确路径。
     */
    /**
     * JSI对象
     * @public
     */
    var $JSI= {
        /**
         * 包加载的根路径，根据启动脚本文件名自动探测。
         * @public
         * @id $JSI.scriptBase
         * @typeof string
         * @static
         */
         //scriptBase : "http://localhost:8080/script2/"
    };
}

/**
 * 导入指定元素（脚本、函数、类、变量）至指定目标,默认方式为同步导入，默认目标为全局对象（Global == window(html)）。
 * <pre class="code"><code>  //Example:
 *   $import("com.yourcompany.ClassA")//即时装载--通过指定对象
 *   $import("com/yourcompany/class-a.js")//即时装载--通过指定文件
 *   $import("example.ClassA",MyNamespace)//指定装载目标
 *   $import("example.ClassA",function(ClassA){alert("callback:"+ClassA)})//异步装载
 *   $import("example/class-a.js",true)//延迟装载(可获得良好特性,需要编译支持或者服务端支持)
 * </code></pre>
 * <h3>实现步骤：</h3>
 * <ul>
 *   <li>若元素未装载或依赖未装载，且为异步装载模式，先缓存需要的脚本资源</li>
 *   <li>若元素未装载或依赖未装载，且为同步非阻塞装载模式，打印预装载脚本（当前script标签的其他脚本<b>可能</b>继续运行，浏览器不同表现略有不同）;
 *    并且等待预装载脚本执行之后继续以下步骤</li>
 *   <li>若元素未装载或依赖未装载，装载之</li>
 *   <li>将该元素声明为指定目标的属性(默认目标为全局对象，这时相当于声明了全局变量)</li>
 * </ul>
 * <h3>全局对象的特殊性说明:</h3>
 * <ul>
 *   <p>全局对象的属性同时也是全局变量，可以在任何地方直接使用，<br/>
 *    也就是说：<br/>
 *    $import函数调用时，默认（未指定target）导入成全局对象属性，等价于声明了一个全局变量。</p>
 * </ul>
 * <p>
 *   <i><b>该方法为最终用户设计（页面上的脚本）,不推荐类库开发者（托管脚本）使用该函数,除非确实需要（如需要动态导入时）。类库开发者可在包中定义脚本依赖完成类似功能。</b></i>
 * </p>
 * @public
 * @param <string> path (package:Object|package.Object|package:*|package.*| scriptPath)
 * @param <Object> target 可选参数，指定导入容器。
 *                    当该参数为有效对象时(instanceof Object && not instanceof Function)，导入的元素将赋值成其属性；
 *                    当该参数为boolean型或函数(typeof target in ['boolean','function'])且未指定第三个参数时，将其当做第三个参数，而target本身等价为未指定；
 *                    当该参数未指定时，target为全局变量容器,这种情况等价于直接声明的全局变量。
 * @param <Function|boolean> col callbackOrLazyLoad 可选参数,默认为null。
 *                    如果其值为函数，表示异步导入模式；
 *                    如果其值为真，表示延迟同步导入模式，否则为即时同步导入（默认如此）。
 * @return <Package|object|void> 用于即时导入时返回导入的对象
 *                    <ul>
 *                      <li>导入单个对象时:返回导入对象;</li>
 *                      <li>导入文件或者多个对象(*)时:返回导入目标;</li>
 *                      <li>导入包时:返回包对象;</li>
 *                    </ul>
 *                    <p>一般可忽略返回值.因为默认情况下,导入为全局变量;无需再显示申明了.</p>
 */
var $import = function(freeEval,cachedScripts){
    if(":debug"){
        function error(text){
            error = confirm("Core Error",
                           text+"\n\n继续显示系统错误信息？ ")?error:Function.prototype;
        }
    }
    var packageMap = {};
    var scriptBase = $JSI.scriptBase;
    if("org.xidea.jsi.boot:col"){
        var lazyTaskList = [];
        var lazyScript ="<script src='data:text/javascript,$import()'></script>";
        var cacheFileMap = [];
        /*
         * 缓存清单计算
         */
        function appendCacheFiles(packageObject,file,object){
            packageObject.initialize && packageObject.initialize();
            var path = packageObject.name.replace(/\.|$/g,'/') + file;
            //data[0] 装载状态
            //data[1] 脚本是否无需再缓存
            var data = cacheFileMap[path];
            var loader = packageObject.loaderMap[file];
            if(data){//无需再与装载系统同步
                if(data[0]){
                    return;
                }else{
                    if(object){
                        if(data[object]){
                            //已经装载了
                            return;
                        }else{
                            data[object] = 1;
                        }
                    }else{
                        //完全装载了
                        data[0] = 1;
                    }
                }
            }else{//未装载，先用实际装载的信息填充之
                cacheFileMap[path] = data = {}
                //更新该装载节点状态
                data[object||0] = 1;
                //表示缓存库已经存在
                if(getCachedScript(packageObject.name,file) == null){
                    //hack data[1] = loader != null ||...
                    data[1] = loader;
                }else{
                    //hack = true
                    data[1] = 1;
                }
            }
            if(loader){
                //dependenceMap 再下一个分支中声明了，怪异的js：（
                if(deps = loader.dependenceMap){
                    //deps[0]是绝对不可能存在的！！
                    if(object){
                        var deps = deps[object];
                        var i = deps && deps.length;
                        while(i--){
                            var dep = deps[i];
                            appendCacheFiles(dep[0],dep[1],dep[2])
                        }
                    }
                    for(object in deps){
                        var deps2 = deps[object];
                        var i = deps2.length;
                        while(i--){
                            var dep = deps2[i];
                            appendCacheFiles(dep[0],dep[1],dep[2])
                        }
                    }
                }else{
                    //没有依赖，标识为全部装载完成
                    data[0] = 1;
                    //同时完成该节点
                    //return;
                }
            }else{
                var deps = packageObject.dependenceMap[file];
                var i = deps && deps.length;
                while(i--){
                    var dep = deps[i];
                    var key = dep[3];
                    if(!object || !key || object == key){
                        appendCacheFiles(dep[0],dep[1],dep[2]);
                    }
                }
            }
        }
    }
    if(!scriptBase){
        scriptBase = document.getElementsByTagName('script');
        $JSI.scriptBase = scriptBase = scriptBase[scriptBase.length-1].src.replace(/[^\/]*$/,'');
    }
    /*
     * 获取脚本缓存。
     * @private
     * @param <string>packageName 包名
     * @param <string>fileName 文件名
     */
    function getCachedScript(pkg,fileName){
        return (pkg = cachedScripts[pkg]) && pkg[fileName];
    };
    /**
     * 缓存脚本。
     * @public
     * @param <string>packageName 包名
     * @param <string>key 文件相对路径
     * @param <string|Function>value 缓存函数或文本
     */
    $JSI.preload = function(pkg,file2dataMap,value){
        if(cachedScripts[pkg]){ //比较少见
            pkg = cachedScripts[pkg];
            if(value == null){//null避免空串影响
                for(var n in file2dataMap){
                    pkg[n] = file2dataMap[n];
                }
            }else{
                pkg[file2dataMap] = value;
            }
        }else {
            if(value == null){//null避免空串影响
                cachedScripts[pkg] = file2dataMap;
            }else{
              (cachedScripts[pkg] = {})[file2dataMap] = value;
            }
        }
    };
    //模拟XMLHttpRequest对象
    if(this.ActiveXObject ){
        if("org.xidea.jsi.boot:col"){
            lazyScript =lazyScript.replace(/'.*'/,scriptBase+"lazy-trigger.js");
        }
        if(!this.XMLHttpRequest ){
            var xmlHttpRequstActiveIds = [
                //"Msxml2.XMLHTTP.6.0,"  //都IE7了，罢了罢了
                //"Msxml2.XMLHTTP.5.0,"  //office 的
                //"Msxml2.XMLHTTP.4.0,"
                //"MSXML2.XMLHTTP.3.0,"  //应该等价于MSXML2.XMLHTTP
                "MSXML2.XMLHTTP",
                "Microsoft.XMLHTTP"//IE5的，最早的XHR实现
                ];
            /**
             * 统一的 XMLHttpRequest 构造器（对于ie，做一个有返回值的构造器（这时new操作返回该返回值），返回他支持的AxtiveX控件）
             * 关于 XMLHttpRequest对象的详细信息请参考
             * <ul>
             *   <li><a href="http://www.w3.org/TR/XMLHttpRequest/">W3C XMLHttpRequest</a></li>
             *   <li><a href="http://www.ikown.com/manual/xmlhttp/index.htm">中文参考</a></li>
             *   <li><a href="http://msdn2.microsoft.com/en-us/library/ms762757(VS.85).aspx">MSXML</a></li>
             * </ul>
             * @id XMLHttpRequest 
             * @constructor
             */
            this.XMLHttpRequest = function(){
                while(true){
                    try{
                         return new ActiveXObject(xmlHttpRequstActiveIds[0]);
                    }catch (e){
                        if(!xmlHttpRequstActiveIds.shift()){
                            throw e;//not suport
                        }
                    }
                }
            };
        }
    }
    /**
     * 包信息数据结构类<b> &#160;(JSI 内部对象，普通用户不可见)</b>.
     * <p>在包目录下，有个包定义脚本（__package__.js）；
     * 在包的构造中执行这段脚本，执行中，this指向当前包对象</p>
     * <p>其中,两个常用方法,<a href="#Package.prototype.addScript">addScript</a>,<a href="#Package.prototype.addDependence">addDependence</a></p>
     * <p>该对象不应该在任何的方修改.</p>
     * @public
     * @constructor
     * @implicit
     * @param <string>name 包名（必须为真实存在的包）
     * @param <string>pscript 定义脚本
     */
    function Package(name,pscript){
        /*
         * 注册包
         */
        /**
         * 包名 
         * @private
         * @readonly
         * @typeof string
         * @id Package.this.name
         */
        packageMap[this.name = name] = this;

        /**
         * 包脚本路径目录 2
         * @private
         * @readonly
         * @typeof string
         */
        this.scriptBase = scriptBase+(name.replace(/\./g,'/'))+ '/';
        /**
         * 包脚本依赖  
         * 起初作为一个数组对象临时存储 依赖信息。
         * <code>
         * {[thisPath1,targetPath1,afterLoad],...}</code>
         * initialize成员方法调用后。
         * 将变成一个依赖表、且计算完全部包内匹配
         * <code>
         * [targetPackage, targetFileName, targetObjectName,thisObjectName, afterLoad, names]
         * </code>
         * 该值初始化后为Object实例,且一定不为空.
         * @private
         * @readonly
         * @typeof object
         */
        this.dependenceMap = [];
        /**
         * 脚本装载器表{scriptPath:ScriptLoader}
         * @private
         * @readonly
         * @typeof object
         */
        this.loaderMap = {};
        /**
         * 脚本->对象表{scriptPath:objectName}
         * object名为类名或包名 如<code>YAHOO</code>
         * @private
         * @typeof object
         * @readonly
         */
        this.scriptObjectMap = {};
        /**
         * 对象->脚本表{objectName:scriptPath}
         * object名为全名 如<code>YAHOO.ui.Color</code>
         * @private
         * @readonly
         * @typeof object
         */
        this.objectScriptMap = {};
        /**
         * 存储顶级对象的表.
         * 比如yahoo ui 的objectMap = {YAHOO:?}
         * prototype 的objectMap = {$:?,$A:? ....}
         * @private
         * @readonly
         * @typeof object
         * @owner Package.this
         */
        this.objectMap = {};
        
        try{
            if(pscript instanceof Function){
                pscript.call(this);
            }else{
                freeEval.call(this,pscript);
            }
        }catch(e){
            if(":debug"){
                error("Package Syntax Error:"+name+"\n\nException:"+e);
            }
            throw e;
        }

    }


    Package.prototype = {

        /**
         * 初始化 包依赖信息.
         * @private
         * @typeof function
         * @param
         */
        initialize : function(){
            //hack for null
            this.initialize = 0;
            //cache attributes
            var thisObjectScriptMap = this.objectScriptMap;
            var thisScriptObjectMap = this.scriptObjectMap;
            var list = this.dependenceMap;
            var map = {};
            var i = list.length;
            while(i--){
                var dep = list[i];
                var thisPath = dep[0];
                var targetPath = dep[1];
                var afterLoad = dep[2];
                if(":debug"){
                    if(!targetPath){
                        error(dep.join('\n'));
                        error(list.join('\n'));
                    }
                }
    
                //循环内无赋值变量声明应特别小心。函数变量
                var targetPackage = this;
                //hack for null
                var thisObjectName = 0;
                //hack for null
                var targetObjectName = 0;
                //hack for distinctPackage = false
                var distinctPackage = 0;
                var allSource = "*" == thisPath;
                var allTarget = targetPath.indexOf("*")+1;
                
                if (allSource || allTarget) {
                    var targetFileMap;
                    if (allSource) {
                        var thisFileMap = thisScriptObjectMap;
                    } else {
                        var thisFileName = thisObjectScriptMap[thisPath];
                        if (thisFileName) {
                            thisObjectName = thisPath;
                        } else {
                            thisFileName = thisPath;
                        }
                        (thisFileMap = {})[ thisFileName ]= 0;
                    }
                    if (allTarget) {
                        if (allTarget>1) {
                            targetPackage = realPackage(findPackageByPath(targetPath));
                            distinctPackage = 1;
                        }
                        targetFileMap = targetPackage.scriptObjectMap;
                    } else {
                        var targetFileName = thisObjectScriptMap[targetPath];
                        if(targetFileName){
                            targetObjectName = targetPath;
                        }else if(thisScriptObjectMap[targetPath]){
                            targetFileName = targetPath;
                            //targetObjectName = null;
                        }else{
                            distinctPackage = 1;
                            targetPackage = findPackageByPath(targetPath);
                            targetPath = targetPath.substring(targetPackage.name.length + 1);
                            targetPackage = realPackage(targetPackage);
                            //targetObjectName = null;
                            var targetFileName = targetPackage.objectScriptMap[targetPath];
                            if (targetFileName) {
                                targetObjectName = targetPath;
                            } else {
                                targetFileName = targetPath;
                            }
                        }
                        (targetFileMap = {})[ targetFileName ]= 0;
                    }
                    for (var targetFileName in targetFileMap) {
                        var dep = [targetPackage, targetFileName, targetObjectName,thisObjectName,afterLoad,
                                      targetObjectName ? [targetObjectName.replace(/\..*$/,'')]
                                                       :targetPackage.scriptObjectMap[targetFileName]]
                        for (var thisFileName in thisFileMap) {
                            if (distinctPackage || thisFileName != targetFileName) {
                                (map[thisFileName] || (map[thisFileName] = [])).push(dep);
                            }
                        }
                    }
                } else {
                    var thisFileName = thisObjectScriptMap[thisPath];
                    var targetFileName = thisObjectScriptMap[targetPath];
                    if (thisFileName) {//is object
                        thisObjectName = thisPath;
                    } else {
                        thisFileName = thisPath;
                    }
                    if(targetFileName){
                        targetObjectName = targetPath;
                    }else if(thisScriptObjectMap[targetPath]){
                        targetFileName = targetPath;
                    }else{
                        targetPackage = findPackageByPath(targetPath);
                        targetPath = targetPath.substr(targetPackage.name.length + 1);
                        targetPackage = realPackage(targetPackage);
                        var targetFileName = targetPackage.objectScriptMap[targetPath];
                        if (targetFileName) {
                            targetObjectName = targetPath;
                        } else {
                            targetFileName = targetPath;
                        }
                    }
                    (map[thisFileName] || (map[thisFileName] = [])).push(
                        [targetPackage, targetFileName, targetObjectName,thisObjectName,afterLoad,
                                  targetObjectName ? [targetObjectName.replace(/\..*$/,'')]
                                                   :targetPackage.scriptObjectMap[targetFileName]]
                    );
                }
    
            }
            this.dependenceMap = map;
        },

        /**
         * 添加脚本及其声明的对象（函数、方法名）。
         * 需要指定脚本位置（必须在当前包目录中），元素名(可用数组，同时指定多个)。
         * <i>该成员函数只在包定义文件（__package__.js）中调用 </i>
         * @public
         * @typeof function
         * @param <string>scriptPath 指定脚本路径
         * @param <string|Array>objectNames[opt] 字符串或其数组
         * @param <string|Array>beforeLoadDependences[opt] 装在前依赖
         * @param <string|Array>afterLoadDependences[opt] 装在后依赖
         */
        addScript :  function(scriptPath, objectNames, beforeLoadDependences, afterLoadDependences){
            var objects = this.scriptObjectMap[scriptPath];
            if(objects){
                var previousObject = objects[objects.length-1];
            }else{
                objects = (this.scriptObjectMap[scriptPath] = []);
            }
            if(objectNames){
                if(objectNames instanceof Array){
                    for(var i = 0,len = objectNames.length;i<len;i++){
                        var object = objectNames[i];
                        this.objectScriptMap[object] = scriptPath;
                        object = object.replace(/\..*$/,'');
                        if(previousObject != object){
                            objects.push(previousObject = object);
                        }
                    }
                }else{
                    this.objectScriptMap[objectNames] = scriptPath;
                    objectNames = objectNames.replace(/\..*$/,'');
                    if(previousObject != objectNames){
                        objects.push(objectNames);
                    }
                }
            }
            beforeLoadDependences && this.addDependence(scriptPath, beforeLoadDependences);
            afterLoadDependences && this.addDependence(scriptPath, afterLoadDependences,1);
        },
        /**
         * 添加脚本依赖。
         * 需要指定当前脚本文件或者脚本元素位置（必须在当前包目录中）、
         * 被依赖的脚本文件或者脚本元素位置(当前包中的脚本，或者通过抽象路径指定其他包中的脚本)、
         * 是否需要执行前导入(装载期依赖)。
         * <i>该成员函数只在包定义文件（__package__.js）中调用 </i>
         * @public
         * @typeof function
         * @param thisPath 本包中当前脚本文件或者脚本元素，使用*可表示当前该包中已添加全部脚本文件（将逐一添加同样的依赖）。
         * @param targetPath 依赖的脚本文件抽象路径（可不包括最后的版本包）或者脚本元素抽象路径
         * @param afterLoad 可选参数(默认为false) 是否可以执行后导入(运行期依赖)
         */
        addDependence : function(thisPath,targetPath,afterLoad){
            if(targetPath instanceof Array){
                var i = targetPath.length;
                while(i--){
                    this.addDependence(thisPath,targetPath[i],afterLoad);
                }
            }else{
                //TODO:可编译优化,进优化的脚本可以直接删除此运行时优化
                if("org.xidea.jsi.boot:dependenceOptimize"){
                    if(!afterLoad ){
                        thisPath = this.objectScriptMap[thisPath] || thisPath;
                    }
                    /* 还是没有想好怎么搞相对路径
                    if(targetPath.charAt(0) == '.'){
                        if(/\w\//.test(targetPath)){
                            
                        }
                        targetPath = this.name + targetPath;
                        while(targetPath!=(targetPath = targetPath.replace(/\w+\.\.\//,'')));
                    }
                    */
                }
                this.dependenceMap.push([thisPath,targetPath,afterLoad]);
            }
            
        },
    
        /**
         * 设置具体实现包名,用于版本管理,不常用。
         * 比如，我们可以给prototype库一个统一的包，
         * 但是我们的内容都放在具体的实现版本里，
         * 我们可以通过该设置（setImplementation(".v1_5");）来指定默认的具体实现版本。
         * <i>该成员函数只在包定义文件（__package__.js）中调用 </i>
         * @public
         * @typeof function
         * @param <String> packagePath 指定实现包名，全路径(ID(.ID)*)或相对路径（"." 开始的为本包下的相对路径）
         */
        setImplementation : function(packagePath){
            if(packagePath.charAt(0) == '.'){
                packagePath = this.name + packagePath;
                while(packagePath != (packagePath = packagePath.replace(/\w+\.\.\//,'')));
            }
            this.implementation = packagePath;
        }
        //,constructor : Package
    };
//奇怪的问题
//    if("org.xidea.jsi.boot:exportPackage"){
//        Package.prototype.constructor = Package; 
//    }


//    if("org.xidea.jsi.boot:exportPackage"){
//        $JSI.Package = Package; 
//    }



//    /**
//     * 包内文本加载函数
//     * 为方便后续扩展
//     * @private
//     * @owner Package.prototype
//     * @typeof function
//     */
//    function loadText(fileName){
//        return loadTextByURL(this.scriptBase+ fileName);
//    }


    
    /*
     * 创建一个新的类加载器，加载指定脚本
     * @private
     * @typeof function
     * @param packageObject 指定的脚本文件名
     * @param scriptPath 指定的脚本文件名
     * @param object 需要装载的对象 * 代表全部元素
     */
     function loadScript(packageObject,fileName,object){
        var loader = packageObject.loaderMap[fileName];
        if(!loader){
            //trace("load script path:",packageObject.scriptBase ,fileName);
            if(packageObject.scriptObjectMap[fileName]){
                //不敢确认是否需要延迟到这里再行初始化操作
                if(packageObject.initialize){
                    packageObject.initialize();
                }
                loader = new ScriptLoader(packageObject,fileName);
            }else{
                //TODO: try parent
                if(":debug"){
                    throw new Error('Script:['+fileName+'] Not Found')
                }
            }
        }
        if(loader.initialize){
            //trace("object loader initialize:",packageObject.scriptBase ,fileName);
            loader.initialize(object);
        }
    }
    /*
     * Dependence 的第二种设计
     * Dependence = [0            , 1             , 2               , 3            ,4         ,5    ]
     * Dependence = [targetPackage, targetFileName, targetObjectName,thisObjectName, afterLoad,names]
     * afterLoad,thisObject 有点冗余
     */
    function loadDependence(data,vars){
        loadScript(data[0],data[1],data[2]);
        var objectMap = data[0].objectMap;
        var names = data[5];
        var i = names.length;
        while(i--){
            var name = names[i];
            vars.push(name);//对于转载后依赖，我们使用重复设置了一次
            vars[name] = objectMap[name];
        }
    }
    /*
     * 加载指定文本，找不到文件(404)返回null,调试时采用
     * @friend
     * @param url 文件url
     * @return <string> 结果文本
     */
    function loadTextByURL(url){
        if("org.xidea.jsi.boot:avoidBlock"){
            var req = new XMLHttpRequest();
            req.open("GET",url,false);
            //for ie file 404 will throw exception 
            //document.title = url;
            req.send('');
            if(req.status >= 200 && req.status < 300 || req.status == 304 || !req.status){
                //return  req.responseText;
                return req.responseText;
            }else{
                //debug("load faild:",url,"status:",req.status);
            }
        }else{
            //debug(url);
            //trace(url);
            //return ''; //throw new Error("uncached url:"+url)
        }

    };
    /*
     * 获取指定实现包(不存在则加载之)
     * @intenal
     * @param <string>name 包名
     */
    function realPackage(packageObject){
        if(":debug"){
            if(!packageObject){
                alert('包对象不能为空:'+arguments.callee)
            }
        }
        while(packageObject.implementation){
            packageObject = findPackage(packageObject.implementation,true);
        }
        return packageObject;
    }
    
    /*
     * 获取指定包,抽象包也行(不存在则加载之)
     * TODO:可编译优化 cacheAllPackage,不必探测空包
     * @intenal
     * @param <string>name 包名
     * @param <boolean>exact 准确名，不需可上溯探测父包
     */
    function findPackage(name,exact){
        do{
            if(packageMap[name]){
                return packageMap[name];
            }
            if(packageMap[name] === undefined){
                var pscript = getCachedScript(name,'') ||
                    loadTextByURL(scriptBase+(name.replace(/\.|$/g,'/'))+ '__package__.js');
                if(pscript){
                    return new Package(name,pscript);
                }
                //注册空包，避免重复探测
                //hack for null
                packageMap[name] = 0;
            }
            if(exact){
                break;
            }
        }while(name = name.replace(/\.?[^\.]+$/,''));
    }
    /*
     * 获取指定对象路径的对应包
     */
    function findPackageByPath(path){
        var p = path.lastIndexOf('/');
        if(p>0){
            return findPackage(path.substr(0,p).replace(/\//g,'.'),true);
        }else if((p = path.indexOf(':'))>0){
            return findPackage(path.substr(0,p),true);
        }else{
            return findPackage(path.replace(/\.?[^\.]+$/,''));
        }
    }



    /**
     * 脚本装载器<b> &#160;(JSI 内部对象，普通用户不可见)</b>.
     * 该对象的属性可以在JSI托管脚本内调用,但是,如果你使用了这些属性,你的脚本就无法脱离JSI环境(导出).
     * <pre><code>eg:
     *   var scriptBase = this.scriptBase;//获取当前脚本所在的目录
     * </code></pre>
     * @constructor
     * @protected
     * @implicit
     * @param <Package> packageObject 包对象
     * @param <string> fileName 脚本名 
     */
    function ScriptLoader(packageObject,fileName){
        /**
         * 脚本名，可在托管脚本顶层上下文（非函数内）访问，<code>this&#46;name</code>
         * @friend
         * @typeof string 
         */
        this.name = fileName;

        /**
         * 脚本目录，可在托管脚本顶层上下文（非函数内）访问，<code>this&#46;scriptBase</code>
         * @friend
         * @typeof string 
         */
        this.scriptBase = packageObject.scriptBase;
        /**
         * 脚本的装在后依赖集合
         * 脚本依赖键为0
         * 对象依赖的键为对象名称
         * 其与initialize共存亡
         * @private
         * @id ScriptLoader.this.dependenceMap
         * @typeof object 
         */
        //this.dependenceMap = null;
        
        var loader = prepareScriptLoad(packageObject,this)
        if(loader){
            return  loader;
        }
        doScriptLoad(packageObject,this);
    };
    /*
     * 前期准备，初始化装载单元的依赖表，包括依赖变量申明，装载前依赖的装载注入
     * @private
     */
    function prepareScriptLoad(packageObject,loader){
        var name = loader.name;
        var deps = packageObject.dependenceMap[name];
        var varText = 'this.hook=function(n){return eval(n)}';
        var vars = [];
        var i = deps && deps.length;
        while(i--){
            var dep = deps[i];
            var key =  dep[3] || 0;
            if(dep[4]){//记录依赖，以待装载
                vars.push.apply(vars,dep[5]);
                if(map){
                    if(map[key]){
                        map[key].push(dep);
                    }else{
                        map[key] = [dep]
                    }
                }else{
                    //函数内只有一次赋值（申明后置，也就你JavaScript够狠！！ ）
                    var map = loader.dependenceMap = {};
                    loader.initialize = scriptLoaderInitialize;
                    map[key] = [dep]
                }
            }else{//直接装载（只是装载到缓存对象，没有进入装载单元），无需记录
                //这里貌似有死循环的危险
                loadDependence(dep,vars);
                if(dep = packageObject.loaderMap[name]){
                    return dep;
                }
            }
        }
        if(vars.length){
            loader.varMap = vars;
            varText += ';var '+vars.join(',').replace(/([^,]+)/g,'$1 = this.varMap.$1');
        }
        loader.varText = varText;
    }
    

    /*
     * 装载脚本
     * 这里没有依赖装载，装载前依赖装载在prepareScriptLoad中完成，装载后依赖在ScriptLoader.initialize中完成。
     * @private 
     */
    function doScriptLoad(packageObject,loader){
        var name = loader.name;
        var packageName = packageObject.name;
        var cachedScript = getCachedScript(packageName,name);
        packageObject.loaderMap[name] = loader;
        try{
            if(cachedScript instanceof Function){
                //$JSI.preload(pkgName,name,'')
                cachedScripts[packageName][name]='';//clear cache
                return cachedScript.call(loader);
            }else{
                //不要清除文本缓存
                return freeEval.call(loader,'eval(this.varText);'+(cachedScript || loadTextByURL(packageObject.scriptBase+name)));
            }
        }catch(e){
            if(":debug"){
                error("Load Error:\n"+loader.scriptBase + name+"\n\nException:"+e);
            }
            throw e;
        }finally{
            delete loader.varMap ;
            delete loader.varText ;
            var names = packageObject.scriptObjectMap[name];
            var index = names.length;
            var objectMap = packageObject.objectMap;
            //此处优化不知有无作用
            if(index == 1){
                objectMap[names = names[0]] = loader.hook(names);
            }else{
                var values = loader.hook('['+names.join(',')+']');
                while(index--){
                    objectMap[names[index]] = values[index];
                }
            }
        }
    }
    /*
     * 初始化制定对象，未指定代表全部对象，即当前转载单元的全部对象
     * @private
     */
    function scriptLoaderInitialize(object){
        //也一定不存在。D存I存，D亡I亡
        var dependenceMap = this.dependenceMap;
        var vars = [];
        var name = this.name;
        var dependenceList = dependenceMap[0];
        if(dependenceList){
            //一定要用delete，彻底清除
            delete dependenceMap[0];
            var i = dependenceList.length;
            while(i--){
                //alert("ScriptLoader#initialize:"+name+"/"+dep.getNames())
                loadDependence(dependenceList[i],vars);
            }
        }
        //这里进行了展开优化，有点冗余
        if(object){//装载对象
            if(dependenceList = dependenceMap[object]){
                //一定要用delete，彻底清除
                delete dependenceMap[object];
                var i = dependenceList.length;
                while(i--){
                    loadDependence(dependenceList[i],vars);
                }
            }
            //谨慎，这里的i上面已经声明，不过，他们只有两种可能，undefined和0 
            for(var i in dependenceMap){
                  break;
            }
            if(!i){
                //initialize 不能delete
                this.dependenceMap = this.initialize = 0;
            }
        }else{//装载脚本
            for(var object in dependenceMap){
                var dependenceList = dependenceMap[object];
                delete dependenceMap[object];
                var i = dependenceList.length;
                while(i--){
                    loadDependence(dependenceList[i],vars);
                }
            }
            //initialize 不能delete
            this.dependenceMap = this.initialize = 0;
        }
        if(vars.length){
            this.varMap = vars;
            vars = vars.join(',')
            this.hook(vars.replace(/([^,]+)/g,'$1 = this.varMap.$1'));
            delete this.varMap;
        }
    }
    
    function doObjectImport(packageObject,objectName,target){
        //do load
        loadScript(packageObject,packageObject.objectScriptMap[objectName],objectName,true);
        var pos2obj = objectName.indexOf('.');
        if(pos2obj>0){
            objectName = objectName.substr(0,pos2obj)
        }
        //p 为对象,节省个变量
        pos2obj = packageObject.objectMap[objectName];
        //null不可hack
        return target!=null?target[objectName]=pos2obj:pos2obj;
    }
    function doScriptImport(packageObject,fileName,target){
        loadScript(packageObject,fileName);
        var objectNames = packageObject.scriptObjectMap[fileName];
        //null不可hack
        if(target != null){
            for(var i = 0; i<objectNames.length;i++){
                target[objectNames[i]]=packageObject.objectMap[objectNames[i]];
            }
        }
    }
    if("org.xidea.jsi.boot:col"){
        function lazyImport(path,target,col){
            var pkg = findPackageByPath(path);
            var fileName = path.substr(pkg.name.length+1)
            var list = [];
            pkg = realPackage(pkg);
            if(fileName == '*'){
                for(var fileName in pkg.scriptObjectMap){
                    appendCacheFiles(pkg,fileName);
                }
            }else {
                if(path.indexOf('/')+1){
                    appendCacheFiles(pkg,fileName);;
                }else{
                    appendCacheFiles(pkg,pkg.objectScriptMap[fileName],fileName);;
                }
            }
            for(var filePath in cacheFileMap){//path --> filePath
                if(!cacheFileMap[filePath][1]){
                    cacheFileMap[filePath][1] = 1;
                    list.push(filePath);
                }
            }
            
            if(col instanceof Function){
                //alert([list , path ,  target,col].join('\n'))
                function callback() {
                    if(xhr.readyState == 4){
                        $JSI.preload(pkg,fileName,xhr.responseText) ;
                        //xhr.abort();
                        setTimeout(next,1);
                    }
                }
                function next(){
                    while(filePath = list.pop()){
                        pkg = filePath.replace(/\/[^\/]+$/,'').replace(/\//g,'.');
                        fileName = filePath.substr(pkg.length+1);
                        if(!getCachedScript(pkg,fileName)){
                            //need hack? xhr.open(); xhr.send('');return ;
                            xhr.open("get",scriptBase + filePath,true) ;
                            xhr.onreadystatechange = callback;
                            return xhr.send('');
                        }
                    }
                    xhr.onreadystatechange = Function.prototype;
                    col($import(path,target));
                }
                var xhr = new XMLHttpRequest();
                next();
            }else{
                if(":debug"){
                    if(location.protocol != 'file:'){
                        document.write(list.join("\n").
                                replace(/.+/g,"<script src='"+scriptBase+"?path=$&'></script>"))
                    }else{
                        document.write(list.join("\n").
                                replace(/.js$/gm,"__preload__.js").
                                replace(/.+/g,"<script src='"+scriptBase+"$&'></script>"))
                    }
                }else{
                    document.write(list.join("\n").
                                replace(/.js$/gm,"__preload__.js").
                                replace(/.+/g,"<script src='"+scriptBase+"$&'></script>"))
                }
                lazyTaskList.push(function(){
                        $import(path,target)
                    });
                document.write(lazyScript);
            }
        }
    }
    /*
     * 即JSI 的$import函数
     */
    return function(path,target,col){
        if(/\:$/.test(path)){
            return realPackage(findPackageByPath(path));
        }
        switch(arguments.length){
        case 0:
            col = lazyTaskList.shift();
            if(":debug"){
                if(!(col instanceof Function)){
                    error("延迟导入错误，非法内部状态！！ ");
                }
            }
            //hack return void;
            return col && col();
        case 1:
            target = this;
            break;
        case 2:
            switch(typeof target){
            case 'boolean':
            case 'function':
                col = target;
                target = this;
            }
        }
        if("org.xidea.jsi.boot:col"){
            if(col){
                return lazyImport(path,target,col); 
            }
        }
        var pkg2obj = findPackageByPath(path);
        var objectName = path.substr(pkg2obj.name.length+1);
        if(path.indexOf('/')+1){//path.indexOf('/') == -1
            doScriptImport(realPackage(pkg2obj),objectName,pkg2obj = target);
        }else{
            pkg2obj = realPackage(pkg2obj);
            if(objectName){
                if(objectName == '*'){
                    for(var fileName in pkg2obj.scriptObjectMap){
                        doScriptImport(pkg2obj,fileName,target);
                    }
                    //reuse pkg2obj variable
                    pkg2obj =  target;
                }else{
                    //reuse pkg2obj variable
                    pkg2obj =  doObjectImport(pkg2obj,objectName,target);
                }
            }
        }
        return pkg2obj;
    }
}(function(){eval(arguments[0]);},{});
