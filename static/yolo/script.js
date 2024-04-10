const video = document.getElementById("video");
const canvas2 = document.getElementById("canvas2");
const captureButton = document.getElementById("capture-btn");

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
    video: true,
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
  .catch((error) => {
    console.error("Error accessing webcam:", error);
  });

//take image and send to flask backend
captureButton.addEventListener("click", () => {
  sendFram();
});

function sendFram() {
  canvas2.getContext("2d").drawImage(video, 0, 0, WIDTH, HEIGHT);
  const imageData = canvas2.toDataURL("image/jpeg");

  // Send captured image data to Flask backend
  fetch("yolov8", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageData: imageData }),
  })
    .then((response) => response.json())
    .then((data) => {
    //   data = JSON.parse(data);
      displayValue(data);
    });
}

function displayValue(data) {
  // console.log(data.boxes);
  showRect(data.boxes);
}

function showRect(boxes) {
  const ctx = canvas2.getContext("2d");

  ctx.beginPath();
  ctx.lineWidth = "2";
  ctx.strokeStyle = "red";

  ctx.textAlign = "start";
  ctx.font = "20px serif";
  boxes.forEach(box => {
    const x = box[0];
    const y = box[1];
    const w = box[2] - box[0]
    const h = box[3] - box[1]
    conf = box[4]
    cls = box[5]

    ctx.rect(x, y, w, h);

    ctx.fillStyle = "blue";
    ctx.fillRect(x, y-20, 45, 20);

    ctx.fillStyle = "white";
    ctx.fillText(cls+"  "+conf, x+2, y-3, 40);
    
  });
  ctx.stroke();
}

// setInterval(sendFram, 300);
