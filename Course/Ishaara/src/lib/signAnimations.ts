import { Challenge } from '@/types';

export interface SignStep {
  title: string;
  handEmoji: string;
  description: string;
  avatarPose: string;
  motionDirection?: 'left' | 'right' | 'up' | 'down' | 'circle' | 'pulse' | 'wave' | 'connect';
  badgeText: string;
}

export interface SignAnimationConfig {
  id: string;
  signName: string;
  englishMeaning: string;
  hindiMeaning?: string;
  themeColor: 'emerald' | 'amber' | 'sky' | 'rose' | 'purple' | 'orange' | 'indigo';
  avatar: string;
  backdropGlow: string;
  visualGraphic: string;
  motionTrail: string;
  steps: SignStep[];
  culturalNote?: string;
}

export const SIGN_ANIMATION_REGISTRY: Record<string, SignAnimationConfig> = {
  hello: {
    id: 'hello',
    signName: 'HELLO / GREETINGS',
    englishMeaning: 'Hello / Hi / Greetings',
    hindiMeaning: 'नमस्ते (Namaste)',
    themeColor: 'emerald',
    avatar: '🧑‍🏫',
    backdropGlow: 'from-emerald-600/30 to-teal-500/20',
    visualGraphic: '👋✨',
    motionTrail: 'Temple wave outward right-to-left',
    culturalNote: 'In ISL, placing the open palm near the temple and waving outward with eye contact is the standard greeting.',
    steps: [
      {
        title: 'Step 1: Hand at Temple',
        handEmoji: '✋',
        avatarPose: '🧑‍🏫',
        description: 'Raise dominant open hand to temple level beside forehead.',
        motionDirection: 'up',
        badgeText: 'POSITION: Temple',
      },
      {
        title: 'Step 2: Waving Outward',
        handEmoji: '👋',
        avatarPose: '😄',
        description: 'Wave open palm outward twice in a friendly arc toward the viewer.',
        motionDirection: 'wave',
        badgeText: 'MOTION: Wave 2x',
      },
      {
        title: 'Step 3: Warm Greeting',
        handEmoji: '✨',
        avatarPose: '😊',
        description: 'Hold with pleasant facial expression and smile.',
        motionDirection: 'pulse',
        badgeText: 'EXPRESSION: Smile',
      },
    ],
  },

  welcome: {
    id: 'welcome',
    signName: 'WELCOME / SWAGATAM',
    englishMeaning: 'Welcome / Please Come In',
    hindiMeaning: 'स्वागत है (Swagatam)',
    themeColor: 'emerald',
    avatar: '👩‍🏫',
    backdropGlow: 'from-teal-600/30 to-emerald-500/20',
    visualGraphic: '👐💖',
    motionTrail: 'Both hands sweep inward to chest',
    culturalNote: 'Both palms facing upward and sweeping inward welcoming guests into your space.',
    steps: [
      {
        title: 'Step 1: Open Palms Forward',
        handEmoji: '🤲',
        avatarPose: '👩‍🏫',
        description: 'Extend both hands forward at chest level with open palms facing up.',
        motionDirection: 'right',
        badgeText: 'POSITION: Open Palms',
      },
      {
        title: 'Step 2: Sweeping Inward',
        handEmoji: '👐',
        avatarPose: '😄',
        description: 'Bring both hands inward toward your chest in an inviting motion.',
        motionDirection: 'circle',
        badgeText: 'MOTION: Inward Sweep',
      },
      {
        title: 'Step 3: Welcoming Gesture',
        handEmoji: '🏡',
        avatarPose: '😊',
        description: 'Complete with a gentle nod and open hospitable demeanor.',
        motionDirection: 'pulse',
        badgeText: 'SIGN: Welcome',
      },
    ],
  },

  good_morning: {
    id: 'good_morning',
    signName: 'GOOD MORNING / SHUBH PRABHAT',
    englishMeaning: 'Good Morning',
    hindiMeaning: 'शुभ प्रभात',
    themeColor: 'amber',
    avatar: '🧑‍🎓',
    backdropGlow: 'from-amber-500/30 to-orange-500/20',
    visualGraphic: '🌅☀️',
    motionTrail: 'Thumbs-up chin touch + Rising sun arc',
    culturalNote: 'Compound sign: "Good" (chin thumbs-up) + "Morning" (arm rising like the dawn sun).',
    steps: [
      {
        title: 'Step 1: Sign "Good"',
        handEmoji: '👍',
        avatarPose: '🧑‍🎓',
        description: 'Touch thumb to chin with thumbs-up fist signifying "Good".',
        motionDirection: 'up',
        badgeText: 'PART 1: Good (Chin)',
      },
      {
        title: 'Step 2: Sun Rising Arc',
        handEmoji: '🌅',
        avatarPose: '😃',
        description: 'Sweep your arm upward from horizon level representing the rising sun.',
        motionDirection: 'up',
        badgeText: 'PART 2: Sun Rising',
      },
      {
        title: 'Step 3: Bright Day',
        handEmoji: '☀️',
        avatarPose: '✨',
        description: 'Open fingers like beaming morning sunlight.',
        motionDirection: 'pulse',
        badgeText: 'MEANING: Morning',
      },
    ],
  },

  thank_you: {
    id: 'thank_you',
    signName: 'THANK YOU / DHANYAVAD',
    englishMeaning: 'Thank You / Thanks',
    hindiMeaning: 'धन्यवाद / शुक्रिया',
    themeColor: 'sky',
    avatar: '👩‍🎓',
    backdropGlow: 'from-sky-500/30 to-blue-600/20',
    visualGraphic: '🙏💫',
    motionTrail: 'Chin tap extending outward to viewer',
    culturalNote: 'Touch fingers to lips or chin and extend outward towards the person you are thanking.',
    steps: [
      {
        title: 'Step 1: Touch Chin / Lips',
        handEmoji: '👆',
        avatarPose: '👩‍🎓',
        description: 'Place flat fingertips gently against your chin or lower lip.',
        motionDirection: 'down',
        badgeText: 'STEP 1: Touch Chin',
      },
      {
        title: 'Step 2: Move Forward',
        handEmoji: '🫲',
        avatarPose: '😊',
        description: 'Extend the hand forward toward the other person with palm facing up.',
        motionDirection: 'right',
        badgeText: 'STEP 2: Extend Out',
      },
      {
        title: 'Step 3: Respectful Nod',
        handEmoji: '🙏',
        avatarPose: '😇',
        description: 'Slight head nod expressing sincere gratitude and thanks.',
        motionDirection: 'pulse',
        badgeText: 'STEP 3: Gratitude',
      },
    ],
  },

  please: {
    id: 'please',
    signName: 'PLEASE / KRIPYA',
    englishMeaning: 'Please / Kindly',
    hindiMeaning: 'कृपया (Kripya)',
    themeColor: 'rose',
    avatar: '🧑‍💼',
    backdropGlow: 'from-rose-500/30 to-pink-600/20',
    visualGraphic: '❤️✨',
    motionTrail: 'Clockwise palm rubbing on center of chest',
    culturalNote: 'Rubbing the flat open hand in a circle over the heart signifies heartfelt request.',
    steps: [
      {
        title: 'Step 1: Palm on Heart',
        handEmoji: '✋',
        avatarPose: '🧑‍💼',
        description: 'Place open right palm flat on center of chest over the heart.',
        motionDirection: 'down',
        badgeText: 'POSITION: Chest/Heart',
      },
      {
        title: 'Step 2: Circular Rubbing',
        handEmoji: '🔄',
        avatarPose: '😌',
        description: 'Rub gently in a smooth clockwise circular motion.',
        motionDirection: 'circle',
        badgeText: 'MOTION: Circular Rub',
      },
      {
        title: 'Step 3: Polite Request',
        handEmoji: '❤️',
        avatarPose: '🥺',
        description: 'Keep soft, polite facial expression showing request.',
        motionDirection: 'pulse',
        badgeText: 'EXPRESSION: Polite',
      },
    ],
  },

  sorry: {
    id: 'sorry',
    signName: 'SORRY / MAAF KIJIYE',
    englishMeaning: 'Sorry / Apologies',
    hindiMeaning: 'माफ़ कीजिए (Maaf Kijiye)',
    themeColor: 'purple',
    avatar: '🙇‍♂️',
    backdropGlow: 'from-purple-600/30 to-indigo-600/20',
    visualGraphic: '🙇💔',
    motionTrail: 'Fist circular motion on chest + head tilt',
    culturalNote: 'Closed fist with thumb rubbing over chest accompanied by an apologetic facial expression.',
    steps: [
      {
        title: 'Step 1: Fist over Chest',
        handEmoji: '✊',
        avatarPose: '🙇‍♂️',
        description: 'Form a loose closed fist and position against upper center chest.',
        motionDirection: 'down',
        badgeText: 'POSITION: Closed Fist',
      },
      {
        title: 'Step 2: Circular Apology',
        handEmoji: '🔄',
        avatarPose: '😔',
        description: 'Rotate the fist in small circular motions against the chest.',
        motionDirection: 'circle',
        badgeText: 'MOTION: Chest Rub',
      },
      {
        title: 'Step 3: Apologetic Bow',
        handEmoji: '💔',
        avatarPose: '🙇',
        description: 'Tilt head slightly down with sincere apologetic expression.',
        motionDirection: 'down',
        badgeText: 'EXPRESSION: Apology',
      },
    ],
  },

  goodbye: {
    id: 'goodbye',
    signName: 'GOODBYE / ALVIDA',
    englishMeaning: 'Goodbye / See You Later',
    hindiMeaning: 'अलविदा / फिर मिलेंगे',
    themeColor: 'orange',
    avatar: '🙋‍♀️',
    backdropGlow: 'from-orange-500/30 to-amber-500/20',
    visualGraphic: '🙋💨',
    motionTrail: 'Open hand side-to-side parting wave',
    culturalNote: 'Raised open hand with side-to-side waving farewell motion.',
    steps: [
      {
        title: 'Step 1: Raise Hand High',
        handEmoji: '✋',
        avatarPose: '🙋‍♀️',
        description: 'Raise dominant hand upright at shoulder height.',
        motionDirection: 'up',
        badgeText: 'POSITION: Shoulder High',
      },
      {
        title: 'Step 2: Parting Wave',
        handEmoji: '👋',
        avatarPose: '😃',
        description: 'Wave hand smoothly side-to-side or open and close fingers gently.',
        motionDirection: 'wave',
        badgeText: 'MOTION: Farewell Wave',
      },
      {
        title: 'Step 3: Warm Farewell',
        handEmoji: '💫',
        avatarPose: '😊',
        description: 'Maintain friendly eye contact as you wave goodbye.',
        motionDirection: 'pulse',
        badgeText: 'SIGN: Goodbye',
      },
    ],
  },

  good_night: {
    id: 'good_night',
    signName: 'GOOD NIGHT / SHUBH RATRI',
    englishMeaning: 'Good Night / Sleep Well',
    hindiMeaning: 'शुभ रात्रि',
    themeColor: 'indigo',
    avatar: '😴',
    backdropGlow: 'from-indigo-600/40 to-slate-900/60',
    visualGraphic: '🌙✨',
    motionTrail: 'Sign Good + Hand dropping over wrist sunset',
    culturalNote: 'Sign "Good" then lower dominant hand over opposite wrist symbolizing nightfall.',
    steps: [
      {
        title: 'Step 1: Sign "Good"',
        handEmoji: '👍',
        avatarPose: '🧑‍🎓',
        description: 'Touch thumb to chin signaling "Good".',
        motionDirection: 'up',
        badgeText: 'PART 1: Good',
      },
      {
        title: 'Step 2: Sunset / Darkness',
        handEmoji: '🌘',
        avatarPose: '😌',
        description: 'Drop dominant hand downward over the opposite horizontal wrist.',
        motionDirection: 'down',
        badgeText: 'PART 2: Nightfall',
      },
      {
        title: 'Step 3: Restful Night',
        handEmoji: '🌙',
        avatarPose: '😴',
        description: 'Hand resting over wrist like the moon over the horizon.',
        motionDirection: 'pulse',
        badgeText: 'MEANING: Good Night',
      },
    ],
  },

  number_1: {
    id: 'number_1',
    signName: 'NUMBER 1 (EK)',
    englishMeaning: 'Number One (1)',
    hindiMeaning: 'संख्या १ (एक)',
    themeColor: 'sky',
    avatar: '🧑‍🏫',
    backdropGlow: 'from-sky-500/30 to-blue-500/20',
    visualGraphic: '☝️1️⃣',
    motionTrail: 'Single index finger pointing upright',
    culturalNote: 'Vertical index finger extended with palm facing outward.',
    steps: [
      {
        title: 'Step 1: Make Fist',
        handEmoji: '✊',
        avatarPose: '🧑‍🏫',
        description: 'Start with right hand in a comfortable fist.',
        motionDirection: 'up',
        badgeText: 'BASE: Fist',
      },
      {
        title: 'Step 2: Raise Index Finger',
        handEmoji: '☝️',
        avatarPose: '🤓',
        description: 'Extend index finger straight upward with palm facing front.',
        motionDirection: 'up',
        badgeText: 'DIGIT: 1 (One)',
      },
      {
        title: 'Step 3: Hold Steady',
        handEmoji: '1️⃣',
        avatarPose: '😊',
        description: 'Keep other 3 fingers and thumb securely tucked in.',
        motionDirection: 'pulse',
        badgeText: 'VALUE: 1',
      },
    ],
  },

  number_2: {
    id: 'number_2',
    signName: 'NUMBER 2 (DO)',
    englishMeaning: 'Number Two (2)',
    hindiMeaning: 'संख्या २ (दो)',
    themeColor: 'sky',
    avatar: '👩‍🏫',
    backdropGlow: 'from-sky-500/30 to-teal-500/20',
    visualGraphic: '✌️2️⃣',
    motionTrail: 'Index and middle fingers extended V-shape',
    culturalNote: 'Two fingers held vertically in a V-shape facing front.',
    steps: [
      {
        title: 'Step 1: Form Hand Shape',
        handEmoji: '☝️',
        avatarPose: '👩‍🏫',
        description: 'Extend index finger first from closed fist.',
        motionDirection: 'up',
        badgeText: 'START: 1',
      },
      {
        title: 'Step 2: Extend Middle Finger',
        handEmoji: '✌️',
        avatarPose: '😄',
        description: 'Raise middle finger alongside index finger forming a clean "V".',
        motionDirection: 'up',
        badgeText: 'DIGIT: 2 (Two)',
      },
      {
        title: 'Step 3: Clear V-Shape',
        handEmoji: '2️⃣',
        avatarPose: '😊',
        description: 'Hold palm facing outward clearly for the viewer.',
        motionDirection: 'pulse',
        badgeText: 'VALUE: 2',
      },
    ],
  },

  number_5: {
    id: 'number_5',
    signName: 'NUMBER 5 (PAANCH)',
    englishMeaning: 'Number Five (5)',
    hindiMeaning: 'संख्या ५ (पाँच)',
    themeColor: 'sky',
    avatar: '🧑‍🏫',
    backdropGlow: 'from-sky-500/30 to-indigo-500/20',
    visualGraphic: '🖐️5️⃣',
    motionTrail: 'All 5 digits spread open facing front',
    culturalNote: 'Open hand with all 5 digits spread outwards.',
    steps: [
      {
        title: 'Step 1: Open Palm',
        handEmoji: '✋',
        avatarPose: '🧑‍🏫',
        description: 'Raise hand upright at chest/face level.',
        motionDirection: 'up',
        badgeText: 'POSITION: Raised',
      },
      {
        title: 'Step 2: Spread All 5 Digits',
        handEmoji: '🖐️',
        avatarPose: '😃',
        description: 'Spread thumb and all four fingers wide apart facing forward.',
        motionDirection: 'pulse',
        badgeText: 'DIGIT: 5 (Five)',
      },
      {
        title: 'Step 3: Full Hand Shown',
        handEmoji: '5️⃣',
        avatarPose: '✨',
        description: 'Hold all 5 fingers distinct and visible.',
        motionDirection: 'pulse',
        badgeText: 'VALUE: 5',
      },
    ],
  },

  number_6: {
    id: 'number_6',
    signName: 'NUMBER 6 (CHHAH)',
    englishMeaning: 'Number Six (6 = 5 + 1)',
    hindiMeaning: 'संख्या ६ (छह)',
    themeColor: 'indigo',
    avatar: '🧑‍🏫',
    backdropGlow: 'from-indigo-500/30 to-purple-500/20',
    visualGraphic: '🖐️☝️6️⃣',
    motionTrail: '5 on base hand + 1 on dominant hand',
    culturalNote: 'In ISL two-hand counting, 6 is formed by 5 on one hand and 1 on the other.',
    steps: [
      {
        title: 'Step 1: Base Hand 5',
        handEmoji: '🖐️',
        avatarPose: '🧑‍🏫',
        description: 'Show open 5 fingers on non-dominant base hand.',
        motionDirection: 'left',
        badgeText: 'BASE: 5',
      },
      {
        title: 'Step 2: Dominant Hand 1',
        handEmoji: '☝️',
        avatarPose: '🤓',
        description: 'Add index finger (1) with the dominant hand beside it.',
        motionDirection: 'right',
        badgeText: 'ADD: 1',
      },
      {
        title: 'Step 3: Total 6',
        handEmoji: '6️⃣',
        avatarPose: '😃',
        description: 'Together (5 + 1) signifies number 6 in standard ISL.',
        motionDirection: 'connect',
        badgeText: 'VALUE: 6 (5+1)',
      },
    ],
  },

  number_10: {
    id: 'number_10',
    signName: 'NUMBER 10 (DAS)',
    englishMeaning: 'Number Ten (10 = 5 + 5)',
    hindiMeaning: 'संख्या १० (दस)',
    themeColor: 'indigo',
    avatar: '👩‍🏫',
    backdropGlow: 'from-purple-500/30 to-sky-500/20',
    visualGraphic: '👐🔟',
    motionTrail: 'Both open 5-hands presented side by side',
    culturalNote: 'Both open hands showing five fingers each represent 10 in ISL.',
    steps: [
      {
        title: 'Step 1: Raise Both Hands',
        handEmoji: '🙌',
        avatarPose: '👩‍🏫',
        description: 'Raise both hands to shoulder height.',
        motionDirection: 'up',
        badgeText: 'POSITION: Both Hands',
      },
      {
        title: 'Step 2: Flash Both 5s',
        handEmoji: '👐',
        avatarPose: '😄',
        description: 'Open all 10 fingers spread wide facing forward.',
        motionDirection: 'pulse',
        badgeText: 'DIGIT: 5 + 5',
      },
      {
        title: 'Step 3: Complete Ten',
        handEmoji: '🔟',
        avatarPose: '✨',
        description: 'Hold both open hands steady to sign 10.',
        motionDirection: 'pulse',
        badgeText: 'VALUE: 10',
      },
    ],
  },

  mother: {
    id: 'mother',
    signName: 'MOTHER / MAA',
    englishMeaning: 'Mother / Mom / Maa',
    hindiMeaning: 'माँ / माताजी',
    themeColor: 'purple',
    avatar: '👩',
    backdropGlow: 'from-purple-500/30 to-pink-500/20',
    visualGraphic: '👩💖',
    motionTrail: 'Finger touching cheek/nose-pin adorned face',
    culturalNote: 'In ISL, gesturing towards the nose-pin / cheek gently denotes Mother / female elder.',
    steps: [
      {
        title: 'Step 1: Gentle Touch',
        handEmoji: '🤏',
        avatarPose: '👩',
        description: 'Form a gentle pinch gesture near the side of the nose / cheek.',
        motionDirection: 'up',
        badgeText: 'POSITION: Cheek / Nose',
      },
      {
        title: 'Step 2: Soft Tap',
        handEmoji: '✨',
        avatarPose: '🤱',
        description: 'Gently tap twice referencing the traditional Indian nath/nose adornment.',
        motionDirection: 'pulse',
        badgeText: 'MOTION: Tap 2x',
      },
      {
        title: 'Step 3: Maternal Smile',
        handEmoji: '💖',
        avatarPose: '🥰',
        description: 'Warm, loving facial expression symbolizing Mother.',
        motionDirection: 'pulse',
        badgeText: 'SIGN: Mother (Maa)',
      },
    ],
  },

  father: {
    id: 'father',
    signName: 'FATHER / PITAJI',
    englishMeaning: 'Father / Dad / Papa',
    hindiMeaning: 'पिताजी / पापा',
    themeColor: 'purple',
    avatar: '👨',
    backdropGlow: 'from-indigo-500/30 to-purple-500/20',
    visualGraphic: '👨🧔',
    motionTrail: 'Mustache twirl gesture at upper lip',
    culturalNote: 'Iconic stroke/twirl of the mustache at upper lip represents Father or male elder in ISL.',
    steps: [
      {
        title: 'Step 1: Pinch at Upper Lip',
        handEmoji: '🤏',
        avatarPose: '👨',
        description: 'Place thumb and index finger together at center of upper lip.',
        motionDirection: 'up',
        badgeText: 'POSITION: Upper Lip',
      },
      {
        title: 'Step 2: Twirl Outward',
        handEmoji: '💫',
        avatarPose: '🧔',
        description: 'Twirl fingers outward toward the edge of the mouth like mustache tips.',
        motionDirection: 'right',
        badgeText: 'MOTION: Mustache Twirl',
      },
      {
        title: 'Step 3: Proud Posture',
        handEmoji: '👑',
        avatarPose: '😎',
        description: 'Stand with dignified posture representing Father.',
        motionDirection: 'pulse',
        badgeText: 'SIGN: Father (Pitaji)',
      },
    ],
  },

  friend: {
    id: 'friend',
    signName: 'FRIEND / DOST',
    englishMeaning: 'Friend / Companion',
    hindiMeaning: 'दोस्त / मित्र',
    themeColor: 'purple',
    avatar: '🧑‍🤝‍🧑',
    backdropGlow: 'from-purple-500/30 to-teal-500/20',
    visualGraphic: '🤝✨',
    motionTrail: 'Interlocking index fingers hooked together',
    culturalNote: 'Both hooked index fingers interlocked together symbolizing the unbreakable bond of friendship.',
    steps: [
      {
        title: 'Step 1: Hook Index Fingers',
        handEmoji: '🤞',
        avatarPose: '🧑‍🤝‍🧑',
        description: 'Curve both index fingers into small hooks facing each other.',
        motionDirection: 'connect',
        badgeText: 'POSITION: Hooked Fingers',
      },
      {
        title: 'Step 2: Interlock Together',
        handEmoji: '🤝',
        avatarPose: '😄',
        description: 'Lock right index finger over left index finger securely.',
        motionDirection: 'connect',
        badgeText: 'MOTION: Interlock',
      },
      {
        title: 'Step 3: Bond of Friendship',
        handEmoji: '💛',
        avatarPose: '😊',
        description: 'Give a gentle tug showing strong bond between friends.',
        motionDirection: 'pulse',
        badgeText: 'SIGN: Friend (Dost)',
      },
    ],
  },

  red: {
    id: 'red',
    signName: 'COLOR: RED / LAAL',
    englishMeaning: 'Red Color',
    hindiMeaning: 'लाल रंग (Laal Rang)',
    themeColor: 'rose',
    avatar: '👩‍🎨',
    backdropGlow: 'from-rose-600/40 to-red-600/30',
    visualGraphic: '🔴💄',
    motionTrail: 'Index finger brushing downward on red lips',
    culturalNote: 'In ISL, touching or brushing the index finger against the lips indicates the color Red.',
    steps: [
      {
        title: 'Step 1: Index to Lips',
        handEmoji: '☝️',
        avatarPose: '👩‍🎨',
        description: 'Point index finger directly at lower lip.',
        motionDirection: 'up',
        badgeText: 'POSITION: Lips',
      },
      {
        title: 'Step 2: Brush Downward',
        handEmoji: '👇',
        avatarPose: '💋',
        description: 'Brush the fingertip gently downward across the lower lip.',
        motionDirection: 'down',
        badgeText: 'MOTION: Lip Brush',
      },
      {
        title: 'Step 3: Red Spotlight',
        handEmoji: '🔴',
        avatarPose: '🎨',
        description: 'Signifies the natural red color of lips.',
        motionDirection: 'pulse',
        badgeText: 'COLOR: Red',
      },
    ],
  },

  brush_teeth: {
    id: 'brush_teeth',
    signName: 'BRUSH TEETH / DAANT SAAF',
    englishMeaning: 'Brush Teeth / Oral Care',
    hindiMeaning: 'दाँत साफ करना',
    themeColor: 'amber',
    avatar: '🪥',
    backdropGlow: 'from-cyan-500/30 to-sky-500/20',
    visualGraphic: '🦷✨',
    motionTrail: 'Horizontal scrubbing motion in front of teeth',
    culturalNote: 'Mimicking holding a toothbrush and brushing horizontally across smiling teeth.',
    steps: [
      {
        title: 'Step 1: Hold Toothbrush',
        handEmoji: '☝️',
        avatarPose: '😁',
        description: 'Hold index finger horizontally in front of mouth like a toothbrush.',
        motionDirection: 'right',
        badgeText: 'POSITION: At Teeth',
      },
      {
        title: 'Step 2: Scrub Side-to-Side',
        handEmoji: '🪥',
        avatarPose: '😬',
        description: 'Move finger back and forth horizontally in rapid scrubbing motion.',
        motionDirection: 'wave',
        badgeText: 'MOTION: Side-to-Side',
      },
      {
        title: 'Step 3: Sparkling Clean',
        handEmoji: '✨',
        avatarPose: '😁',
        description: 'Smile wide showcasing sparkling clean teeth.',
        motionDirection: 'pulse',
        badgeText: 'ACTION: Brush Teeth',
      },
    ],
  },

  water: {
    id: 'water',
    signName: 'WATER / PAANI',
    englishMeaning: 'Water / Drinking Water',
    hindiMeaning: 'पानी / जल',
    themeColor: 'rose',
    avatar: '💧',
    backdropGlow: 'from-sky-600/40 to-cyan-500/30',
    visualGraphic: '🥤🌊',
    motionTrail: 'Curved C-shaped hand tipping toward mouth',
    culturalNote: 'Hand shaped like a cup tipped toward mouth representing drinking fresh water.',
    steps: [
      {
        title: 'Step 1: Cup the Hand',
        handEmoji: '🤏',
        avatarPose: '🧑',
        description: 'Form a curved "C" or cup shape with thumb and fingers.',
        motionDirection: 'up',
        badgeText: 'SHAPE: C-Hand Cup',
      },
      {
        title: 'Step 2: Tip Toward Mouth',
        handEmoji: '🥤',
        avatarPose: '😋',
        description: 'Tip the hand backward toward the mouth like drinking from a glass.',
        motionDirection: 'down',
        badgeText: 'MOTION: Tip to Mouth',
      },
      {
        title: 'Step 3: Refreshing Drink',
        handEmoji: '💧',
        avatarPose: '😌',
        description: 'Signifies thirst quenching fresh water.',
        motionDirection: 'pulse',
        badgeText: 'ITEM: Water (Paani)',
      },
    ],
  },

  happy: {
    id: 'happy',
    signName: 'HAPPY / KHUSH',
    englishMeaning: 'Happy / Joyful / Cheerful',
    hindiMeaning: 'खुश / प्रसन्न',
    themeColor: 'emerald',
    avatar: '😄',
    backdropGlow: 'from-emerald-500/30 to-amber-500/20',
    visualGraphic: '🎉✨',
    motionTrail: 'Both open palms sweeping upward on chest',
    culturalNote: 'Sweeping hands upward on the chest with a beaming joyful smile.',
    steps: [
      {
        title: 'Step 1: Hands on Lower Chest',
        handEmoji: '👐',
        avatarPose: '🙂',
        description: 'Place both flat palms on lower chest level.',
        motionDirection: 'down',
        badgeText: 'POSITION: Chest Base',
      },
      {
        title: 'Step 2: Sweep Upward Twice',
        handEmoji: '🙌',
        avatarPose: '😃',
        description: 'Brush both hands upward in repeated cheerful upward strokes.',
        motionDirection: 'up',
        badgeText: 'MOTION: Upward Sweep',
      },
      {
        title: 'Step 3: Beaming Smile',
        handEmoji: '🎉',
        avatarPose: '😁',
        description: 'Radiant smile and bright eyes expressing pure joy.',
        motionDirection: 'pulse',
        badgeText: 'FEELING: Happy',
      },
    ],
  },

  home: {
    id: 'home',
    signName: 'HOME / GHAR',
    englishMeaning: 'Home / House / Residence',
    hindiMeaning: 'घर / निवास',
    themeColor: 'sky',
    avatar: '🏠',
    backdropGlow: 'from-sky-500/30 to-amber-500/20',
    visualGraphic: '🏡✨',
    motionTrail: 'Two palms touching at fingertips forming roof peak',
    culturalNote: 'Both hands meet diagonally at fingertips forming the shape of a house roof.',
    steps: [
      {
        title: 'Step 1: Bring Hands Together',
        handEmoji: '🫲🫱',
        avatarPose: '🧑‍💼',
        description: 'Bring both flat hands upward in front of chest.',
        motionDirection: 'connect',
        badgeText: 'POSITION: Front Chest',
      },
      {
        title: 'Step 2: Form Roof Peak',
        handEmoji: '📐',
        avatarPose: '😄',
        description: 'Touch fingertips together at an angle forming a triangular roof.',
        motionDirection: 'connect',
        badgeText: 'SHAPE: Roof Peak',
      },
      {
        title: 'Step 3: Safe Shelter',
        handEmoji: '🏠',
        avatarPose: '😌',
        description: 'Hold the roof structure representing home and shelter.',
        motionDirection: 'pulse',
        badgeText: 'PLACE: Home (Ghar)',
      },
    ],
  },
};

