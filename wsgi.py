from flask import Flask
import requests
from flask import jsonify
from flask import request
import urllib3
urllib3.disable_warnings()
application = Flask(__name__, template_folder="public", static_folder="public", static_url_path='')



@application.route("/data")
def tuples():
    url = request.args.get("url")
    resp = requests.get(url +"/Visualization/MapViewer/ports/input/0/tuples",verify=False)
    if (resp.status_code >= 200 and resp.status_code < 300):
        return jsonify(resp.json())

@application.route("/")
def map():
    return application.send_static_file('simplemap.html')

if __name__ == "__main__":
    application.run(ssl_context='adhoc')
