# 🌐 MuscleMap: Bilingual Assessment Results & API Configuration Guide

This guide explains how the **Bilingual (English / हिंदी) Assessment Result & Voice Assistance** system works in MuscleMap, how bilingual records are saved to your assessment history, and **how you can provide external API keys** (such as Google Gemini AI and YouTube Data API) to enhance the system.

---

## 📌 Executive Summary

- **Selective Bilingual Support:** Per your requirement, the general interface (3D viewer, controls, headers) stays in English, while **the assessment results (and only the results)** have an intuitive **English | हिंदी (Hindi)** language toggle.
- **Persistent Assessment History:** When an assessment is analyzed, both English and Hindi results are automatically generated and permanently saved in SQLite (`pain_entries.result_hindi`). Reopening any session in `/history` or `/session/:id` retains the language toggle and displays in your preferred language.
- **Voice Assistance (Web Speech API):** 
  - In **English mode**: The audio assistant reads the assessment with English TTS (`en-US`).
  - In **Hindi mode**: The audio assistant switches speech synthesis to Hindi (`hi-IN`), automatically detecting and selecting installed Hindi voices (e.g., *Google हिन्दी*, *Microsoft Hemant/Kalpana*) and speaking the Hindi clinical report aloud.
- **Works 100% Out-of-the-Box (Zero API Key Required):** MuscleMap includes a built-in **Clinical Knowledgebase Translation Engine** covering all 19 body regions, dozens of muscle groups, evidence-based exercises, acupressure points, and risk warnings with zero downtime.
- **Optional External AI Polish:** You can provide your own **Google Gemini API Key** to enable live AI-driven reasoning and dynamic translations for custom clinical inputs.

---

## 🔑 How to Provide Your External API Keys

### 1. Google Gemini API Key (Recommended for Dynamic AI Insights & Translation)

#### Why is this needed?
The previous Gemini key in the repository was automatically revoked by Google because it was exposed in git history. MuscleMap gracefully fell back to its Clinical Knowledgebase rules. Providing your own private Gemini API key unlocks:
1. **Dynamic Generative AI Clinical Reasoning:** Real-time generation of custom insights tailored to unique pain profiles.
2. **AI-Powered Natural Hindi Nuances:** Context-aware translations of unique, free-form symptom descriptions.

