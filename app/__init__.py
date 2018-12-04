from flask import Flask,render_template
# from flask_sqlalchemy import SQLAlchemy
app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template("layout.html")

@app.route('/knock')
def knock():
    return "knock"

if __name__ == '__main__':
    app.run()
