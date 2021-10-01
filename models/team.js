const mongoose = require("mongoose");

const teamSchema = mongoose.Schema({
  teamId: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  accessToken: { type: String, required: true, trim: true },
});

module.exports = mongoose.model("teams", teamSchema);
