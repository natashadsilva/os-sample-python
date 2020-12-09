import json
from flask import abort
from flask import Flask
import requests
from flask import jsonify
from flask import request
import urllib3
from flask import Response
urllib3.disable_warnings()
application = Flask(__name__, template_folder="public", static_folder="public", static_url_path='')
import random

## Endpoint to find out what the columns are for a given endpoint
## returns a single element from the payload

@application.route("/columns", methods=["POST"])
def get_columns():
    params = json.loads(request.data)
    url= params.get("endpoint_url")
    user = params.get("u")
    password=  params.get("p")
    if not user or not password or not url:
        abort(400, "Invalid URL or credentials")
        return
    resp = requests.get(url, auth=(user, password), verify=False)
    if (resp.status_code >= 200 and resp.status_code < 300):
        items  = resp.json()["items"]
        if len(items) > 0:
            if items[0].get("jsonString", None) is None:
                return dict(items=items[0])
            else:
                first = items[0]["jsonString"]
                return dict(items=first)
        else:
            return dict(items=[])
    
    elif resp.status_code == 401:
        
        abort(401, "Invalid credentials.")
    else:
        print("Request failed")
        print(resp.request)
        print(resp.status_code)
        print(resp.text)
        abort(resp.status_code, resp.text)

@application.route("/")
def table():
    return application.send_static_file('index.html')


## This is the endpoint that acts as a proxy between the web client
## and the Streams job

@application.route("/data", methods=["POST"])
def table_data():
    # Data tables uses a different mechanism
    if (request.values.get("endpoint_url") is None):
        params = request.get_json()
    else:
        params = request.values
    url = params.get("endpoint_url")
    user = params.get("u")
    password=  params.get("p")

    if not user or not password or not url:
        abort(400, "Invalid URL or credentials")
        return

    resp = requests.get(url, auth=(user, password), verify=False)
    if (resp.status_code >= 200 and resp.status_code < 300):
        print(resp.elapsed.total_seconds())
        return jsonify(resp.json())
    elif resp.status_code == 401:
        abort(401, "Invalid credentials.")
    else:
        print("Request failed")
        print(resp.request)
        print(resp.status_code)
        print(resp.text)
        abort(resp.status_code, resp.text)


if __name__ == '__main__':
    application.run()
