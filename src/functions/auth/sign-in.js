'use strict';
const AWS = require('aws-sdk');

module.exports.handler = async (event) => {
    const provider = new AWS.CognitoIdentityServiceProvider();
    const { username, password } = JSON.parse(event.body);

    try {
        const signInResult = await provider.adminInitiateAuth({
            ClientId: process.env.APP_CLIENT_ID,
            UserPoolId: process.env.USER_POOL,
            AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password
            }
        }).promise();

        console.log('Sign In Result:', signInResult);
        return {
            statusCode: 200,
            body: JSON.stringify(signInResult.AuthenticationResult),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: err.statusCode,
            body: JSON.stringify(err),
        };
    }

    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
