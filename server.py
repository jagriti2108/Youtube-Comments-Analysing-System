from flask import Flask, render_template, request, jsonify
from youtube_comment_analysis import analyze_comments

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    if request.method == 'POST':
        youtube_link = request.form['videoLink']
        developer_key = "AIzaSyBC4qWUlwUM-NpHGomWK7GrMfjixo2DD0c"  
        analysis_results = analyze_comments(youtube_link, developer_key)
        return jsonify(analysis_results)

if __name__ == '__main__':
    app.run(debug=True)
