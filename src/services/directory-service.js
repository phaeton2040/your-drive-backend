const AWS = require('aws-sdk');


module.exports = class DirectoryService {
    constructor(username) {
        this.username = username;
        this.db = new AWS.DynamoDB.DocumentClient();
        this.s3Client = new AWS.S3({ signatureVersion: 'v4' });
    }

    async listDirectory(directory) {
        directory = `${this.username}/${directory}/`;
        directory = directory.replace(/\/+/g, '/')

        return await this.db.query({
            TableName: process.env.TABLE_NAME,
            IndexName: 'path-index',
            KeyConditionExpression: '#path = :p and deletedAt = :n',
            ExpressionAttributeNames: {
                '#path': 'path',
                '#name': 'name',
                '#type': 'type'
            },
            ExpressionAttributeValues: {
                ':p': directory,
                ':n': 'NULL'
            },
            ProjectionExpression: '#name, #path, #type, created, updated'
        }).promise();
    }

    async deleteDirectory(directory, path) {
        const name = directory;
        const selfPath = `${this.username}/${path}/`.replace(/\/+/g, '/');

        directory = `${this.username}/${path}/${directory}/`;
        directory = directory.replace(/\/+/g, '/');

        const items = (await this.db.query({
            TableName: process.env.TABLE_NAME,
            IndexName: 'path-partial-index',
            KeyConditionExpression: '#user = :u and begins_with(#path, :p)',
            ExpressionAttributeNames: {
                '#path': 'path',
                '#user': 'user',
            },
            ExpressionAttributeValues: {
                ':p': directory,
                ':u': this.username,
                ':n': 'NULL'
            },
            FilterExpression: 'deletedAt = :n'
        }).promise()).Items;

        await this.db.update({
            TableName: process.env.TABLE_NAME,
            Key: {
                name,
                path: selfPath
            },
            UpdateExpression: 'set deletedAt = :n',
            ConditionExpression: '#name = :name and begins_with(#path, :p)',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#path': 'path'
            },
            ExpressionAttributeValues: {
                ':name': name,
                ':p': selfPath,
                ':n': new Date().toISOString()
            },
        }).promise();

        return Promise.all(
            items.map(item => {
                return this.db.update({
                    TableName: process.env.TABLE_NAME,
                    Key: {
                        name: item.name,
                        path: item.path
                    },
                    UpdateExpression: 'set deletedAt = :n',
                    ConditionExpression: '#name = :name and begins_with(#path, :p)',
                    ExpressionAttributeNames: {
                        '#name': 'name',
                        '#path': 'path'
                    },
                    ExpressionAttributeValues: {
                        ':name': item.name,
                        ':p': directory,
                        ':n': new Date().toISOString()
                    },
                    ReturnValues: 'UPDATED_NEW'
                }).promise()
            })
        )
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
                deletedAt: 'NULL',
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
