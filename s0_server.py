from bottle import app, response, route, run
from bottle_cors_plugin import cors_plugin
from datetime import datetime

from s0_parser import get_parsed_log_data


@route('/')
def index():
    return 's0-server is up and running. call /s0-logs/{last_hours} to s0 logs'


@route("/s0-logs/<last_hours:int>", method='GET')
def get_logs(last_hours):
    response.content_type = 'application/json'
    return get_parsed_log_data(datetime.now(), last_hours)


# Allow CORS for all domains
app = app()
app.install(cors_plugin('*'))

run(host='0.0.0.0', port=8080)


