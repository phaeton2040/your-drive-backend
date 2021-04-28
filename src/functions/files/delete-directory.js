'use strict';

const middy = require('@middy/core');
const cors = require('@middy/http-cors');
const DirectoryService = require('../../services/directory-service');

const deleteDirectory = async (event) => {
    const { directory, path } = JSON.parse(event.body);

    try {
        const user = JSON.parse(event.requestContext.authorizer.user);
        const email = user.UserAttributes.find(attr => attr.Name === 'email').Value;
        const directoryService = new DirectoryService(email);

        await directoryService.deleteDirectory(directory, path ? path : '/');

        return {
            statusCode: 200,
        };
    } catch (err) {
        return {
            statusCode: err.statusCode,
            body: JSON.stringify(err)
        }
    }
}

module.exports.handler = middy(deleteDirectory).use(cors());
