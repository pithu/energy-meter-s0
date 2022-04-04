from datetime import datetime, timedelta

from s0_filename import data_filename


def date_files(log_date, last_hours):
    return [
        data_filename(log_date - timedelta(hours=last_hour)) for last_hour in range(last_hours)
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


def get_parsed_log_data(log_date=datetime.now(), last_hours=48):
    date_files_list = date_files(log_date, last_hours)
    parse_data_files = [
        (fn['path'], fn['hour'], parse_data_file(fn['full_filename'])) for fn in date_files_list
    ]
    log_days = dict({})
    for log_hour in parse_data_files:
        log_days.setdefault(log_hour[0], dict({}))[log_hour[1]] = log_hour[2]

    return log_days
