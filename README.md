# Streams REST Data Viewer Application

## Run locally:

Install requirements: ` pip install -r requirements.txt`

Run: 

`python wsgi.py`

Go to `http://127.0.0.1:5000/tables` in your browser.

Enter the Streams endpoint URL and the credentials and click *Submit.*

Notes:
- To retreive data from a new URL, reload the page or open a new tab. 
- If you get an error popup from DataTables, reload the page.

## Deploy to OpenShift:


`oc new-app https://github.com/natashadsilva/os-sample-python.git --name flaskdemo`

`oc expose svc/flaskdemo`

Open <cluster url>/tables

After editing, push to GitHub

Use `oc start-build flaskdemo` to refresh

