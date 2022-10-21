import { add, getUnixTime } from 'date-fns';
import rs from 'jsrsasign';

export const generateAccessToken = (key: string, secret: string) => {
  const header = { alg: 'ES256', typ: 'JWT' };

  const payload = {
    sub: key,
    iat: rs.KJUR.jws.IntDate.get('now'),
    exp: getUnixTime(add(Date.now(), { days: 10 })),
    client: 'api',
    nonce: getUnixTime(Date.now()),
  };

  const headerString = JSON.stringify(header);
  const payloadString = JSON.stringify(payload);

  return rs.KJUR.jws.JWS.sign('ES256', headerString, payloadString, secret);
};
