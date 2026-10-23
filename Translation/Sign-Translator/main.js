// CogniSign (browser demo)
// webcam -> 227x227 crop -> SqueezeNet features -> KNN -> smoothed words -> sentence -> speech
// Launch in kiosk mode:
// "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --app=http://localhost:9966

import {KNNImageClassifier} from 'deeplearn-knn-image-classifier';
import * as dl from 'deeplearn';

// ---------------------------------------------------------------- config
const IMAGE_SIZE = 227        // SqueezeNet input size. Must be 227.
const TOPK = 10               // K value for KNN
const MAX_CLASSES = 40        // slots reserved up front so words can be added any time
const IDLE = 0                // class 0 is always the idle / not-signing class

const CONF_THRESHOLD = 0.9    // min KNN vote share to accept a word
const STABLE_FRAMES = 3       // consecutive agreeing predictions required
const SENTENCE_GAP_MS = 1500  // no confident sign for this long ends the sentence
const PREDICT_INTERVAL_MS = 100
const REPLY_CUTOFF_MS = 15000

const LANG_CODES = {en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN'}
const LANG_NAMES = {en: 'English', hi: 'Hindi', kn: 'Kannada'}

const DEFAULT_WORDS = ['hello', 'yes', 'no', 'thank you']

const $ = (s) => document.querySelector(s)

// ---------------------------------------------------------------- state
// slots[i] is the word for KNN class i (null once removed, so indices never shift)
const slots = ['IDLE'].concat(DEFAULT_WORDS)

let knn = null
let modelReady = false
let camOn = false
let recording = -1            // class index being recorded, -1 when none
let predicting = false
let predictBusy = false
let lastPredictAt = 0

let candidate = -1, candidateCount = 0
let lastAccepted = -1
let lastSignAt = 0
let buffer = []
let chipsStale = false
let pausedForReply = false

let processed = 0, fpsT = performance.now()

const cropCanvas = document.createElement('canvas')
cropCanvas.width = IMAGE_SIZE
cropCanvas.height = IMAGE_SIZE
const cropCtx = cropCanvas.getContext('2d')

// ---------------------------------------------------------------- helpers
function setStatus(text, cls){
  $('#statusText').textContent = text
  $('#dot').className = 'dot ' + (cls || '')
}

function showErr(id, msg){
  const box = $(id)
  box.innerHTML = ''
  if(!msg) return
  const div = document.createElement('div')
  div.className = 'err'
  div.textContent = msg
  box.appendChild(div)
}

function counts(){
  return knn ? knn.getClassExampleCount() : slots.map(() => 0)
}

function liveWords(){
  const out = []
  for(let i = 1; i < slots.length; i++){
    if(slots[i] !== null) out.push(i)
  }
  return out
}

function refreshStatus(){
  if(!modelReady) return setStatus('loading model', 'busy')
  if(!camOn) return setStatus('camera off', '')
  if(pausedForReply) return setStatus('listening for reply', 'busy')
  if(predicting) return setStatus('predicting', 'on')
  if(recording != -1) return setStatus('recording ' + slots[recording], 'on')
  setStatus('ready', 'on')
}

// ---------------------------------------------------------------- tabs
function showTab(name){
  document.querySelectorAll('nav button').forEach((b) => {
    b.setAttribute('aria-selected', b.dataset.tab == name ? 'true' : 'false')
  })
  document.querySelectorAll('.panel').forEach((p) => p.classList.remove('on'))
  const panel = $('#tab-' + name)
  panel.classList.add('on')

  // the camera card lives in whichever tab has a slot for it
  const slot = panel.querySelector('.slot')
  if(slot) slot.appendChild($('#cameraCard'))

  if(name == 'about') renderAbout()
  window.dispatchEvent(new CustomEvent('cognisign:tab', {detail: name}))
}

document.querySelectorAll('nav button').forEach((b) => {
  b.addEventListener('click', () => showTab(b.dataset.tab))
})

// ---------------------------------------------------------------- model
// SqueezeNet weights ship in ./weights so the demo works offline; the library
// hardcodes Google Cloud Storage, so requests are redirected to the local copy.
const REMOTE_WEIGHTS = 'https://storage.googleapis.com/learnjs-data/checkpoint_zoo/'
let useLocalWeights = true
const xhrOpen = XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function(method, url){
  const args = Array.prototype.slice.call(arguments)
  if(useLocalWeights && typeof url == 'string' && url.indexOf(REMOTE_WEIGHTS) == 0){
    args[1] = 'weights/' + url.slice(REMOTE_WEIGHTS.length)
  }
  return xhrOpen.apply(this, args)
}

function loadModel(){
  setStatus('loading model', 'busy')
  knn = new KNNImageClassifier(MAX_CLASSES, TOPK)
  knn.load()
  .then(() => {
    modelReady = true
    $('#modelFlag').textContent = 'ready'
    $('#modelFlag').className = ''
    refreshStatus()
    return restoreTraining()
  })
  .catch((err) => {
    console.log(err)
    if(useLocalWeights){
      console.log('local weights failed, trying the online copy')
      useLocalWeights = false
      return loadModel()
    }
    $('#modelFlag').textContent = 'failed'
    setStatus('model failed to load', 'err')
    showErr('#camErr', 'The recognition model could not be loaded. Check your internet connection and reload the page.')
  })
}

// ---------------------------------------------------------------- saved training
// Examples are kept in IndexedDB so a page reload during a demo doesn't lose them.
const DB_NAME = 'cognisign', DB_STORE = 'training', DB_KEY = 'v1'

function openDB(){
  return new Promise((resolve, reject) => {
    if(!window.indexedDB) return reject(new Error('no indexedDB'))
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function dbDo(mode, fn){
  return openDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, mode)
    const req = fn(tx.objectStore(DB_STORE))
    tx.oncomplete = () => {
      db.close()
      resolve(req && req.result)
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  }))
}

let saveTimer = null
function saveTraining(){
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if(!knn || !modelReady) return
    const c = counts()
    const classes = []
    slots.forEach((w, i) => {
      const m = knn.classLogitsMatrices[i]
      if(w !== null && c[i] > 0 && m) classes.push({i: i, n: c[i], data: new Float32Array(m.dataSync())})
    })
    dbDo('readwrite', (store) => store.put({slots: slots.slice(), classes: classes}, DB_KEY))
    .catch((err) => console.log('could not save training', err))
  }, 400)
}

