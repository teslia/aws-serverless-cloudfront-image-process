const AwsPromise = require("./util/AwsPromise");
const ImageLib = require("./util/ImageLib");
const QueryParser = require("./util/QueryParser");
const Md5 = require("./util/Md5");

exports.handler = async function (event, context, callback) {
    event = event["Records"][0];
    let cf = event["cf"];
    let ret = await handleOriginResponse(cf["request"], cf["response"]);
    let response = ret ? ret : cf["response"];
    if (response["status"] && response["status"] < 400) {
        response["headers"]["cache-control"] = [
            { key: "Cache-Control", value: "max-age=86400" },
        ];
    }
    callback(null, response);
};

const getBucketNameFromCFRequest = (request) => {
    let domain;
    try {
        domain = request.origin.s3.domainName;
    } catch (e) {
        return false;
    }
    if (!domain.includes(".amazonaws.com")) {
        return false;
    }
    return domain.split(".")[0];
};

const handleOriginResponse = async (request, response) => {
    let requestPolicy = QueryParser.parseUri(request["uri"]);
    let bucketName = getBucketNameFromCFRequest(request);
    if (response["status"] < 400 || response["status"] > 599) {
        return false;
    }

    if (bucketName === false) {
        return false;
    }

    if (requestPolicy === false) {
        return false;
    }

    let rawObjectKey = requestPolicy.originImagePath;
    while (rawObjectKey.charAt(0) === "/") {
        rawObjectKey = rawObjectKey.substr(1);
    }
    let saveObjKey = request["uri"];
    while (saveObjKey.charAt(0) === "/") {
        saveObjKey = saveObjKey.substr(1);
    }

    let contentType = getContentTypeByExt(requestPolicy.targetFormatExt);

    let buffer = await resizeImage(
        bucketName,
        rawObjectKey,
        requestPolicy.targetFormatExt,
        requestPolicy.filterMap
    );
    if (!buffer) {
        return false;
    }

    uploadToS3(bucketName, saveObjKey, buffer, contentType);

    return generateResponse(response, buffer, contentType);
};

const resizeImage = async (bucketName, objectKey, targetFormatExt, option) => {
    let image = await AwsPromise.getObject({
        Bucket: bucketName,
        Key: objectKey,
    });
    if (!image) {
        return false;
    }
    return await ImageLib.adjustImage(image, targetFormatExt, option);
};

const uploadToS3 = async (bucketName, objectKey, buffer, contentType) => {
    return await AwsPromise.putObject({
        Bucket: bucketName,
        Key: objectKey,
        Body: buffer,
        ContentType: contentType,
    });
};

const generateResponse = (response, buffer, contentType) => {
    response["status"] = "200";
    response["body"] = buffer.toString("base64");
    response["bodyEncoding"] = "base64";
    response["headers"]["content-type"] = [
        { key: "Content-Type", value: contentType },
    ];
    response["headers"]["content-encoding"] = [
        { key: "Content-Encoding", value: "base64" },
    ];
    response["headers"]["content-length"] = [
        { key: "Content-Length", value: response["body"].length + "" },
    ];
    response["headers"]["etag"] = [
        { key: "Etag", value: Md5(response["body"]) },
    ];
    return response;
};

const getContentTypeByExt = (ext) => {
    const map = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
    };
    return map[ext];
};