#### How to get a Free Google Gemini API Key (Takes 1 Minute):
1. Visit **Google AI Studio**: [https://aistudio.google.com/](https://aistudio.google.com/)
2. Sign in with your standard Google Account.
3. Click the blue **"Get API key"** button on the top left.
4. Click **"Create API key"** (you can create it in a new Google Cloud project with one click).
5. Copy your generated key (it starts with `AIzaSy...`).

#### Where to put the key in MuscleMap:
1. Open the file: [`Backeknd/.env`](file:///c:/Users/prath/OneDrive/Desktop/Curious%20Parc/Curious%20Parc%20Finial/Curious%20Parc/Backeknd/.env)
2. Locate line 5:
   ```env
   GEMINI_API_KEY=AIzaSyDzyqciU0BZxWIknHHa8hGXv7y4k9pOjAs
   ```
3. Replace the old key with your new key:
   ```env
   GEMINI_API_KEY=AIzaSyYourNewActualKeyHere1234567890
   ```
4. Save the file.
5. That's it! When the backend server restarts or runs, it will immediately detect your valid key and switch from offline rules to Gemini AI!

---

### 2. YouTube Data API v3 Key (Optional for Guided Exercise Videos)

#### Why is this used?
MuscleMap searches for relevant physiotherapy exercise videos for each recommended exercise.
- **Without a key:** MuscleMap already automatically provides a clean YouTube web search fallback URL for every exercise (`https://www.youtube.com/results?search_query=...`).
- **With a key:** MuscleMap embeds specific video IDs directly with channel information and local caching.

#### How to get a YouTube Data API v3 Key:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **YouTube Data API v3** in "APIs & Services".
3. Create an API Key in "Credentials".
4. Open [`Backeknd/.env`](file:///c:/Users/prath/OneDrive/Desktop/Curious%20Parc/Curious%20Parc%20Finial/Curious%20Parc/Backeknd/.env) and update line 9:
   ```env
   YOUTUBE_API_KEY=AIzaSyYourYouTubeKeyHere
   ```
5. Save the file.

---

## 🛠️ Complete `.env` Reference File

Your [`Backeknd/.env`](file:///c:/Users/prath/OneDrive/Desktop/Curious%20Parc/Curious%20Parc%20Finial/Curious%20Parc/Backeknd/.env) should look like this:

```env
PORT=4000
DB_PATH=./musclemap.sqlite
ALLOWED_ORIGIN=http://localhost:5173
NODE_ENV=development
GEMINI_API_KEY=AIzaSyYourNewGeminiKeyHere
JWT_SECRET=m8K#vP2xQnL9rT4wZjA6sYcE1dF7hB3uMuscleMap2026!
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:5001
YOUTUBE_API_KEY=AIzaSyYourYouTubeKeyHere
```

---

## 🚀 How to Run and Test the System

### 1. Start the Backend Server:
Open a PowerShell / Command Prompt window:
```powershell
cd "c:\Users\prath\OneDrive\Desktop\Curious Parc\Curious Parc Finial\Curious Parc\Backeknd"
npm run dev
```
*(The backend runs on `http://localhost:4000` and will initialize the database schema with the new `result_hindi` column automatically).*

### 2. Start the Frontend Server:
Open a second PowerShell / Command Prompt window:
```powershell
cd "c:\Users\prath\OneDrive\Desktop\Curious Parc\Curious Parc Finial\Curious Parc\Frontend\musclemap-frontend"
npm run dev
```
*(The frontend runs on `http://localhost:5173`).*

---

## 🧪 Testing the Bilingual & Voice Assistant Features

1. **Perform an Assessment:**
   - Open `http://localhost:5173` in Google Chrome or Microsoft Edge.
   - Click on any body region (e.g. *Lower Back*, *Neck*, *Right Shoulder*).
   - Fill in the symptoms questionnaire and click **Submit Assessment**.

2. **Toggle Result Language:**
   - In the slide-out panel, look at the top of the Results section:
     ```
     🌐 Result Language / परिणाम की भाषा:  [ English ]  [ हिंदी (Hindi) ]
     ```
   - Click **हिंदी (Hindi)**.
   - Notice how all the clinical outputs instantaneously translate to clear Hindi:
     - **Muscles:** `इरेक्टर स्पाइनी (कमर की रीढ़ की मांसपेशी)`, `क्वाड्राटस लंबोरम...`
     - **Assessment Method:** `क्लीनिकल रूल्स इंजन`
     - **Personalized Clinical Insight:** `व्यक्तिगत क्लीनिकल सलाह`
     - **Recommended Exercises:** Exercise titles and instructions in Hindi.
     - **Recovery Tips:** `सुधार और देखभाल के उपाय`
     - **Acupressure Relief Points:** Detailed Hindi locations and self-care steps.
     - **Caution & Disclaimer:** Medical warnings in Hindi.

3. **Test Voice Assistance in Hindi & English:**
   - With **हिंदी (Hindi)** active, click **"▶ परिणाम बोलकर सुनें (Read Aloud)"**.
   - The browser's Web Speech API will synthesize the spoken report in Hindi (`hi-IN`).
   - If your browser has a Hindi TTS voice installed (e.g., *Google हिन्दी*, *Microsoft Kalpana* or *Hemant*), it will automatically speak with that natural voice.
   - Switch back to **English** and click **"▶ Read Results Aloud"** to hear the English report.
   - You can pause, resume, change playback speed (0.8x to 1.5x), or switch specific voices from the dropdown.

4. **Verify Assessment History Persistence:**
   - Click **History** in the top navigation or in the Assessment Panel tab.
   - Click **"View Details & 3D Model ↗"** on any past assessment.
   - The session detail page (`/session/:id`) loads with the bilingual toggle intact.
   - Switch between **English** and **हिंदी (Hindi)** to confirm that historical records retain full bilingual fidelity!