function restoreTraining(){
  return dbDo('readonly', (store) => store.get(DB_KEY))
  .then((saved) => {
    if(!saved || !saved.slots) return
    slots.length = 0
    saved.slots.forEach((w) => slots.push(w))
    let total = 0
    saved.classes.forEach((cl) => {
      if(cl.i >= MAX_CLASSES || !cl.n) return
      knn.classLogitsMatrices[cl.i] = dl.tensor2d(cl.data, [cl.n, cl.data.length / cl.n])
      knn.classExampleCount[cl.i] = cl.n
      total += cl.n
    })
    knn.clearTrainLogitsMatrix()
    renderWords()
    if(total) showNote('#trainNote', 'Restored your saved training (' + total + ' examples).')
  })
  .catch((err) => console.log('could not restore training', err))
}

function showNote(id, msg){
  $(id).textContent = msg || ''
}

// ---------------------------------------------------------------- camera
const video = $('#vid')

$('#btnCam').addEventListener('click', () => {
  if(camOn) return stopCam()
  showErr('#camErr', '')
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    return showErr('#camErr', 'This browser cannot access a camera. Use the latest Chrome on http://localhost.')
  }
  navigator.mediaDevices.getUserMedia({video: {width: 640, height: 480, facingMode: 'user'}, audio: false})
  .then((stream) => {
    video.srcObject = stream
    return video.play()
  })
  .then(() => {
    camOn = true
    $('#btnCam').textContent = 'Stop camera'
    $('#btnCam').classList.add('stop')
    refreshStatus()
  })
  .catch((err) => {
    console.log(err)
    showErr('#camErr', 'Camera unavailable: ' + (err.message || err.name) +
      '. Check that no other app is using it and that the browser has permission.')
  })
})

