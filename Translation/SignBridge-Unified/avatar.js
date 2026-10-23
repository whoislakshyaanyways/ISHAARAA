// CogniSign signing avatar: text -> glosses -> keyframed arm/hand animation (three.js)
//
// Hands are posed by target position + orientation in body space; a two-bone IK
// solves the arm. Poses are authored per hand in "hand-relative" coordinates where
// +x points away from the body's midline toward that hand's side, so one spec can
// be used for both hands.

import * as THREE from './vendor/three/three.module.js'

const V3 = THREE.Vector3

// ---------------------------------------------------------------- body (metres)
const SHOULDER_X = 0.25, SHOULDER_Y = 1.44
const UPPER = 0.27, FORE = 0.25
const PALM_OFFSET = 0.05          // wrist -> palm centre, along the fingers

// ---------------------------------------------------------------- handshapes
// f: curl per finger (index, middle, ring, pinky). 0 straight, 1 fully curled,
//    or [knuckle, middle, tip] for bent shapes.
// s: spread (negative crosses fingers). t: thumb {curl, across the palm, out}
const SHAPES = {
  relaxed: {f: [.18, .22, .28, .32], s: .15, t: {curl: .2, across: .25, out: .1}},
  flat:    {f: [0, 0, 0, 0], s: 0, t: {curl: .1, across: .15, out: 0}},
  B:       {f: [0, 0, 0, 0], s: 0, t: {curl: .7, across: 1, out: 0}},
  open:    {f: [0, 0, 0, 0], s: 1, t: {curl: 0, across: 0, out: 1}},
  S:       {f: [1, 1, 1, 1], s: 0, t: {curl: .6, across: 1, out: 0}},
  A:       {f: [1, 1, 1, 1], s: 0, t: {curl: 0, across: 0, out: 0}},
  point:   {f: [0, 1, 1, 1], s: 0, t: {curl: .6, across: 1, out: 0}},
  D:       {f: [0, .7, .7, .7], s: 0, t: {curl: .5, across: .8, out: 0}},
  G:       {f: [0, 1, 1, 1], s: 0, t: {curl: 0, across: .3, out: .3}},
  V:       {f: [0, 0, 1, 1], s: .8, t: {curl: .6, across: 1, out: 0}},
  H:       {f: [0, 0, 1, 1], s: 0, t: {curl: .6, across: 1, out: 0}},
  R:       {f: [0, 0, 1, 1], s: -.5, t: {curl: .6, across: 1, out: 0}},
  K:       {f: [0, 0, 1, 1], s: .5, t: {curl: 0, across: .45, out: 0}},
  W:       {f: [0, 0, 0, 1], s: .7, t: {curl: .6, across: 1, out: 0}},
  I:       {f: [1, 1, 1, 0], s: 0, t: {curl: .6, across: 1, out: 0}},
  Y:       {f: [1, 1, 1, 0], s: .6, t: {curl: 0, across: 0, out: 1}},
  L:       {f: [0, 1, 1, 1], s: 0, t: {curl: 0, across: 0, out: 1}},
  C:       {f: [.45, .45, .45, .45], s: 0, t: {curl: .15, across: .35, out: .3}},
  O:       {f: [.62, .62, .62, .62], s: 0, t: {curl: .35, across: .85, out: 0}},
  E:       {f: [[.4, 1, .9], [.4, 1, .9], [.4, 1, .9], [.4, 1, .9]], s: 0, t: {curl: .8, across: 1, out: 0}},
  F:       {f: [.6, 0, 0, 0], s: .5, t: {curl: .45, across: .7, out: 0}},
  X:       {f: [[.2, 1, .9], 1, 1, 1], s: 0, t: {curl: .6, across: 1, out: 0}},
  M:       {f: [.9, .9, .9, 1], s: 0, t: {curl: .2, across: 1.1, out: 0}},
  N:       {f: [.9, .9, 1, 1], s: 0, t: {curl: .2, across: .95, out: 0}},
  T:       {f: [.95, 1, 1, 1], s: 0, t: {curl: .3, across: .7, out: 0}},
  claw:    {f: [[.25, .9, .7], [.25, .9, .7], [.25, .9, .7], [.25, .9, .7]], s: .8, t: {curl: .5, across: .3, out: .4}},
  grab:    {f: [[.6, 1, .8], [.6, 1, .8], [.6, 1, .8], [.6, 1, .8]], s: .3, t: {curl: .6, across: .7, out: 0}},
  bent:    {f: [[1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0]], s: 0, t: {curl: .3, across: .6, out: 0}},
  snap:    {f: [.75, .75, 1, 1], s: 0, t: {curl: .5, across: .8, out: 0}},
}
const JOINT_MAX = [1.5, 1.75, 1.2]

const shapeCache = {}
function resolveShape(name){
  if(shapeCache[name]) return shapeCache[name]
  const def = SHAPES[name] || SHAPES.relaxed
  const f = def.f.map((v) => (Array.isArray(v) ? v : [v, v, v]).map((x, j) => x * JOINT_MAX[j]))
  shapeCache[name] = {f, s: def.s, tc: def.t.curl, ta: def.t.across, to: def.t.out}
  return shapeCache[name]
}

function lerpShape(a, b, k){
  const m = (x, y) => x + (y - x) * k
  return {
    f: a.f.map((row, i) => row.map((v, j) => m(v, b.f[i][j]))),
    s: m(a.s, b.s), tc: m(a.tc, b.tc), ta: m(a.ta, b.ta), to: m(a.to, b.to),
  }
}

// ---------------------------------------------------------------- pose helpers
const UP = [0, 1, 0], DOWN = [0, -1, 0], FWD = [0, 0, 1], BACK = [0, 0, -1], IN = [-1, 0, 0], OUT = [1, 0, 0]

// shape, palm centre, finger direction, palm-normal direction (hand-relative coords)
const H = (shape, c, p, n) => ({shape, c, p, n})

const REST = H('relaxed', [0.27, 0.885, 0.06], DOWN, IN)

// ---------------------------------------------------------------- sign dictionary
// Approximations for demonstration; not validated by a native signer.
const FS = [0.13, 1.38, 0.3]   // fingerspelling position

