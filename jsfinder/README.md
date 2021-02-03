# jsfinder

从当前页面中的js文件中提取api

参考于[Threezh1](https://github.com/Threezh1/Deconstruct/tree/main/DevTools_JSFinder)大佬的，自己新增修改了一些功能

提取规则的匹配情况（正则直接用的[LinkFinder](https://github.com/GerbenJavado/LinkFinder)的，下面是这个的正则会匹配的情况，根据需要进行优化）

![img.png](img.png)

# 使用

chrome安装Tampermonkey

然后添加js即可

如果想要抓取指定域名的，可以修改js的match的匹配规则 , 就下面的配置

```// @match        *://*/*```

使用方法：

1、正常网站页面，会对当前页面的引入的所有本域js进行提取api

**Note**：存在个问题，js太大就抓不到响应数据，即使响应成功了，没查到是什么原因（有知道的请告知，感谢），如果出现就使用下面的方法对每个js进行提取吧。

2、直接访问目标js，获取这个js的api

# 效果

1、正常网站

![img_1.png](img_1.png)

2、访问指定js

![img_2.png](img_2.png)