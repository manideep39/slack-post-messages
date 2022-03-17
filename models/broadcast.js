const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const broadcastSchema = Schema({
  name: { type: String, required: true, trim: true },
  postTo: [
    {
      team: { type: Schema.Types.ObjectId, ref: "teams" },
      teamName: { type: String, required: true, trim: true },
      channelId: { type: String, required: true, trim: true },
      channelName: { type: String, required: true, trim: true}
    },
  ],
});

module.exports = mongoose.model("broadcasts", broadcastSchema);