const SIGNS = {
  'HELLO': [
    {R: H('B', [0.14, 1.67, 0.17], [0.15, 1, 0], FWD), t: .4, hold: .08},
    {R: H('B', [0.3, 1.64, 0.27], [0.3, 1, 0], FWD), t: .35, hold: .15},
  ],
  'BYE': [
    {R: H('open', [0.22, 1.55, 0.28], UP, FWD), t: .4},
    {R: H('open', [0.23, 1.55, 0.28], [0.4, 1, 0], FWD), t: .17, hold: 0},
    {R: H('open', [0.21, 1.55, 0.28], [-0.3, 1, 0], FWD), t: .17, hold: 0},
    {R: H('open', [0.23, 1.55, 0.28], [0.4, 1, 0], FWD), t: .17, hold: 0},
    {R: H('open', [0.21, 1.55, 0.28], [-0.3, 1, 0], FWD), t: .17, hold: .1},
  ],
  'THANK-YOU': [
    {R: H('flat', [0.02, 1.535, 0.19], UP, BACK), t: .45, hold: .1, head: [0.06, 0, 0]},
    {R: H('flat', [0.1, 1.38, 0.42], [0, 0.6, 1], UP), t: .4, hold: .2, head: [0.12, 0, 0]},
  ],
  'PLEASE': [
    {R: H('flat', [0.04, 1.3, 0.2], [-0.5, 1, 0], BACK), t: .4, hold: 0},
    {R: H('flat', [0.1, 1.24, 0.2], [-0.5, 1, 0], BACK), t: .2, hold: 0},
    {R: H('flat', [0.04, 1.18, 0.2], [-0.5, 1, 0], BACK), t: .2, hold: 0},
    {R: H('flat', [-0.02, 1.24, 0.2], [-0.5, 1, 0], BACK), t: .2, hold: 0},
    {R: H('flat', [0.04, 1.3, 0.2], [-0.5, 1, 0], BACK), t: .2, hold: .1},
  ],
  'SORRY': [
    {R: H('S', [0.04, 1.3, 0.21], [-0.3, 1, 0], BACK), t: .4, hold: 0, head: [0.1, 0, 0]},
    {R: H('S', [0.1, 1.24, 0.21], [-0.3, 1, 0], BACK), t: .2, hold: 0, head: [0.1, 0, 0]},
    {R: H('S', [0.04, 1.18, 0.21], [-0.3, 1, 0], BACK), t: .2, hold: 0, head: [0.1, 0, 0]},
    {R: H('S', [-0.02, 1.24, 0.21], [-0.3, 1, 0], BACK), t: .2, hold: 0, head: [0.1, 0, 0]},
    {R: H('S', [0.04, 1.3, 0.21], [-0.3, 1, 0], BACK), t: .2, hold: .1, head: [0.1, 0, 0]},
  ],
  'YES': [
    {R: H('S', [0.14, 1.38, 0.32], UP, FWD), t: .35, hold: 0},
    {R: H('S', [0.14, 1.36, 0.33], [0, 0.64, 0.77], [0, -0.77, 0.64]), t: .16, hold: 0, head: [0.22, 0, 0]},
    {R: H('S', [0.14, 1.38, 0.32], UP, FWD), t: .16, hold: 0},
    {R: H('S', [0.14, 1.36, 0.33], [0, 0.64, 0.77], [0, -0.77, 0.64]), t: .16, hold: .1, head: [0.22, 0, 0]},
  ],
  'NO': [
    {R: H('H', [0.15, 1.4, 0.32], [0, 0.6, 0.8], [0, -0.8, 0.6]), t: .35, hold: 0},
    {R: H('snap', [0.15, 1.4, 0.32], [0, 0.6, 0.8], [0, -0.8, 0.6]), t: .14, hold: 0, head: [0, 0.28, 0]},
    {R: H('H', [0.15, 1.4, 0.32], [0, 0.6, 0.8], [0, -0.8, 0.6]), t: .14, hold: 0, head: [0, -0.28, 0]},
    {R: H('snap', [0.15, 1.4, 0.32], [0, 0.6, 0.8], [0, -0.8, 0.6]), t: .14, hold: .1, head: [0, 0.2, 0]},
  ],
  'I': [
    {R: H('point', [0.03, 1.32, 0.25], BACK, IN), t: .35, hold: .2},
  ],
  'MY': [
    {R: H('flat', [0.03, 1.3, 0.2], [-0.4, 1, 0], BACK), t: .35, hold: .2},
  ],
  'YOU': [
    {R: H('point', [0.06, 1.33, 0.44], [-0.4, 0.3, 1], DOWN), t: .35, hold: .2},
  ],
  'NAME': [
    {L: H('H', [0.06, 1.24, 0.33], IN, BACK), R: H('H', [0.0, 1.3, 0.34], IN, BACK), t: .4, hold: 0},
    {R: H('H', [0.0, 1.265, 0.34], IN, BACK), t: .14, hold: 0},
    {R: H('H', [0.0, 1.3, 0.34], IN, BACK), t: .14, hold: 0},
    {R: H('H', [0.0, 1.265, 0.34], IN, BACK), t: .14, hold: .15},
  ],
  'WHAT': [
    {L: H('open', [0.18, 1.18, 0.32], [0.3, 0.2, 1], UP), R: H('open', [0.18, 1.18, 0.32], [0.3, 0.2, 1], UP), t: .4, hold: 0, head: [-0.05, 0, 0.12]},
    {L: H('open', [0.23, 1.18, 0.32], [0.4, 0.2, 1], UP), R: H('open', [0.23, 1.18, 0.32], [0.4, 0.2, 1], UP), t: .17, hold: 0, head: [-0.05, 0, 0.12]},
    {L: H('open', [0.17, 1.18, 0.32], [0.3, 0.2, 1], UP), R: H('open', [0.17, 1.18, 0.32], [0.3, 0.2, 1], UP), t: .17, hold: 0, head: [-0.05, 0, 0.12]},
    {L: H('open', [0.23, 1.18, 0.32], [0.4, 0.2, 1], UP), R: H('open', [0.23, 1.18, 0.32], [0.4, 0.2, 1], UP), t: .17, hold: .15, head: [-0.05, 0, 0.12]},
  ],
  'WHERE': [
    {R: H('point', [0.18, 1.45, 0.32], UP, FWD), t: .4, hold: 0, head: [-0.05, 0, 0.1]},
    {R: H('point', [0.24, 1.45, 0.32], [0.25, 1, 0], FWD), t: .17, hold: 0, head: [-0.05, 0, 0.1]},
    {R: H('point', [0.12, 1.45, 0.32], [-0.25, 1, 0], FWD), t: .17, hold: 0, head: [-0.05, 0, 0.1]},
    {R: H('point', [0.24, 1.45, 0.32], [0.25, 1, 0], FWD), t: .17, hold: 0, head: [-0.05, 0, 0.1]},
    {R: H('point', [0.16, 1.45, 0.32], UP, FWD), t: .17, hold: .1, head: [-0.05, 0, 0.1]},
  ],
  'HELP': [
    {L: H('flat', [0.03, 1.12, 0.3], [-0.6, 0, 1], UP), R: H('A', [0.0, 1.18, 0.31], UP, IN), t: .45, hold: .05},
    {L: H('flat', [0.03, 1.26, 0.3], [-0.6, 0, 1], UP), R: H('A', [0.0, 1.32, 0.31], UP, IN), t: .35, hold: .15},
  ],
  'WANT': [
    {L: H('claw', [0.16, 1.2, 0.42], FWD, UP), R: H('claw', [0.16, 1.2, 0.42], FWD, UP), t: .4, hold: .05},
    {L: H('grab', [0.13, 1.24, 0.26], FWD, UP), R: H('grab', [0.13, 1.24, 0.26], FWD, UP), t: .35, hold: .15},
  ],
  'NEED': [
    {R: H('X', [0.12, 1.36, 0.34], [0, 0.2, 1], DOWN), t: .35, hold: 0},
    {R: H('X', [0.12, 1.32, 0.34], [0, -0.5, 1], [0, -1, -0.5]), t: .15, hold: 0},
    {R: H('X', [0.12, 1.36, 0.34], [0, 0.2, 1], DOWN), t: .15, hold: 0},
    {R: H('X', [0.12, 1.32, 0.34], [0, -0.5, 1], [0, -1, -0.5]), t: .15, hold: .15},
  ],
  'WATER': [
    {R: H('W', [0.03, 1.54, 0.18], UP, IN), t: .4, hold: 0},
    {R: H('W', [0.03, 1.54, 0.23], UP, IN), t: .14, hold: 0},
    {R: H('W', [0.03, 1.54, 0.18], UP, IN), t: .14, hold: 0},
    {R: H('W', [0.03, 1.54, 0.23], UP, IN), t: .14, hold: .1},
  ],
  'FOOD': [
    {R: H('O', [0.01, 1.64, 0.23], [-0.2, 0.4, -1], DOWN), t: .4, hold: 0},
    {R: H('O', [0.02, 1.62, 0.28], [-0.2, 0.4, -1], DOWN), t: .14, hold: 0},
    {R: H('O', [0.01, 1.64, 0.23], [-0.2, 0.4, -1], DOWN), t: .14, hold: 0},
    {R: H('O', [0.02, 1.62, 0.28], [-0.2, 0.4, -1], DOWN), t: .14, hold: .1},
  ],
  'DOCTOR': [
    {L: H('flat', [0.04, 1.18, 0.3], [-0.6, 0, 1], UP), R: H('bent', [-0.07, 1.25, 0.28], [-0.3, 0, 1], DOWN), t: .45, hold: 0},
    {R: H('bent', [-0.07, 1.215, 0.28], [-0.3, 0, 1], DOWN), t: .14, hold: 0},
    {R: H('bent', [-0.07, 1.25, 0.28], [-0.3, 0, 1], DOWN), t: .14, hold: 0},
    {R: H('bent', [-0.07, 1.215, 0.28], [-0.3, 0, 1], DOWN), t: .14, hold: .15},
  ],
  'HOSPITAL': [
    {R: H('H', [-0.2, 1.42, 0.14], UP, IN), t: .5, hold: 0},
    {R: H('H', [-0.2, 1.32, 0.14], UP, IN), t: .25, hold: 0},
    {R: H('H', [-0.25, 1.38, 0.13], UP, IN), t: .2, hold: 0},
    {R: H('H', [-0.15, 1.38, 0.15], UP, IN), t: .25, hold: .15},
  ],
  'HOME': [
    {R: H('O', [0.05, 1.62, 0.18], [-0.4, 0.3, -1], DOWN), t: .4, hold: .05},
    {R: H('O', [0.11, 1.69, 0.14], [-0.4, 0.3, -1], DOWN), t: .25, hold: .15},
  ],
  'SCHOOL': [
    {L: H('flat', [0.03, 1.15, 0.3], [-0.6, 0, 1], UP), R: H('flat', [0.03, 1.27, 0.31], [-0.3, 0, 1], DOWN), t: .45, hold: 0},
    {R: H('flat', [0.03, 1.18, 0.31], [-0.3, 0, 1], DOWN), t: .13, hold: 0},
    {R: H('flat', [0.03, 1.27, 0.31], [-0.3, 0, 1], DOWN), t: .13, hold: 0},
    {R: H('flat', [0.03, 1.18, 0.31], [-0.3, 0, 1], DOWN), t: .13, hold: .15},
  ],
  'WORK': [
    {L: H('S', [0.07, 1.18, 0.32], [-0.5, 0, 1], DOWN), R: H('S', [-0.02, 1.26, 0.3], [-0.5, 0, 1], DOWN), t: .45, hold: 0},
    {R: H('S', [-0.02, 1.215, 0.3], [-0.5, 0, 1], DOWN), t: .14, hold: 0},
    {R: H('S', [-0.02, 1.26, 0.3], [-0.5, 0, 1], DOWN), t: .14, hold: 0},
    {R: H('S', [-0.02, 1.215, 0.3], [-0.5, 0, 1], DOWN), t: .14, hold: .15},
  ],
  'GOOD': [
    {R: H('flat', [0.02, 1.535, 0.19], UP, BACK), t: .4, hold: .05},
    {L: H('flat', [0.05, 1.16, 0.33], [-0.4, 0, 1], UP), R: H('flat', [0.04, 1.22, 0.37], FWD, UP), t: .4, hold: .2, head: [0.08, 0, 0]},
  ],
  'BAD': [
    {R: H('flat', [0.02, 1.535, 0.19], UP, BACK), t: .4, hold: .05},
    {R: H('flat', [0.16, 1.35, 0.32], [0.3, -0.2, 1], DOWN), t: .3, hold: .2, head: [0, 0.12, 0]},
  ],
  'UNDERSTAND': [
    {R: H('S', [0.13, 1.66, 0.15], UP, BACK), t: .45, hold: .1},
    {R: H('point', [0.13, 1.67, 0.15], UP, BACK), t: .15, hold: .25, head: [0.12, 0, 0]},
  ],
  'NOT': [
    {R: H('A', [0.02, 1.52, 0.18], UP, IN), t: .4, hold: .05},
    {R: H('A', [0.05, 1.48, 0.34], [0, 0.4, 1], IN), t: .2, hold: .2, head: [0, 0.15, 0]},
  ],
  'LEARN': [
    {L: H('flat', [0.04, 1.18, 0.3], [-0.6, 0, 1], UP), R: H('claw', [0.02, 1.24, 0.31], DOWN, BACK), t: .45, hold: 0},
    {R: H('grab', [0.02, 1.27, 0.31], DOWN, BACK), t: .15, hold: 0},
    {L: 'rest', R: H('O', [0.04, 1.72, 0.21], BACK, DOWN), t: .4, hold: .15},
  ],
  'HOW': [
    {L: H('bent', [0.03, 1.25, 0.3], DOWN, BACK), R: H('bent', [0.03, 1.25, 0.3], DOWN, BACK), t: .45, hold: 0, head: [-0.05, 0, 0.1]},
    {L: H('bent', [0.04, 1.28, 0.33], FWD, UP), R: H('bent', [0.04, 1.28, 0.33], FWD, UP), t: .35, hold: .15, head: [-0.05, 0, 0.1]},
  ],
  'TODAY': [
    {L: H('Y', [0.2, 1.3, 0.32], FWD, UP), R: H('Y', [0.2, 1.3, 0.32], FWD, UP), t: .4, hold: 0},
    {L: H('Y', [0.2, 1.22, 0.32], FWD, UP), R: H('Y', [0.2, 1.22, 0.32], FWD, UP), t: .16, hold: 0},
    {L: H('Y', [0.2, 1.3, 0.32], FWD, UP), R: H('Y', [0.2, 1.3, 0.32], FWD, UP), t: .16, hold: 0},
    {L: H('Y', [0.2, 1.22, 0.32], FWD, UP), R: H('Y', [0.2, 1.22, 0.32], FWD, UP), t: .16, hold: .15},
  ],
  'TOMORROW': [
    {R: H('A', [0.12, 1.6, 0.14], UP, IN), t: .45, hold: .05},
    {R: H('A', [0.17, 1.58, 0.32], [0, 0.6, 1], IN), t: .3, hold: .2},
  ],
  'NAMASTE': [
    {L: H('flat', [0.022, 1.33, 0.26], [0, 1, 0.25], IN), R: H('flat', [0.022, 1.33, 0.26], [0, 1, 0.25], IN), t: .5, hold: .15},
    {t: .35, hold: .5, head: [0.28, 0, 0]},
  ],
  'LOVE': [
    {L: H('S', [-0.05, 1.33, 0.21], [-0.6, 1, 0], BACK), R: H('S', [-0.05, 1.31, 0.23], [-0.6, 1, 0], BACK), t: .5, hold: .5, head: [0.06, 0, 0.08]},
  ],
  'FRIEND': [
    {L: H('X', [0.03, 1.28, 0.32], [-0.4, 0, 1], UP), R: H('X', [0.03, 1.32, 0.32], [-0.4, 0, 1], DOWN), t: .45, hold: .05},
    {L: H('X', [0.03, 1.32, 0.32], [-0.4, 0, 1], DOWN), R: H('X', [0.03, 1.28, 0.32], [-0.4, 0, 1], UP), t: .35, hold: .15},
  ],
  'STOP': [
    {L: H('flat', [0.04, 1.2, 0.32], [-0.5, 0, 1], UP), R: H('flat', [0.02, 1.42, 0.33], FWD, IN), t: .45, hold: 0},
    {R: H('flat', [0.02, 1.26, 0.33], FWD, IN), t: .15, hold: .3},
  ],
  'MORE': [
    {L: H('O', [0.06, 1.3, 0.32], IN, DOWN), R: H('O', [0.06, 1.3, 0.32], IN, DOWN), t: .45, hold: 0},
    {L: H('O', [0.025, 1.3, 0.32], IN, DOWN), R: H('O', [0.025, 1.3, 0.32], IN, DOWN), t: .14, hold: 0},
    {L: H('O', [0.06, 1.3, 0.32], IN, DOWN), R: H('O', [0.06, 1.3, 0.32], IN, DOWN), t: .14, hold: 0},
    {L: H('O', [0.025, 1.3, 0.32], IN, DOWN), R: H('O', [0.025, 1.3, 0.32], IN, DOWN), t: .14, hold: .15},
  ],
  'FINE': [
    {R: H('open', [0.05, 1.36, 0.23], UP, IN), t: .4, hold: 0},
    {R: H('open', [0.05, 1.36, 0.28], UP, IN), t: .14, hold: 0},
    {R: H('open', [0.05, 1.36, 0.23], UP, IN), t: .14, hold: .2},
  ],
  'OK': [
    {R: H('F', [0.16, 1.42, 0.32], UP, FWD), t: .4, hold: .1},
    {R: H('F', [0.17, 1.4, 0.34], [0.15, 1, 0.2], FWD), t: .2, hold: .2, head: [0.1, 0, 0]},
  ],
}

