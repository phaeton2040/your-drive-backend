const AWS = require('aws-sdk');


module.exports = class DirectoryService {
    constructor(username) {
        this.username = username;
        this.db = new AWS.DynamoDB.DocumentClient();
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

    async createDirectory(name, path) {
        path = `${this.username}/${path}/`.replace(/\/+/g, '/');

        return await this.db.put({
            TableName : process.env.TABLE_NAME,
            Item: {
                path,
                name,
                type: 'directory',
                user: this.username,
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            }
        }).promise();
    }
}