function stopCam(){
  camOn = false
  stopRecording()
  setPredicting(false)
  if(video.srcObject) video.srcObject.getTracks().forEach((t) => t.stop())
  video.srcObject = null
  $('#btnCam').textContent = 'Start camera'
  $('#btnCam').classList.remove('stop')
  $('#fps').textContent = '-- fps'
  refreshStatus()
}

// centre-crop the frame to a square so the classifier always sees the same geometry
function grabFrame(){
  const vw = video.videoWidth, vh = video.videoHeight
  const s = Math.min(vw, vh)
  cropCtx.drawImage(video, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, IMAGE_SIZE, IMAGE_SIZE)
  return dl.fromPixels(cropCanvas)
}

// ---------------------------------------------------------------- main loop
function loop(){
  requestAnimationFrame(loop)

  const now = performance.now()
  if(now - fpsT > 1000){
    if(camOn) $('#fps').textContent = processed + ' fps'
    processed = 0
    fpsT = now
  }

  if(!camOn || !modelReady || video.readyState < 2) return

  if(recording != -1){
    const image = grabFrame()
    knn.addImage(image, recording)
    image.dispose()
    processed++
    updateCount(recording)
    return
  }

  if(predicting && !pausedForReply){
    if(!predictBusy && now - lastPredictAt >= PREDICT_INTERVAL_MS){
      lastPredictAt = now
      predictOnce()
    }
    checkSentenceEnd(now)
  }
}

function predictOnce(){
  const total = counts().reduce((a, b) => a + b, 0)
  if(total == 0) return

  predictBusy = true
  const image = grabFrame()
  knn.predictClass(image)
  .then((res) => {
    processed++
    if(predicting && !pausedForReply) onPrediction(res.classIndex, res.confidences[res.classIndex] || 0)
  })
  .catch((err) => console.log(err))
  .then(() => {
    image.dispose()
    predictBusy = false
  })
}

// ---------------------------------------------------------------- smoothing
function onPrediction(cls, conf){
  const name = cls >= 0 && slots[cls] !== null ? slots[cls] : '?'
  $('#livePred').textContent = name + '  ' + Math.round(conf * 100) + '%'
  $('#liveBar').style.width = (conf * 100) + '%'

  if(conf < CONF_THRESHOLD || cls < 0 || slots[cls] === null){
    candidate = -1
    candidateCount = 0
    return
  }

  if(cls != IDLE) lastSignAt = performance.now()

  if(cls == candidate){
    candidateCount++
  } else {
    candidate = cls
    candidateCount = 1
  }

  if(candidateCount != STABLE_FRAMES) return

  if(cls == IDLE){
    // returning to idle lets the same word be signed again
    lastAccepted = IDLE
    return
  }

  if(cls == lastAccepted) return
  lastAccepted = cls

  if(chipsStale){
    buffer = []
    chipsStale = false
  }
  buffer.push(slots[cls])
  renderChips()
}

function checkSentenceEnd(now){
  if(buffer.length == 0 || chipsStale) return
  if(now - lastSignAt < SENTENCE_GAP_MS) return
  finishSentence()
}

function finishSentence(){
  let sentence = buffer.join(' ')
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1)
  chipsStale = true
  lastAccepted = -1

  const el = $('#sentence')
  el.classList.remove('empty')
  el.textContent = sentence

  if($('#autoSpeak').checked){
    speak(sentence, $('#lang').value, () => {
      if($('#listenReply').checked) listenForReply()
    })
  } else if($('#listenReply').checked){
    listenForReply()
  }
}

