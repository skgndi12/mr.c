import { validateGoogleIdToken } from '@src/core/validator';

describe('Test validator', () => {
  it('should return true when given ID token is valid', () => {
    const givenIdToken = {
      iss: 'https://accounts.google.com',
      aud: '89988810438-h3st2janmqb7db8hhrem5hbj7pcptjot.apps.googleusercontent.com',
      sub: '103395839580300821622',
      email: 'user1@gmail.com',
      iat: 1704250140,
      exp: 1704253740
    };

    expect(validateGoogleIdToken(givenIdToken)).toEqual(true);
  });

  it('should return false when given ID token does not include an email', () => {
    const givenIdToken = {
      iss: 'https://accounts.google.com',
      aud: '89988810438-h3st2janmqb7db8hhrem5hbj7pcptjot.apps.googleusercontent.com',
      sub: '103395839580300821622',
      iat: 1704250140,
      exp: 1704253740
    };

    expect(validateGoogleIdToken(givenIdToken)).toEqual(false);
  });
});
