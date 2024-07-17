import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import pandas as pd

model = joblib.load(r'D:\WorkSpace_Thinh1\FSS\model\best_rf_model.pkl')

app = Flask(__name__)
CORS(app)

required_fields = ["LOAN", "MORTDUE", "VALUE", "YOJ", "DEROG", "DELINQ", "CLAGE", "NINQ", "CLNO", "DEBTINC"]

median_values = {
    "LOAN": 0,
    "MORTDUE": 65019,
    "VALUE": 89235,
    "YOJ": 7,
    "DEROG": 0,
    "DELINQ": 0,
    "CLAGE": 173,
    "NINQ": 1,
    "CLNO": 20,
    "DEBTINC": 34.8
}
pd.set_option('future.no_silent_downcasting', True)

def pre_processing(data):
    df = pd.DataFrame([data])
    
    for column, median_value in median_values.items():
        
        if column in df.columns:
            df[column] = df[column].fillna(median_value)
        else:
            df[column] = median_value
            
    job_mapping = {
        "Mgr": 0,
        "Office": 0,
        "Other": 0,
        "ProfExe": 0,
        "Sales": 0,
        "Self": 0
    }
    job_mapping[data.get("JOB", "Other")] = 1
    df["JOB_Mgr"] = job_mapping["Mgr"]
    df["JOB_Office"] = job_mapping["Office"]
    df["JOB_Other"] = job_mapping["Other"]
    df["JOB_ProfExe"] = job_mapping["ProfExe"]
    df["JOB_Sales"] = job_mapping["Sales"]
    df["JOB_Self"] = job_mapping["Self"]
    
    reason_mapping = {
        "DebtCon": 0,
        "HomeImp": 0,
        "Other reason": 0
    }
    reason_mapping[data.get("REASON", "Other reason")] = 1
    df["REASON_DebtCon"] = reason_mapping["DebtCon"]
    df["REASON_HomeImp"] = reason_mapping["HomeImp"]
    df["REASON_Other reason"] = reason_mapping["Other reason"]
    return df.drop(["REASON", "JOB"], axis=1)



def scale_score(p):
    factor = 25/np.log(2)
    offset = 600 - factor*np.log(50)
    val = (1-p)/p
    score = offset + factor * np.log(val)
    score = score + 150
    return round(max(0, min(score, 750)))


def process_input(data):
    if data['VALUE'] is None:
        res_value = data['LOAN']
    else:
        res_value = data['VALUE']
    df = pre_processing(data=data)

    predicted_probability = model.predict_proba(df)[:, 1]
    predicted_class = model.predict(df)

    score = scale_score(predicted_probability[0])
    
    result = {
        'credit_score': score,
        'value': res_value
    }
    return result

@app.route('/predict', methods=['POST'])
def predict():
    if not request.json:
        return jsonify({'error': 'No input data provided'}), 400

    missing_fields = [field for field in required_fields if field not in request.json]
    
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    input_data = request.json
    result = process_input(input_data)

    return jsonify(result), 201

if __name__ == '__main__':
    app.run(debug=True)
