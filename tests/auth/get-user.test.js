const AWS = require('aws-sdk');
const getUser = require('../../src/functions/auth/get-user');

let getUserSpy = jest.fn();
const successResponse = {
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
};
const errorResponse = {
    "message": "Access Token has expired",
    "code": "NotAuthorizedException",
    "time": "2021-03-19T10:52:05.439Z",
    "requestId": "b8a88e06-dfcc-46aa-8ce3-4c27ea6284ed",
    "statusCode": 400,
    "retryable": false,
    "retryDelay": 97.46269788667001
}

const mockPositive = () => {
    getUserSpy = jest.fn()

    AWS.CognitoIdentityServiceProvider = jest.fn().mockImplementation(() => {
        return {
            getUser: getUserSpy.mockImplementation(() => {
                return {
                    promise: () => Promise.resolve(successResponse)
                }
            })
        }
    });
}

const mockNegative = () => {
    AWS.CognitoIdentityServiceProvider = jest.fn().mockImplementation(() => {
        return {
            getUser: getUserSpy.mockImplementation(() => {
                return {
                    promise: () => Promise.reject(errorResponse)
                }
            })
        }
    });
}

test('Get user handler positive', async () => {
    mockPositive();

    const handler = getUser.handler;
    const event = {
        body: JSON.stringify({
            token: 'test-token'
        })
    }
    const response = await handler(event);

    expect(getUserSpy).toHaveBeenCalled()
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(JSON.stringify(successResponse));
})

test('Sign IN handler negative', async () => {
    mockNegative();

    const handler = getUser.handler;
    const event = {
        body: JSON.stringify({
            token: 'test-token'
        })
    }
    const response = await handler(event);

    expect(getUserSpy).toHaveBeenCalled()
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(JSON.stringify(errorResponse));
})
