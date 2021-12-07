const axios = require("axios");

async function postMessage(accessToken, channelId, message) {
  const response = await axios({
    method: "post",
    url: "https://slack.com/api/chat.postMessage",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json; charset=utf-8",
    },
    data: {
      channel: channelId,
      text: message,
      username: process.env.USERNAME,
      icon_url: process.env.ICON_URL,
    },
  });
  return response;
}

module.exports = postMessage;
