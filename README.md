Hugo Nuo
========

Hugo Nuo is an responsive light & clean hugo theme for blogger. This theme features several page layout, like an [about page](https://laozhu.me/about/) for your portfolio, a [links page](https://laozhu.me/links/) for your friends' blog, a works page is under development. This theme makes many third-party hugo shortcodes, including [Codepen](https://codepen.io/), [JSFiddle](https://jsfiddle.net/), [Video.js](http://videojs.com/), [Music 163](https://music.163.com/) and [Sheng Xiang](https://ppt.baomitu.com/).

![Hugo Nuo Theme Screenshot](https://raw.githubusercontent.com/laozhu/hugo-nuo/master/images/screenshot.png)

Or you want → [A Real Site Demo](https://laozhu.me) | [Hugo Nuo Theme Post Preview](https://laozhu.me/post/hugo-nuo-post-preview/)

[中文帮助](https://laozhu.me/post/hugo-nuo-theme/)

## Installation

Inside the folder of your Hugo site run:

```bash
$ cd themes
$ git clone https://github.com/laozhu/hugo-nuo
```

*For more information read the official [setup guide](https://gohugo.io/overview/installing/) of Hugo.*

## Getting Started

After installing the hugo-nuo theme successfully it requires just a few more steps to get your site finally running.

### The config file

Take a look inside the [exampleSite](https://github.com/laozhu/hugo-nuo/tree/master/exampleSite) folder of this theme. You'll find a file called [config.toml](https://github.com/laozhu/hugo-nuo/blob/master/exampleSite/config.toml). To use it, copy the config.toml in the root folder of your Hugo site. Feel free to customize this theme as you like.

**Main Menu**

The hugo-nuo theme add `home` and `works` page to initial site menu, you can add your own menu item here.

```toml
[[menu.main]]
  name = "Home"
  weight = 10
  identifier = "home"
  url = "/"

[[menu.main]]
  name = "Works"
  weight = 20
  identifier = "works"
  url = "https://github.com/laozhu"
```

Or you can add some other page to menu in page's front matter:

```markdown
---
title: "Links"
date: 2017-08-02
layout: "links"
menu: "main"
weight: 30
---
```

**Social Networks**

The following social network icons are available:

```toml
[params]
  email = "name@domain.com"
  github = "github_username"
  twitter = "twitter_username"
  linkedin = "linkedin_username"
  weibo = "weibo_username"
  wechat= "/img/qrcode.jpg" # Replace with your wechat qrcode image
  facebook = "facebook_username"
  google = "googlplus_id_number"
  instagram = "instagram_username"
  youtube = "youtube_username"
  vimeo = "vimeo_username"
  medium = "medium_username"
  quora = "quora_username"
  pinterest = "pinterest_username"
  dribbble = "dribbble_username"
  behance = "behance_username"
  jsfiddle = "jsfiddle_username"
  codepen = "codepen_username"
  zhihu = "zhihu_username"
  douban = "douban_username"
  bilibili = "bilibili_id_number"
```

You can choose someone to display, the recommend number is 7 icons.

**SEO**

The hugo-nuo theme support [Google](https://www.google.com/webmasters/), [Bing](https://www.bing.com/toolbox/webmaster/), [Baidu](https://zhanzhang.baidu.com/), [Sogou](http://zhanzhang.sogou.com/), [360](http://zhanzhang.so.com/) webmaster's meta verification tool, you can activate as required. The `seotitle` and `description` will show in search results and browser title.

```toml
[params]
  seotitle = "Hugo Blog Title (SEO Version)"
  description = "Hugo is one of the most popular open-source static site generators. With its amazing speed and flexibility, Hugo makes building websites fun again."

  # Google Webmaster
  # https://www.google.com/webmasters/
  googleSiteVerification = "google_site_verification_code"
  
  # Bing Webmaster
  # https://www.bing.com/toolbox/webmaster/
  msValidate = "bing_site_verification_code"
  
  # Baidu Webmaster (China Only)
  # https://zhanzhang.baidu.com/
  # baiduSiteVerification = "baidu_site_verification_code"
  
  # Sogou Webmaster (China Only)
  # http://zhanzhang.sogou.com/
  # sogouSiteVerification = "sogou_site_verification_code"
  
  # 360 Webmaster (China Only)
  # http://zhanzhang.so.com/
  # soSiteVerification = "360_site_verification_code"
```

**Website Analytics**

The hugo-nuo theme support [Google Analytics](https://www.google.com/analytics/) and [Baidu Tongji](https://tongji.baidu.com/), In China you can choose both Baidu Tongji and Google Analytics.

```toml
# Google Analytics UA number
googleAnalytics = "UA-XXXXXXXX-X"

[params]
  # Baidu Tongji (China Only)
  # https://tongji.baidu.com/
  baiduTongji = "baidu_tongji_code"
```

**Social Comments**

The hugo-nuo theme support [Disqus](https://disqus.com/) and [Chang Yan](https://changyan.kuaizhan.com/) social comment system, In China you can choose Chang Yan because Disqus is blocked by GFW.

```toml
# Disqus Username
disqusShortname = "disqus_shortname"

[params]
  # Changyan Comments (China Only)
  changyan = false
  changyanId = "your_changyan_id"
  changyanConf = "your_changyan_conf"
```

If you want to use Disqus, you should disable `changyan` to `false`.

### The works page

The works page layout is under development, you can use github homepage for replacement temporarily.

### The links page

Inside the folder of your Hugo site run:

```bash
$ hugo new links.md
$ mkdir data && touch data/links.yml
$ mkdir -p content/media/links
$ vim content/links.md
```

Change the content of `links.md`, set page layout to `links`, If you want to add about page to menu, set menu to `main` and `weight` to 30.

```markdown
---
title: "Links"
date: 2017-08-02
layout: "links"
menu: "main"
weight: 30
---
```

The links page read data from `data/link.yml` file, now you can add friend's links there. The format looks like:

```yaml
01_link:
  title: chekun's blog
  link: https://chekun.me
  avatar: /media/links/chekun.jpg
  description: A full-stack PHP developer

02_link:
  title: Boof Wang
  link: http://boof.wang
  avatar: /media/links/wangbo.jpg
  description: Another full-stack PHP developer
```

The links page need friend's avatar, finally you should add friend's avatar to `content/media/links` directory and link to avatar in the `links.yml` file.

### The about page

Inside the folder of your Hugo site run:

```bash
$ hugo new about.md
$ vim content/about.md
```

Change the content of `about.md`, set page layout to `about`, If you want to add about page to menu, set menu to `main` and `weight` to 40.

```markdown
---
title: "About"
date: 2017-08-02
layout: "about"
menu: "main"
weight: 40
comments: false
---

Write something about you here.
```

Write your portfolio as a post here, if you want comments in about page, you should turn comments to `true`.

## Build

If you want to modify styles and scripts by yourself, you should install dev packages by `npm install`, I use [sass](http://sass-lang.com/) for styles development, [rollup](https://github.com/rollup/rollup) for scripts development, inside the folder of your Hugo site run:

```bash
# Install dependences
$ cd themes/hugo-nuo
$ npm install

# Scripts dev
$ npm run dev
$ npm run build

# Styles dev
$ npm run sass

# Copy fonts to static
$ npm run fonts

# Copy images to static
$ npm run images

# Scripts lint
$ npm run eslint

# Styles lint
$ npm run stylelint

# Minify images
$ npm run imagemin
```

If you want to build hugo-nuo theme, you should have `node` and `npm` evironment installed. Besides, you should have dependencies below installed.

* [ImageOptim](https://imageoptim.com/) - Makes images load faster
* [SASS](http://sass-lang.com/install) - Ruby version SASS compiler
* [Pygments](http://pygments.org/) - Python syntax hightlighter

*From Hugo 0.28, the default syntax hightlighter in Hugo is [Chroma](https://github.com/alecthomas/chroma); it is built in Go and is really, really fast – and for the most important parts compatible with [Pygments](http://pygments.org/).*

```bash
$ hugo gen chromastyles --style=monokai > ./src/styles/partials/syntax.css
```

Run hugo gen `chromastyles -h` for more options. See <https://help.farbox.com/pygments.html> for a gallery of available styles.

## Nearly finished

In order to see your site in action, run Hugo's built-in local server.

```bash
$ hugo server -w
```

Now enter [localhost:1313](http://localhost:1313) in the address bar of your browser.

## Credits

- [Video.js](http://videojs.com/)
- [MathJax](https://www.mathjax.org/)
- [Smooth Scroll](https://github.com/cferdinandi/smooth-scroll)
- [BootCDN](http://www.bootcdn.cn/)

Also thanks to [Steve Francia](https://github.com/spf13) for creating [Hugo](https://gohugo.io/) and the awesome community around the project.