function renderChips(){
  const box = $('#chips')
  box.innerHTML = ''
  buffer.forEach((w) => {
    const span = document.createElement('span')
    span.className = 'chip'
    span.textContent = w.toUpperCase()
    box.appendChild(span)
  })
}

function setPredicting(on){
  predicting = on
  candidate = -1
  candidateCount = 0
  const b = $('#btnPredict')
  b.textContent = on ? 'Stop predicting' : 'Start predicting'
  b.classList.toggle('stop', on)
  if(!on){
    $('#livePred').textContent = 'waiting for signs'
    $('#liveBar').style.width = '0'
  }
  refreshStatus()
}

function readyToPredict(){
  if(!modelReady) return 'The model is still loading. Give it a few seconds.'
  if(!camOn) return 'Start the camera first.'
  const c = counts()
  if(c[IDLE] == 0) return 'Record some IDLE examples first (hands down, not signing). Without them every frame looks like a word.'
  if(!liveWords().some((i) => c[i] > 0)) return 'Record examples for at least one word first.'
  return null
}

$('#btnPredict').addEventListener('click', () => {
  if(predicting) return setPredicting(false)
  const problem = readyToPredict()
  showErr('#signErr', problem)
  if(problem) return
  stopRecording()
  setPredicting(true)
})

$('#btnGoSign').addEventListener('click', () => {
  const problem = readyToPredict()
  showErr('#trainErr', problem)
  if(problem) return
  showErr('#signErr', '')
  showTab('sign')
  stopRecording()
  setPredicting(true)
})

$('#btnClear').addEventListener('click', () => {
  buffer = []
  chipsStale = false
  lastAccepted = -1
  renderChips()
  const el = $('#sentence')
  el.classList.add('empty')
  el.textContent = 'Sign to begin. Return to idle for a moment to end a sentence.'
  $('#replyBox').hidden = true
})

$('#btnSpeak').addEventListener('click', () => {
  if($('#sentence').classList.contains('empty')) return
  speak($('#sentence').textContent, $('#lang').value)
})

// ---------------------------------------------------------------- training UI
function renderWords(){
  const list = $('#wordList')
  list.innerHTML = ''
  const c = counts()

  slots.forEach((word, i) => {
    if(word === null) return

    const row = document.createElement('div')
    row.className = 'word'

    const name = document.createElement('span')
    name.className = 'name'
    name.textContent = word.toUpperCase()
    if(i == IDLE){
      const small = document.createElement('small')
      small.textContent = 'hands down / not signing'
      name.appendChild(small)
    }
    row.appendChild(name)

    const count = document.createElement('span')
    count.className = 'count'
    count.id = 'count-' + i
    row.appendChild(count)

    const rec = document.createElement('button')
    rec.className = 'act rec'
    rec.textContent = 'Record'
    rec.title = 'Hold while signing'
    const start = (e) => {
      e.preventDefault()
      startRecording(i, rec)
    }
    rec.addEventListener('pointerdown', start)
    rec.addEventListener('pointerup', stopRecording)
    rec.addEventListener('pointerleave', stopRecording)
    rec.addEventListener('pointercancel', stopRecording)
    rec.addEventListener('contextmenu', (e) => e.preventDefault())
    rec.addEventListener('keydown', (e) => {
      if((e.key == ' ' || e.key == 'Enter') && !e.repeat) start(e)
    })
    rec.addEventListener('keyup', (e) => {
      if(e.key == ' ' || e.key == 'Enter') stopRecording()
    })
    row.appendChild(rec)

    const clear = document.createElement('button')
    clear.className = 'ghost'
    clear.textContent = 'Clear'
    clear.addEventListener('click', () => {
      if(knn) knn.clearClass(i)
      updateCount(i, counts())
      saveTraining()
    })
    row.appendChild(clear)

    if(i != IDLE){
      const del = document.createElement('button')
      del.className = 'ghost'
      del.textContent = '\u2715'
      del.title = 'Remove word'
      del.setAttribute('aria-label', 'Remove ' + word)
      del.addEventListener('click', () => {
        if(knn) knn.clearClass(i)
        slots[i] = null
        renderWords()
        saveTraining()
      })
      row.appendChild(del)
    }

    list.appendChild(row)
    updateCount(i, c)
  })
}

