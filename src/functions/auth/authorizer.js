const AWS = require('aws-sdk');

module.exports.handler = async (event) => {
    const provider = new AWS.CognitoIdentityServiceProvider();
    const authHeader = event.authorizationToken;
    const token = authHeader.split(' ')[1];

    try {
        const user = await provider.getUser(({
            AccessToken: token
        })).promise();

        return generatePolicy(user.Username, 'Allow', event.methodArn, user);
    } catch (err) {
        console.log('Authorizer error:', err)
        return {
            statusCode: err.statusCode,
            body: {error: err.message},
        };
    }
};

// Help function to generate an IAM policy
const generatePolicy = function (principalId, effect, resource, user) {
    const authResponse = {};

    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};

        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];

        const statementOne = {};

        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = { user: JSON.stringify(user) };

    console.log('Authorizer response:', JSON.stringify(authResponse));
    return authResponse;
}
