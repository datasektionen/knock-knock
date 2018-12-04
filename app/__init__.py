from flask import Flask,render_template
from random import randint
# from flask_sqlalchemy import SQLAlchemy
app = Flask(__name__)

@app.route('/api/')
def hello_world():
    return "Hello home"

# This should CREATE a new event
@app.route('/api/event/') #Post
def getEvents():
    return "getEvents"

# This should GENERATE a list of the persons on the specified event
@app.route('/api/event/<string:event>/') #GET
def getPresent():
    return "getPresent"

#This should generate if user has changed in/out
# GET should generate True or False
@app.route('/api/event/<string:event>/user/<ustring:ser>/') #PUT/GET
def handleUser():
    return "handleUser"

#This should generate if user(with UGID) has changed in/out
# GET should generate True or False
@app.route('/api/event/<string:event>/ugid/<string:ugid>/') #PUT/GET
def handleUgid():
    return "handleUgid"

@app.route('/knock/')
def knock():
    return "knock"

@app.route('/knock/<string:joke>/')
def getJoke(joke):
    jokes = [ "This is a joke", "Another joke", "A third joke, and now to the awsome"]
    randomNumber = randint(0,len(jokes)-1)
    joke = jokes[randomNumber]
    return render_template('knockknock.html',**locals())

if __name__ == '__main__':
    app.run()