let lastCountUpdate = 0
function updateCount(i, c){
  // recording runs every frame; don't touch the DOM more than ~10x/sec
  const now = performance.now()
  if(!c && now - lastCountUpdate < 100) return
  lastCountUpdate = now

  const el = document.getElementById('count-' + i)
  if(!el) return
  const n = (c || counts())[i]
  el.textContent = n
  el.className = 'count' + (n >= 30 ? ' ok' : '')
}

function startRecording(i, btn){
  if(!modelReady) return showErr('#trainErr', 'The model is still loading. Give it a few seconds.')
  if(!camOn) return showErr('#trainErr', 'Start the camera first.')
  showErr('#trainErr', '')
  if(predicting) setPredicting(false)
  recording = i
  btn.classList.add('held')
  $('#recWord').textContent = slots[i].toUpperCase()
  $('#recFlag').hidden = false
  refreshStatus()
}

function stopRecording(){
  if(recording == -1) return
  const i = recording
  recording = -1
  document.querySelectorAll('button.rec.held').forEach((b) => b.classList.remove('held'))
  $('#recFlag').hidden = true
  updateCount(i, counts())
  refreshStatus()
  saveTraining()
}
window.addEventListener('blur', stopRecording)

$('#addWord').addEventListener('submit', (e) => {
  e.preventDefault()
  const input = $('#newWord')
  const word = input.value.trim().replace(/\s+/g, ' ')
  if(!word) return
  const taken = slots.some((w) => w !== null && w.toLowerCase() == word.toLowerCase())
  if(taken) return showErr('#trainErr', '"' + word + '" is already in the list.')
  if(slots.length >= MAX_CLASSES) return showErr('#trainErr', 'You can add up to ' + (MAX_CLASSES - 1) + ' words.')
  showErr('#trainErr', '')
  slots.push(word)
  input.value = ''
  renderWords()
  saveTraining()
})

// two-step reset so it can't be hit by accident mid-demo
let resetArmed = null
function disarmReset(){
  clearTimeout(resetArmed)
  resetArmed = null
  $('#btnResetTraining').textContent = 'Reset all training'
  $('#btnResetTraining').classList.remove('danger')
}
$('#btnResetTraining').addEventListener('click', () => {
  if(!resetArmed){
    $('#btnResetTraining').textContent = 'Click again to erase everything'
    $('#btnResetTraining').classList.add('danger')
    resetArmed = setTimeout(disarmReset, 3000)
    return
  }
  disarmReset()
  stopRecording()
  setPredicting(false)
  if(knn) for(let i = 0; i < MAX_CLASSES; i++) knn.clearClass(i)
  slots.length = 0
  ;['IDLE'].concat(DEFAULT_WORDS).forEach((w) => slots.push(w))
  renderWords()
  saveTraining()
  showNote('#trainNote', 'Training erased.')
})

// ---------------------------------------------------------------- text to speech
let voices = []
let currentUtterance = null   // Chrome drops onend if the utterance gets garbage collected

function loadVoices(){
  if(!window.speechSynthesis) return
  voices = window.speechSynthesis.getVoices()
}
if(window.speechSynthesis){
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
}

function pickVoice(code){
  const norm = (l) => (l || '').replace('_', '-').toLowerCase()
  const want = code.toLowerCase()
  const base = want.split('-')[0]
  return voices.find((v) => norm(v.lang) == want) ||
    voices.find((v) => norm(v.lang).split('-')[0] == base && v.name.indexOf('Google') != -1) ||
    voices.find((v) => norm(v.lang).split('-')[0] == base) ||
    null
}

