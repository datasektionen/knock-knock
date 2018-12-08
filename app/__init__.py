import json
import requests
from flask import Flask,render_template, request, abort
from random import randint
from flask_sqlalchemy import SQLAlchemy

# from flask_sqlalchemy import SQLAlchemy
app = Flask(__name__)

def authenticate(permission):
    def foo(f):
        def decorated_function():
            # token = request.headers.get("api_key")
            token = "luddz-_qBFhK1VDoQo16AxTUBahsirHogH-2rYXp8q5foYBsk"
            url = f'https://pls.datasektionen.se/api/token/{token}/knockknock/{permission}/'
            response = requests.get(url)
            allowed = response.json()
            if not allowed:
                abort(403)
            return f()

        return decorated_function
    return foo

@app.route('/', methods=['GET'])
def hello_world():
    return "Who's there?"

@authenticate("write")
@app.route('/', methods=['POST'])
def hello_worldx():
    return "POSTING LIKE A BOSS"

# This should CREATE a new event
@authenticate("write")
@app.route('/api/event/', methods=['POST']) #Post
def getEvents():
    return "getEvents"

# This should GENERATE a list of the persons on the specified event
@authenticate("read")
@app.route('/api/event/<string:event>/', methods=['GET']) #GET
def getPresent():
    return "getPresent"

#This should generate if user has changed in/out
# GET should generate True or False
@authenticate("read")
@app.route('/api/event/<string:event>/user/<string:user>/', methods=['GET']) #GET
def handleUserGet():
    return "handleUser"

#This should generate if user has changed in/out
# PUT should change the status of the user.
@authenticate("write")
@app.route('/api/event/<string:event>/user/<string:user>/', methods=['PUT']) #PUT
def handleUserPut():
    return "handleUser"

#This should generate if user(with UGID) has changed in/out
# GET should generate True or False
@authenticate("read")
@app.route('/api/event/<string:event>/ugid/<string:ugid>/',methods=['GET']) #GET
def handleUgidGet():
    return "handleUgidGet"

#This should generate if user(with UGID) has changed in/out
# PUT should change the status of the current user
@authenticate("write")
@app.route('/api/event/<string:event>/ugid/<string:ugid>/',methods=['PUT']) #PUT
def handleUgidPut():
    return "handleUgidPut"

@app.route('/knock/', methods=['GET'])
def getJokes():
    jokes = [ "This is a joke", "Another joke", "A third joke, and now to the awsome"]
    randomNumber = randint(0,len(jokes)-1)
    joke = jokes[randomNumber]
    return render_template('knockknock.html',**locals())

if __name__ == '__main__':
    app.run()
