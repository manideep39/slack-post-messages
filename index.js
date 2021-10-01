const path = require("path");

require("dotenv").config();
const cors = require("cors");

const axios = require("axios");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());

const Team = require("./models/team");

const generateAccessToken = require("./middleware/generateAccessToken");

app.get("/callback", generateAccessToken, async (req, res) => {
  try {
    const slackData = req.slackData;
    const {
      team: { id: teamId, name },
      access_token: accessToken,
    } = slackData;

    const oldTeam = await Team.find({ teamId }).lean();
    if (!oldTeam.length) {
      await Team.create({ teamId, name, accessToken });
    } else {
      await Team.findOneAndUpdate({ teamId }, { accessToken });
    }

    res.sendFile(path.join(__dirname, "static/index.html"));
  } catch (err) {
    res.status(500).send(`Something went wrong: ${err}`);
  }
});

app.listen(process.env.PORT || 3000, () => {
  try {
    mongoose.connect(
      process.env.MONGODB_URI,
      { useNewUrlParser: true, useUnifiedTopology: true },
      () => console.log("Mongoose is connected")
    );
  } catch (e) {
    console.log("could not connect");
  }
  console.log(`listening on port ${process.env.PORT}`);
});
