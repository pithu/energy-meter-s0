from bottle import app, hook, response, route, run
from datetime import datetime

from s0_parser import get_parsed_log_data

# CORS
@hook('after_request')
def enable_cors():
    """Add headers to enable CORS"""

    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'PUT, GET, POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = \
        'Authorization, Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token '


@route('/', method='OPTIONS')
@route('/<path:path>', method='OPTIONS')
def options_handler(path=None):
    return


@route('/')
def index():
    return 's0-server is up and running. call /s0-logs/{last_hours} to s0 logs'


@route("/s0-logs/<hours:int>", method='GET')
def get_logs(hours):
    response.content_type = 'application/json'
    return get_parsed_log_data(datetime.now(), hours)


run(host='0.0.0.0', port=8080, debug=True)


