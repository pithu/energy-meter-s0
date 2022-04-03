from datetime import datetime, timedelta
import os
import json

date_dir = os.path.dirname(os.path.abspath(__file__)) + "/data"


def data_filename(log_date):
    path = log_date.strftime("%Y/%m/%d")
    hour = log_date.strftime("%H")
    filename = hour + ".csv"
    minute = log_date.strftime("%M")
    full_filename = date_dir + "/" + path + "/" + filename
    return dict({
        'path': path,
        'filename': filename,
        'full_filename': full_filename,
        'hour': hour,
        'minute': minute,
    })


def date_files(log_date, last_hours):
    return [
        data_filename(log_date - timedelta(hours=last_hour)) for last_hour in range(last_hours, 0, -1)
    ]


def parse_data_file(full_filename):
    try:
        with open(full_filename, 'r') as file:
            log_per_hour = file.read().rstrip()
    except OSError:
        log_per_hour = ''

    log_per_minutes = dict([
        tuple([minute for minute in minute_log.split(':')])
        for minute_log in log_per_hour.split(',') if len(minute_log) > 3
    ])
    return [
        log_per_minutes.get(str(idx).zfill(2)) for idx in range(60)
    ]


def log_data(log_date, last_hours):
    date_files_list = date_files(log_date, last_hours)
    parse_data_files = [
        (fn['path'], fn['hour'], parse_data_file(fn['full_filename'])) for fn in date_files_list
    ]
    log_days = dict({})
    for log_hour in parse_data_files:
        log_days.setdefault(log_hour[0], dict({}))[log_hour[1]] = log_hour[2]

    return log_days


print(json.dumps(log_data(datetime.now(), 48), indent=4))

