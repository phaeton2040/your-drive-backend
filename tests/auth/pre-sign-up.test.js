const preSignUp = require('../../src/functions/auth/pre-sign-up');

test('Pre signup', async () => {
    const handler = preSignUp.handler;

    const result = await handler({
        response: {}
    });

    expect(result.response.autoConfirmUser).toBe(true);
    expect(result.response.autoVerifyEmail).toBe(true);
});
