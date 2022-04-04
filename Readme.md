## Autostart s0 logger

Adapt path and other settings in `./services-conf/s0_logger.service` and than

```shell
sudo cp ./services-conf/s0_logger.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start s0_logger.service
sudo systemctl enable s0_logger.service
```

## Start s0 server 

```shell
pip3 install - r requirements.txt

$ uvicorn s0_server:app --reload
```
