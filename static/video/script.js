const video = document.getElementById("video");
const canvas2 = document.getElementById("canvas2");
const canvas1 = document.getElementById("canvas1");
const captureButton = document.getElementById("capture-btn");
const isVideo = document.getElementById("isVideo");
const isImage = document.getElementById("isImage");

const WIDTH = 640;
const HEIGHT = 480;

//Box on video cordinates
const box_x = (WIDTH - 140) / 2; // x-coordinate of the rectangle
const box_y = (HEIGHT - 140) / 2; // y-coordinate of the rectangle
const box_width = 140; // width of the rectangle
const box_height = 140; // height of the rectangle

// Play video
navigator.mediaDevices
  .getUserMedia({
    video: true
    // video: {
    //   deviceId: {
    //     exact:
    //       "806dd06bcbadcc2f6b1d312881644fcb47cd5076f14bbd17743d1e65899f7998",
    //   },
    // },
  })
  .then((stream) => {
    video.srcObject = stream;
  })

  // To extract the camara id of different devices
  // .enumerateDevices()
  // .then((devices) => {
  //   devices.forEach((device) => {
  //     console.log(`${device.kind}: ${device.label} id = ${device.deviceId}`);
  //   });
  // })

  .catch((error) => {
    console.error("Error accessing webcam:", error);
  });

// Draw a rectangle on the canvas
const ctx = canvas1.getContext("2d");
ctx.strokeStyle = "red";
ctx.lineWidth = 2;
ctx.strokeRect(box_x, box_y, box_width, box_height); // (x, y, width, height)

//take image and send to flask backend
captureButton.addEventListener("click", () => {
  sendFram();
});

function sendFram() {
  canvas2
    .getContext("2d")
    .drawImage(
      video,
      box_x,
      box_y,
      box_width,
      box_height,
      0,
      0,
      box_width * 2,
      box_height * 2
    );
  const imageData = canvas2.toDataURL("image/jpeg");

  // Send captured image data to Flask backend
  fetch("video", {
    method: "POST",
    body: JSON.stringify({ imageData: imageData }), // Sending raw image data without JSON serialization
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      displayPrediction(data);
    });
}

var interval;
var is_image = true;
// changing the video to image or wise versa mode
isVideo.addEventListener("click", () => {
  interval = setInterval(sendFram, 100);
  is_image = false;
  isVideo.style.display = "none";
  captureButton.style.display = "none";
  isImage.style.display = "inherit";
});

isImage.addEventListener("click", () => {
  clearInterval(interval); //To stop the interval
  is_image = true;
  isImage.style.display = "none";
  captureButton.style.display = "inherit";
  isVideo.style.display = "inherit";
});

//Display the value and progress bar
function displayPrediction(data) {
  // Display value prediction
  document.getElementById("output_value").innerText = data.predict[0];

  //Display progress bar
  arr = data.predict[1];
  var progressBar = document.getElementById("progress_bar");
  progressBar.replaceChildren(); //Remove old progress bars

  if (is_image) { //prograss bar only for images
    // Creating progressBar for all 10 digit prediction
    for (let i = 0; i < arr.length; i++) {
      var progressContainer = document.createElement("div");
      progressContainer.className = "progress_container";

      var predValue = document.createElement("div");
      predValue.className = "prog_text";
      predValue.id = "pred_value";
      predValue.textContent = i;

      var progress = document.createElement("div");
      progress.className = "progress";

      var progressValue = document.createElement("div");
      // progressValue.style.width = arr[i]+"%";
      progressValue.className = "progress-value";

      var predPercent = document.createElement("div");
      predPercent.className = "prog_text";
      predPercent.id = "pred_percent";
      predPercent.textContent = arr[i] + "%";

      // Set the custom Progress value
      progressValue.style.setProperty("--progBarValue", arr[i] + "%");

      // Append the elements to the container
      progress.appendChild(progressValue);
      progressContainer.appendChild(predValue);
      progressContainer.appendChild(progress);
      progressContainer.appendChild(predPercent);

      progressBar.appendChild(progressContainer);
    }

    // Auto scroll down
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }
}
