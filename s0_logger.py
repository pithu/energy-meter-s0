#!/usr/bin/python3
import RPi.GPIO as GPIO
from datetime import datetime
import time
import os

from s0_filename import data_filename

GPIO_PIR = 18

GPIO.setmode(GPIO.BOARD)
GPIO.setup(GPIO_PIR, GPIO.IN)

count = 0
current_date = datetime.now()

print("so_logger start up", GPIO.RPI_INFO, GPIO.gpio_function(GPIO_PIR))


def log_minute(now, count):
    data_file = data_filename(now)
    os.makedirs(os.path.dirname(data_file['full_filename']), mode=0o777, exist_ok=True)
    with open(data_file['full_filename'], 'a+') as f:
        f.write(data_file['minute'] + ":" + str(count) + ",")


def has_raised(channel):
    global count, current_date
    now = datetime.now()
    if current_date.minute != now.minute:
        log_minute(current_date, count)
        count = 0
        current_date = now
    count += 1
    # print(now.hour, now.minute, count)


try:
    GPIO.add_event_detect(GPIO_PIR , GPIO.RISING, callback=has_raised, bouncetime=20)
    while True:
        time.sleep(100)

except KeyboardInterrupt:
    GPIO.cleanup()
