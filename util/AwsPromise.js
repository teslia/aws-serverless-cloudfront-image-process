const AWS = require("aws-sdk");

const getObject = (params) => {
    const s3 = new AWS.S3();
    return new Promise((resolve) => {
        s3.getObject(params, function (err, data) {
            if (err) {
                resolve(false);
            } else {
                resolve(data.Body);
            }
        });
    });
};

const putObject = (params) => {
    const s3 = new AWS.S3();
    return new Promise((resolve) => {
        s3.putObject(params, function (err, data) {
            if (err) {
                resolve(false);
            } else {
                resolve(data);
            }
        });
    });
};

module.exports = {
    getObject,
    putObject,
};
