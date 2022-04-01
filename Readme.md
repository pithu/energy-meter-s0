## Autostart s0 logger

```shell
$ sudo crontab -e 

@reboot /usr/bin/sudo /home/pithu/projects/energy-meter-s0/s0-simple.py >> /var/log/energy-meter-s0.log
```
