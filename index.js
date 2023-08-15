const express = require("express");
const mongoose = require("mongoose");
var cron = require("node-cron");
const app = express();
const json = require("./dataset.json");
const { IgApiClient } = require("instagram-private-api");

let videos = [];

const ig = new IgApiClient();
ig.state.generateDevice("javascriptpro1");
ig.account.login("javascriptpro1", "icekid@love");

mongodburi =
  "mongodb+srv://icekid35:6BFiHbTsSjavcWdg@cluster0.awcnqku.mongodb.net/?retryWrites=true&w=majority";

// Set up Mongoose and connect to your MongoDB instance
mongoose.connect(mongodburi, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});
mongoose.connection.on("error", () => {
  console.log("error connecting to MongoDB");
});

// Define a schema for the videos
const videoSchema = new mongoose.Schema({
  videoBuffer: Buffer,
  imageBuffer: Buffer,
});

// Create a Mongoose model for the videos
const videoModel = mongoose.model("video", videoSchema);

(async () => {
  let vm = await videoModel.find().exec();
  videos = Array.from(vm);
})();

const caption =
  " follow @javascriptpro1 for more \n\n\n#program #coding #code #programmingmemes #css #webdev #codingmemes #programmer #java #python #javascript #html #memecoding #cs #computers #cpp #csharp #developer #nerd #math #apple #windows #programmerhumor #programminghumor #codinglife #stackoverflow #devhumor #dev #tech";

async function startWork() {
  try {
    //my logic here

    console.log("posting video...");
    const randomIndex = Math.round(Math.random() * (videos.length - 1));
    const { videoBuffer, imageBuffer,_id } = videos[randomIndex];
    // const videoBuffer = await convertUrlToBuffer(video);
    // const coverImageBuffer = await convertUrlToBuffer(coverImage);
    const publishResult = await ig.publish.video({
      // read the file into a Buffer
      video: videoBuffer,
      coverImage: imageBuffer,
      // video: await readFileAsync(videoPath),
      // coverImage: await readFileAsync(coverPath),
      caption,
    });
    console.log(publishResult);
    last = 0;
    videos.splice(randomIndex, 1);
    const deletedImage = await videoModel.findByIdAndDelete(_id);

    if (!deletedImage) {
      console.log(`Image with ID ${_id} not found.`);
    } else {
      console.log(`Image with ID ${_id} deleted successfully.`);
    }
  } catch (err) {
    console.log("an error occured with details ...", err.code);
  }
  console.log("job done");
  return "done ";
}

// const cronExpression = '0 */5 * * *';
// cron.schedule(cronExpression, startWork);
app.get("/work", async (req, res) => {
  let data = await startWork();
  res.json(data);
});

app.get("/", (req, res) => {
  res.json({ active: true });
});
app.get("/data", (req, res) => {
  res.json(json);
});
app.get("*", (req, res) => {
  res.json({
    videos,
  });
});
const port = process.env.port || 3000;

app.listen(port, () => {
  console.log(" app is listening on port " + port);
});
