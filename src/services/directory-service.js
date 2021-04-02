const AWS = require('aws-sdk');


module.exports = class DirectoryService {
    constructor(username) {
        this.username = username;
        this.db = new AWS.DynamoDB.DocumentClient();
        this.s3Client = new AWS.S3();
    }

    async listDirectory(directory) {
        directory = `${this.username}/${directory}/`;
        directory = directory.replace(/\/+/g, '/')

        return await this.db.query({
            TableName: process.env.TABLE_NAME,
            IndexName: 'path-index',
            KeyConditionExpression: '#path = :p',
            ExpressionAttributeNames: {
                '#path': 'path'
            },
            ExpressionAttributeValues: {
                ':p': directory,
            }
        }).promise();
    }

    async createEntry(name, path, type = 'directory') {
        path = `${this.username}/${path}/`.replace(/\/+/g, '/');

        return await this.db.put({
            TableName : process.env.TABLE_NAME,
            Item: {
                path,
                name,
                type,
                user: this.username,
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            }
        }).promise();
    }

    getUploadUrl(fileName) {
        return this.s3Client.getSignedUrlPromise('putObject', {
            Key: `${this.username}/${fileName}`.replace(/\/+/g, '/'),
            Bucket: process.env.BUCKET_NAME,
            Expires: 3600,
        });
    }
}
