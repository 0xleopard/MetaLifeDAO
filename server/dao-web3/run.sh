gunicorn -w 3 -b 0.0.0.0:5050 server:app > server.logo & python listener.py > eth.log