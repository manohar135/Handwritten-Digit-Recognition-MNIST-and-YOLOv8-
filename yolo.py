from ultralytics import YOLO
import cv2
import numpy as np
import base64

def decode_base64_image(image_data):
    encoded_data = image_data.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

model = YOLO("YOLO_model/yolov8l.pt")

def getBoxs(image):
    boxes = []
    image = decode_base64_image(image)

    # Converting to Gray and increasing the thickness of black pixles
    image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    image = cv2.Canny(image, 200, 400) #extracting the edges

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))

    #Perform dilation on the image
    image = cv2.dilate(image, kernel)
    image = cv2.bitwise_not(image)

    image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)

    # cv2.imshow("image", image)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    results = model(image)
    for r in results:
        for box in r.boxes:
            conf = box.conf[0]
            if conf > 0.10:
                conf = int(conf*100)/100.0
                cls = int(box.cls[0])
                x1, y1, x2, y2 = box.xyxy[0]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                boxes.append([x1, y1, x2, y2, conf, cls])
    
    return boxes

