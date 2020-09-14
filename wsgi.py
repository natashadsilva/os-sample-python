from flask import Flask
application = Flask(__name__, template_folder="../public", static_folder="../public", static_url_path='')


@application.route("/")
def map():
    return application.send_static_file('simplemap.html')

if __name__ == "__main__":
    application.run()
