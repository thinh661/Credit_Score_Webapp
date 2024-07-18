# Credit-Score-Prediction-ML-Project

![Logo](https://github.com/thinh661/Credit_Score_Webapp/blob/master/image/credit_score.jpg)

## Table of Contents
- [Introduction](#introduction)
- [Project Phases](#project-phases)
- [Data Source](#data-source)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [EDA - Exploratory Data Analysis](#eda)
- [Data - Preprocessing](#pre-processing)
- [Build Model](#build-model)
- [Deploy Web Application](#deploy-webapp)

## Introduction
Welcome to the Credit Score Prediction - Machine Learning Project. This is a step-by-step Machine Learning project for Data Science. I'll start from EDA, Preprocessing, Building the Model, and finally Deploying the Web Application. The domain of this project focuses on Finance (Banking). The data used is based on customers' past credit history.

## Project Phases
1. **EDA -Exploratory Data Analysis**: In this phase, the data has been explored, analyzed for distribution, missing values, noise, etc., and the correlation between variables has also been calculated to provide an overview of the data.
2. **Pre-Processing**: Based on the data exploration and analysis in the previous step, we perform data preprocessing to facilitate the building of a prediction model. At the same time, test the data sets with some basic models to compare and provide the most stable data set.
3. **Build Model**: Build prediction models using machine learning algorithms such as KNN, Random Forest, Decision Tree, ...
4. **Deploy Web Application**: Build interfaces to serve end users, allowing them to visit the website and enter the necessary data fields to perform a credit score prediction.
5. **Report**

## Data Source
The source dataset for this project is the "HMEQ_dataset", which can be found [here](https://www.kaggle.com/datasets/ajay1735/hmeq-data).

## Technologies Used
- Python (Numpy,Pandas, Matplotlib,...)
- Sklearn (Build Model)
- ReactJS (Frontend)
- Flask (Backend)

## Getting Started
To explore and replicate the project, follow these steps:
1. Clone this repository to your local machine.
2. Setup the evn for the project (python, matplotlib, pandas, sklearn, ReactJS/Html/Css, Flask)
3. Follow the instructions in the respective folders for each project phase (EDA, Pre-processing, Build Model, Deploy) to set up and execute the code.

## EDA Phase
The steps of EDA: 
    - Summary (shape, describe,)
    - Check null, Outliner
    - Distribution
    - Data trend
    - Correlation and Skewness
    
And specifically about the source code in [here](https://github.com/thinh661/Credit_Score_Webapp/blob/master/EDA_hmeq.ipynb).

## Pre-processing Phase
The steps of Pre-processing:
    - Handling missing data
    - Handling outliner
    - Handling imbalance data (Can't do it)
    - Normalization (Scaling)
    - Reduction
        - PCA
        - Feature Selection
        - Feature Selection + PCA
    - Test datasets with various models to find the best stable dataset.

Specifically about the source code in [here](https://github.com/thinh661/Credit_Score_Webapp/blob/master/Preprocessing_hmeq.ipynb).


## Model Phase
Build models with 4 main machine learning algorithms:
    - Random Forest
    - Decision Tree
    - SVM
    - KNN

and tunning them for best validataion.

Specifically about the source code in this file and 4 models are saved in [here](https://github.com/thinh661/Credit_Score_Webapp/blob/master/build_model.ipynb).

## Deploy Phase
* In this phase, I'll build the Web Application for end users:
    * The frontend is built using the ReactJS framework.
    * GUI:
        ![GUI](https://github.com/thinh661/Credit_Score_Webapp/blob/master/image/GUI.png)
    * The backend is built using the Flask framework by writing RESTful APIs.
    * To test the api working properly, use the postman
        ![Postman](https://github.com/thinh661/Credit_Score_Webapp/blob/master/image/postman_test.png)

## Report

---

