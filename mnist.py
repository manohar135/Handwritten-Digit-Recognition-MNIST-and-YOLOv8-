import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

from keras.models import load_model
import base64
import numpy as np
import cv2

model = load_model('Ml_model\cnn_model_best.h5')


def decode_base64_image(image_data):
    encoded_data = image_data.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def convert28(image_data, isbase64 = False):
    if isbase64:
        image = decode_base64_image(image_data)  # Decode the base64 encoded image data
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)  #Gray image

        #Resizing the image to 28x28
        resized_image = cv2.resize(gray_image, (28, 28), interpolation=cv2.INTER_CUBIC)
        # normalize the pixel form 0-1 
        image = np.absolute(np.array(resized_image/255, float) - 1)
        image[image < 0.5] = 0
        image[image >= 0.5] = 1
        return image
    else:
        data = np.array(image_data, dtype=float)
        data = data.reshape(280, 280)
        res_image28 = cv2.resize(data, (28, 28), interpolation=cv2.INTER_CUBIC)
        return res_image28


def predictDigit(image_data, isbase64 = False):
    image = convert28(image_data, isbase64)
    prediction = model(image.reshape(-1, 28, 28, 1))

    #transfering the data to html
    precent_predict = np.round(prediction*100).reshape(10)
    precent_predict = np.array(precent_predict, dtype='int32').tolist()
    value = int(np.argmax(precent_predict))
    return value, precent_predict