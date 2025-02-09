[English](./README.md) | 简体中文

# 在AWS Cloudfront中使用Lambda@Edge处理图片

> 包含简单的图片处理代码；欢迎大家 star、fork 或提交 pr 以改善该实践

## 这是什么？
类似阿里云 OSS 的图片处理服务、腾讯云的数据万象。

因为 AWS 并没有单独将图片处理单独发布服务，只提供了 lambda 配合 CloudFront 用于处理这类需求。因此我设计了一套方案用于实现图片处理的需求

有了本方案，前端可以在原有的 cdn 图片链接后面拼接参数，获取对应的缩略图、加水印等图片处理需求。
## 说明
1. 本项目是基于[foamzou](https://github.com/foamzou/aws-lambda-edge-image-process)版本基础上修改而来，非常感谢原作者！
2. 本项目已经加入[serverless](https://www.serverless.com/)支持，在部署之前，请务必修改`serverless.yml`中的`distributionID`以及其他你认为需要修改的配置。
3. 原作者中的使用Docker进行编译的步骤已经在本项目中去除。
4. 原理、说明请移步原作者的文章[《在AWS使用Lambda@Edge处理图片的最佳实践》](https://foamzou.com/2020/08/30/best-practices-for-using-lambdaedge-to-process-images-on-aws/)浏览。

## 安装
由于sharp包需要指定环境，而lambda使用的是linux x64环境，为了解决这个问题，我已经在`package.json`中加入了对应的安装命令，请在部署项目之前，一定要使用下面的命令进行一次安装。
```
npm run install-lambda
```

## 部署
直接按照serverless的方式进行部署，部署之前，请确定配置（aws配置、serverless.yml配置文件等）是否正确！
如果你还没有安装过serverless，需要使用下面的命令进行全局安装。
```
npm install -g serverless
```
使用下面的命令进行部署
```
serverless deploy
```
## 前端使用说明
url 构成：`https://cdn域名/文件名@<参数值1><参数名1>_<参数值2><参数名2>.期望转换的文件格式`

例子：https://d1xxxxxxxx.cloudfront.net/foamzou/image/4951f0e35a37e5190e78798dcfcad984.jpg@1020w_160h_0e_1l_70q.webp

### 参数
- w: 指定目标缩略图的宽度。1-4096
- h: 指定目标缩略图的高度。1-4096
- e: 缩放优先边。0：长边优先，1：短边优先，2：强制按指定宽高缩放。默认为 0
- l: 目标缩略图大于原图是否处理。如果值是 1, 即不处理；是 0，表示处理。默认为 0
- p: 比例百分比。 小于 100，即是缩小，大于 100 即是放大。1-1000。如果参数 p 跟 w、h 合用时，p 将直接作用于 w、h （乘以 p%）得到新的 w、h，例如 100w_100h_200p 的作用跟 200w_200h 的效果是一样的。默认为 100
- q: 质量百分比。1-100。默认为 80
- r: 是否使用渐进式 jpeg。0：不使用，1 使用。默认为 0。只有在输出格式为 jpg 时，该参数才会生效。注意：1. 小尺寸图片不建议使用，因为渐进式 jpeg 会比原图大；2. 能够使用 webp 尽量使用 webp；3. 渐进式展示图片的最佳方案应当是前端同时渲染小图和大图，动画过度到大图
- .format 格式转换。目前支持 jpg, png, webp。若保留原文件格式，那么  .format 可以不添加

### 注意
当总面积超过 4096px * 4096px，或者单边长度超过 4096px * 4，那么不会对图片进行缩放处理