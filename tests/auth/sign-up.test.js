const AWS = require('aws-sdk');
const signUp = require('../../src/functions/auth/sign-up');

let signUpSpy;
let putObjectSpy;

const mockPositive = () => {
    signUpSpy = jest.fn();
    putObjectSpy = jest.fn();

    AWS.CognitoIdentityServiceProvider = jest.fn().mockImplementation(() => {
        return {
            signUp: signUpSpy.mockImplementation(() => {
                return {
                    promise: () => Promise.resolve({
                        UserConfirmed: true
                    })
                }
            })
        }
    })

    AWS.S3 = jest.fn().mockImplementation(() => {
        return {
            putObject: putObjectSpy.mockImplementation(() => {
                return {
                    promise: () => Promise.resolve()
                }
            })
        }
    })
}

const errorResponse = {
    "message": "1 validation error detected: Value at 'password' failed to satisfy constraint: Member must have length greater than or equal to 6",
    "code": "InvalidParameterException",
    "time": "2021-03-19T10:41:12.798Z",
    "requestId": "4fa2479e-fd1f-4454-975e-50d66465bd7a",
    "statusCode": 400,
    "retryable": false,
    "retryDelay": 98.43064794712409
}
const mockNegative = () => {
    signUpSpy = jest.fn();
    putObjectSpy = jest.fn();

    AWS.CognitoIdentityServiceProvider = jest.fn().mockImplementation(() => {
        return {
            signUp: signUpSpy.mockImplementation(() => {
                return {
                    promise: () => Promise.reject(errorResponse)
                }
            })
        }
    })

    AWS.S3 = jest.fn().mockImplementation(() => {
        return {
            putObject: putObjectSpy.mockImplementation(() => {
                return {
                    promise: () => Promise.resolve()
                }
            })
        }
    })
}

process.env.BUCKET_NAME = 'test-bucket';

test('Sign UP handler positive', async () => {
    mockPositive();

    const handler = signUp.handler;
    const event = {
        body: JSON.stringify({
            username: 'test@test.com',
            password: 'qwer1234'
        })
    }
    const response = await handler(event);

    expect(signUpSpy).toHaveBeenCalled()
    expect(putObjectSpy).toHaveBeenCalledWith({
        Key: 'test@test.com/',
        Bucket: process.env.BUCKET_NAME
    })
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(JSON.stringify({UserConfirmed: true}));
})

test('Sign UP handler negative', async () => {
    mockNegative();

    const handler = signUp.handler;
    const event = {
        body: JSON.stringify({
            username: 'test@test.com',
            password: 'qwer1234'
        })
    }
    const response = await handler(event);

    expect(signUpSpy).toHaveBeenCalled()
    expect(putObjectSpy).toHaveBeenCalledTimes(0)
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(JSON.stringify(errorResponse));
})
