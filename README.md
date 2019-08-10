# 搭建基于Vuepress的个人博客
## 一、目录结构
```sh
MyBlog
|—— config              vuepress文档自定义配置                 
│    ├── navbar-conf          导航栏配置
│    ├── sidebar-conf         侧边栏配置
│    ├── utils                工具函数
|—— docs                vuepress文档目录
│    ├── .vuepress           vuepress文档默认配置
│    ├── xxx                 页面路由
│    │    ├── README.md            页面具体内容
|—— deploy.sh           部署脚本
```

## 二、使用说明
```sh
npm install         安装依赖
npm run docs:dev    本地开发
npm run build       构建页面
npm run pub         发布页面
```

## 导航栏与侧边栏配置
按照官方文档的介绍，这些内容都需要在 `./docs/.vuepress/config.js` 文件中进行配置，但文档数量较多时，如果还集中在 `config` 文件中，那就会使文件显得很冗长，因此我将导航栏与侧边栏单独使用`navbar-conf` 以及 `sidebar-conf` 文件进行定义
```js
// docs/.vuepress/config.js
const navbarConf = require('@navbar')
const sidebarConf = require('@sidebar')

module.exports = {
	title: 'GoFzy',
	description: '脚踏实地，仰望星空',
	head: [
		['link', { rel: "icon", href: "/F.png"}]
	],
	themeConfig: {
		lastUpdated: '最后更新于：', // string | boolean
		nav: navbarConf,
		sidebar: sidebarConf
	},
}
```
具体配置可在 `./config`，即根目录下的 `config` 文件夹下查看


## 关于部署发布
部署发布命令为 `npm run pub`，此时将会执行根目录下 `deploy.sh` 脚本文件
```sh
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 发布到自定义域名
touch CNAME
echo "gofzy.com" > CNAME

git init
git add .
git commit -m '发布更新'

# 如果发布到 https://<USERNAME>.github.io
git push -f git@github.com:gofzy/gofzy.github.io.git master

cd ..
```
这里我是将 `npm run docs:build` 生成的静态资源打包到了 `github pages` 项目上，同时 重新绑定了域名(所以新建了`CNAME` 文件)，具体配置方法可参考如下链接：
* `GitHub Pages` 初始化 <https://sspai.com/post/54608> 
* `GitHub Pages` 自定义域名 <https://juejin.im/post/5a71a4f9518825733a3105ac>
* `Vuepress` 部署 <https://vuepress.vuejs.org/zh/guide/deploy.html>