// one-handed manual alphabet (approximate) used to spell names and unknown words
const SPELL = {
  a: ['A'], b: ['B'], c: ['C', UP, [-0.7, 0, 0.7]], d: ['D'], e: ['E'], f: ['F'],
  g: ['G', IN, BACK], h: ['H', IN, BACK], i: ['I'], k: ['K'], l: ['L'], m: ['M'],
  n: ['N'], o: ['O', UP, [-0.7, 0, 0.7]], p: ['K', [0, -0.3, 1], [0, -1, -0.3]], q: ['G', DOWN, BACK],
  r: ['R'], s: ['S'], t: ['T'], u: ['H'], v: ['V'], w: ['W'], x: ['X'], y: ['Y'],
}

function spellFrames(word){
  const frames = []
  let prev = null
  word.split('').forEach((ch, i) => {
    const base = {t: .24, hold: .2, letter: i}
    if(ch == 'j'){
      frames.push(Object.assign({}, base, {R: H('I', FS, UP, FWD), hold: 0}))
      frames.push(Object.assign({}, base, {R: H('I', [0.09, 1.32, 0.3], [-0.4, 0.9, 0], [0.4, 0, 1]), t: .2}))
    } else if(ch == 'z'){
      frames.push(Object.assign({}, base, {R: H('point', [0.1, 1.42, 0.3], UP, FWD), hold: 0}))
      frames.push(Object.assign({}, base, {R: H('point', [0.18, 1.42, 0.3], UP, FWD), t: .14, hold: 0}))
      frames.push(Object.assign({}, base, {R: H('point', [0.1, 1.35, 0.3], UP, FWD), t: .14, hold: 0}))
      frames.push(Object.assign({}, base, {R: H('point', [0.18, 1.35, 0.3], UP, FWD), t: .14}))
    } else {
      const def = SPELL[ch]
      if(!def) return
      if(ch == prev){
        // repeated letter: small bounce outward
        frames.push(Object.assign({}, base, {R: H(def[0], [FS[0] + 0.05, FS[1], FS[2]], def[1] || UP, def[2] || FWD), t: .14, hold: 0}))
      }
      frames.push(Object.assign({}, base, {R: H(def[0], FS, def[1] || UP, def[2] || FWD)}))
    }
    prev = ch
  })
  return frames
}