function speak(text, lang, onend){
  if(!window.speechSynthesis || !text){
    if(onend) onend()
    return
  }
  const code = LANG_CODES[lang] || 'en-IN'
  const u = new SpeechSynthesisUtterance(text)
  u.lang = code
  const voice = pickVoice(code)
  if(voice) u.voice = voice
  u.rate = 0.95
  let done = false
  const finish = () => {
    if(done) return
    done = true
    if(onend) onend()
  }
  u.onend = finish
  u.onerror = (e) => {
    console.log('speech error', e.error)
    finish()
  }
  currentUtterance = u
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

function voiceWarning(lang, box){
  if(!voices.length) return
  if(!pickVoice(LANG_CODES[lang])){
    showErr(box, 'No ' + LANG_NAMES[lang] + ' voice is installed in this browser, so the default voice will be used. ' +
      'Add one in Windows Settings > Time & language > Speech, then restart Chrome.')
  } else {
    showErr(box, '')
  }
}
$('#lang').addEventListener('change', () => voiceWarning($('#lang').value, '#signErr'))

// ---------------------------------------------------------------- speech recognition
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition

// after a signed sentence: listen for the spoken answer (e.g. an Echo nearby)
function listenForReply(){
  const box = $('#replyBox')
  const out = $('#reply')
  box.hidden = false
  out.className = 'out empty'

  if(!Recognition){
    out.textContent = 'Speech recognition is not supported in this browser (use Chrome).'
    return
  }

  out.textContent = 'listening\u2026'
  pausedForReply = true
  refreshStatus()

  const r = new Recognition()
  r.lang = LANG_CODES[$('#lang').value]
  r.continuous = true
  r.interimResults = true
  let finalText = ''
  let cutoff = null

  r.onresult = (e) => {
    let interim = ''
    for(let i = e.resultIndex; i < e.results.length; i++){
      if(e.results[i].isFinal) finalText += e.results[i][0].transcript
      else interim += e.results[i][0].transcript
    }
    out.className = 'out'
    out.textContent = finalText + interim
  }
  r.onerror = (e) => console.log('reply recognition error', e.error)
  r.onend = () => {
    clearTimeout(cutoff)
    if(!finalText){
      out.className = 'out empty'
      out.textContent = 'No reply heard.'
    }
    // short pause so the reply isn't mistaken for the next query
    setTimeout(() => {
      pausedForReply = false
      lastSignAt = performance.now()
      refreshStatus()
    }, 1000)
  }

  cutoff = setTimeout(() => r.stop(), REPLY_CUTOFF_MS)
  try {
    r.start()
  } catch(err) {
    console.log(err)
    clearTimeout(cutoff)
    pausedForReply = false
    refreshStatus()
  }
}

// SPEECH -> TEXT tab
let mic = null
let micWanted = false
let micFinal = ''

$('#btnMic').addEventListener('click', () => {
  if(!Recognition){
    return showErr('#speechErr', 'This browser has no speech recognition. Use Chrome, or type instead.')
  }
  if(micWanted) return stopMic()
  showErr('#speechErr', '')
  micWanted = true
  micFinal = ''
  renderTranscript('')
  $('#btnMic').textContent = 'Stop listening'
  $('#btnMic').classList.add('stop')
  startMic()
})

function startMic(){
  mic = new Recognition()
  mic.lang = LANG_CODES[$('#lang2').value]
  mic.continuous = true
  mic.interimResults = true

  mic.onresult = (e) => {
    let interim = ''
    for(let i = e.resultIndex; i < e.results.length; i++){
      if(e.results[i].isFinal) micFinal += e.results[i][0].transcript + ' '
      else interim += e.results[i][0].transcript
    }
    renderTranscript(interim)
  }
  mic.onerror = (e) => {
    console.log('recognition error', e.error)
    if(e.error == 'not-allowed' || e.error == 'service-not-allowed'){
      showErr('#speechErr', 'Microphone access was blocked. Allow it in the address bar and try again.')
      stopMic()
    } else if(e.error == 'network'){
      showErr('#speechErr', 'Speech recognition needs an internet connection in Chrome.')
      stopMic()
    } else if(e.error == 'language-not-supported'){
      showErr('#speechErr', LANG_NAMES[$('#lang2').value] + ' recognition is not available in this browser.')
      stopMic()
    }
  }
  // Chrome ends continuous sessions after a silence; keep going until the user stops
  mic.onend = () => {
    if(micWanted){
      try { mic.start() } catch(err) { stopMic() }
    }
  }
  try {
    mic.start()
  } catch(err) {
    console.log(err)
    stopMic()
  }
}

function stopMic(){
  micWanted = false
  if(mic){
    mic.onend = null
    try { mic.stop() } catch(err) {}
  }
  mic = null
  $('#btnMic').textContent = 'Start listening'
  $('#btnMic').classList.remove('stop')
  renderTranscript('')
}

$('#lang2').addEventListener('change', () => {
  voiceWarning($('#lang2').value, '#speechErr')
  if(micWanted){
    stopMic()
    $('#btnMic').click()
  }
})

function renderTranscript(interim){
  const el = $('#transcript')
  el.innerHTML = ''
  if(!micFinal && !interim){
    el.className = 'out big empty'
    el.textContent = micWanted ? 'listening\u2026' : 'Press start and speak. The words appear here for a deaf or hard-of-hearing reader.'
  } else {
    el.className = 'out big'
    el.appendChild(document.createTextNode(micFinal))
    const span = document.createElement('span')
    span.className = 'interim'
    span.textContent = interim
    el.appendChild(span)
  }

  // trained words that appear in what was said
  const said = (' ' + micFinal + ' ' + interim + ' ').toLowerCase()
  const box = $('#chips2')
  box.innerHTML = ''
  liveWords().forEach((i) => {
    if(said.indexOf(slots[i].toLowerCase()) != -1){
      const chip = document.createElement('span')
      chip.className = 'chip'
      chip.textContent = slots[i].toUpperCase()
      box.appendChild(chip)
    }
  })
}

$('#btnTranscriptSign').addEventListener('click', () => {
  const text = micFinal.trim()
  if(!text) return showErr('#speechErr', 'Nothing has been transcribed yet.')
  if(!window.CogniAvatar) return showErr('#speechErr', 'The avatar is not available in this browser.')
  stopMic()
  showTab('avatar')
  $('#signInput').value = text
  window.CogniAvatar.sign(text)
})
$('#btnTranscriptClear').addEventListener('click', () => {
  micFinal = ''
  renderTranscript('')
})

$('#btnSay').addEventListener('click', () => speak($('#sayText').value.trim(), $('#lang2').value))
$('#sayText').addEventListener('keydown', (e) => {
  if(e.key == 'Enter') speak($('#sayText').value.trim(), $('#lang2').value)
})

// ---------------------------------------------------------------- about
function renderAbout(){
  const c = counts()
  const box = $('#vocabList')
  box.innerHTML = ''
  let total = 0
  slots.forEach((w, i) => {
    if(w === null) return
    total += c[i]
    const span = document.createElement('span')
    span.textContent = w.toUpperCase() + ' \u00b7 ' + c[i]
    box.appendChild(span)
  })
  const voiceInfo = Object.keys(LANG_CODES).map((l) => l + (pickVoice(LANG_CODES[l]) ? ' \u2713' : ' \u2717')).join('  ')
  $('#healthOut').textContent =
    liveWords().length + ' words \u00b7 ' + total + ' examples \u00b7 model ' +
    (modelReady ? 'loaded' : 'loading') + ' \u00b7 voices: ' + voiceInfo +
    ' \u00b7 speech recognition ' + (Recognition ? 'available' : 'unavailable')
}

// shared with avatar.js
window.CogniSign = {speak: speak, showTab: showTab}

// ---------------------------------------------------------------- start
function init(){
  showTab('train')
  renderWords()
  loadModel()
  requestAnimationFrame(loop)
}

if(document.readyState == 'loading'){
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
