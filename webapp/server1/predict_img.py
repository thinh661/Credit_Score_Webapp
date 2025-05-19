import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import pandas as pd
import os

import uuid


model_path = os.path.join('..', '..', 'model', 'best_rf_model.pkl')
model = joblib.load(model_path)


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


csv_file_path = os.path.join('..', '..', 'hmeq_with_scores.csv')
df_csv = pd.read_csv(csv_file_path)

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


feature_order = [
    "LOAN", "MORTDUE", "VALUE", "YOJ", "DEROG", "DELINQ", "CLAGE",
    "NINQ", "CLNO", "DEBTINC",
    "JOB_Mgr", "JOB_Office", "JOB_Other", "JOB_ProfExe", "JOB_Sales", "JOB_Self",
    "REASON_DebtCon", "REASON_HomeImp", "REASON_Other reason"
]



pd.set_option('future.no_silent_downcasting', True)

def pre_processing(data):
    df = pd.DataFrame([data])

    for column, median_value in median_values.items():
        if column in df.columns:
            df[column] = df[column].fillna(median_value)
        else:
            df[column] = median_value

    # Xử lý JOB
    job_mapping = {
        "Mgr": 0,
        "Office": 0,
        "Other": 0,
        "ProfExe": 0,
        "Sales": 0,
        "Self": 0
    }
    job_val = data.get("JOB") or "Other"
    if job_val not in job_mapping:
        job_val = "Other"
    job_mapping[job_val] = 1
    df["JOB_Mgr"] = job_mapping["Mgr"]
    df["JOB_Office"] = job_mapping["Office"]
    df["JOB_Other"] = job_mapping["Other"]
    df["JOB_ProfExe"] = job_mapping["ProfExe"]
    df["JOB_Sales"] = job_mapping["Sales"]
    df["JOB_Self"] = job_mapping["Self"]

    # Xử lý REASON
    reason_mapping = {
        "DebtCon": 0,
        "HomeImp": 0,
        "Other reason": 0
    }
    reason_val = data.get("REASON") or "Other reason"
    if reason_val not in reason_mapping:
        reason_val = "Other reason"
    reason_mapping[reason_val] = 1
    df["REASON_DebtCon"] = reason_mapping["DebtCon"]
    df["REASON_HomeImp"] = reason_mapping["HomeImp"]
    df["REASON_Other reason"] = reason_mapping["Other reason"]

    df = df.drop(["REASON", "JOB"], axis=1)
    df = df.reindex(columns=feature_order)  # Sắp xếp đúng thứ tự
    return df



def scale_score(p):
    factor = 25/np.log(2)
    offset = 600 - factor*np.log(50)
    val = (1-p)/p
    score = offset + factor * np.log(val)
    score = score + 150
    return round(max(0, min(score, 750)))

def process_input(data):
    # Chỉ giữ lại các cột cần thiết cho model
    allowed_keys = set(required_fields + ["REASON", "JOB"])
    clean_data = {k: v for k, v in data.items() if k in allowed_keys}

    if clean_data.get('VALUE') is None:
        clean_data['VALUE'] = clean_data.get('LOAN', 0)

    df = pre_processing(clean_data)

    predicted_probability = model.predict_proba(df)[:, 1]
    score = scale_score(predicted_probability[0])

    result = {
        'credit_score': score,
        'value': clean_data['VALUE']
    }
    return result


def read_loans_with_status():
    folder = os.path.join('..', 'data')

    def load_file(file_name, status):
        path = os.path.join(folder, file_name)
        if os.path.exists(path):
            try:
                df = pd.read_csv(path)
                if df.empty or df.shape[1] == 0:
                    return pd.DataFrame()  # Không có cột hợp lệ
                df["Trạng thái"] = status
                return df
            except pd.errors.EmptyDataError:
                print(f"[WARN] File {file_name} rỗng.")
                return pd.DataFrame()
        else:
            return pd.DataFrame()


    df_pending = load_file("pending_loans.csv", "Chờ duyệt")
    df_approved = load_file("approved_loans.csv", "Đã duyệt")
    df_rejected = load_file("rejected_loans.csv", "Từ chối")

    return pd.concat([df_pending, df_approved, df_rejected], ignore_index=True)


columns_to_return = [
    "id", "Score", "Tên", "CCCD", "LOAN", "VALUE", "Trạng thái"
]