// ---------------------------------------------------------------- text -> glosses
const ALIASES = {
  hello: 'HELLO', hi: 'HELLO', hey: 'HELLO', bye: 'BYE', goodbye: 'BYE',
  thanks: 'THANK-YOU', thank: 'THANK-YOU', please: 'PLEASE', sorry: 'SORRY',
  yes: 'YES', yeah: 'YES', yep: 'YES', no: 'NO', nope: 'NO',
  i: 'I', me: 'I', im: 'I', ive: 'I', my: 'MY', mine: 'MY',
  you: 'YOU', your: 'YOU', youre: 'YOU', yours: 'YOU',
  name: 'NAME', what: 'WHAT', whats: 'WHAT', where: 'WHERE', wheres: 'WHERE',
  help: 'HELP', want: 'WANT', need: 'NEED', water: 'WATER',
  food: 'FOOD', eat: 'FOOD', hungry: 'FOOD', doctor: 'DOCTOR', hospital: 'HOSPITAL',
  home: 'HOME', house: 'HOME', school: 'SCHOOL', college: 'SCHOOL',
  work: 'WORK', job: 'WORK', office: 'WORK', good: 'GOOD', nice: 'GOOD', great: 'GOOD',
  bad: 'BAD', understand: 'UNDERSTAND', not: 'NOT', dont: 'NOT', doesnt: 'NOT',
  didnt: 'NOT', cant: 'NOT', cannot: 'NOT', wont: 'NOT', isnt: 'NOT', arent: 'NOT',
  learn: 'LEARN', study: 'LEARN', how: 'HOW', hows: 'HOW', today: 'TODAY', now: 'TODAY',
  tomorrow: 'TOMORROW', namaste: 'NAMASTE', namaskar: 'NAMASTE', love: 'LOVE',
  friend: 'FRIEND', friends: 'FRIEND', stop: 'STOP', more: 'MORE', fine: 'FINE',
  ok: 'OK', okay: 'OK',
  // Hindi
  'नमस्ते': 'NAMASTE', 'नमस्कार': 'NAMASTE', 'धन्यवाद': 'THANK-YOU', 'शुक्रिया': 'THANK-YOU',
  'पानी': 'WATER', 'खाना': 'FOOD', 'मदद': 'HELP', 'हाँ': 'YES', 'हां': 'YES', 'नहीं': 'NO',
  'डॉक्टर': 'DOCTOR', 'अस्पताल': 'HOSPITAL', 'घर': 'HOME', 'स्कूल': 'SCHOOL', 'काम': 'WORK',
  'अच्छा': 'GOOD', 'मैं': 'I', 'मेरा': 'MY', 'मेरी': 'MY', 'आप': 'YOU', 'तुम': 'YOU', 'नाम': 'NAME',
  'क्या': 'WHAT', 'कहाँ': 'WHERE', 'कहां': 'WHERE', 'कैसे': 'HOW', 'आज': 'TODAY', 'कल': 'TOMORROW',
  'मुझे': 'I', 'मुझको': 'I', 'दोस्त': 'FRIEND', 'प्यार': 'LOVE', 'माफ़': 'SORRY', 'माफ': 'SORRY', 'चाहिए': 'NEED',
  // Kannada
  'ನಮಸ್ಕಾರ': 'NAMASTE', 'ಧನ್ಯವಾದ': 'THANK-YOU', 'ಧನ್ಯವಾದಗಳು': 'THANK-YOU', 'ನೀರು': 'WATER',
  'ಊಟ': 'FOOD', 'ಸಹಾಯ': 'HELP', 'ಹೌದು': 'YES', 'ಇಲ್ಲ': 'NO', 'ವೈದ್ಯ': 'DOCTOR',
  'ಆಸ್ಪತ್ರೆ': 'HOSPITAL', 'ಮನೆ': 'HOME', 'ಶಾಲೆ': 'SCHOOL', 'ಕೆಲಸ': 'WORK', 'ಒಳ್ಳೆಯ': 'GOOD',
  'ನಾನು': 'I', 'ನನ್ನ': 'MY', 'ನೀವು': 'YOU', 'ನೀನು': 'YOU', 'ಹೆಸರು': 'NAME', 'ಏನು': 'WHAT',
  'ಎಲ್ಲಿ': 'WHERE', 'ಹೇಗೆ': 'HOW', 'ಇಂದು': 'TODAY', 'ನಾಳೆ': 'TOMORROW', 'ಸ್ನೇಹಿತ': 'FRIEND', 'ಬೇಕು': 'NEED',
}

