#!/usr/bin/python3
import RPi.GPIO as GPIO
from datetime import datetime
import time
import os

GPIO_PIR = 18

GPIO.setmode(GPIO.BOARD)
GPIO.setup(GPIO_PIR, GPIO.IN)

count = 0
current_date = datetime.now()
date_dir = os.path.dirname(os.path.abspath(__file__)) + "/data"

print("programm start up", GPIO.RPI_INFO, GPIO.gpio_function(GPIO_PIR))

def log_minute(now, count):
    path = date_dir + "/" + now.strftime("%Y/%m/%d")
    hour = now.strftime("%H")
    minute = now.strftime("%M")
    filename = path + "/" + hour + ".csv"
    # print(filename, minute, count)

    os.makedirs(path, mode=0o777, exist_ok=True)
    with open(filename, 'a+') as f:
        f.write(minute + ":" + str(count) + ",")

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
