'use strict';

const middy = require('@middy/core');
const cors = require('@middy/http-cors');
const DirectoryService = require('../../services/directory-service');

const commitUpload = async (event) => {
    const { fileName, path } = JSON.parse(event.body);

    try {
        const user = JSON.parse(event.requestContext.authorizer.user);
        const email = user.UserAttributes.find(attr => attr.Name === 'email').Value;
        const directoryService = new DirectoryService(email);

        await directoryService.createEntry(
            fileName, path, 'file'
        )
        return {
            statusCode: 200
        };
    } catch (err) {
        return {
            statusCode: err.statusCode,
            body: JSON.stringify(err)
        }
    }
}

module.exports.handler = middy(commitUpload).use(cors());