/**
 * Intelligent helper to resolve the exact SignAnimationConfig for any Challenge
 */
export function resolveSignAnimation(challenge: Challenge): SignAnimationConfig {
  const text = `${challenge.id} ${challenge.question} ${challenge.videoSignLabel || ''} ${challenge.explanation || ''} ${challenge.hint || ''}`.toLowerCase();

  // Check direct matches
  if (text.includes('hello') || text.includes('greetings') || text.includes('👋') || text.includes('namaste')) {
    return SIGN_ANIMATION_REGISTRY.hello;
  }
  if (text.includes('welcome') || text.includes('swagatam') || text.includes('👐')) {
    return SIGN_ANIMATION_REGISTRY.welcome;
  }
  if (text.includes('morning') || text.includes('prabhat') || text.includes('🌅')) {
    return SIGN_ANIMATION_REGISTRY.good_morning;
  }
  if (text.includes('thank') || text.includes('dhanyavad') || text.includes('shukriya') || text.includes('gift')) {
    return SIGN_ANIMATION_REGISTRY.thank_you;
  }
  if (text.includes('please') || text.includes('kripya') || text.includes('chest motion') || text.includes('rubbed in a circular')) {
    return SIGN_ANIMATION_REGISTRY.please;
  }
  if (text.includes('sorry') || text.includes('maaf') || text.includes('apologetic')) {
    return SIGN_ANIMATION_REGISTRY.sorry;
  }
  if (text.includes('goodbye') || text.includes('farewell') || text.includes('alvida') || text.includes('parting')) {
    return SIGN_ANIMATION_REGISTRY.goodbye;
  }
  if (text.includes('night') || text.includes('ratri') || text.includes('sleep') || text.includes('sunset')) {
    return SIGN_ANIMATION_REGISTRY.good_night;
  }
  if (text.includes('index finger raised vertically') || text.includes('number "1"') || text.includes('1 (one)')) {
    return SIGN_ANIMATION_REGISTRY.number_1;
  }
  if (text.includes('forming a "v"') || text.includes('number "2"') || text.includes('2 (two)')) {
    return SIGN_ANIMATION_REGISTRY.number_2;
  }
  if (text.includes('five fingers spread') || text.includes('number "5"') || text.includes('5 (five)')) {
    return SIGN_ANIMATION_REGISTRY.number_5;
  }
  if (text.includes('5 and the other showing 1') || text.includes('6 (six)')) {
    return SIGN_ANIMATION_REGISTRY.number_6;
  }
  if (text.includes('both open hands showing five') || text.includes('10 (ten)')) {
    return SIGN_ANIMATION_REGISTRY.number_10;
  }
  if (text.includes('mother') || text.includes('maa') || text.includes('nose-ring') || text.includes('female elder')) {
    return SIGN_ANIMATION_REGISTRY.mother;
  }
  if (text.includes('father') || text.includes('pitaji') || text.includes('mustache') || text.includes('male elder')) {
    return SIGN_ANIMATION_REGISTRY.father;
  }
  if (text.includes('friend') || text.includes('dost') || text.includes('hooked together') || text.includes('interlocking')) {
    return SIGN_ANIMATION_REGISTRY.friend;
  }
  if (text.includes('red') || text.includes('laal') || text.includes('lips')) {
    return SIGN_ANIMATION_REGISTRY.red;
  }
  if (text.includes('brush') || text.includes('teeth') || text.includes('daant')) {
    return SIGN_ANIMATION_REGISTRY.brush_teeth;
  }
  if (text.includes('water') || text.includes('paani') || text.includes('drink') || text.includes('curved hand')) {
    return SIGN_ANIMATION_REGISTRY.water;
  }
  if (text.includes('happy') || text.includes('khush') || text.includes('smile') || text.includes('joy')) {
    return SIGN_ANIMATION_REGISTRY.happy;
  }
  if (text.includes('home') || text.includes('ghar') || text.includes('house') || text.includes('roof')) {
    return SIGN_ANIMATION_REGISTRY.home;
  }

  // Fallback default config custom generated from challenge attributes
  return {
    id: challenge.id,
    signName: challenge.videoSignLabel || 'ISL DEMONSTRATION SIGN',
    englishMeaning: challenge.question,
    themeColor: 'emerald',
    avatar: '🤟',
    backdropGlow: 'from-emerald-600/30 to-teal-500/20',
    visualGraphic: challenge.videoEmoji || '🤟',
    motionTrail: challenge.videoGestureGuide || 'Watch hand position, shape, and facial orientation.',
    steps: [
      {
        title: 'Step 1: Starting Hand Shape',
        handEmoji: challenge.videoEmoji || '✋',
        avatarPose: '🧑‍🏫',
        description: 'Form the initial hand shape and position.',
        motionDirection: 'up',
        badgeText: 'STEP 1: Starting Position',
      },
      {
        title: 'Step 2: Sign Motion',
        handEmoji: challenge.videoEmoji || '🤟',
        avatarPose: '😄',
        description: challenge.videoGestureGuide || 'Perform the specific trajectory and movement.',
        motionDirection: 'wave',
        badgeText: 'STEP 2: Sign Action',
      },
      {
        title: 'Step 3: Hold & Expression',
        handEmoji: '✨',
        avatarPose: '😊',
        description: 'Hold final position with matching facial expression.',
        motionDirection: 'pulse',
        badgeText: 'STEP 3: Complete Sign',
      },
    ],
  };
}
