#(import pickle
import numpy as np

# Load the trained model
with open('server/ml/churn_model.pkl', 'rb') as f:
    model = pickle.load(f)

def predict_churn(customer_data):
    """Takes a customer_data dict and returns churn risk prediction."""
    features = np.array([[
        customer_data['avg_order_value'],
        customer_data['purchase_frequency'],
        customer_data['days_since_last_purchase'],
        customer_data['total_spent']
    ]])
    prediction = model.predict(features)
    probability = model.predict_proba(features)

    return {
        'churn_risk': int(prediction[0]),
        'confidence': round(float(max(probability[0])), 2)
    }

# Test block — only runs when this file is executed directly
if __name__ == "__main__":
    sample = {
        'avg_order_value': 30,
        'purchase_frequency': 3,
        'days_since_last_purchase': 45,
        'total_spent': 150
    }

    result = predict_churn(sample)
    print("Prediction Result:", result)
