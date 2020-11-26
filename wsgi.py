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

@application.route("/columns", methods=["POST"])
def get_columns():
    params = json.loads(request.data)
    url= params.get("endpoint_url")
    user = params.get("u")
    password=  params.get("p")
    if (url is not None):
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
        else:
            print("Request failed")
            print(resp.request)
            print(resp.status_code)
            print(resp.text)
            return dict(items=[])
    else:
        return dict(items=[])


@application.route("/map")
def map():
    return application.send_static_file('simplemap.html')

@application.route("/netflow")
def netflow_ui():
    return application.send_static_file('netflow/index.html')



@application.route("/tables")
def table():
    return application.send_static_file('table.html')

@application.route("/data", methods=["POST"])
def table_data():
    url =request.values.get("endpoint_url")
   
    user = request.values.get("u")
    password=  request.values.get("p")
    resp = requests.get(url, auth=(user, password), verify=False)
    if (resp.status_code >= 200 and resp.status_code < 300):
        print(resp.elapsed.total_seconds())
        return jsonify(resp.json())
    else:
        print("Request failed")
        print(resp.request)
        print(resp.status_code)
        print(resp.text)
        abort(resp.status_code, resp.text)


if __name__ == '__main__':
    app.run()
