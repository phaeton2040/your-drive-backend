'use strict';
const AWS = require('aws-sdk');
const middy = require('@middy/core');
const cors = require('@middy/http-cors');

const getUser = async (event) => {
    const provider = new AWS.CognitoIdentityServiceProvider();
    const { token } = JSON.parse(event.body);

    try {
        const getUserResult = await provider.getUser({
            AccessToken: token
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(getUserResult),
        };
    } catch (err) {
        return {
            statusCode: err.statusCode,
            body: JSON.stringify(err),
        };
    }
}

module.exports.handler = middy(getUser).use(cors());
