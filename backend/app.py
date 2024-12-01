from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('scores.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS scores
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, score INTEGER)''')
    conn.commit()
    conn.close()

init_db()

@app.route('/save_score', methods=['POST'])
def save_score():
    data = request.get_json()
    score = data.get('score')
    conn = sqlite3.connect('scores.db')
    c = conn.cursor()
    c.execute("INSERT INTO scores (score) VALUES (?)", (score,))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/get_high_score', methods=['GET'])
def get_high_score():
    conn = sqlite3.connect('scores.db')
    c = conn.cursor()
    c.execute("SELECT MAX(score) FROM scores")
    high_score = c.fetchone()[0]
    conn.close()
    return jsonify({'high_score': high_score or 0})

if __name__ == '__main__':
    app.run(debug=True)
