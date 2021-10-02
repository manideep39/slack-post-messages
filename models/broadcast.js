const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const broadcastSchema = Schema({
  name: { type: String, required: true, trim: true },
  postTo: [
    {
      team: { type: Schema.Types.ObjectId, ref: "teams" },
      channelId: { type: String, required: true, trim: true },
    },
  ],
});

module.exports = mongoose.model("broadcasts", broadcastSchema);