required_fields_in_csv = ["CCCD", "LOAN", "VALUE"]





''' API for Admin'''
# Lấy chi tiết hồ sơ theo CCCD
# @app.route('/loan_detail/<cccd>', methods=['GET'])
# def loan_detail(cccd):
#     df_all = read_loans_with_status()
#     if 'CCCD' not in df_all.columns:
#         return jsonify({'error': 'Không có cột CCCD trong dữ liệu'}), 500

#     record = df_all[df_all['CCCD'].astype(str) == str(cccd)]
#     if record.empty:
#         return jsonify({'error': 'Không tìm thấy hồ sơ với CCCD đã nhập'}), 404

#     record = record.fillna('')
#     return jsonify(record.iloc[0].to_dict()), 200

# Lấy chi tiết hồ sơ theo ID
@app.route('/loan_detail_by_id/<record_id>', methods=['GET'])
def loan_detail_by_id(record_id):
    df_all = read_loans_with_status()
    if 'id' not in df_all.columns:
        return jsonify({'error': 'Không có cột id trong dữ liệu'}), 500

    record = df_all[df_all['id'].astype(str) == str(record_id)]
    if record.empty:
        return jsonify({'error': 'Không tìm thấy hồ sơ'}), 404

    record = record.fillna('')
    return jsonify(record.iloc[0].to_dict()), 200



# Lấy hồ sơ theo id
@app.route('/get_by_id/<record_id>', methods=['GET'])
def get_by_id(record_id):
    try:
        all_files = ['data/pending_loans.csv', 'data/approved_loans.csv', 'data/rejected_loans.csv']

        for file in all_files:
            if os.path.exists("..", file):
                df = pd.read_csv("..", file)
                df = df.fillna('')
                if 'id' in df.columns:
                    record = df[df['id'] == record_id]
                    if not record.empty:
                        return jsonify(record.to_dict(orient='records')), 200
        return jsonify([]), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Admin1 gửi & lưu hồ sơ
@app.route('/add_loan', methods=['POST'])
def add_loan():
    data = request.json
    if not data:
        return jsonify({'error': 'No input data'}), 400

    required_fields = ["CCCD", "LOAN", "VALUE",]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400
    
    data["id"] = str(uuid.uuid4())
    try:
        data.setdefault("REASON", "Other reason")
        data.setdefault("JOB", "Other")
        score_result = process_input(data)
        data["Score"] = score_result['credit_score']
        print(">> DEBUG SCORE:", data["Score"])
    except Exception as e:
        print(">> DEBUG SCORE ERROR:", e)
        data["Score"] = ''  # fallback nếu lỗi


    file_path = os.path.join("..", "data", "pending_loans.csv")
    df_new = pd.DataFrame([data])
    
    if os.path.exists(file_path):
        df_existing = pd.read_csv(file_path)
        df_all = pd.concat([df_existing, df_new], ignore_index=True)
    else:
        df_all = df_new

    df_all.to_csv(file_path, index=False)
    return jsonify({'message': 'Loan submitted and pending approval'}), 201


# Tải lên hồ sơ (csv)
@app.route('/upload_loans', methods=['POST'])
def upload_loans():
    if not request.json or not isinstance(request.json, list):
        return jsonify({'error': 'Input must be a JSON array'}), 400

    loans = request.json
    processed_loans = []

    for loan in loans:
        # Kiểm tra thiếu trường
        missing_fields = required_fields_in_csv - loan.keys()
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        # Chỉ giữ lại các trường hợp lệ
        cleaned_loan = {k: loan[k] for k in required_fields_in_csv if k in loan}

        cleaned_loan["id"] = str(uuid.uuid4())

        # Tính điểm tín dụng
        try:
            score_result = process_input(cleaned_loan)
            cleaned_loan["Score"] = score_result['credit_score']
        except Exception as e:
            print(">> DEBUG SCORE ERROR (UPLOAD):", e)
            cleaned_loan["Score"] = ''

        processed_loans.append(cleaned_loan)

    # Ghi vào file
    pending_path = os.path.join("..", "data", "pending_loans.csv")
    new_records = pd.DataFrame(processed_loans)

    if os.path.exists(pending_path):
        existing = pd.read_csv(pending_path)
        combined = pd.concat([existing, new_records], ignore_index=True)
    else:
        combined = new_records

    combined.to_csv(pending_path, index=False)

    return jsonify({'message': f'{len(processed_loans)} records uploaded'}), 201



