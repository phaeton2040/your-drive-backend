const getUploadUrl = require('../../src/functions/files/get-upload-url');
let DirectoryService = require('../../src/services/directory-service');

jest.mock('../../src/services/directory-service', () => jest.fn());

let getUploadUrlSpy = jest.fn().mockImplementation(() => {
    return Promise.resolve('https://presigned-url');
});

DirectoryService.mockImplementation(() => {
    return {
        getUploadUrl: getUploadUrlSpy
    }
})

process.env.BUCKET_NAME = 'test-bucket';

test('Get upload url', async () => {
    const handler = getUploadUrl.handler;
    const event = {
        body: JSON.stringify({
            fileName: 'index.html'
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

    expect(getUploadUrlSpy).toHaveBeenCalled()
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(JSON.stringify('https://presigned-url'));
})
