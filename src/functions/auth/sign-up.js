'use strict';
const AWS = require('aws-sdk');

module.exports.handler = async (event) => {
    const provider = new AWS.CognitoIdentityServiceProvider();
    const s3 = new AWS.S3();
    const { username, password } = JSON.parse(event.body);

    try {
        const signUpResult = await provider.signUp({
            ClientId: process.env.APP_CLIENT_ID,
            Username: username,
            Password: password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: username
                }
            ]
        }).promise();

        await s3.putObject({
            Key: `${username}/`,
            Bucket: process.env.BUCKET_NAME
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(signUpResult),
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
