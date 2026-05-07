# AI-Powered Business Intelligence Web Application

A Business Intelligence (BI) web application designed for non-technical business users to analyze datasets, generate automated visualizations, and receive AI-powered recommendations.

---

# Project Overview

This project aims to simplify the data analysis process and encourage non-technical Small and Medium-sized Enterprises (SMEs) to use Business Intelligence tools.

Users can upload Excel datasets containing standard business-related columns such as date, product, category, price, and quantity. The system performs automated data cleaning and preprocessing before displaying insights through an interactive visualization dashboard.

---

# Features

1. Upload Excel datasets for analysis.
2. AI-powered column mapping to identify standard business-related columns automatically.
3. Data cleaning pipeline categorizes records into:
   - Critical
   - Warning
   - Valid / Informational
4. Users can review, edit, save, or delete dataset rows.
5. AI-assisted correction suggestions for warning records.
6. Users can validate and confirm cleaned data rows.
7. Interactive dashboard with KPIs and visual analytics.
8. AI-generated explanations and business recommendations.
9. Chatbot support for asking dataset-related questions using natural language.

---

# System Architecture

<img width="870" height="344" alt="System Architecture" src="https://github.com/user-attachments/assets/d401281d-3f39-4d5a-a229-5b31f7504a38" />

---

# Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Backend Framework | Laravel | REST API, business logic, routing |
| Backend Language | PHP | Server-side scripting |
| Frontend Framework | React | User interface and dashboard |
| Database | PostgreSQL | Data storage and querying |
| Data Processing | Python / Pandas | Data cleaning and KPI computation |
| AI Microservice | FastAPI / Uvicorn | Python HTTP service layer |
| AI Intelligence | OpenAI API (GPT-4) | AI summaries, chatbot, recommendations |
| IDE | Visual Studio Code | Code editing and debugging |
| API Testing | Postman | API endpoint testing |

---

# Screenshots
Data Cleaning Board
<img width="1794" height="889" alt="critical" src="https://github.com/user-attachments/assets/5676bd3c-ff55-4981-9763-c324f0dc7a36" />


Data Visualization Board
<img width="1794" height="889" alt="ai summery" src="https://github.com/user-attachments/assets/4daf28fa-4856-44d5-81a0-08bfd377349e" />
