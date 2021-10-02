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
const Broadcast = require("./models/broadcast");

const generateAccessToken = require("./middleware/generateAccessToken");

const postMessage = require("./utils/postMessage");

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

app.get("/teams", async (req, res) => {
  try {
    const teams = await Team.find({}, { accessToken: 0 }).lean();
    res.status(200).send(teams);
  } catch (error) {
    res.status(500).send(`Something went wrong: ${error}`);
  }
});

app.get("/publicChannelsList/:teamId", async (req, res) => {
  try {
    const { accessToken } = await Team.findOne({
      teamId: req.params.teamId,
    });

    const { data } = await axios({
      method: "get",
      url: "https://slack.com/api/conversations.list",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    if (data.ok) {
      const channels = data.channels
        .filter(({ name, id, is_channel, is_archived }) => {
          if (is_channel && !is_archived) {
            return 1;
          }
        })
        .map(({ name, id }) => ({ name, id }));
      res.status(200).json({ channels });
    } else {
      res.send(data.error);
    }
  } catch (error) {
    res.status(500).send(`Something went wrong: ${error}`);
  }
});

app.post("/broadcasts", async (req, res) => {
  try {
    const { name, postTo } = req.body;
    await Broadcast.create({ name, postTo });
    res.status(201).send("Added!");
  } catch (error) {
    res.status(500).send(`Something went wrong: ${error}`);
  }
});

app.get("/broadcasts", async (req, res) => {
  try {
    const broadcasts = await Broadcast.find({}).populate({
      path: "postTo.team",
      select: { accessToken: 0 },
    });
    res.status(200).json(broadcasts);
  } catch (error) {
    res.status(500).send(`Something went wrong: ${error}`);
  }
});

app.post("/slack/interactive-endpoint", async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const { callback_id, trigger_id, team, type, view } = payload;

    if (type === "view_submission") {
      res.status(200).json({ response_action: "clear" });
      const {
        state: { values },
      } = view;
      const broadcastId =
        values.broadcastName.broadcastName.selected_option.value;
      const broadcastMessage = values.message.message.value;

      const broadcast = await Broadcast.findById(broadcastId)
        .populate("postTo.team")
        .lean();

      if (!broadcast) {
        return res.status(404).send("No records found.");
      }

      const { postTo } = broadcast;
      const response = { success: [], failure: [] };
      for (const { team, channelId } of postTo) {
        const { data } = await postMessage(
          team.accessToken,
          channelId,
          broadcastMessage
        );
        data.ok
          ? response.success.push({ workspace: team.name })
          : response.failure.push({ workspace: team.name, error: data.error });
      }
    } else if (type === "shortcut") {
      if (team.id !== process.env.PARENT_TEAM_ID) {
        return res.end();
      }

      const broadcastForm = require("./forms/broadcastMessage.json");
      const broadcasts = await Broadcast.find({}).lean();
      const { accessToken } = await Team.findOne({ teamId: team.id });

      broadcastForm.view.blocks[0].element.options = broadcasts.map(
        (broadcast) => ({
          text: {
            type: "plain_text",
            text: `${broadcast.name}`,
            emoji: true,
          },
          value: `${broadcast._id}`,
        })
      );

      broadcastForm.trigger_id = trigger_id;
      const response = await axios({
        method: "post",
        url: "https://slack.com/api/views.open",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json; charset=utf-8",
        },
        data: broadcastForm,
      });
    }
  } catch (error) {
    res.status(500).send(`Something went wrong: ${error}`);
  }
});
