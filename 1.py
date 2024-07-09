import pandas as pd

file_path = 'D:\WorkSpace_Thinh1\FSS\hmeq.csv'
data = pd.read_csv(file_path)

descriptive_stats = data.describe(include='all')
missing_values = data.isnull().sum()

stats_summary = pd.DataFrame(descriptive_stats)
stats_summary['Missing Values'] = missing_values

stats_summary.T 

numeric_columns = data.select_dtypes(include=['number']).columns

for col in numeric_columns:
    median_value = data[col].median()
    data[col].fillna(median_value, inplace=True)

missing_values_after_imputation = data[numeric_columns].isnull().sum()
missing_values_after_imputation

data["REASON"] = data["REASON"].fillna("Other reason")
data['JOB'] = data['JOB'].fillna(data['JOB'].mode()[0])

categorical_columns = data.select_dtypes(include=['object']).columns

missing_values_after_imputation_categorical = data[categorical_columns].isnull().sum()
missing_values_after_imputation_categorical

import matplotlib.pyplot as plt
import seaborn as sns


sns.set(style="whitegrid")
numeric_cols_to_analyze = ['LOAN', 'MORTDUE', 'VALUE', 'DEBTINC']


fig, axes = plt.subplots(nrows=2, ncols=2, figsize=(15, 10))
axes = axes.flatten() 

for i, col in enumerate(numeric_cols_to_analyze):
    sns.histplot(data[col], ax=axes[i], kde=True, color='skyblue')
    axes[i].set_title(f'Distribution of {col}', fontsize=14)
    axes[i].set_xlabel(col)
    axes[i].set_ylabel('Frequency')

plt.tight_layout()
plt.show()

plt.figure(figsize=(6, 4))
sns.countplot(x='BAD', data=data)
plt.title('Distribution of BAD (Target Variable)')
plt.show()

fig, axes = plt.subplots(nrows=1, ncols=3, figsize=(18, 5))

sns.boxplot(x='BAD', y='LOAN', data=data, ax=axes[0])
axes[0].set_title('LOAN vs BAD')

sns.boxplot(x='BAD', y='MORTDUE', data=data, ax=axes[1])
axes[1].set_title('MORTDUE vs BAD')

sns.boxplot(x='BAD', y='VALUE', data=data, ax=axes[2])
axes[2].set_title('VALUE vs BAD')

plt.tight_layout()
plt.show()

correlation_matrix = data[numeric_columns].corr()

# heatmap korelasi
plt.figure(figsize=(12, 8))
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', fmt=".2f")
plt.title("Correlation Matrix of Numeric Features")
plt.show()

correlations_with_bad = correlation_matrix['BAD'].sort_values(ascending=False)

correlations_with_bad

data_encoded = pd.get_dummies(data, columns=['JOB', 'REASON'])
data_encoded.head()

X = data_encoded.drop('BAD', axis=1)
y = data_encoded['BAD']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
X_train_smote, y_train_smote = X_train,y_train

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve, auc
import numpy as np
import matplotlib.pyplot as plt

rf_model = RandomForestClassifier(random_state=42)
rf_model.fit(X_train_smote, y_train_smote)

y_pred_rf = rf_model.predict(X_test)

rf_report = classification_report(y_test, y_pred_rf, output_dict=True)
rf_confusion_matrix = confusion_matrix(y_test, y_pred_rf)
rf_roc_auc = roc_auc_score(y_test, rf_model.predict_proba(X_test)[:, 1])

rf_metrics = {
    'F1-score': rf_report['weighted avg']['f1-score'],
    'Precision': rf_report['weighted avg']['precision'],
    'Recall': rf_report['weighted avg']['recall'],
    'Accuracy': rf_report['accuracy'],
    'ROC AUC': rf_roc_auc
}

plt.figure(figsize=(14, 10))

metrics_df = pd.DataFrame([rf_metrics], index=['Random Forest'])

plt.subplot(2, 2, 1)
sns.heatmap(rf_confusion_matrix, annot=True, fmt="d", cmap='Blues')
plt.title("Confusion Matrix for Random Forest")
plt.ylabel('Actual label')
plt.xlabel('Predicted label')

plt.subplot(2, 2, 2)
fpr, tpr, _ = roc_curve(y_test, rf_model.predict_proba(X_test)[:, 1])
plt.plot(fpr, tpr, color='orange', label=f'ROC curve (area = {rf_roc_auc:.2f})')
plt.plot([0, 1], [0, 1], color='darkblue', linestyle='--')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic (ROC) Curve')
plt.legend()

plt.subplot(2, 2, 3)
sns.heatmap(metrics_df, annot=True, cmap='coolwarm', fmt=".2f")
plt.title("Evaluation Metrics Heatmap for Random Forest")

plt.subplot(2, 2, 4)
sns.histplot(rf_model.predict_proba(X_test)[:, 1], kde=True, color='green', bins=20)
plt.title('Distribution of Prediction Probabilities')
plt.xlabel('Predicted Probability')
plt.ylabel('Frequency')

plt.tight_layout()
plt.show()
print(rf_metrics)

