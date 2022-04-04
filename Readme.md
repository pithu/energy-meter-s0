## Manually start apps

```shell
pip3 install -r requirements.txt

python3 s0_logger.py
python3 s0_server.py
```

## Autostart apps

Adapt path and other settings in `./services-conf/s0_*.service` and then

```shell
sudo cp ./services-conf/*.service /etc/systemd/system/
sudo systemctl daemon-reload

sudo systemctl start s0_logger.service
sudo systemctl enable s0_logger.service

sudo systemctl start s0_server.service
sudo systemctl enable s0_server.service
```

