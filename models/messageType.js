const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageTypeSchema = Schema({
  name: { type: String, required: true, trim: true },
  postTo: [
    {
      team: { type: Schema.Types.ObjectId, ref: "teams" },
      channelId: { type: String, required: true, trim: true },
    },
  ],
});

module.exports = mongoose.model("messageTypes", messageTypeSchema);
