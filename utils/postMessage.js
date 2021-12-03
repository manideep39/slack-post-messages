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
      as_user: false,
      username: "Masai School",
    },
  });
  return response;
}

module.exports = postMessage;