# Dự đoán điểm tín dụng
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


# Xem danh sách hồ sơ 
@app.route('/pending_loans', methods=['GET'])
def get_pending_loans():
    file_path = os.path.join("..", "data", "pending_loans.csv")
    if not os.path.exists(file_path):
        return jsonify([]), 200

    df = pd.read_csv(file_path)
    df["Trạng thái"] = "Chờ duyệt"
    df = df.fillna('')
    if 'id' not in df.columns:
        return jsonify({'error': 'Thiếu cột id trong dữ liệu'}), 500

    df = df[[col for col in columns_to_return if col in df.columns]]
    return jsonify(df.to_dict(orient='records')), 200




# Xem danh sách hồ sơ dã duyệt
@app.route('/approved_loans', methods=['GET'])
def get_approved_loans():
    file_path = os.path.join("..", "data", "approved_loans.csv")
    if not os.path.exists(file_path):
        return jsonify([]), 200

    df = pd.read_csv(file_path)
    df["Trạng thái"] = "Đã duyệt"
    df = df.fillna('')
    if 'id' not in df.columns:
        return jsonify({'error': 'Thiếu cột id trong dữ liệu'}), 500

    df = df[[col for col in columns_to_return if col in df.columns]]
    return jsonify(df.to_dict(orient='records')), 200


# Xem danh sách hồ sơ đã từ chối
@app.route('/rejected_loans', methods=['GET'])
def get_rejected_loans():
    file_path = os.path.join("..", "data", "rejected_loans.csv")
    if not os.path.exists(file_path):
        return jsonify([]), 200

    df = pd.read_csv(file_path)
    df["Trạng thái"] = "Từ chối"
    df = df.fillna('')
    if 'id' not in df.columns:
        return jsonify({'error': 'Thiếu cột id trong dữ liệu'}), 500

    df = df[[col for col in columns_to_return if col in df.columns]]
    return jsonify(df.to_dict(orient='records')), 200



''' API bổ sung cho Admin2 '''

# Lấy danh sách hồ sơ theo CCCD
@app.route('/get_by_cccd/<int:cccd>', methods=['GET'])
def get_by_cccd(cccd):
    cccd = int(cccd)
    df_all = read_loans_with_status()
    if 'CCCD' not in df_all.columns:
        return jsonify({'error': 'Không có cột CCCD trong dữ liệu'}), 500

    record = df_all[df_all['CCCD'] == cccd]
    if record.empty:
        return jsonify({'error': 'Không tìm thấy hồ sơ với CCCD đã nhập'}), 404

    record = record.fillna('')

    # Lọc lại các cột cần trả về
    record = record[[col for col in columns_to_return if col in record.columns]]

    return jsonify(record.to_dict(orient='records')), 200

# Lấy ngẫu nhiên 20 hàng 
@app.route('/get_random_20', methods=['GET'])
def get_random_20():
    df_all = read_loans_with_status()
    if df_all.empty:
        return jsonify([]), 200

    df_sample = df_all.sample(n=min(20, len(df_all)))  # lấy tối đa 20 mẫu nếu đủ
    df_sample = df_sample[[col for col in columns_to_return if col in df_sample.columns]]
    df_sample = df_sample.fillna('')

    return jsonify(df_sample.to_dict(orient='records')), 200


# Sửa thông tin hồ sơ chờ duyệt
@app.route('/update_loan/<record_id>', methods=['PUT'])
def update_loan(record_id):
    data = request.json
    if not data:
        return jsonify({'error': 'Không có dữ liệu gửi lên'}), 400

    data_dir = os.path.join('..', 'data')
    file_list = ['pending_loans.csv', 'approved_loans.csv', 'rejected_loans.csv']
    updated = False

    for file_name in file_list:
        path = os.path.join(data_dir, file_name)

        if not os.path.exists(path):
            continue

        df = pd.read_csv(path)
        if 'id' not in df.columns:
            continue

        match_idx = df.index[df['id'].astype(str) == str(record_id)].tolist()
        if match_idx:
            i = match_idx[0]

            # Cập nhật thông tin trong record
            for key, val in data.items():
                if key in df.columns:
                    df.at[i, key] = val

            # Nếu có các cột liên quan đến tính điểm => tính lại Score
            if any(field in data for field in required_fields + ['JOB', 'REASON']):
                try:
                    updated_row = df.loc[i].to_dict()
                    score_result = process_input(updated_row)
                    df.at[i, 'Score'] = score_result['credit_score']
                except Exception as e:
                    print(">> DEBUG UPDATE SCORE ERROR:", e)

            df.to_csv(path, index=False)
            updated = True
            break

    if not updated:
        return jsonify({'error': 'Không tìm thấy hồ sơ cần cập nhật'}), 404

    return jsonify({'message': 'Cập nhật hồ sơ thành công'}), 200



