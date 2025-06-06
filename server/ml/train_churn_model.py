import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle

# Sample training data
data = pd.DataFrame({
    'avg_order_value': [50, 20, 300, 10, 100, 85],
    'purchase_frequency': [10, 2, 1, 0, 4, 5],
    'days_since_last_purchase': [5, 60, 90, 120, 30, 15],
    'total_spent': [500, 40, 300, 10, 400, 420],
    'churned': [0, 1, 1, 1, 0, 0]
})

# Split features and target
X = data.drop('churned', axis=1)
y = data['churned']

# Train model
model = RandomForestClassifier()
model.fit(X, y)

# Save model to file
with open('server/ml/churn_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("✅ Model trained and saved to server/ml/churn_model.pkl")
