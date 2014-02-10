#!/bin/bash
PIDFILE=/home/javaguirre/sabrosous.pid
if [ -f $PIDFILE ]; then
    kill `cat -- $PIDFILE`
    rm -f -- $PIDFILE
fi
cd /home/javaguirre/sabrosous/sabrosous/sabrosous && /home/javaguirre/sabrosous/env/bin/python2 /home/javaguirre/sabrosous/env/bin/gunicorn -p $PIDFILE wsgi:application --bind 127.0.0.1:8127
