# SignBridge Unified — Dual-Engine Sign Language System Runbook

This guide covers everything you need to run, test, and use the unified **SignBridge + CogniSign** system.

---

## 1. What is SignBridge Unified?

SignBridge Unified combines the best capabilities of **SignBridge** (Production ASL model, MediaPipe, TFLite, Whisper, and AI Tutor) and **CogniSign** (Interactive 3D Three.js Avatar, Webcam Few-Shot Custom Sign Trainer, and Multilingual Speech Synthesis):

| Feature | Engine / Tech | What it does |
| :--- | :--- | :--- |
| **1 · Sign to Speech (ASL Model)** | MediaPipe Holistic + TFLite (`action_native_fp16.tflite`) | 32 ASL classes + alphabet recognition with 4 confidence gates, distance-invariant normalization, sentence assembly, and text-to-speech. |
| **2 · Custom Sign Trainer** | SqueezeNet 1.1 + KNN Classifier + IndexedDB *(from CogniSign)* | Record custom gestures with your webcam on the fly (30+ frames). Persists in browser storage and detects signs with multilingual output in English, Hindi, and Kannada. |
| **3 · Speech to Sign (Dual Display)** | OpenAI Whisper (Offline on-device) + Three.js Avatar & ASL GIFs | Transcribe spoken words with Whisper or browser STT. Display animations via **3D Avatar**, **ASL GIFs**, or **Side-by-Side**! |
| **4 · 3D Avatar Studio** | Three.js + Two-Bone Arm Inverse Kinematics *(from CogniSign)* | Interactive 3D humanoid avatar with 15-joint hands, 38-gloss dictionary, fingerspelling, speed slider (0.6×–1.25×), and orbit controls. |
| **5 · Learn (ASL Tutor)** | Local AI Tutor Chat + Knowledge Base | Interactive conversational tutor that provides sign advice, demonstration GIFs, and webcam practice mode with verification. |
| **6 · Live Session** | WebSockets + Eventlet + QR Code Pairing | Real-time two-way communication between two devices on Wi-Fi using a 5-letter room code or camera QR scan. |
| **7 · History** | In-Memory Session Event Log | Real-time chronological audit trail of all detected signs and spoken phrases with confidence metrics. |

---

## 2. Quick Start

### Start Server
From the `SignBridge-Unified` directory:

```bash
cd /Users/lakshya/Downloads/SignBridge-Unified

# Run on port 5002 (or customize with PORT=...)
PORT=5002 ./.venv/bin/python app.py
```

### Accessing the Web App
Open **Google Chrome** to:
👉 **http://localhost:5002**

Allow camera and microphone permissions when prompted.

---

## 3. Tab-by-Tab Usage Guide

### Tab 1: Sign to Speech (ASL Model)
- Click **Start camera**. Hold your hand in frame and form an ASL sign or letter.
- The 4 instrument gates will monitor: *Hands in frame*, *Hand settled*, *Confidence*, and *Clear of runner-up*.
- The invariance scopes compare the raw camera coordinates against the distance-normalized vector.
- Click **Build sentence** to assemble words into grammatically correct English and speak aloud.

### Tab 2: Custom Sign Trainer & Recognition
- **Train Custom Signs:** Click **Start camera** on the custom camera card. Hold **Record** next to any word while performing your custom sign (aim for 30+ frames). Record **IDLE** with hands down.
- **Add Words:** Type new words in English, Hindi, or Kannada script and click **Add**.
- **Run Recognition:** Click **Start predicting** to recognize your custom signs with live confidence bar and multi-frame stabilization.

### Tab 3: Speech to Sign (Dual Display Mode)
- Choose your preferred display toggle:
  - **3D Avatar:** Animates the full Three.js 3D avatar with continuous arm/finger IK.
  - **ASL GIFs:** Displays animated demonstration GIFs.
  - **Side by Side:** Renders both the 3D Avatar and ASL GIFs simultaneously!
- Click **Record audio** to speak into your microphone (transcribed by local Whisper), or type a sentence and click **Sign it**.

### Tab 4: 3D Avatar Studio
- Type any phrase or click **Dictate** to speak in English, Hindi, or Kannada.
- Drag the 3D viewport to orbit around the avatar; double-click to face front.
- Click any gloss in the 38-sign dictionary to test its animation immediately. Unknown words are automatically fingerspelled.

### Tab 5: Learn (ASL Tutor)
- Type questions in the chat, e.g., *"How do I sign thank you?"* or *"Teach me hello"*.
- The tutor explains the handshape and movement, presents a demonstration GIF, and initiates a live practice session to verify your execution.

### Tab 6: Live Sessions
- Click **Open Session** to create a private room code and QR code.
- Another person on the same Wi-Fi network can scan the QR code with their phone to connect. One can sign to the camera while the other speaks!

---

## 4. Verification & Testing

To run the unit tests:
```bash
./.venv/bin/pytest tests/test_normalisation.py
```
25/25 unit tests verify that hand normalisation remains invariant across distances.
