English | [简体中文](./README.zh-CN.md)
# AWS Cloudfront Image Process (with Serverless)

> Provides simple code which process image. Welcome to star, fork or PR to improve the practice

## What’s this
For the same image link, we may response different sizes of thumbnails according to different pages. Unfortunately, AWS does not directly provide such services. But it provides lambda@edge with CloudFront to handle this kind of demand. Therefore, I designed a set of solutions to achieve the requirements of image processing. This article contains instructions, design solutions and practical steps.

Using this solution, the client can splice parameters behind the original cdn link to obtain the thumbnail, add watermark and other processing requirements.

## Instruction
1. This project is based on the modified version of [foamzou](https://github.com/foamzou/aws-lambda-edge-image-process), thanks original author!
2. This project has added [serverless](https://www.serverless.com/) support, be sure to change the `distributionID` in `serverless.yml` and any other configuration you think you need to change before deploying.
3. The steps in the original author for compiling with Docker have been removed in this project.
4. Please go to the original author's article [<Best Practices for using Lambda@Edge to process images on AWS>](https://foamzou.com/2020/08/30/best-practices-for-using-lambdaedge-to-process-images-on-aws-en/) for the principle and explanation.

## Installation
Since the sharp package needs to specify the environment, and lambda uses a linux x64 environment, to solve this problem, I have added the corresponding installation command in `package.json`, please make sure to install it once using the following command before deploying the project.
```
npm run install-lambda
```

## Deployment
Deploy directly as serverless. Before deploying, make sure the configuration (aws configuration, serverless.yml configuration file, etc.) is correct!
If you haven't installed serverless yet, you need to use the following command for global installation.
```
npm install -g serverless
```
Use the following command to deploy
```
serverless deploy
```
## Parameter description
url format: `https://cdn-domain/filename@<value1><param1>_<value2><param2>.outputFormat`

example, https://d1xxxxxxxx.cloudfront.net/foamzou/image/4951f0e35a37e5190e78798dcfcad984.jpg@1020w_160h_0e_1l_70q.webp

### Parameters
- `w`: Width of thumb. 1-4096
- `h`: Height of thumb. 1-4096
- `e`: Policy about aspect ratio. 0: Keep the aspect ratio, base on long side(Default). 1: Keep the aspect ratio, base on short side. 2: Ignore aspect ratio, force resize with width and height.
- `l`: Whether to process if the target thumbnail is larger than the original image.1: no processing; 0: will processing(Default)
- `p`: Percent of the size (1-1000). Less than 100 means zoom out, and greater than 100 means zoom in. If the parameter p is used in combination with w and h, p will directly act on w and h (multiply by p%) to get the new w and h. For example, 100w_100h_200p has the same effect as 200w_200h. The default value is 100
- `q`: Percent of quality (1-100) . Default: 80
- `r`: Whether to response progressive jpeg. 0: not used (default), 1 used. The default is 0. This parameter will take effect only when the output format is jpg. Note: 1. Small size image are not recommended, because progressive jpeg will be larger than the original image; 2. If you can use webp, try to use webp;
- `.format`: Be output format. Support jpg, png, webp. No need to add .format if you keep the original format
### Notice
When the total area exceeds 4096px * 4096px, or the length of one side exceeds 4096px * 4, the image will not be scaled