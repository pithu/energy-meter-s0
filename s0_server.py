from bottle import route, run
from datetime import datetime

from s0_parser import get_parsed_log_data


@route('/')
def index():
    return 's0-server is up and running. call /s0-logs/{last_hours} to s0 logs'


@route("/s0-logs/<last_hours:int>")
def get_logs(last_hours):
    return get_parsed_log_data(datetime.now(), last_hours)


run(host='0.0.0.0', port=8080)


