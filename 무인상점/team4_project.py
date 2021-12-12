from keras.models import load_model
from PIL import Image, ImageOps
import numpy as np
import requests
import pymysql
import cv2
import requests
import json


conn = pymysql.connect(
    host='13.208.69.254',
    user='root',
    password='1234',
    db='nagadb',
    charset='utf8'
)


def save_event():
    with conn.cursor() as cur:
        camera = url.split('/')[4]
        date = url.split('/')[5][:-4]
        sql = f"""
            insert into naga_event(camera,imgUrl, date) values('{camera}', '{url}', '{date}')
            """
        cur.execute(sql)
        conn.commit()


def swap_alert():
    with conn.cursor() as cur:
        camera = url.split('/')[4]
        sql = f"""
        update naga_camera set alert='1' where name='{camera}'
        """
        cur.execute(sql)
        conn.commit()


def to_alert():
    with conn.cursor() as cur:
        camera = url.split('/')[4]
        sql = f"""
        select alert from naga_camera where name='{camera}'
        """
        cur.execute(sql)
        conn.commit()
        flag = cur.fetchall()[0][0]
        if flag == 1:
            return True
        else:
            return False


with conn.cursor() as cur:
    select_sql = """
    SELECT *
    FROM naga_image 
    ORDER BY imgUrl DESC
    LIMIT 1 
    """

    while True:
        cur.execute(select_sql)
        id, url, camera = cur.fetchone()
        res = requests.get(url)
        data = res.content
        conn.commit()

        encoded_img = np.fromstring(data, dtype=np.uint8)
        np_img = cv2.imdecode(encoded_img, cv2.IMREAD_COLOR)

        im_rgb = cv2.cvtColor(np_img, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(im_rgb)
        img.save("test_img.jpg")

        # Load the model
        model = load_model('keras_model.h5')

        # Create the array of the right shape to feed into the keras model
        # The 'length' or number of images you can put into the array is
        # determined by the first position in the shape tuple, in this case 1.
        data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
        # Replace this with the path to your image

        image = Image.open('test_img.jpg')
        # resize the image to a 224x224 with the same strategy as in TM2:
        # resizing the image to be at least 224x224 and then cropping from the center
        size = (224, 224)
        image = ImageOps.fit(image, size, Image.ANTIALIAS)

        # turn the image into a numpy array
        image_array = np.asarray(image)
        # Normalize the image
        normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1
        # Load the image into the array
        data[0] = normalized_image_array

        # run the inference
        prediction = model.predict(data)

        pose_name = ''
        pose_rate = 0
        poses = ['sitting', 'standing', 'lying', 'normal']
        for i in range(len(prediction[0])):
            if prediction[0][i] > pose_rate:
                pose_name = poses[i]
                pose_rate = prediction[0][i]

        print(pose_name)
        if pose_name == 'sitting':
            save_event()
        elif pose_name == 'lying':
            save_event()

        data = {'Message': pose_name, 'camera': camera}
        URL = 'https://ds1qpemkjf.execute-api.ca-central-1.amazonaws.com/alert/'

        if (pose_name in ['lying', 'sitting']) and to_alert():
            res = requests.post(URL, data=json.dumps(data))
            swap_alert()
