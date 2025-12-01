---
title: mac使用hexo+github搭建博客
date: 2018-08-09
---

# mac使用hexo+github搭建博客

## 准备

### 创建Github Repo

在github创建一个名称格式为yourname.github.io 的 repo （yourname：github用户名）

### 本地安装homebrew、git、npm、hexo

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew install git
brew install node
```

确认npm安装ok后，安装hexo
```bash
npm config set registry https://registry.npm.taobao.org
npm install hexo -g
npm install hexo-cli -g
```

## 搭建

### 初始化本地站点

搭建本地目录环境
```bash
cd ~/Public
hexo init yourname.github.io
cd yourname.github.io
npm install hexo-deployer-git --save
hexo generate
hexo server
```

浏览器输入：localhost:4000,本地查看网站

### 发布站点到github

修改hexo配置文件
```bash
cd ~/Public/yourname.github.io
vi _config.py
```

将 _config.py中
```text
deploy:
    type:
```

修改为：
```text
deploy:
    type:git
    repo: https://github.com/yourname/yourname.github.io.git
```

保存文件退出编辑器
发布到github
```bash
hexo deploy
```

## TODO
