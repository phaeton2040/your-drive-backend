const AWS = require('aws-sdk');
const signIn = require('../../src/functions/auth/sign-in');

let signInSpy;

const mockPositive = () => {
    signInSpy = jest.fn();

    AWS.CognitoIdentityServiceProvider = jest.fn().mockImplementation(() => {
        return {
            adminInitiateAuth: signInSpy.mockImplementation(() => {
                return {
                    promise: () => Promise.resolve({
                        AuthenticationResult: {
                            AccessToken: 'test-token'
                        }
                    })
                }
            })
        }
    });
}
const errorResponse = {
    message: "Incorrect username or password.",
    code: "NotAuthorizedException",
    time: "2021-03-19T10:36:19.742Z",
    requestId: "0b7ae508-54ea-49da-ae9e-81310c2d7b7a",
    statusCode: 400,
    retryable: false,
    retryDelay: 68.16196121324755
}
const mockNegative = () => {
    signInSpy = jest.fn();

    AWS.CognitoIdentityServiceProvider = jest.fn().mockImplementation(() => {
        return {
            adminInitiateAuth: signInSpy.mockImplementation(() => {
                return {
                    promise: () => Promise.reject(errorResponse)
                }
            })
        }
    });
}

test('Sign IN handler positive', async () => {
    mockPositive();
    const handler = signIn.handler;
    const event = {
        body: JSON.stringify({
            username: 'test@test.com',
            password: 'qwer1234'
        })
    }
    const response = await handler(event);

    expect(signInSpy).toHaveBeenCalled()
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(JSON.stringify({AccessToken: 'test-token'}));
})

test('Sign IN handler negative', async () => {
    mockNegative();
    const handler = signIn.handler;
    const event = {
        body: JSON.stringify({
            username: 'test@test.com',
            password: 'qwer1234'
        })
    }
    const response = await handler(event);

    expect(signInSpy).toHaveBeenCalled()
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(JSON.stringify(errorResponse));
})
