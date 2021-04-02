const AWS = require('aws-sdk');
const listDirectory = require('../../src/functions/files/list-directory');
let DirectoryService = require('../../src/services/directory-service');

jest.mock('../../src/services/directory-service', () => jest.fn());

let listDirectorySpy = jest.fn().mockImplementation(() => {
    return Promise.resolve({
        Items: [
            {
                name: 'src',
                path: '/'
            },
            {
                name: 'index.html',
                path: '/'
            }
        ]
    });
});


DirectoryService.mockImplementation(() => {
    return {
        listDirectory: listDirectorySpy
    }
})

process.env.BUCKET_NAME = 'test-bucket';

test('List directory', async () => {
    const handler = listDirectory.handler;
    const event = {
        body: JSON.stringify({
            directory: 'src/'
        }),
        requestContext: {
            authorizer: {
                user: JSON.stringify({
                    "Username": "d0f9cd64-f514-43c8-8b90-350375ebcad9",
                    "UserAttributes": [
                        {
                            "Name": "sub",
                            "Value": "d0f9cd64-f514-43c8-8b90-350375ebcad9"
                        },
                        {
                            "Name": "email_verified",
                            "Value": "true"
                        },
                        {
                            "Name": "email",
                            "Value": "test@test.com"
                        }
                    ]
                })
            }
        }
    }
    const response = await handler(event);

    expect(listDirectorySpy).toHaveBeenCalled()
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(JSON.stringify([
        {
            "name": "src",
            "path": "/"
        }, {
            "name": "index.html",
            "path": "/",
        }])
    );
})
