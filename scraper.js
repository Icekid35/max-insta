const axios = require("axios");
const mongoose = require("mongoose");
const json = require("./dataset.json");
const types = [{}];
let videos = [];
let images = [];
mongodburi =
  "mongodb+srv://icekid35:6BFiHbTsSjavcWdg@cluster0.awcnqku.mongodb.net/?retryWrites=true&w=majority";

// Set up Mongoose and connect to your MongoDB instance
mongoose.connect(mongodburi, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
analyseData(json);

});
mongoose.connection.on("error", () => {
  console.log("error connecting to MongoDB");
});
// Define a schema for the images
const ImageSchema = new mongoose.Schema({
  buffer: Buffer,
});

// Create a Mongoose model for the images
const ImageModel = mongoose.model("Image", ImageSchema);

// Define a schema for the videos
const videoSchema = new mongoose.Schema({
  videoBuffer: Buffer,
  imageBuffer: Buffer,
});

// Create a Mongoose model for the videos
const videoModel = mongoose.model("video", videoSchema);

let last = 1; //1 for image and 0 for video
async function convertUrlToBuffer(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer",	});
    return Buffer.from(response.data, "binary");
  } catch (error) {
    console.error("Error converting URL to buffer:", error.code);
    throw error;
  }
}

let postType = "Video";
async function startWork() {
  try {
    //my logic here

    // if ((last == 1)) {
    //   postType = "Video";
    // } else {
    //   postType = "Image";
    // }

    if (postType == "Video") {
      try {
        console.log("posting video...");
        for (let i = 0; i < videos.length; i++) {
          try {
            const { videoFile, coverImage } = videos[i];
            const videoBuffer = await convertUrlToBuffer(videoFile);
            const coverImageBuffer = await convertUrlToBuffer(coverImage);
            const video = new videoModel({
              videoBuffer: videoBuffer,
              imageBuffer: coverImageBuffer,
            });

            await video.save();
            console.log(`video saved: ${video._id}`);
            console.log("saved " + i + "videos...");
          } catch (err) {
            console.log(
              "error occured while saving the file with ...." + err.code
            );
          }
        }
      } catch (err) {
        //   last = 0;
        //   startWork()
        console.log("error occured ..." + err.code);
      }
    } else if (postType == "Image") {
      try {
        console.log("posting image...");
        try {
          const img = images[i];
          const ImageBuffer = await convertUrlToBuffer(img);
          const Image = new ImageModel({
            buffer: ImageBuffer,
          });

          await Image.save();
          console.log(`Image saved: ${Image._id}`);
          console.log("saved " + i + "Images...");
        } catch (err) {
          console.log(
            "error occured while saving the file with ...." + err.code
          );
        }
      } catch (err) {
        console.log("error encountered while posting images" + err.code);
      }
    }
  } catch (err) {
    console.log("an error occured with details ...", err.code);
  }
  console.log("job done");
  mongoose.connection.close();
  return "done ";
}

const shuffle = (array) =>
  [...Array(array.length)]
    .map((el, i) => Math.floor(Math.random() * i))
    .reduce((a, rv, i) => ([a[i], a[rv]] = [a[rv], a[i]]) && a, array);

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
  startWork();
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

