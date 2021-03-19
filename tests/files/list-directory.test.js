const AWS = require('aws-sdk');
const listDirectory = require('../../src/functions/files/list-directory');

let listObjectsSpy;

const mockPositive = () => {
    listObjectsSpy = jest.fn();

    AWS.S3 = jest.fn().mockImplementation(() => {
        return {
            listObjects: listObjectsSpy.mockImplementation(() => {
                return {
                    promise: () => Promise.resolve({
                        Contents: [
                            {
                                Key: 'app',
                                Size: 0
                            },
                            {
                                Key: 'index.html',
                                Size: 504
                            }
                        ]
                    })
                }
            })
        }
    })
}

process.env.BUCKET_NAME = 'test-bucket';

test('List directory', async () => {
    mockPositive();

    const handler = listDirectory.handler;
    const event = {
        body: JSON.stringify({
            directory: 'src/'
        }),
        requestContext: {
            authorizer: {
                user: {
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
                }
            }
        }
    }
    const response = await handler(event);

    expect(listObjectsSpy).toHaveBeenCalled()
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(JSON.stringify([
        {
            "name": "app",
            "type": "file",
            "size": 0
        }, {
            "name": "index.html",
            "type": "file",
            "size": 504
        }])
    );
})
