const express = require("express");
const mongoose = require("mongoose");
var cron = require("node-cron");
const app = express();
const json = require("./dataset.json");
const { IgApiClient } = require("instagram-private-api");

let videos = [];

let videoSchema

let videoModel
console.log("loging in...")
const ig = new IgApiClient();
ig.state.generateDevice("javascriptpro1");
ig.account.login("javascriptpro1", "icekid@love");

mongodburi =
  "mongodb+srv://icekid35:6BFiHbTsSjavcWdg@cluster0.awcnqku.mongodb.net/?retryWrites=true&w=majority";
  console.log("connecting to database...")

// Set up Mongoose and connect to your MongoDB instance
mongoose.connect(mongodburi, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected",async() => {
  console.log("Mongoose connected to MongoDB");
  videoSchema = new mongoose.Schema({
    videoBuffer: Buffer,
    imageBuffer: Buffer,
  });
  
  // Create a Mongoose model for the videos
   videoModel = mongoose.model("video", videoSchema);
  console.log("created schema...")
  
    let vm = await videoModel.find().limit(10).exec();
    videos = Array.from(vm);
    console.log("loaded videos...")
    console.log(videos)

});
mongoose.connection.on("error", () => {
  console.log("error connecting to MongoDB");
  // Define a schema for the videos
 
});
mongoose.connection.on("close", () => {
  console.log("closed connection to MongoDB");
});



const caption =
  " follow @javascriptpro1 for more \n\n\n#program #coding #code #programmingmemes #css #webdev #codingmemes #programmer #java #python #javascript #html #memecoding #cs #computers #cpp #csharp #developer #nerd #math #apple #windows #programmerhumor #programminghumor #codinglife #stackoverflow #devhumor #dev #tech";

async function startWork() {
  try {
    //my logic here
if (videos.length < 1){
  let vm = await videoModel.find().limit(10).exec();
  videos = Array.from(vm);
  console.log("loaded videos...")
  console.log(videos)
}
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
