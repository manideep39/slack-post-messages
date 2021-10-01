async function postMessage(channelId, message) {
  const response = await axios({
    method: "post",
    url: "https://slack.com/api/chat.postMessage",
    headers: {
      Authorization:
        "Bearer " + "xoxb-2125375846757-2568218558945-mcU05O1lDaZLIKSrQBQCtEph",
      "Content-Type": "application/json; charset=utf-8",
    },
    data: {
      channel: channelId,
      text: message,
    },
  });
}

module.exports = postMessage;
