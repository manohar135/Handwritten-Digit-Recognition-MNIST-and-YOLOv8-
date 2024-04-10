from flask import Flask, request, render_template, jsonify
import mnist
import yolo

app = Flask(__name__)

@app.route("/", methods=["GET","POST"])
def Home():
    if request.method == "GET":
        return render_template("index.html")
    
    if request.method == "POST":

        #Fetch image data from javascript
        data = request.json
        imageData = data.get('imageData')
        predict_value, precent_predict_arr = mnist.predictDigit(imageData)

        return jsonify(({'value': predict_value, 'pred_array':precent_predict_arr}))
    

@app.route("/video", methods = ["GET", "POST"])
def video():
    if request.method == "GET":
        return render_template("video.html")
    if request.method == "POST":

        #Fetch image data from javascript
        data = request.json
        image_data = data.get('imageData') #Here the image is base64 formate

        #predict the value from the image data
        predicted_value = mnist.predictDigit(image_data, isbase64=True)
        return jsonify({'predict': predicted_value})
    
@app.route("/yolov8", methods=["GET","POST"])
def yolov8():
    if request.method == "GET":
        return render_template("yolo.html")
    
    if request.method == "POST":
        data = request.json
        imageData = data.get('imageData')
        boxes = yolo.getBoxs(imageData)

        return jsonify(({'boxes': boxes}))

if __name__ == "__main__":
    app.run(debug=True)