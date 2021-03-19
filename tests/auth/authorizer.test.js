const AWS = require('aws-sdk');
const authorizer = require('../../src/functions/auth/authorizer');

let getUserSpy;
const userObject = {
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
const policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "execute-api:Invoke",
            "Effect": "Allow",
            "Resource": "arn::test"
        }
    ]
}
const context = {
    user: userObject
}
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
    getUserSpy = jest.fn();

    AWS.CognitoIdentityServiceProvider = jest.fn().mockImplementation(() => {
        return {
            getUser: getUserSpy.mockImplementation(() => {
                return {
                    promise: () => Promise.resolve(userObject)
                }
            })
        }
    });
}

const mockNegative = () => {
    getUserSpy = jest.fn();

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

test('Authorizer function positive', async () => {
    mockPositive();

    const handler = authorizer.handler;
    const event = {
        authorizationToken: 'Bearer test-token',
        methodArn: 'arn::test'
    }
    const response = await handler(event);

    expect(getUserSpy).toHaveBeenCalled()
    expect(response.principalId).toEqual(userObject.Username);
    expect(response.policyDocument).toEqual(policy);
    expect(response.context).toEqual(context);
})

test('Authorizer function negative', async () => {
    mockNegative();

    const handler = authorizer.handler;
    const event = {
        authorizationToken: 'Bearer test-token',
        methodArn: 'arn::test'
    }
    const response = await handler(event);

    expect(getUserSpy).toHaveBeenCalled()
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ error: errorResponse.message });
})
