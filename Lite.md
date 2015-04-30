### 网页已移动至：http://code.google.com/p/jsi/wiki/Lite ###

<font color='#FFF'>
<h3>Lite 是什么</h3>

缩写自List Template，是一个由一个简单的控制指令集和一个表达式解析引擎组成的简单模板引擎。<br>
模板语言所解析的中间格式，由数组、字符串、和整数三种数据类型组成。数组就是这里唯一的复合类型，于是，我采用List Template来命名这个模板引擎。List 和Template各取两个首字母，组成Lite这个单词。<br>
<br>
用户不能直接编写控制指令，如同java程序员不能直接编写字节码一样，Lite需要一种真正的源代码格式。理论上，通过这些控制指令和自定义表达式函数，我们可以支持任何模板语法翻译为Lite能解释的中间代码。<br>
<br>
如CLR需要C#，C++.net，java byte code需要Java语法;Lite提供一种XML源代码语法，作为Lite的默认源代码格式。<br>
<br>
<h3>Lite 支持那些环境</h3>

目前支持JS和Java两种编程环境，新的环境将继续补充，因为Lite本身的简单性，如果，我们仅仅支持其运用环境，是一件非常简单的事情（编译环境可以在开发期间通过java程序完成，或者可以在运行时通过远程调用，完成模板动态编译）<br>
<br>
<h3>Lite效率</h3>

Lite的运行效率，是非常出众的，高于Velocity大约50%。<br>
测试结果见：<a href='http://code.google.com/p/templatetest/wiki/Velocity_CommonTemplate_XMLTemplate_Compare'>http://code.google.com/p/templatetest/wiki/Velocity_CommonTemplate_XMLTemplate_Compare</a>

<h3>Lite 的XML语法简介</h3>

Lite的语法非常简单，如果你熟悉jstl，那么，你基本也就熟悉了Lite XML<br>
<ul><li>if 指令<br>
</li><li>for 指令<br>
</li><li>else 指令<br>
</li><li>var 指令<br>
</li><li>include 指令（编译期指令）</li></ul>

<h3>Lite 的XML语法的优势</h3>

XML良好的结构，对于模板的语意表达和代码组织非常有利。<br>
<br>
同时，模板通常用来生成类XML数据（如html），XML源代码懂XML语法，用它来生成标记另外一种类XML标记语言，有一定的先天优势。<br>
<br>
主要表现有：<br>
<ul><li>代码的格式化和自动的空白压缩。<br>
</li><li>简单的可选属性表示方法。<br>
</li><li>文档片段级别的包含。<br>
</font>