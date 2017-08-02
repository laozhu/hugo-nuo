---
title: "简单几步让服务器更安全"
tags: ["linode", "security", "server"]
date: 2017-07-19
draft: false
---

对于爱折腾的人来说，在自己的服务器上搭建博客是一件很有趣的事情，但从头开始配置服务器，完成博客部署并非一件易事，使用或者配置不恰当更是可能引起服务器的安全隐患。本文参考了 [DigitalOcean](https://www.digitalocean.com/) 的一篇文章 <sup>[[1]](#ref01) </sup>，介绍几个简单的增强服务器安全性的方法，希望对你有所帮助。

<!--more-->

## 选择服务器

![Linode VPS](/media/posts/make-server-secure/01.jpg)

如果你想自由的写作，或者希望写的东西能够不仅仅在墙内传播，请购买一台海外服务器。这里强烈推荐 [Linode](https://www.linode.com/?r=b16765dc2f06d3cdc0d543d33ae1bf592a0315da) 的日本机房，主要优势有三点：访问速度快，价格便宜，当 IP 被封禁时换得快。如果你只是搭建博客的话，选择最低配每月 **$5** 的乞丐版完全够用了（本站选择的便是）。

## 选择操作系统

![Debian 9 Stretch](/media/posts/make-server-secure/02.jpg)

选择版本稳定的发行版，[Debian](https://www.debian.org/index.zh-cn.html) 是比较好的选择，[Ubuntu](http://cn.ubuntu.com/) 升级过于频繁，而且每半年的大版本升级经常搞坏系统，不推荐，[CentOS](https://www.centos.org/) 的包管理器用得不顺手，弃。惊喜的发现 `Debian 9 Stretch` 稳定版时隔两年也发布了，正合我意。

## 更新系统

修改系统的更新源，选择与服务器连接比较好的源，因为服务器在日本，我优先选择日本的源，然后开始执行升级和清理工作。

```bash
apt update
apt full-upgrade
apt autoremove
```

## 修改 SSH 端口号

修改 `ssh` 的默认 `22` 端口。

```bash
vim /etc/ssh/sshd_config

# 修改端口
Port 2222

service ssh restart
```

## 禁用 ROOT 账号

`root` 权限过大，我们新建一个普通用户加入 `sudo` 组，同时彻底禁用 `root` 通过 `ssh` 登录服务器。

```bash
apt install sudo
adduser ritchie
visudo

# 赋予 ritchie 以 sudo 权限
ritchie ALL=(ALL:ALL) ALL

vim /etc/ssh/sshd_config

# 禁用 ROOT 登录 SSH
PermitRootLogin no

service ssh restart
```

## 使用 SSH-KEY 登录

首先本地生成一对公钥和私钥，将公钥部署到服务器上，彻底禁用密码登录。

```bash
$ ssh-keygen
$ ssh-copy-id username@remote_host -p 2222
$ sudo vim /etc/ssh/sshd_config

# 禁用密码登录
PasswordAuthentication no

$ sudo service ssh restart
```

## 启用 UFW 服务

![UFW](/media/posts/make-server-secure/03.jpg)

[UFW](https://zh.wikipedia.org/wiki/Uncomplicated_Firewall) 全称为 Uncomplicated Firewall，是 [Ubuntu](http://cn.ubuntu.com/) 系统上默认的防火墙组件, 为了轻量化配置 iptables 而开发的一款工具。高级的防火墙技巧博主也不会，但是简单的设置下防火墙默认禁止进的访问，将 OpenSSH 和 WEB Server 的常用端口放行，其他的端口全部禁用即可。

```bash
$ sudo apt install ufw
$ sudo ufw default allow outgoing
$ sudo ufw default deny incoming
$ sudo ufw app list
$ sudo vim /etc/ufw/applications.d/openssh-server

[OpenSSH]
title=Secure shell server, an rshd replacement
description=OpenSSH is a free implementation of the Secure Shell protocol.
ports=2222/tcp

$ sudo ufw allow 'OpenSSH'
$ sudo ufw allow 'WWW Full'
$ sudo ufw logging off
$ sudo ufw status verbose

Status: active
Logging: off
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
80,443/tcp (WWW Full)      ALLOW IN    Anywhere
2222/tcp (OpenSSH)         ALLOW IN    Anywhere
80,443/tcp (WWW Full (v6)) ALLOW IN    Anywhere (v6)
2222/tcp (OpenSSH (v6))    ALLOW IN    Anywhere (v6)
```

至此，我拥有了一个相对安全的操作系统作为宿主环境，下面可以放心的继续配置 `WEB` 服务器和应用啦。

## 参考资料

1. <a id="ref01">[Initial Server Setup with Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-16-04)</a>
