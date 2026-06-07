const { getPublicSwellConfig } = require("../lib/swell-config");

module.exports = function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.statusCode = 200;
  response.end(JSON.stringify(getPublicSwellConfig()));
};
