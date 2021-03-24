'use strict';
const AWS = require('aws-sdk');
const middy = require('@middy/core');
const cors = require('@middy/http-cors');

const listDirectory = async (event) => {
    const s3 = new AWS.S3();
    const { directory } = JSON.parse(event.body);
    const { user } = event.requestContext.authorizer;
    const email = user.UserAttributes.find(attr => attr.Name === 'email').Value;
    const prefix = `${email}/${directory}/`.replace('//', '/');

    const listObjResult = await s3.listObjects({
        Bucket: process.env.BUCKET_NAME,
        Prefix: prefix,
    }).promise();

    const folderNames = new Set();
    const responseBody = listObjResult.Contents
        .filter(item => {
            const name = item.Key.replace(prefix, '');

            if (name.includes('/')) {
                folderNames.add(name.split('/')[0]);
            }

            return item.Key !== prefix && !name.includes('/');
        })
        .map(item => {
            const name = item.Key.replace(prefix, '');

            return {
                name,
                type: 'file',
                size: item.Size
            }
        });

    const folders = Array.from(folderNames).map(folder => {
        return {
            name: folder,
            type: 'directory'
        }
    })
    return {
        statusCode: 200,
        body: JSON.stringify([...folders, ...responseBody]),
    };
}

module.exports.handler = middy(listDirectory).use(cors());
