# Streams REST Data Viewer Application

## Run locally:

Install requirements: ` pip install -r requirements.txt`

Run Locally: 

1. Start the server: `python wsgi.py`
2. Go to `http://127.0.0.1:5000/tables` in your browser.
3. Enter the Streams endpoint URL and the credentials and click *Submit.*
4. Data should start flowing and the table should be updated every 5 seconds. Change update [frequency here](https://github.com/natashadsilva/streams-rest-viewer/blob/master/public/table.html#L97)


Notes:
- To retreive data from a new URL, reload the page or open a new tab. 
- If you get an error popup from DataTables, reload the page.

## Deploy to OpenShift:


`oc new-app https://github.com/natashadsilva/streams-rest-viewer.git --name flaskdemo`

`oc expose svc/flaskdemo`

Open <cluster url>/tables

After editing, push to GitHub

Use `oc start-build flaskdemo` to refresh

