# SignBridge — macOS Local Runbook

This guide contains everything you need to run, test, and use the SignBridge Bi-Directional Sign Language Translator on your Mac.

---

## 1. Setup Status (Completed)

All environment setup and bug fixes have been completed:
- **Python Runtime:** Python 3.11.17 isolated in `.venv/`.
- **TFLite Classifier:** Powered by TensorFlow 2.16.2; verified at **5.0 ms** inference latency.
- **Normalization Invariant Suite:** 25/25 unit tests passing (`pytest tests/test_normalisation.py`).
- **Speech-to-Text:** OpenAI Whisper (`base.en`) installed with bundled `ffmpeg` binary.
- **Code Fixes:**
  - Created missing `assets/signs_gifs/words/` directory.
  - Hardened `signbridge/Gloss.py` to prevent import crashes and gracefully fall back to native browser speech synthesis.
  - Updated `signbridge/whisper_stt.py` to automatically discover bundled virtual environment binaries.
  - Configured safe default binding to `127.0.0.1` (configurable via `HOST` environment variable).

---

## 2. Starting the Application

To launch the server, open your terminal in this repository folder and run:

```bash
# 1. Activate the Python 3.11 virtual environment
source .venv/bin/activate

# 2. Start the server
python app.py
```

*Alternatively, run in one line without manual activation:*
```bash
./.venv/bin/python app.py
```

### Expected Startup Output
```
[INIT] Loading model and MediaPipe
[TFLITE] Loaded models/tflite/action_native_fp16.tflite
[TFLITE] Input  [  1  30 126] float32
[TFLITE] Output [ 1 32]
[ML] Classifier loaded
[INIT] Loading Whisper
[INIT] Whisper ready — speech stays on this machine
[READY] http://localhost:5001
[READY] On this network: http://127.0.0.1:5001
```

---

## 3. Opening the Web Interface

1. Open your web browser (Google Chrome or Safari recommended) to:
   **http://localhost:5001**
2. When prompted by the browser, click **Allow** for:
   - **Camera access** (required for hand landmark tracking)
   - **Microphone access** (required for speech-to-sign transcription)

---

## 4. How to Test Each Feature

### A. Sign to Speech (Webcam $\rightarrow$ Spoken Voice)
1. Select the **Sign to Speech** tab.
2. Click **Start Camera**. Your video feed will appear with hand skeleton tracking.
3. Hold your hand in an **"A"** fist (closed fist with thumb alongside index finger) and hold still for ~1 second.
4. Watch the four gate indicators on the instrument panel:
   - **G1 (Hand Presence):** Turns green (`One` or `Two`).
   - **G2 (Motion Settle):** Turns green (`Steady`) once your hand stops moving.
   - **G3 (Confidence):** Turns green once confidence clears $\ge 92\%$.
   - **G4 (Confidence Gap):** Turns green once leading prediction is $\ge 25\%$ clear of runner-up.
5. Token `A` will appear as a chip in the **Sign Buffer**.
6. Click **⚡ Convert to Sentence** (`btnSay`). The browser's native text-to-speech voice will read the sentence aloud.

### B. Speech to Sign (Microphone $\rightarrow$ Sign Animations)
1. Select the **Speech to Sign** tab.
2. Click **Record**. The button status will change to *Listening*.
3. Speak clearly into your microphone: *"Hello"* or *"A B C"*.
4. Click **Stop recording**.
5. Whisper will transcribe the audio on CPU (typically within 1–2 seconds).
6. The stage window will sequentially play the corresponding animated ASL sign GIFs.
7. *Tip:* You can also type text directly into the input box below the player and press Enter.

### C. ASL Knowledge Base & AI Tutor
1. Select the **Learn** tab.
2. In the chat box, type: *"Show me Hello"* or *"Show me A"*.
3. The tutor will provide the authentic ASL reference details (handshape, movement, location) and display the sign demonstration.

### D. Optional: Multi-Device LAN Rooms
If you wish to test real-time communication between two devices on the same Wi-Fi network:
```bash
HOST=0.0.0.0 python app.py
```
Open the LAN IP address displayed in the console on the second device, create a room on Device 1, and join using the 5-character room code on Device 2.

---

## 5. Stopping the Application

- In your terminal window, press:
  **`Ctrl + C`**
- To exit the virtual environment:
  ```bash
  deactivate
  ```
