const baseUrl = "[REDACTED]";

const callback = (err, resp, body) => {
  if (err) throw err;

  return {
    body,
    headers: resp.headers,
    status: resp.statusCode,
  };
};

const getBytecode = async (userAgent, ak_bmsc, session) => {
  const response = await session._request(
    {
      url: `https://unite.nike.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/ips.js?ak_bmsc_nke-2.3=${ak_bmsc}`,
      method: "GET",
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        referer:
          "https://unite.nike.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/fp",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "sec-gpc": "1",
        "upgrade-insecure-requests": "1",
        "user-agent": userAgent,
      },
    },
    callback,
  );

  const bytecode = response.body.split("},window,'")[1].split("'")[0];

  const ssn = response.headers["x-kpsdk-ct"];

  return { bytecode, ssn };
};

const postBytecode = async (array, origin, userAgent, session) => {
  const response = await session._request(
    {
      url: "https://unite.nike.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/tl",
      method: "POST",
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "content-type": "application-x/octet-stream",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "sec-gpc": "1",
        "upgrade-insecure-requests": "1",
        "user-agent": userAgent,
        "x-kpsdk-ct": origin,
      },
      body: Buffer.from(array),
    },
    callback,
  );

  if (response.status !== 200)
    throw new Error(`Non OK status ${response.status}`);

  return response.headers["x-kpsdk-ct"];
};

const getFp = async (userAgent, session) => {
  const response = await session._request(
    {
      url: "https://unite.nike.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/fp",
      method: "GET",
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "sec-gpc": "1",
        "upgrade-insecure-requests": "1",
        "user-agent": userAgent,
      },
    },
    callback,
  );

  return response.body.split("nke-2.3=")[1].split('"')[0];
};

exports.generateCd = async (userAgent, session) => {
  const apiUrl = `${baseUrl}/api/kasada/cd`;

  const response = await session._request(
    {
      url: apiUrl,
      method: "GET",
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "sec-gpc": "1",
        "upgrade-insecure-requests": "1",
        "user-agent": userAgent,
      },
    },
    callback,
  );

  return JSON.parse(response.body).solve;
};

exports.generateCt = async (userAgent, session, kasadaCookie) => {
  const apiUrl = `${baseUrl}/api/kasada/ct`;

  const body = await getBytecode(userAgent, kasadaCookie, session);

  const response = await session._request(
    {
      method: "POST",
      url: apiUrl,
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "content-type": "application/json",
        "if-none-match": '"3e63e68685085366501f6be6c6f118c9"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "sec-gpc": "1",
        "upgrade-insecure-requests": "1",
        "user-agent": userAgent,
      },
      body: JSON.stringify(body),
    },
    callback,
  );

  const payload = JSON.parse(response.body);

  const ctResponse = await postBytecode(
    payload.buffer,
    payload.origin,
    userAgent,
    session,
  );

  return ctResponse;
};

exports.generateHeaders = async (userAgent, session, kasadaCookie) => {
  return {
    "x-kpsdk-cd": await this.generateCd(userAgent, session),
    "x-kpsdk-ct": await this.generateCt(userAgent, session, kasadaCookie),
  };
};
