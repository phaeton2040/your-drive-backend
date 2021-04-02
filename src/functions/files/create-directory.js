'use strict';

const middy = require('@middy/core');
const cors = require('@middy/http-cors');
const DirectoryService = require('../../services/directory-service');

const createDirectory = async (event) => {
    const { directory, path } = JSON.parse(event.body);

    try {
        const user = JSON.parse(event.requestContext.authorizer.user);
        console.log('User:', user);

        const email = user.UserAttributes.find(attr => attr.Name === 'email').Value;
        const directoryService = new DirectoryService(email);

        const result = await directoryService.createDirectory(directory, path || '/');

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (err) {
        return {
            statusCode: err.statusCode,
            body: JSON.stringify(err)
        }
    }
}

module.exports.handler = middy(createDirectory).use(cors());
