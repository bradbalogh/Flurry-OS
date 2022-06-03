const request = require("request-promise");

const API_KEY = "[REDACTED]";

exports.generateHeaders = async (userAgent, rq) => {
  let data = {
    "x-kpsdk-cd": "",
    "x-kpsdk-ct": "",
  };

  const generator = new gen(userAgent, rq);

  data["x-kpsdk-cd"] = await generator.genCd();
  data["x-kpsdk-ct"] = await generator.genCt();

  return data;
};

class gen {
  constructor(ua, rq) {
    this.userAgent = ua;

    this.request = rq;
  }

  async genCd() {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await this.request({
          url: "[REDACTED]",
          method: "POST",
          form: {
            key: API_KEY,
          },
          resolveWithFullResponse: true,
          simple: false,
        });

        if (res) {
          let resultbody = JSON.parse(res.body).result;
          resolve(JSON.stringify(resultbody));
        }
      } catch (e) {
        reject(null);
      }
    });
  }

  async genCt() {
    return new Promise(async (resolve, reject) => {
      try {
        let initFPRes = await this.request({
          url: "https://web.api.prod.veve.me/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/fp",
          method: "GET",
          resolveWithFullResponse: true,
          simple: false,
        });

        let kasadaInfo = /ips.js?(.*)">/.exec(initFPRes.body)[1];

        let initIPSRes = await this.request({
          url: `https://web.api.prod.veve.me/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/ips.js${kasadaInfo}`,
          method: "GET",
          resolveWithFullResponse: true,
        });

        let ipsdata = /,window,'(.*)'\);}\)/.exec(initIPSRes.body)[1];
        let x_kpsdk_ct = initIPSRes.headers["x-kpsdk-ct"];

        let jemGenRes = await this.request({
          url: "[REDACTED]",
          method: "POST",
          form: {
            ipsdata: ipsdata,
            key: API_KEY,
          },
          resolveWithFullResponse: true,
          simple: false,
        });

        let resultbody = JSON.parse(jemGenRes.body);
        let posttldata = Object.values(resultbody.result);
        let tldataArray = new Uint8Array(posttldata);

        let checkTLRes = await this.request({
          url: "https://web.api.prod.veve.me/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/tl",
          method: "POST",
          headers: {
            "x-kpsdk-ct": x_kpsdk_ct,
          },
          body: tldataArray,
          resolveWithFullResponse: true,
          simple: false,
        });

        if (checkTLRes) {
          let parsedcheckTL = JSON.parse(checkTLRes.body);
          if (parsedcheckTL.reload == true) {
            resolve(x_kpsdk_ct);
          }
        }
      } catch (e) {
        reject(null);
      }
    });
  }
}