// words a sign sentence leaves out (articles, copulas, auxiliaries)
const DROP = new Set([
  'a', 'an', 'the', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'to', 'of', 'do', 'does',
  'did', 'it', 'its', 'this', 'that', 'and', 'for', 'some', 'at', 'in', 'on', 'with', 'can',
  'will', 'would', 'could', 'should', 'very', 'so', 'just', 'there', 'here', 'please?',
  'है', 'हैं', 'हूँ', 'हूं', 'का', 'की', 'के', 'को', 'में', 'से', 'जी', 'ಇದೆ', 'ಅದು', 'ಆಗಿದೆ',
])

function textToTokens(text){
  const clean = text.toLowerCase()
    .replace(/[’']/g, '')
    .replace(/thank\s+you/g, 'thanks')
    .replace(/good\s*bye/g, 'goodbye')
  const words = clean.split(/[^\p{L}\p{M}0-9]+/u).filter(Boolean)
  const tokens = []
  words.forEach((w) => {
    if(ALIASES[w]) return tokens.push({kind: 'sign', gloss: ALIASES[w], word: w})
    if(DROP.has(w)) return
    if(/^[a-z]+$/.test(w)) return tokens.push({kind: 'spell', gloss: w.toUpperCase(), word: w})
    tokens.push({kind: 'skip', gloss: w, word: w})
  })
  return tokens
}

// ---------------------------------------------------------------- pose -> state
function toBody(side, v){
  const sx = side == 'R' ? -1 : 1
  return new V3(v[0] * sx, v[1], v[2])
}

function handState(side, spec){
  const y = toBody(side, spec.p).normalize()
  const z = toBody(side, spec.n)
  z.addScaledVector(y, -z.dot(y))
  if(z.lengthSq() < 1e-6) z.set(0, 0, 1).addScaledVector(y, -y.z)
  z.normalize()
  const x = new V3().crossVectors(y, z)
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z))
  const pos = toBody(side, spec.c).addScaledVector(y, -PALM_OFFSET)
  return {pos, q, sh: resolveShape(spec.shape)}
}

const REST_R = handState('R', REST)
const REST_L = handState('L', REST)

function cloneState(s){
  return {pos: s.pos.clone(), q: s.q.clone(), sh: s.sh}
}

