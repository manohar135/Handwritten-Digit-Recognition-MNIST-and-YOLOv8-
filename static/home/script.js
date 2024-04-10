class CreateCanvas{
    constructor(canvas){
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
    }
  
    draw() {
      let isDrawing = false;
      let lastX = 0;
      let lastY = 0;
    
      this.canvas.addEventListener("mousedown", (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
      });
    
      this.canvas.addEventListener("mousemove", (e) => {
        if (!isDrawing) return;
        this.ctx.lineWidth = "15";
        this.ctx.lineCap = "round";
        this.ctx.beginPath();
        this.ctx.moveTo(lastX, lastY);
        this.ctx.lineTo(e.offsetX, e.offsetY);
        this.ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
      });
    
      this.canvas.addEventListener("mouseup", (event) => {
        isDrawing = false;
        sendImageToFlask();
      });
    }

    getImage(){
        var imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        var pixels = imageData.data;
        var data = new Array(280*280)
        var j = 0;
        for (var i = 3; i < pixels.length; i += 4) {
            data[j] = pixels[i]/255;
            j++;
        };
        return data; //return 1d pixel array
    }
    clearCanvas(){
      // Clear the canvas screen
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}


canvas = document.getElementById("canvas");
const cvs = new CreateCanvas(canvas);
cvs.draw();

clear = document.getElementById("clearCanvas");
clear.addEventListener("click", ()=>{
    cvs.clearCanvas();
});

function sendImageToFlask(){
    image = cvs.getImage()
    // Send captured image data to Flask backend
    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageData: image})
    })
    .then((response) => response.text())
    .then((data) => {
      data = JSON.parse(data)
      displayPrediction(data)
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//Display the value and progress bar
function displayPrediction(data) {
  // Display value prediction
  document.getElementById("predict_value").innerText = data.value;

  //Display progress bar
  arr = data.pred_array
  var progressBar = document.getElementById("progress_bar");
  progressBar.replaceChildren(); //Remove old progress bars
  
  // Creating progressBar for all 10 digit prediction
  for(let i=0; i<arr.length; i++){
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
    predPercent.textContent = arr[i]+"%";

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
    behavior: "smooth"
  })
}