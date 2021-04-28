
const deleteDirectory = require('../../src/functions/files/delete-directory');
let DirectoryService = require('../../src/services/directory-service');

jest.mock('../../src/services/directory-service', () => jest.fn());

let delDirectorySpy = jest.fn().mockImplementation(() => {
    return Promise.resolve([]);
});


DirectoryService.mockImplementation(() => {
    return {
        deleteDirectory: delDirectorySpy
    }
})

process.env.BUCKET_NAME = 'test-bucket';

test('Delete directory', async () => {
    const handler = deleteDirectory.handler;
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

    expect(delDirectorySpy).toHaveBeenCalled()
    expect(response.statusCode).toEqual(200);
})