function buildTimeline(tokens){
  const items = []
  tokens.forEach((tok, wi) => {
    if(tok.kind == 'skip') return
    const frames = tok.kind == 'sign' ? SIGNS[tok.gloss] : spellFrames(tok.word)
    let curR = null, curL = REST_L
    frames.forEach((fr, fi) => {
      if(fr.R) curR = handState('R', fr.R)
      if(fr.L == 'rest') curL = REST_L
      else if(fr.L) curL = handState('L', fr.L)
      items.push({
        t: fi == 0 ? Math.max(fr.t || .3, .35) : (fr.t || .3),
        hold: fr.hold == null ? .12 : fr.hold,
        R: curR || REST_R, L: curL,
        head: fr.head || [0, 0, 0],
        word: wi, letter: fr.letter == null ? null : fr.letter,
      })
    })
  })
  if(items.length) items.push({t: .6, hold: 0, R: REST_R, L: REST_L, head: [0, 0, 0], word: -1, letter: null})
  return items
}

// ---------------------------------------------------------------- character
function capsuleMesh(r, len, mat){
  return new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), mat)
}

function chain(parent, lens, r, mat){
  const joints = []
  let p = parent
  lens.forEach((len, i) => {
    const j = new THREE.Group()
    if(i > 0) j.position.y = lens[i - 1]
    p.add(j)
    const m = capsuleMesh(r * (1 - i * 0.07), len, mat)
    m.position.y = len / 2
    m.castShadow = true
    j.add(m)
    joints.push(j)
    p = j
  })
  return joints
}

const FINGERS = [
  {x: .027, len: [.034, .025, .02], r: .0092},
  {x: .009, len: [.037, .027, .021], r: .0095},
  {x: -.009, len: [.035, .025, .02], r: .0092},
  {x: -.027, len: [.028, .02, .017], r: .0085},
]
const SPREAD = [-.22, -.06, .09, .24]

class Hand {
  // side +1: right hand (thumb on local +x), -1: left hand
  constructor(side, mat){
    this.side = side
    this.group = new THREE.Group()
    const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat)
    palm.scale.set(.043, .052, .018)
    palm.position.y = .046
    palm.castShadow = true
    this.group.add(palm)
    this.fingers = FINGERS.map((f) => {
      const base = new THREE.Group()
      base.position.set(side * f.x, .086, 0)
      this.group.add(base)
      return chain(base, f.len, f.r, mat)
    })
    this.thumbBase = new THREE.Group()
    this.thumbBase.position.set(side * .03, .018, .008)
    this.group.add(this.thumbBase)
    this.thumb = chain(this.thumbBase, [.032, .028, .024], .0115, mat)
  }

  apply(sh){
    const s = this.side
    this.fingers.forEach((j, i) => {
      j[0].rotation.set(sh.f[i][0], 0, s * SPREAD[i] * sh.s)
      j[1].rotation.x = sh.f[i][1]
      j[2].rotation.x = sh.f[i][2]
    })
    this.thumbBase.rotation.set(.35 + .75 * sh.ta - .3 * sh.to, 0, s * (-.55 - .55 * sh.to + 1.2 * sh.ta))
    this.thumb[0].rotation.x = sh.tc * .3
    this.thumb[1].rotation.x = sh.tc * .9
    this.thumb[2].rotation.x = sh.tc
  }
}

const Y_AXIS = new V3(0, 1, 0)

function placeBetween(mesh, a, b){
  mesh.position.addVectors(a, b).multiplyScalar(.5)
  const dir = new V3().subVectors(b, a).normalize()
  mesh.quaternion.setFromUnitVectors(Y_AXIS, dir)
}

class Arm {
  constructor(side, root, mats){
    this.sx = side == 'R' ? -1 : 1
    this.shoulder = new V3(this.sx * SHOULDER_X, SHOULDER_Y, 0)
    this.pole = new V3(this.sx * .45, -1, -.3).normalize()
    this.upper = capsuleMesh(.05, UPPER, mats.shirt)
    this.fore = capsuleMesh(.04, FORE, mats.skin)
    this.elbow = new THREE.Mesh(new THREE.SphereGeometry(.042, 16, 12), mats.skin)
    this.wrist = new THREE.Mesh(new THREE.SphereGeometry(.03, 16, 12), mats.skin)
    ;[this.upper, this.fore, this.elbow, this.wrist].forEach((m) => {
      m.castShadow = true
      root.add(m)
    })
    this.hand = new Hand(side == 'R' ? 1 : -1, mats.skin)
    root.add(this.hand.group)
    this._d = new V3()
    this._p = new V3()
    this._e = new V3()
    this._w = new V3()
  }

  pose(state){
    const S = this.shoulder
    const d = this._d.subVectors(state.pos, S)
    const dist = Math.min(Math.max(d.length(), .06), UPPER + FORE - .002)
    const u = d.normalize()
    const cosA = Math.min(1, Math.max(-1, (UPPER * UPPER + dist * dist - FORE * FORE) / (2 * UPPER * dist)))
    const sinA = Math.sqrt(1 - cosA * cosA)
    const p = this._p.copy(this.pole).addScaledVector(u, -this.pole.dot(u))
    if(p.lengthSq() < 1e-6) p.set(0, -1, 0)
    p.normalize()
    const E = this._e.copy(S).addScaledVector(u, UPPER * cosA).addScaledVector(p, UPPER * sinA)
    const W = this._w.copy(S).addScaledVector(u, dist)

    placeBetween(this.upper, S, E)
    placeBetween(this.fore, E, W)
    this.elbow.position.copy(E)
    this.wrist.position.copy(W)
    this.hand.group.position.copy(W)
    this.hand.group.quaternion.copy(state.q)
    this.hand.apply(state.sh)
  }
}

