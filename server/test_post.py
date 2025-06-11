import requests

response = requests.post(
    "https://7d501f1c-4167-438e-88b6-2f263ea35eef-00-s70ulz95a28b.worf.replit.dev/predict-churn",
    json={
        "avg_order_value": 30,
        "purchase_frequency": 3,
        "days_since_last_purchase": 45,
        "total_spent": 150
    }
)

print("Status Code:", response.status_code)
print("Raw Text:", response.text)