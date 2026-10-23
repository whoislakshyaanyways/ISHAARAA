# CogniSign — Sign Language Translator

A two-way sign language translator that runs entirely in the browser. Teach it your own
signs with a webcam, sign sentences that are spoken aloud, and watch a 3D avatar sign
typed or spoken text back. No video ever leaves your machine.

## Features

- **Sign → Speech** — train your own signs on the webcam, then sign sentences that are
  spoken aloud in **English, Hindi or Kannada**.
- **Text → Sign** — type or say a sentence and a **3D avatar** signs it, fingerspelling
  any word outside its dictionary.
- **Speech → Text** — live captions of what a hearing person says (en-IN / hi-IN / kn-IN).
- **Saved training** — trained signs are stored in the browser (IndexedDB) and restored
  after a reload.
- **Works offline** — model weights and three.js are bundled; recognition, training and
  the avatar need no internet.

## How it works

```
webcam ─► 227×227 crop ─► SqueezeNet features ─► KNN classifier ─► smoothed words ─► sentence ─► speech
text / speech ─► glosses ─► keyframed arm & hand poses (two-bone IK) ─► three.js avatar
```

- Recognition uses a **KNN classifier on SqueezeNet 1.1 features** (deeplearn.js). A word
  is accepted at ≥90% confidence held for 3 consecutive frames; 1.5 s of IDLE ends the
  sentence.
- Speech output uses the browser's **Web Speech API** (speech synthesis + recognition).
- The avatar (`avatar.js`) poses each hand by target position and orientation and solves
  the arm with two-bone inverse kinematics.

## Getting started

**Requirements:** [Node.js](https://nodejs.org/) and **Google Chrome**.

On Windows, double-click **`start-demo.bat`** (installs dependencies on first run, then
opens the browser). Or from a terminal:

```bash
npm install
npm start
```

Open [http://localhost:9966](http://localhost:9966) in Chrome and allow camera and
microphone access.

| Script          | What it does                                            |
| --------------- | ------------------------------------------------------- |
| `npm start`     | Dev server with live reload                             |
| `npm run demo`  | Dev server that opens the browser automatically         |
| `npm run build` | Rebuilds `dist/build.js` from `main.js`                 |

`avatar.js` is loaded directly as an ES module and needs no build step.

## Usage

1. **Train** — start the camera, then hold **Record** next to each word while performing
   its sign (30+ examples each). Record **IDLE** with your hands down. **Reset all
   training** (click twice) clears everything.
2. **Sign → Speech** — sign words one after another; pause on IDLE to finish and speak
   the sentence. Optionally listen for a spoken reply.
3. **Text → Sign** — 38-sign dictionary (greetings, questions, needs, places, NAMASTE…),
   English plus common Hindi/Kannada words. Helper words (is, the, a…) are dropped and
   other English words are fingerspelled. Drag the avatar to rotate it.
4. **Speech → Text** — live transcription; **Sign this** sends it to the avatar.
5. **Model** — vocabulary, example counts and installed voices.

## Project structure

```
├── index.html          # App shell and tabs
├── style.css           # UI styles
├── main.js             # Camera, training, KNN prediction, speech (bundled to dist/)
├── avatar.js           # three.js signing avatar and sign dictionary
├── dist/build.js       # Browserify bundle of main.js
├── weights/            # Bundled SqueezeNet 1.1 weights (offline use)
├── vendor/three/       # Bundled three.js
└── start-demo.bat      # One-click launcher for Windows
```

## Notes

- Speech recognition uses Chrome's online service and needs internet; web fonts fall
  back to system fonts offline.
- If a language shows ✗ on the Model tab, install its voice in Windows Settings →
  Time & language → Speech, then restart Chrome.
- Avatar signs are illustrative approximations and have not been validated by a native
  ISL signer.

## Credits

Built on the [Alexa sign language translator](https://github.com/shekit/alexa-sign-language-translator)
by Abhishek Singh (KNN classifier on SqueezeNet features), extended with the CogniSign
interface, multilingual speech, saved training and the 3D signing avatar.

Third-party licences: three.js (MIT, `vendor/three/LICENSE`).