function buildCharacter(scene){
  const mats = {
    skin: new THREE.MeshStandardMaterial({color: 0xc48a62, roughness: .62}),
    shirt: new THREE.MeshStandardMaterial({color: 0x1f6feb, roughness: .85}),
    collar: new THREE.MeshStandardMaterial({color: 0x1858c4, roughness: .85}),
    hair: new THREE.MeshStandardMaterial({color: 0x1b1b20, roughness: .9}),
    dark: new THREE.MeshStandardMaterial({color: 0x15161a, roughness: .4}),
    lip: new THREE.MeshStandardMaterial({color: 0x8e5040, roughness: .6}),
  }

  const root = new THREE.Group()
  scene.add(root)

  // lathe profile: waist -> chest -> sloped shoulders -> neckline
  const profile = [
    [0, .78], [.17, .78], [.168, .95], [.18, 1.1], [.205, 1.26], [.225, 1.37],
    [.215, 1.44], [.17, 1.49], [.09, 1.515], [0, 1.52],
  ].map((p) => new THREE.Vector2(p[0], p[1]))
  const torso = new THREE.Mesh(new THREE.LatheGeometry(profile, 40), mats.shirt)
  torso.scale.set(1.08, 1, .68)
  torso.castShadow = true
  torso.receiveShadow = true
  root.add(torso)

  ;[-1, 1].forEach((sx) => {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.068, 20, 14), mats.shirt)
    cap.position.set(sx * SHOULDER_X, SHOULDER_Y, 0)
    cap.castShadow = true
    root.add(cap)
  })

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.048, .055, .12, 18), mats.skin)
  neck.position.y = 1.55
  root.add(neck)
  const collar = new THREE.Mesh(new THREE.TorusGeometry(.058, .014, 10, 28), mats.collar)
  collar.rotation.x = Math.PI / 2
  collar.position.y = 1.505
  root.add(collar)

  const head = new THREE.Group()
  head.position.y = 1.66
  root.add(head)
  const skull = new THREE.Mesh(new THREE.SphereGeometry(.115, 32, 24), mats.skin)
  skull.scale.set(.93, 1.1, 1)
  skull.position.y = .05
  skull.castShadow = true
  head.add(skull)

  const hair = new THREE.Mesh(new THREE.SphereGeometry(.121, 32, 16, 0, Math.PI * 2, 0, Math.PI * .45), mats.hair)
  hair.scale.set(.95, 1.1, 1.02)
  hair.position.set(0, .055, -.012)
  hair.rotation.x = -.42
  head.add(hair)

  const eyes = []
  ;[-1, 1].forEach((sx) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.013, 14, 10), mats.dark)
    eye.position.set(sx * .037, .035, .104)
    head.add(eye)
    eyes.push(eye)
    const brow = capsuleMesh(.0045, .026, mats.hair)
    brow.rotation.z = Math.PI / 2 + sx * .12
    brow.position.set(sx * .038, .066, .108)
    head.add(brow)
    const ear = new THREE.Mesh(new THREE.SphereGeometry(.024, 14, 10), mats.skin)
    ear.scale.set(.5, 1, .8)
    ear.position.set(sx * .106, .035, 0)
    head.add(ear)
  })
  const nose = new THREE.Mesh(new THREE.SphereGeometry(.015, 14, 10), mats.skin)
  nose.position.set(0, .008, .108)
  head.add(nose)
  const mouth = capsuleMesh(.006, .03, mats.lip)
  mouth.rotation.z = Math.PI / 2
  mouth.position.set(0, -.027, .088)
  head.add(mouth)

  const arms = {R: new Arm('R', root, mats), L: new Arm('L', root, mats)}
  return {root, torso, head, eyes, arms}
}

// ---------------------------------------------------------------- player
function ease(k){
  return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
}

class Player {
  constructor(){
    this.cur = {R: cloneState(REST_R), L: cloneState(REST_L), head: new V3()}
    this.items = []
    this.item = null
    this.speed = 1
    this.cb = {}
  }

  play(items, cb){
    this.items = items
    this.cb = cb || {}
    this.idx = -1
    this.next()
  }

  stop(){
    this.items = [{t: .5, hold: 0, R: REST_R, L: REST_L, head: [0, 0, 0], word: -1, letter: null}]
    this.idx = -1
    this.next()
  }

  next(){
    this.idx++
    if(this.idx >= this.items.length){
      this.item = null
      if(this.cb.done) this.cb.done()
      return
    }
    const it = this.items[this.idx]
    this.item = it
    this.t = 0
    this.from = {R: cloneState(this.cur.R), L: cloneState(this.cur.L), head: this.cur.head.clone()}
    this.toHead = new V3(it.head[0], it.head[1], it.head[2])
    if(this.cb.step) this.cb.step(it)
  }

  update(dt){
    if(!this.item) return
    this.t += dt * this.speed
    const it = this.item
    const k = ease(Math.min(1, this.t / it.t))
    ;['R', 'L'].forEach((s) => {
      const a = this.from[s], b = it[s], c = this.cur[s]
      c.pos.lerpVectors(a.pos, b.pos, k)
      c.q.slerpQuaternions(a.q, b.q, k)
      c.sh = lerpShape(a.sh, b.sh, k)
    })
    this.cur.head.lerpVectors(this.from.head, this.toHead, k)
    if(this.t >= it.t + it.hold) this.next()
  }
}

// ---------------------------------------------------------------- page wiring
const $ = (s) => document.querySelector(s)

function langOf(text){
  if(/[ಀ-೿]/.test(text)) return 'kn'
  if(/[ऀ-ॿ]/.test(text)) return 'hi'
  return 'en'
}

