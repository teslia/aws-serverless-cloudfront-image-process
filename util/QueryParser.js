const ALLOW_IMAGE_EXT = ["jpg", "png", "jpeg", "webp"];
const ImageFilter = require("./ImageFilter");

const getExtByPath = (path) => {
    path = path.toLowerCase();
    for (let ext of ALLOW_IMAGE_EXT) {
        if (path.endsWith(`.${ext}`)) {
            return ext.replace("jpeg", "jpg");
        }
    }
    return false;
};

const parseUri = (uri) => {
    let match = uri.match(/@(?!.*@)(.[^?]*)/);
    if (!match || !match[1]) {
        return false;
    }

    let originImagePath = uri.replace(match[0], "");
    let originImageExt = getExtByPath(originImagePath);
    if (!originImageExt) {
        return false;
    }

    match = match[1];

    let targetFormatExt = originImageExt;
    if (match.indexOf(".") !== -1) {
        targetFormatExtDefined = true;
        let matchArr = match.split(".");
        let format = matchArr.pop();
        if (format) {
            format = format.toLowerCase();
        }
        if (ALLOW_IMAGE_EXT.includes(format)) {
            targetFormatExt = format;
            match = matchArr.join(".");
        }
    }

    let filterMap = {};
    match.split("_").map((item) => {
        let filterEntity = ImageFilter.parseFilterParam(item);
        if (filterEntity) {
            filterMap[filterEntity.name] = filterEntity.value;
        }
    });

    return {
        originImagePath,
        originImageExt,
        targetFormatExt,
        filterMap,
    };
};

module.exports = {
    parseUri,
    getExtByPath,
};
