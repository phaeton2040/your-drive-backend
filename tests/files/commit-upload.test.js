const commitUpload = require('../../src/functions/files/commit-upload');
let DirectoryService = require('../../src/services/directory-service');

jest.mock('../../src/services/directory-service', () => jest.fn());

let createEntrySpy = jest.fn().mockImplementation(() => {
    return Promise.resolve();
});

DirectoryService.mockImplementation(() => {
    return {
        createEntry: createEntrySpy
    }
})

process.env.BUCKET_NAME = 'test-bucket';

test('Commit upload', async () => {
    const handler = commitUpload.handler;
    const event = {
        body: JSON.stringify({
            fileName: 'index.html',
            path: '/'
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

    expect(createEntrySpy).toHaveBeenCalledWith('index.html', '/', 'file')
    expect(response.statusCode).toEqual(200);
})
