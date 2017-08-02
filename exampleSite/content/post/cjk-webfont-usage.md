---
title: "如何优雅的在网页里使用中文字体"
cover: "/media/posts/cjk-webfont-usage/03.jpg"
tags: ["CJK", "Webfont"]
date: 2017-07-25
draft: false
---

一直以来，在网页中使用中文字体进行排版都是个大难题，设计师和程序员之间因为中文字体爆发了很多场战争，而战争的结果通常是达成妥协，有时候设计师妥协「好吧好吧，就用黑体代替吧」，有时候程序员妥协「满足你，我来切成图片吧」，这篇文章介绍一个方法可以不妥协的解决这个难题。

<!--more-->

## 字体难题

为什么在网页里面引入 `Latin` 语系字体这么容易，但引入中文字体却这么难。原因其实很简单：英文只有 26 个字母，一张 ASCII 码表上 128 个字符集几乎可以表示任何英文语句。由于字符集小，字体文件也可以做的非常小；中文字体就完全不同，单单 `GB2313` 编码的中文字符（含符号）就达到 7445 个，字符数量是 `ASCII` 码表的 58 倍，而字体设计师需要为每一个中文字符设计字体，简单计算下，中文字体文件大小也几乎达到英文字体文件的数十倍。

*总结一下：在网页上使用中文字体的难点在于字体文件过大，下载慢会影响用户体验。*

## 解题思路

通常我们在网页上使用特殊字体的场景是标题和 Banner 图等场景，大篇幅的文章还是会老老实实使用计算机中预装的字体，这种场景下所需要特殊字体的字符数量其实是非常少的，如果我们能够利用工具对字体文件进行裁剪，生成一个只包含特定字符的小字体文件，就可以大大减少字体文件。

*那么问题来了，有没有好用的字体裁剪工具可以自动裁剪并生成所需的 `web font` 呢？*

## 裁剪工具

![字蛛 font-spider](/media/posts/cjk-webfont-usage/01.jpg)

经过一番搜索，博主搜到了两个工具：一个是 Google 家的 [sfntly](https://github.com/googlei18n/sfntly) 项目，一个是华人开发的「[字蛛](http://font-spider.org/)」，英文名 `font-spider`。前者依赖 Java 环境，命令行使用，是个基础库，使用起来比较麻烦；后者依赖 Node.js 环境，也是命令行使用，但产品化程度高得多。博主很懒，也不想折腾 Java 环境，选择了「字蛛」。下面简单画了张「字蛛」的工作原理图解释下它是如何工作的。

![font spider workflow](/media/posts/cjk-webfont-usage/02.svg)

开始使用「字蛛」，首先要在 `CSS` 文件中通过 `@font-face` 引入全量大小的特殊字体即可。

```css
@font-face {
  font-family: 'source';
  src: url('../fonts/source.eot');
  src:
    url('../fonts/source.eot?#font-spider') format('embedded-opentype'),
    url('../fonts/source.woff2') format('woff2'),
    url('../fonts/source.woff') format('woff'),
    url('../fonts/source.ttf') format('truetype'),
    url('../fonts/source.svg') format('svg');
  font-weight: normal;
  font-style: normal;
}

.home h1, .demo > .test {
    font-family: 'source';
}
```

然后执行「字蛛」命令行，使用「字蛛」只需指定一个参数：引入特殊字体的 `HTML` 文件集。

```bash
$ font-spider [options] <htmlFile1 htmlFile2 ...>
```

*讲了这么多，这玩意儿真的管用吗？实践是检验真理的唯一标准，得动手试下才知道*

## 实践出真知

动手前做好准备工作：找一张包含特殊中文字体的图片，找到设计图里面的 `ttf` 字体文件（[方正颜宋简体](https://github.com/laozhu/cjk-webfont-demo/tree/master/fonts/.font-spider)），在本地通过 `@font-face` 引入全量字体，并实现设计图中的布局和样式，实现的效果如下图所示。

*友情提醒：该字体文件只做 demo 演示，如需商用请购买字体版权。*

{{< figure src="/media/posts/cjk-webfont-usage/03.jpg" alt="CJK Web Font Demo" title="左边代码实现，右边是设计图" >}}

代码和演示都在这里，请自助 → [Code](https://github.com/laozhu/cjk-webfont-demo) | [Demo](https://laozhu.github.io/cjk-webfont-demo/)

准备工作做好后，`tree -lh` 查看一下目录结构和字体的大小（吃 🐳，居然有 5M 大小）。

![font spider workflow](/media/posts/cjk-webfont-usage/04.jpg)

然后执行 `font-spider` 命令行，直接上截图 → 这个页面里需要应用「方正颜宋简体」的字符只有 22 个，字体裁切后最小的 woff2 格式大小只有 `5.78 KB`，是原文件的 **1/869** 而已！！！ 这么小的文件我们都可以使用 `data-uri` 咯 👍。

![font spider workflow](/media/posts/cjk-webfont-usage/05.jpg)

裁剪的小字体生成后，原字体会备份到 `fonts/.font-spider` 目录下，网页中引入的字体会自动切换成小字体。

## 兼容性

字体裁剪没有问题的情况下，这个方法的兼容性主要取决于 `@font-face` 本身的兼容性，在低版本 IE 上就不要想了，但是在现代浏览器（包括 IE11）和移动端可以大胆使用。

![Can I Use @font-face](/media/posts/cjk-webfont-usage/06.jpg)

## 开个脑洞

看了下 [Google Fonts](https://fonts.google.com/) 通过 `@font-face` 引用字体的代码，有一个属性值 `unicode-range` 可以指定该字体应用的字符集，利用这个属性可以针对不同的字符应用不同的字体，即使是同一语言的字符。我们是否可以在前端构建环节，通过读取 `unicode-range` 的值，对 `src` 中指向的字体进行裁剪，以达到同样的目的。

## 文章更新

### 2017年8月1日

经由掘金网友提醒，发现一个好用的 GUI 字体裁剪工具 [fontmin](http://ecomfe.github.io/fontmin)，由 [Baidu EFE team](http://efe.baidu.com/) 出品。这个工具不仅提供方便开发者的命令行工具，也提供了 Windows / macOS 版的客户端，只要将字符集填入，选择需要裁剪的目标字体，即可生成根据字符集裁剪好的小字体。

![Fontmin for macOS](/media/posts/cjk-webfont-usage/07.jpg)

顺手摸到了一波好看的中文字体 [新蒂字体](http://www.sentyfont.com/)，需要的话可以到他们的 [淘宝店](https://shop111162234.world.taobao.com/) 购买个人非商用授权支持正版字体设计，几块钱一个也很良心。

## 参考资料

1. [中文字体网页开发指南](http://www.ruanyifeng.com/blog/2014/07/chinese_fonts.html)
2. [利用 CSS 分別設定中文字、英數、注音、假名的字體：使用 CSS3 @font-face](https://blog.yorkxin.org/2012/06/17/assign-fonts-for-specific-characters)
3. [中文WebFont解决方案Font-Spider(字蛛)](https://isux.tencent.com/font-spider.html)
4. [字蛛是一个中文字体压缩器](http://font-spider.org/)
5. [The First Solution Of Font Subsetting All By JavaScript](http://ecomfe.github.io/fontmin/en)
5. [A Library for Using, Editing, and Creating SFNT-based Fonts](https://github.com/googlei18n/sfntly)
