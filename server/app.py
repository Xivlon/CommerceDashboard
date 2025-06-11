from flask import Flask, request, jsonify
from ml.predict import predict_churn  # this imports your ML function

app = Flask(__name__)


# This defines the POST endpoint
@app.route("/predict-churn", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        result = predict_churn(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# This runs the server
if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5050)
