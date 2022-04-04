from fastapi import FastAPI
from datetime import datetime

from s0_parser import get_parsed_log_data


app = FastAPI()


@app.get("/")
def get_root():
    return {"s0-server": "up and running. call /s0-logs/{last_hours} for getting the s0 logs"}


@app.get("/s0-logs/{last_hours}")
def get_logs(last_hours: int):
    return get_parsed_log_data(datetime.now(), last_hours)

