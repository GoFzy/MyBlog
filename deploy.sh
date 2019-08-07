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
rm -rf dist