function init(){
  const stage = $('#avatarStage')
  if(!stage) return

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
  } catch(err) {
    console.log(err)
    $('#avatarErr').innerHTML = '<div class="err">3D graphics (WebGL) are not available in this browser, so the avatar cannot be shown.</div>'
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  stage.insertBefore(renderer.domElement, stage.firstChild)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 4 / 3, .1, 20)
  camera.position.set(0, 1.4, 2.2)
  camera.lookAt(0, 1.34, 0)

  scene.add(new THREE.HemisphereLight(0xdde8ff, 0x1a1e26, 1.1))
  const key = new THREE.DirectionalLight(0xffffff, 2.3)
  key.position.set(1.2, 2.6, 2.4)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.left = -.6
  key.shadow.camera.right = .6
  key.shadow.camera.top = 2.1
  key.shadow.camera.bottom = .8
  key.shadow.bias = -.0005
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x7fb0ff, 1.4)
  rim.position.set(-1.5, 2, -2.5)
  scene.add(rim)

  const body = buildCharacter(scene)
  const player = new Player()

  // drag to turn the avatar, double-click to face front
  let dragging = false, lastX = 0, yaw = 0
  stage.addEventListener('pointerdown', (e) => {
    dragging = true
    lastX = e.clientX
    stage.setPointerCapture(e.pointerId)
  })
  stage.addEventListener('pointermove', (e) => {
    if(!dragging) return
    yaw = Math.max(-1.1, Math.min(1.1, yaw + (e.clientX - lastX) * .008))
    lastX = e.clientX
  })
  const endDrag = () => dragging = false
  stage.addEventListener('pointerup', endDrag)
  stage.addEventListener('pointercancel', endDrag)
  stage.addEventListener('dblclick', () => yaw = 0)

  // checked every frame: the stage is 0x0 while its tab is hidden
  let sizeW = 0, sizeH = 0
  function resize(force){
    const w = stage.clientWidth, h = stage.clientHeight
    if(!w || !h) return
    if(!force && w == sizeW && h == sizeH) return
    sizeW = w
    sizeH = h
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  const clock = new THREE.Clock()
  let blinkAt = 2
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), .05)
    const currentPanel = stage.closest('.panel')
    if(currentPanel && !currentPanel.classList.contains('on')) return
    resize(false)
    const t = clock.elapsedTime

    player.update(dt)
    body.arms.R.pose(player.cur.R)
    body.arms.L.pose(player.cur.L)

    // idle life: breathing, slight sway, blinking
    body.torso.scale.x = 1.08 + Math.sin(t * 1.6) * .006
    body.head.rotation.set(
      player.cur.head.x + Math.sin(t * .7) * .015,
      player.cur.head.y + Math.sin(t * .45) * .02,
      player.cur.head.z
    )
    if(t > blinkAt){
      const b = (t - blinkAt) / .14
      const sy = b < 1 ? Math.abs(1 - 2 * b) : 1
      body.eyes.forEach((e) => e.scale.y = Math.max(.1, sy))
      if(b >= 1) blinkAt = t + 2 + Math.random() * 3
    }
    body.root.rotation.y += (yaw - body.root.rotation.y) * .15

    renderer.render(scene, camera)
  })

  // ------------------------------------------------ UI
  let tokens = []
  let lastText = ''

  function renderChips(active){
    const chipsBox = $('#signChips')
    if(!chipsBox) return
    chipsBox.innerHTML = ''
    if(!tokens.length){
      const span = document.createElement('span')
      span.className = 'chip skip'
      span.textContent = 'nothing to sign'
      chipsBox.appendChild(span)
      return
    }
    tokens.forEach((tok, i) => {
      const span = document.createElement('span')
      span.className = 'chip ' + tok.kind + (i == active ? ' active' : '')
      span.textContent = tok.gloss
      if(tok.kind == 'spell') span.title = 'fingerspelled'
      if(tok.kind == 'skip') span.title = 'no sign in the dictionary'
      chipsBox.appendChild(span)
    })
  }

  function setCaption(tok, letter){
    const caption = $('#avatarCaption')
    if(!caption) return
    caption.innerHTML = ''
    if(!tok) return
    if(tok.kind == 'spell'){
      tok.word.toUpperCase().split('').forEach((ch, i) => {
        const s = document.createElement('span')
        s.textContent = ch
        if(i == letter) s.className = 'on'
        caption.appendChild(s)
      })
    } else {
      caption.textContent = tok.gloss
    }
  }

  function sign(text){
    text = (text || '').trim()
    if(!text) return
    lastText = text
    const errBox = $('#avatarErr')
    if(errBox) errBox.innerHTML = ''
    tokens = textToTokens(text)
    renderChips(-1)
    const items = buildTimeline(tokens)
    if(!items.length){
      setCaption(null)
      if(errBox) errBox.innerHTML = '<div class="err">None of those words are in the sign dictionary, and non-English words can\'t be fingerspelled.</div>'
      return
    }
    const speakOpt = $('#speakWhileSigning')
    if(speakOpt && speakOpt.checked && window.CogniSign) {
      window.CogniSign.speak(text, langOf(text))
    }
    player.play(items, {
      step: (it) => {
        renderChips(it.word)
        setCaption(it.word >= 0 ? tokens[it.word] : null, it.letter)
      },
      done: () => renderChips(-1),
    })
  }

  const btnSignIt = $('#btnSignIt')
  if(btnSignIt) btnSignIt.addEventListener('click', () => sign($('#signInput') ? $('#signInput').value : ''))
  const signInput = $('#signInput')
  if(signInput) {
    signInput.addEventListener('keydown', (e) => {
      if(e.key == 'Enter') sign(signInput.value)
    })
  }
  const btnReplay = $('#btnReplaySign')
  if(btnReplay) btnReplay.addEventListener('click', () => sign(lastText || (signInput ? signInput.value : '')))
  const btnStop = $('#btnStopSign')
  if(btnStop) {
    btnStop.addEventListener('click', () => {
      player.stop()
      setCaption(null)
      renderChips(-1)
    })
  }
  const speedSel = $('#signSpeed')
  if(speedSel) speedSel.addEventListener('change', () => player.speed = parseFloat(speedSel.value))

  document.querySelectorAll('#signExamples button').forEach((b) => {
    b.addEventListener('click', () => {
      if(signInput) signInput.value = b.textContent
      sign(b.textContent)
    })
  })

  // dictionary list for the presenter
  const dict = $('#signDict')
  if(dict){
    Object.keys(SIGNS).forEach((g) => {
      const s = document.createElement('span')
      s.textContent = g
      s.title = 'click to sign'
      s.addEventListener('click', () => {
        if(signInput) signInput.value = g.toLowerCase().replace('-', ' ')
        sign(signInput ? signInput.value : g)
      })
      dict.appendChild(s)
    })
  }
  if($('#signDictCount')) $('#signDictCount').textContent = Object.keys(SIGNS).length

  // dictate
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
  let rec = null
  const btnMic = $('#btnSignMic')
  if(btnMic){
    btnMic.addEventListener('click', () => {
      if(!Recognition){
        if($('#avatarErr')) $('#avatarErr').innerHTML = '<div class="err">This browser has no speech recognition. Use Chrome, or type instead.</div>'
        return
      }
      if(rec){
        rec.stop()
        return
      }
      rec = new Recognition()
      const langSel = $('#signLang')
      rec.lang = {en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN'}[langSel ? langSel.value : 'en'] || 'en-IN'
      rec.interimResults = true
      rec.continuous = false
      btnMic.textContent = 'Stop'
      btnMic.classList.add('stop')
      rec.onresult = (e) => {
        const t = Array.from(e.results).map((r) => r[0].transcript).join('')
        if(signInput) signInput.value = t
        if(e.results[e.results.length - 1].isFinal) sign(t)
      }
      rec.onerror = (e) => {
        if(e.error == 'not-allowed' && $('#avatarErr')) $('#avatarErr').innerHTML = '<div class="err">Microphone access was blocked. Allow it in the address bar and try again.</div>'
      }
      rec.onend = () => {
        rec = null
        btnMic.textContent = 'Dictate'
        btnMic.classList.remove('stop')
      }
      rec.start()
    })
  }

  // jump straight to one keyframe (for checking poses)
  function pose(text, frame){
    const items = buildTimeline(textToTokens(text))
    const it = items[Math.min(frame || 0, items.length - 2)]
    if(!it) return
    player.item = null
    player.cur = {R: cloneState(it.R), L: cloneState(it.L), head: new V3(it.head[0], it.head[1], it.head[2])}
  }

  window.CogniAvatar = {sign, pose, resize, player, stage, stop: () => { player.stop(); setCaption(null); renderChips(-1) }}
}

if(document.readyState == 'loading') document.addEventListener('DOMContentLoaded', init)
else init()