# Duyệt / Từ chối hồ sơ
@app.route('/review_loan', methods=['POST'])
def review_loan():
    data = request.json
    record_id = data.get('id')
    decision = data.get('decision')  # 'approve' hoặc 'reject'

    if not record_id or decision not in ['approve', 'reject']:
        return jsonify({'error': 'Thiếu ID hoặc quyết định không hợp lệ'}), 400

    pending_path = os.path.join('..', 'data', 'pending_loans.csv')
    if not os.path.exists(pending_path):
        return jsonify({'error': 'Không tìm thấy file hồ sơ chờ duyệt'}), 404

    df_pending = pd.read_csv(pending_path)
    match = df_pending[df_pending['id'].astype(str) == str(record_id)]

    if match.empty:
        return jsonify({'error': 'Không tìm thấy hồ sơ'}), 404

    df_pending = df_pending[df_pending['id'].astype(str) != str(record_id)]
    df_pending.to_csv(pending_path, index=False)

    target_file = 'approved_loans.csv' if decision == 'approve' else 'rejected_loans.csv'
    target_path = os.path.join('..', 'data', target_file)

    if os.path.exists(target_path):
        df_target = pd.read_csv(target_path)
        df_target = pd.concat([df_target, match], ignore_index=True)
    else:
        df_target = match

    df_target.to_csv(target_path, index=False)
    return jsonify({'message': f'Hồ sơ đã được {decision} thành công'}), 200



# Lọc hồ sơ vay
@app.route('/filter_loans', methods=['GET'])
def filter_loans():
    loan_type = request.args.get('loan_type', 'pending')
    score_min = request.args.get('score_min', None)
    score_max = request.args.get('score_max', None)

    file_map = {
        'pending': 'pending_loans.csv',
        'approved': 'approved_loans.csv',
        'rejected': 'rejected_loans.csv',
    }
    if loan_type not in file_map:
        return jsonify({'error': 'Loại hồ sơ không hợp lệ'}), 400

    file_path = os.path.join('..', 'data', file_map[loan_type])
    if not os.path.exists(file_path):
        return jsonify([]), 200

    try:
        df = pd.read_csv(file_path)
    except pd.errors.EmptyDataError:
        # Trả về mảng rỗng nếu file trống
        return jsonify([]), 200

    # Kiểm tra có cột Score không
    if 'Score' not in df.columns:
        return jsonify({'error': 'Dữ liệu không có cột Score'}), 500

    try:
        score_min_val = float(score_min) if score_min is not None else float('-inf')
        score_max_val = float(score_max) if score_max is not None else float('inf')
    except ValueError:
        return jsonify({'error': 'Giá trị điểm không hợp lệ'}), 400

    df_filtered = df[(df['Score'] >= score_min_val) & (df['Score'] <= score_max_val)]

    df_filtered = df_filtered.fillna('')
    return jsonify(df_filtered.to_dict(orient='records')), 200



# Thống kê tổng hồ sơ
@app.route('/loan_stats', methods=['GET'])
def loan_stats():
    try:
        import os
        import pandas as pd

        base_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(base_dir, "..", "data")

        stats = {
            "Đã duyệt": 0,
            "Đã từ chối": 0,
            "Chờ duyệt": 0
        }

        approved_path = os.path.join(data_dir, "approved_loans.csv")
        rejected_path = os.path.join(data_dir, "rejected_loans.csv")
        pending_path = os.path.join(data_dir, "pending_loans.csv")

        if os.path.exists(approved_path):
            stats["Đã duyệt"] = len(pd.read_csv(approved_path))

        if os.path.exists(rejected_path):
            stats["Đã từ chối"] = len(pd.read_csv(rejected_path))

        if os.path.exists(pending_path):
            stats["Chờ duyệt"] = len(pd.read_csv(pending_path))

        return jsonify(stats), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == '__main__':
    app.run(debug=True)
