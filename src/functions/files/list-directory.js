'use strict';

const middy = require('@middy/core');
const cors = require('@middy/http-cors');
const DirectoryService = require('../../services/directory-service');

const listDirectory = async (event) => {
    const { directory } = JSON.parse(event.body);

    try {
        const user = JSON.parse(event.requestContext.authorizer.user);
        console.log('User:', user);

        const email = user.UserAttributes.find(attr => attr.Name === 'email').Value;
        const directoryService = new DirectoryService(email);

        const directoryContent = (await directoryService.listDirectory(directory)).Items;

        return {
            statusCode: 200,
            body: JSON.stringify(directoryContent.map(item => {
                item.path = item.path.replace(new RegExp(`^(${email})`, 'gm'), '');

                return item;
            })),
        };
    } catch (err) {
        return {
            statusCode: err.statusCode,
            body: JSON.stringify(err)
        }
    }
}

module.exports.handler = middy(listDirectory).use(cors());
