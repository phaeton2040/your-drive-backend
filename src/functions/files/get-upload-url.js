'use strict';

const middy = require('@middy/core');
const cors = require('@middy/http-cors');
const DirectoryService = require('../../services/directory-service');

const getUploadUrl = async (event) => {
    const { fileName } = JSON.parse(event.body);

    try {
        const user = JSON.parse(event.requestContext.authorizer.user);
        console.log('User:', user);

        const email = user.UserAttributes.find(attr => attr.Name === 'email').Value;
        const directoryService = new DirectoryService(email);

        return {
            statusCode: 200,
            body: JSON.stringify(await directoryService.getUploadUrl(fileName)),
        };
    } catch (err) {
        return {
            statusCode: err.statusCode,
            body: JSON.stringify(err)
        }
    }
}

module.exports.handler = middy(getUploadUrl).use(cors());
