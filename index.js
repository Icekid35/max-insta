const express = require("express");
const axios = require("axios");
const app = express();
const json = require("./dataset.json");
const { IgApiClient } = require("instagram-private-api");
const types = [{}];
let videos = [];
let images = [];

const shuffle = (array) =>
  [...Array(array.length)]
    .map((el, i) => Math.floor(Math.random() * i))
    .reduce((a, rv, i) => ([a[i], a[rv]] = [a[rv], a[i]]) && a, array);

const ig = new IgApiClient();
ig.state.generateDevice("javascriptpro1");
const auth = await ig.account.login("javascriptpro1", "icekid@love");

function organiseData() {
  json.map((data) => {
    let { type } = data;

    switch (type) {
      case "Video":
        videos.push({
          video: data.videoUrl,
          coverImage: data.displayUrl,
        });
        break;

      case "Image":
        images.push(data.displayUrl);
        break;
      case "Sidecar":
        data.images.map((img) => {
          images.push(img);
        });
        break;

      default:
        images.push(displayUrl);

        break;
    }
  });
  videos = shuffle(videos);
  images = shuffle(images);
  console.log(videos.length, images.length);
}

function analyseData(json = json) {
  json.map((data) => {
    let { type } = data;

    if (types.find((i) => i.name == type)) {
      types.find((i) => i.name == type).count += 1;
    } else {
      types.push({ name: type, count: 1 });
    }
    if (type == "Sidecar") {
      data.images.map((img) => {
        types.find((i) => i.name == "Image").count += 1;
      });
    }
  });

  console.log(types);
  organiseData();
}

analyseData(json);

let last = 1; //1 for image and 0 for video
const caption =
  " follow @javascriptpro1 for more \n\n\n#program #coding #code #programmingmemes #css #webdev #codingmemes #programmer #java #python #javascript #html #memecoding #cs #computers #cpp #csharp #developer #nerd #math #apple #windows #programmerhumor #programminghumor #codinglife #stackoverflow #devhumor #dev #tech";
async function convertUrlToBuffer(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  } catch (error) {
    console.error("Error converting URL to buffer:", error);
    throw error;
  }
}

async function startWork() {
  try {
    //my logic here

    if ((last = 1)) {
      postType = "Video";
    } else {
      postType = "Image";
    }

    if (postType == "Video") {
      const randomIndex = Math.round(Math.random() * (videos.length - 1));
      const { video, coverImage } = videos[randomIndex];
      const videoBuffer = await convertUrlToBuffer(video);
      const coverImageBuffer = await convertUrlToBuffer(coverImage);
      const publishResult = await ig.publish.video({
        // read the file into a Buffer
        video: videoBuffer,
        coverImage: coverImageBuffer,
        // video: await readFileAsync(videoPath),
        // coverImage: await readFileAsync(coverPath),
        caption,
      });
      console.log(publishResult);
      last = 0;
      videos.splice(randomIndex, 1);
    } else if (postType == "Image") {
      const randomIndex = Math.round(Math.random() * (images.length - 1));
      const file = convertUrlToBuffer(images[randomIndex]);
      const publishResult = await ig.publish.photo({
        file,
        // file: await readFileAsync(path),
        caption,
      });

      console.log(publishResult);
      last = 1;
      images.splice(randomIndex, 1);
    }
  } catch (err) {
    console.log("an error occured with details ...", err);
  }
  return "done ";
}

app.get("/work", async (req, res) => {
  let data = await startWork();
  res.json(data);
});

app.get("/data", (req, res) => {
  res.json(json);
});
app.get("*", (req, res) => {
  res.json({
    videos,
    images,
  });
});
const port = process.env.port || 3000;

app.listen(port, () => {
  console.log(" app is listening on port " + port);
});
