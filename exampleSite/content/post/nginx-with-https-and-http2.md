---
title: "Nginx with HTTPS and HTTP/2"
cover: "/media/posts/nginx-with-https-and-http2/07.jpg"
tags: ["Nginx", "HTTPS", "HTTP2", "ACME", "letsencrypt"]
date: 2017-07-22
draft: false
---

随着浏览器和服务器对 HTTPS 和 HTTP/2 的全面支持，以及免费证书的快速普及，越来越多的网站开始切换到 HTTPS 和 HTTP/2 上。国内运营商对非加密流量的劫持和污染简直令人发指，这也促使站长们纷纷部署 HTTPS 和 HTTP/2 以免受劫持之苦。

<!--more-->

## 签发证书

目前证书方面比较流行的方案是使用 [Let's Encrypt](https://letsencrypt.org/) 免费证书和 [acme.sh](https://acme.sh) 自动化证书签发和更新工具。签发证书前，我们需要完成一些准备工作：

* 注册一个自己的域名
* 在国内部署需完成备案
* 使用 [DNSPod](https://www.dnspod.cn/) 或 [Aliyun](https://www.aliyun.com/) 解析域名

我使用 DNSPod 解析域名，以下均以此为例。首先登录 DNSPod 的后台管理系统，进入 **用户中心 → 安全设置 → API Token** 中创建一个新的 API Token。这个新的 API Token 将用于 acme.sh 签发证书时进行所有权验证（dns challenge），并非所有的域名服务商都支持 API 方式验证，acme.sh 官方提供了一个 [支持清单](https://github.com/Neilpang/acme.sh#9-automatic-dns-api-integration) 供你查阅。

![创建新的 API Token](/media/posts/nginx-with-https-and-http2/01.jpg)

保存好刚才创建 API Token 中的 id 和 token 值，以 root 身份登录服务器将其导入环境变量中。

*友情提醒：请使用 root 身份登录并执行该部分的所有操作。*

```bash
# Add to ~/.bashrc
export DP_Id="your_dnspod_api_id"
export DP_Key="your_dnspod_api_token"
```

接下来我们需要安装 acme.sh 工具，同时打开其自动更新，安装完成后我们就可以使用 `acme.sh` 命令行啦。

```bash
curl https://get.acme.sh | sh
acme.sh --upgrade --auto-upgrade
```

以本站域名 `laozhu.me` 为例，签发 RSA 普通证书和 [ECC](https://imququ.com/post/ecc-certificate.html) 证书。通过 `--dns` 参数指定通过 DNS 方式进行域名验证；通过 `-d` 参数指定证书起作用的所有域名（包括根域名和子域名，可设置多个）；通过 `-k` 指定证书的加密类型，普通证书可省略。

```bash
# Issue RSA Certificate
acme.sh --issue --dns dns_dp \
        -d laozhu.me -d www.laozhu.me -d status.laozhu.me -d labs.laozhu.me

# Issue ECC Certificate
acme.sh --issue --dns dns_dp \
        -d laozhu.me -d www.laozhu.me -d status.laozhu.me -d labs.laozhu.me \
        -k ec-384
```

将签发的证书文件自动安装到指定目录下，以方便 WEB 服务器引用。需要注意的是，证书每次签发的有效期实际为三个月，acme.sh 通过定时任务每三个月 renew 证书并强制 reload 服务器，使得证书能够长期有效。

```bash
# Install RSA Certificate
acme.sh --install-cert -d laozhu.me \
        --ca-file /etc/nginx/ssl/laozhu.me/ca.cer \
        --cert-file /etc/nginx/ssl/laozhu.me/laozhu.me.cer \
        --key-file /etc/nginx/ssl/laozhu.me/laozhu.me.key \
        --fullchain-file /etc/nginx/ssl/laozhu.me/fullchain.cer \
        --reloadcmd "service nginx force-reload"

# Install ECC Certificate
acme.sh --ecc --install-cert -d laozhu.me \
        --ca-file /etc/nginx/ssl/laozhu.me_ecc/ca.cer \
        --cert-file /etc/nginx/ssl/laozhu.me_ecc/laozhu.me.cer \
        --key-file /etc/nginx/ssl/laozhu.me_ecc/laozhu.me.key \
        --fullchain-file /etc/nginx/ssl/laozhu.me_ecc/fullchain.cer \
        --reloadcmd "service nginx force-reload"
```

如果定时任务异常，我们可以使用下面的命令手动 renew 证书。

```bash
acme.sh --renew -d laozhu.me --force
acme.sh --renew -d laozhu.me --force --ecc
```

总的来说，现在签发 HTTPS 证书的成本真的是极低了，低到已经没有理由不去使用它。

## 通用配置

如果希望服务器上的所有流量都能够走 HTTPS 和 HTTP/2，彻底的放弃 HTTP，可以做一个通用的配置，将 HTTP 流量永久重定向（301）到对应的 HTTPS 路由上。

```nginx
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  # Redirect all HTTP requests to HTTPS with a 301 Moved Permanently response.
  return 301 https://$host$request_uri;
}
```

用户习惯了将 `www.laozhu.me` 等同于 `laozhu.me` 域名，而事实上这是两个域名。两个域名展示同样的内容对于搜索引擎来说并不友好，也不利于网站的数据统计，因此我希望将所有的 `www` 流量永久重定向（301）到对应的 `non-www` 路由上。

```nginx
server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name www.laozhu.me;
  # 通用的 ssl 配置
  include conf.d/ssl/common.conf;
  # 通用的 ssl 头部配置
  include conf.d/ssl/header.conf;
  # 针对该域名的 ssl 配置，如 cert 和 key
  include conf.d/ssl/laozhu.me.conf;
  return 301 https://laozhu.me$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name laozhu.me;
  include conf.d/ssl/common.conf;
  include conf.d/ssl/header.conf;
  include conf.d/ssl/laozhu.me.conf;
  root /home/ritchie/www/laozhu.me/public;
  index index.html;
  error_page 404 /404.html;
}
```

我们可以使用 [Mozilla SSL Configuration Generator](https://mozilla.github.io/server-side-tls/ssl-config-generator/) 这个这个小工具自动生成一些通用的 SSL 配置，在此之前我们需要知道 WEB 服务器的版本号和 OpenSSL 的版本号。博主选择了比较激进的 Modern 配置，这样基本上 IE10 及以下的浏览器都得不到支持，如果你希望支持老旧浏览器，请选择 Intermediate 配置。

![Mozilla SSL Configuration Generator](/media/posts/nginx-with-https-and-http2/02.jpg)

将「域名无关」和「域名相关」的 SSL 配置分开存放，并 `include` 进对应域名的 `server` 配置中。

```nginx
# conf.d/ssl/common.conf
# modern configuration. tweak to your needs.
ssl_protocols TLSv1.2;
ssl_ciphers 'paste_your_ssl_ciphers_here';
ssl_prefer_server_ciphers on;
# Optimize SSL
ssl_session_tickets off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 24h;
ssl_buffer_size 1400;
keepalive_timeout 300s;
# openssl dhparam -out dhparams.pem 2048
ssl_dhparam ssl/dhparams.pem;
```

```nginx
# conf.d/ssl/laozhu.me.conf
# RSA Cert and Key
ssl_certificate ssl/laozhu.me/fullchain.cer;
ssl_certificate_key ssl/laozhu.me/laozhu.me.key;
# ECC Cert and Key
ssl_certificate ssl/laozhu.me_ecc/fullchain.cer;
ssl_certificate_key ssl/laozhu.me_ecc/laozhu.me.key;
```

## OCSP Stapling

OCSP Stapling，也称 OCSP 封套，是一个 TLS 证书状态查询扩展，作为在线证书状态协议的代替方法对 X.509 证书状态进行查询。服务器在 TLS 握手时发送事先缓存的 OCSP 响应，用户只需验证该响应的有效性而不用再向数字证书认证机构（CA）发送请求，开启可提高 TLS 握手效率。虽然博主不是很理解此概念，但既然能优化性能，开启总是比较好的。

```nginx
# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 223.5.5.5 114.114.114.114 8.8.8.8 valid=60s;
resolver_timeout 5s;
```

## HSTS

HSTS 是 HTTP Strict Transport Security 的缩写，也称 HTTP 严格传输安全，是一套由互联网工程任务组发布的互联网安全策略机制。网站可以通过使用 HSTS 策略，让浏览器强制使用 HTTPS 进行通信，以减少会话被劫持的风险。将 `laozhu.me` 及其子域名下的所有流量均重定向到 HTTPS 下确保传输安全，同时需要为每个请求增加 Strict-Transport-Security 响应头。

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

大部分浏览器对 HSTS 的支持都很 [完美](http://caniuse.com/#search=HSTS)，可以放心使用。但这个协议本身仍存在一个小的缺陷，当用户第一次访问网站的时候仍然是 HTTP 301 重定向，而这一次也有可能被不法之徒劫持利用，因此浏览器厂商们就想到一个笨办法，通过维护一个 `HSTS Preload List`，并将这个列表硬编码到浏览器里面，只要用户访问的域名在这个列表上，即使第一次也直接走 HTTPS 协议，完美解决。

问题又来了，我们应该如何进入这个 `HSTS Preload List` 呢？访问 [HSTS Preload List Submission](https://hstspreload.org/?domain=laozhu.me) 看下申请所必须满足的条件，满足条件的前提下提交申请。如果有幸你的域名通过审核，输入域名 check 一下应该就变绿了。

![HSTS Preload List Submission](/media/posts/nginx-with-https-and-http2/03.gif)

## HPKP

HPKP 是 HTTP Public Key Pinning 的缩写，也称 HTTP 公钥固定 或 HTTP 公钥钉扎，是 HTTPS 网站防止攻击者使用 CA 错误签发的证书进行中间人攻击的一种安全机制，用于预防诸如攻击者入侵 CA 偷发证书、浏览器信任的 CA 签发伪造证书等情况。采用该机制后，网站服务器会提供一个公钥哈希列表，客户端在后续通讯中将只接受该列表上的一个或多个公钥。我使用 Let's Encrypt 的两个 [中间证书](https://letsencrypt.org/certificates/#intermediate-certificates) 来生成公钥，其中 `X3` 生成 `primary` 公钥， `X4` 生成 `backup` 公钥。

```bash
# 下载 Let's Encrypt 中间证书
wget https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem.txt -O primary.pem
wget https://letsencrypt.org/certs/lets-encrypt-x4-cross-signed.pem.txt -O backup.pem

# 验证证书是否有效
openssl x509 -in primary.pem -noout -subject
openssl x509 -in backup.pem -noout -subject

# 生成 primary 公钥
openssl x509 -in primary.pem -noout -pubkey | openssl asn1parse -noout -inform pem -out public.key
openssl dgst -sha256 -binary public.key | openssl enc -base64

# 生成 backup 公钥
openssl x509 -in backup.pem -noout -pubkey | openssl asn1parse -noout -inform pem -out public.key
openssl dgst -sha256 -binary public.key | openssl enc -base64
```

修改 Nginx 服务器配置，为每个请求增加 Public-Key-Pins 响应头。

```nginx
add_header Public-Key-Pins 'pin-sha256="primary_base64_key"; pin-sha256="backup_base64_key"; max-age=2592000; includeSubDomains' always;
```

通过 [SSL Labs](https://www.ssllabs.com/ssltest/analyze.html) 检查 HPKP 配置是否生效。

![SSL Labs](/media/posts/nginx-with-https-and-http2/04.jpg)

## CSP

CSP 是 Content Security Policy 的缩写，可直接翻译为「内容安全政策」，是开发者为客户端提供的一份白名单，明确告知客户端哪些资源可以加载和执行，白名单以外的一概不予加载和执行。CSP 白名单制度大大增加了网站的安全性，推荐在生产环境中部署。开启白名单有两种方式：为每个请求增加 Content-Security-Policy 响应头；在网页头部增加 Content-Security-Policy 的 `meta` 标签，看起来在 Nginx 中为所有流量增加响应头更加方便一些。

白名单的配置是个机械重复但很麻烦的事情，好在有人已经开发了好用的可视化工具，访问 [CSP Is Awesome](http://cspisawesome.com/content_security_policies) 这个网站，根据自身网站的情况点选后可自动生成白名单。下面是本站生成的配置，仅供参考。

```nginx
add_header Content-Security-Policy "upgrade-insecure-requests; default-src 'none'; script-src 'self' data: 'unsafe-inline' 'unsafe-eval' https:; object-src 'self' https:; style-src 'self' data: 'unsafe-inline' https:; img-src 'self' data: https:; media-src 'self' data: https; frame-src 'self' https:; font-src 'self' data: https:; connect-src 'self' https:" always;
```

## 其他配置

修改 Nginx 服务器配置，为每个请求增加以下响应头，增强网站整体的安全性。

```nginx
# 告诉 IE8 使用最新的浏览器渲染
add_header X-UA-Compatible "IE=Edge" always;
# 控制 Referrer 信息显示，同源完整显示，跨域仅显示 host 部分
add_header Referrer-Policy "origin-when-cross-origin" always;
# 网页只在同源情况允许被 iframe 嵌套
add_header X-Frame-Options "SAMEORIGIN" always;
# 让浏览器对 Content-Type 不要瞎猜测
add_header X-Content-Type-Options "nosniff" always;
# 开启浏览器 XSS 过滤，一旦发现自动 block 掉
add_header X-XSS-Protection "1; mode=block" always;
```

## 评分时间

本站的 [HTTP Security Report](https://httpsecurityreport.com/?report=laozhu.me) 结果👇。

![HTTP Security Report](/media/posts/nginx-with-https-and-http2/05.jpg)

本站的 [SSL Server Test](https://www.ssllabs.com/ssltest/analyze.html?d=laozhu.me&s=139.162.120.177) 结果👇。

![SSL Server Test](/media/posts/nginx-with-https-and-http2/06.jpg)

经过博主的折腾，本站的安全评估得分为 **95** 分，SSL 测试等级为 **A+**，这主要得益于博主相对激进的服务器配置策略，显然这样对低版本的操作系统和浏览器并不友好，但是对于开发者来说，可以更快的将新技术应用到生产环境，岂不快哉。是时候甩包袱了，大家一起丢弃对老旧操作系统和浏览器的妇人之仁吧。

## 文章更新

### 2017年8月1日

经由 [@波哥](http://boof.wang/) 提醒，如果网站引入的 iframe 中包含了 http 链接地址，可以在 CSP 部分白名单前增加 `upgrade-insecure-requests` 值，让浏览器将 http 自动升级为 https 资源（当存在对应 https 资源的情况下）。

*此方案完美解决了博主引入网易云音乐播放器时遇到 http 资源污染的问题。*

## 参考资料

本文参考了很多的网站，尤其是 [JerryQu 的小站](https://imququ.com)，其对 HTTPS 和 HTTP/2 相关知识的讲解既系统又深入，值得一篇篇研读。

1. [本博客 Nginx 配置之完整篇](https://imququ.com/post/my-nginx-conf.html)
2. [Content Security Policy Level 2 介绍](https://imququ.com/post/content-security-policy-level-2.html)
3. [HTTP Public Key Pinning 介绍](https://imququ.com/post/http-public-key-pinning.html)
4. [开始使用 ECC 证书](https://imququ.com/post/ecc-certificate.html)
5. [解决缺陷，让 HSTS 变得完美](https://blog.wilddog.com/?page_id=1493)
6. [内容安全政策 | Web | Google Developers](https://developers.google.com/web/fundamentals/security/csp/?hl=zh-cn)
7. [Acme.sh Wiki](https://github.com/Neilpang/acme.sh/wiki)
