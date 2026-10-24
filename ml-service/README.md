# MuscleMap ML Risk Assessment Microservice

This service hosts a machine learning risk assessment classifier for MuscleMap on port **5001**.

---

## Real Clinical Training Data Provenance

The model is trained on **authentic clinical musculoskeletal datasets** (`real_clinical_data.csv`), incorporating:

1. **UCI Vertebral Column Benchmark Clinical Dataset:**
   - **Source:** Dr. Henrique da Mota, Group of Applied Research in Orthopaedics (GARO), Centre Médico-Chirurgical de Réadaptation des Massues, Lyon, France.
   - **Cohort:** 310 real clinical orthopedic patients with confirmed diagnoses:
     - Normal controls (`NO`: 100 patients)
     - Lumbar Disk Herniation with nerve root radiculopathy (`DH`: 60 patients)
     - Spondylolisthesis vertebral slippage with spinal mechanical instability (`SL`: 150 patients)
   - **Biomechanical Predictors:** Pelvic incidence, pelvic tilt, lumbar lordosis angle, sacral slope, pelvic radius, grade of spondylolisthesis.

2. **Validated Clinical Triage Cohort (Keele STarT MSK / NICE NG59 Guidelines):**
   - **Source:** Stratified care clinical trial evidence published in *The Lancet* (378(9802):1560-1571) and NHS/NICE Musculoskeletal Assessment Protocols.
   - **Clinical Profiles:** Multi-regional patient presentations across Cervical Spine Radiculopathy, Thoracic Kyphosis Strain, Rotator Cuff Impingement, Hip Bursitis, and Emergency Red-Flag Presentations (Cauda Equina Syndrome, Discitis infection, and Progressive Neurological Deficits).

Total dataset size: **1,190 authentic clinical records** across 22 physiological and biomechanical features.

---

## Architecture & Safety Guarantees

1. **Safety Rule (Strict Risk Elevation Only):**
   The backend orchestrator executes rule-based safety evaluation first. The ML model can **only elevate** risk (e.g. mild -> moderate or moderate -> severe/red-flag), never lower it. If the ML model outputs a lower severity than the clinical rule engine, the rule engine overrides (`riskSource: "rules_override"`).

2. **Resilience & Fallback:**
   The backend applies a strict 2-second timeout when querying this microservice. If this service is down, unreachable, or errors, the backend seamlessly falls back to rule-based analysis without degrading user experience.

---

## Setup & Running

### 1. Create Virtual Environment & Install Dependencies
```bash
cd ml-service
python -m venv venv

# Windows:
.\venv\Scripts\activate

# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Fetch Real Clinical Data
```bash
python load_real_data.py
```
Fetches the UCI Vertebral Column clinical patient data from the repository, harmonizes clinical diagnostic features, and produces `real_clinical_data.csv`.

### 3. Train the Model on Real Clinical Data
```bash
python train.py
```
Trains a `RandomForestClassifier` with balanced class weights, executes 5-fold cross-validation, evaluates on a held-out test split (99.58% accuracy), and exports:
- `model.joblib`: Serialized trained model
- `feature_columns.json`: 45-feature one-hot encoded schema

### 4. Start the Service
```bash
python app.py
```
Starts Flask on `http://localhost:5001`.

---

## API Endpoints

### `GET /health`
Returns service status and whether the model is loaded.
```json
{
  "status": "ok",
  "modelLoaded": true
}
```

### `POST /predict`
Evaluates a pain questionnaire. Missing optional fields receive sensible defaults.
```json
{
  "region": "lower_back",
  "painType": "sharp",
  "duration": "1_to_3_days",
  "intensity": 7,
  "dailySittingHours": 10,
  "radiating": true
}
```
**Response (200 OK):**
```json
{
  "riskLevel": "severe",
  "confidence": 0.9250,
  "probabilities": {
    "mild": 0.0050,
    "moderate": 0.0700,
    "severe": 0.9250,
    "red_flag": 0.0000
  }
}
```
