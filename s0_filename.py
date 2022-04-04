import os


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
