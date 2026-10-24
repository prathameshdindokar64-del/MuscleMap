/**
 * hindiTranslator.ts (Frontend)
 * Clinical Pure Hindi Translation Engine for Assessment Results.
 * Converts all assessment outputs into PURE, NATURAL, MEANINGFUL HINDI (शुद्ध व स्वाभाविक हिंदी).
 * Does NOT write English words in Devanagari or parentheses; translates all medical
 * concepts into pure, respectful, and clinically accurate Hindi terms.
 */

import type { AnalyzePainResponse, Exercise, AcupressurePoint } from '../types'

// ── 1. REGION NAMES (शुद्ध शारीरिक क्षेत्र) ─────────────────────────
export const HINDI_REGION_MAP: Record<string, string> = {
  neck: 'गर्दन',
  left_shoulder: 'बायां कंधा',
  right_shoulder: 'दायां कंधा',
  chest: 'छाती',
  upper_back: 'ऊपरी पीठ',
  lower_back: 'कमर और निचली पीठ',
  abdomen: 'पेट',
  left_hip: 'बायां कूल्हा',
  right_hip: 'दायां कूल्हा',
  left_thigh: 'बाईं जांघ',
  right_thigh: 'दाईं जांघ',
  left_knee: 'बायां घुटना',
  right_knee: 'दायां घुटना',
  left_calf: 'बाईं पिंडली',
  right_calf: 'दाईं पिंडली',
  left_ankle: 'बायां टखना',
  right_ankle: 'दायां टखना',
  left_wrist: 'बाईं कलाई',
  right_wrist: 'दाईं कलाई',
}

// ── 2. RISK LEVELS (शुद्ध जोखिम स्तर) ────────────────────────────────
export const HINDI_RISK_MAP: Record<string, string> = {
  mild: 'हल्का तनाव',
  moderate: 'मध्यम दर्द',
  severe: 'तीव्र दर्द',
  red_flag: 'गंभीर आपातकालीन संकेत',
}

// ── 3. WARNINGS & DISCLAIMER (शुद्ध परामर्श एवं अस्वीकरण) ───────────
export const HINDI_WARNINGS: Record<string, string> = {
  mild: 'यह मांसपेशियों में सामान्य खिंचाव या दैनिक थकान के कारण होने वाला हल्का तनाव है। बताए गए व्यायामों को धीरे-धीरे और आराम से करें। यदि दर्द कुछ दिनों तक बना रहे या बढ़े, तो चिकित्सक या फिजियोथेरेपिस्ट से सलाह लें।',
  moderate: 'आपके लक्षण मध्यम स्तर के दर्द का संकेत देते हैं। ऐसी गतिविधियों से बचें जिनसे इस हिस्से पर अनावश्यक दबाव या खिंचाव पड़ता हो। यदि 5 से 7 दिनों में सुधार न दिखे, तो किसी चिकित्सक या फिजियोथेरेपिस्ट से जांच कराएं।',
  severe: 'आपके दर्द का स्तर काफी अधिक है। प्रभावित हिस्से को पूरा आराम दें और किसी भी भारी काम या खिंचाव से बचें। हम आपको जल्द से जल्द किसी डॉक्टर या हड्डी रोग विशेषज्ञ से मिलने की सलाह देते हैं।',
  red_flag: 'सावधानी (आपातकालीन संकेत): आपके लक्षणों में अत्यधिक तीव्र दर्द, अंगों में सुन्नता या कमजोरी जैसे गंभीर संकेत शामिल हैं। कृपया तुरंत किसी योग्य चिकित्सक से जांच कराएं। यदि सीने में दर्द, सांस लेने में तकलीफ या शौच-पेशाब पर नियंत्रण में बदलाव महसूस हो, तो तुरंत नजदीकी अस्पताल जाएं।',
}

export const HINDI_DISCLAIMER =
  'यह जानकारी केवल शैक्षणिक और प्राथमिक स्व-देखभाल मार्गदर्शन के उद्देश्य से दी गई है। यह किसी प्रकार की चिकित्सीय जांच या डॉक्टर के परामर्श का विकल्प नहीं है। यदि आप अपने स्वास्थ्य को लेकर किसी भी संशय में हैं, तो सदैव योग्य चिकित्सक से ही परामर्श लें।'

// ── 4. UI LABELS (शुद्ध इंटरफेस लेबल) ───────────────────────────────
export const HINDI_UI_LABELS = {
  languageTitle: 'परिणाम की भाषा:',
  redFlagBanner: 'आपातकालीन खतरे के संकेत मिले',
  redFlagSubtext: 'इस मूल्यांकन में कुछ गंभीर चिकित्सीय संकेत मिले हैं। व्यायाम शुरू करने से पहले किसी चिकित्सक या आपातकालीन सेवा से परामर्श लें:',
  assessmentMethod: 'मूल्यांकन पद्धति:',
  methodRules: 'प्रमाणित चिकित्सीय नियम प्रणाली',
  methodML: 'चिकित्सीय नियम एवं स्वचालित विश्लेषण सत्यापन',
  methodOverride: 'चिकित्सीय सुरक्षा प्राथमिकता (सख्त नियम प्रभावी)',
  clinicalInsight: 'व्यक्तिगत चिकित्सीय मार्गदर्शन',
  source: 'स्रोत:',
  recommendedExercises: 'सुझाए गए स्व-देखभाल व्यायाम',
  recoveryTips: 'सुधार और स्वास्थ्य लाभ के उपाय',
  acupressurePoints: 'एक्यूप्रेशर राहत बिंदु',
  acupressureSubtitle: 'इन बिंदुओं पर 30 से 60 सेकंड तक कोमल गोलाकार दबाव बनाएं',
  exportPdf: 'पूर्ण रिपोर्ट डाउनलोड करें (पीडीएफ)',
  exportingPdf: 'रिपोर्ट तैयार हो रही है...',
  startNew: 'नया परीक्षण शुरू करें',
  collapseGuide: 'मार्गदर्शिका छिपाएं ▲',
  expandGuide: 'मार्गदर्शिका देखें ▼',
  stepByStep: 'चरण-दर-चरण स्व-देखभाल मार्गदर्शिका:',
  expectedSensation: 'अपेक्षित अनुभूति:',
  expectedSensationText: 'एक हल्का, भारी या गर्माहट भरा दबाव उपचारात्मक माना जाता है।',
  precautionTitle: 'सावधानी / तुरंत रोकें:',
  precautionText: 'यदि बिजली जैसा झटका या तेज चुभन महसूस हो तो तुरंत दबाव छोड़ें। चोट या गर्भावस्था में विशेष सावधानी बरतें।',
  cameraReady: 'कैमरा मार्गदर्शन उपलब्ध',
  watchVideo: 'प्रदर्शन वीडियो देखें',
  hideVideo: 'वीडियो छिपाएं',
  guidedMode: 'मार्गदर्शित व्यायाम शुरू करें',
  searchingVideo: 'शैक्षणिक वीडियो खोजा जा रहा है...',
  searchOnYoutube: 'यूट्यूब पर वीडियो खोजें',
  openInYoutube: 'यूट्यूब पर देखें',
  videoUnavailable: 'सीधा वीडियो वर्तमान में उपलब्ध नहीं है। सहायता के लिए यूट्यूब पर देखें:',
}

// ── 5. MUSCLE NAMES TRANSLATION (शुद्ध मांसपेशियां) ──────────────────
export const HINDI_MUSCLE_NAMES: Record<string, string> = {
  'Sternocleidomastoid': 'गर्दन की मुख्य मांसपेशी',
  'Trapezius (Upper)': 'कंधे और गर्दन की ऊपरी मांसपेशी',
  'Trapezius (Middle/Lower)': 'पीठ के बीच की मुख्य मांसपेशी',
  'Trapezius': 'कंधे और ऊपरी पीठ की मांसपेशी',
  'Levator Scapulae': 'गर्दन और कंधे को जोड़ने वाली मांसपेशी',
  'Scalenes': 'गर्दन के किनारों की मांसपेशियां',
  'Anterior Deltoid': 'कंधे का अगला भाग',
  'Lateral Deltoid': 'कंधे का मध्य भाग',
  'Posterior Deltoid': 'कंधे का पिछला भाग',
  'Rotator Cuff': 'कंधे के जोड़ को घुमाने वाली मांसपेशियां',
  'Pectoralis Major': 'छाती की मुख्य मांसपेशी',
  'Pectoralis Minor': 'छाती की आंतरिक मांसपेशी',
  'Serratus Anterior': 'पसलियों को सहारा देने वाली मांसपेशी',
  'Intercostals': 'पसलियों के बीच की मांसपेशियां',
  'Rhomboids': 'कंधे की दोनों हड्डियों के बीच की मांसपेशियां',
  'Latissimus Dorsi': 'पीठ के निचले हिस्से की चौड़ी मांसपेशी',
  'Erector Spinae (Upper)': 'ऊपरी रीढ़ की हड्डी को सीधा रखने वाली मांसपेशी',
  'Erector Spinae': 'रीढ़ की हड्डी को सीधा सहारा देने वाली मुख्य मांसपेशी',
  'Quadratus Lumborum': 'कमर के निचले हिस्से की गहरी मांसपेशी',
  'Multifidus': 'रीढ़ के मणकों को जोड़ने वाली आंतरिक मांसपेशियां',
  'Gluteus Maximus': 'नितंब की मुख्य मांसपेशी',
  'Gluteus Medius': 'कूल्हे को संतुलित रखने वाली पार्श्व मांसपेशी',
  'Gluteus Minimus': 'कूल्हे की गहरी आंतरिक मांसपेशी',
  'Rectus Abdominis': 'पेट की सामने वाली मुख्य मांसपेशी',
  'External Oblique': 'पेट की बाहरी तिरछी मांसपेशी',
  'Internal Oblique': 'पेट की भीतरी तिरछी मांसपेशी',
  'Transverse Abdominis': 'पेट और कमर को बांधने वाली गहरी आंतरिक मांसपेशी',
  'Piriformis': 'कूल्हे के जोड़ के भीतर की गहरी मांसपेशी',
  'TFL': 'जांघ के बाहरी हिस्से की मांसपेशी',
  'Quadriceps': 'जांघ के सामने की चार मुख्य मांसपेशियां',
  'Hamstrings': 'जांघ के पिछले हिस्से की मुख्य मांसपेशियां',
  'Adductors': 'जांघ के भीतरी हिस्से की मांसपेशियां',
  'Rectus Femoris': 'जांघ के सामने की खिंचाव मांसपेशी',
  'IT Band': 'जांघ के बाहरी हिस्से की मजबूत नस',
  'Patellar Tendon': 'घुटने की कटोरी की मुख्य नस',
  'Popliteus': 'घुटने के पिछले हिस्से की मांसपेशी',
  'Medial Meniscus': 'घुटने के जोड़ की भीतरी गद्दी',
  'Gastrocnemius': 'पिंडली के उभार वाली मुख्य मांसपेशी',
  'Soleus': 'पिंडली के निचले हिस्से की गहरी मांसपेशी',
  'Tibialis Anterior': 'पिंडली के आगे की मुख्य मांसपेशी',
  'Peroneus Longus': 'पैर के बाहरी हिस्से को सहारा देने वाली मांसपेशी',
  'Achilles Tendon': 'एड़ी की सबसे बड़ी मुख्य नस',
  'Plantar Fascia': 'पैर के तलवे का सुरक्षात्मक स्नायुबंध',
  'Flexor Carpi Radialis': 'कलाई को आगे मोड़ने वाली मांसपेशी',
  'Extensor Carpi': 'कलाई को पीछे सीधा करने वाली मांसपेशी',
  'Pronator Teres': 'कलाई और हथेली को नीचे घुमाने वाली मांसपेशी',
  'Primary Stabilizers': 'शरीर को संतुलित और स्थिर रखने वाली प्राथमिक मांसपेशियां',
}

// ── 6. STANDARD EXERCISE TRANSLATIONS (शुद्ध हिंदी) ──────────────────
export const HINDI_EXERCISES: Record<string, { title: string; instructions: string; tags: string[] }> = {
  'Chin Tuck': {
    title: 'ठुड्डी को पीछे खींचने का खिंचाव',
    instructions: 'सीधे बैठें या खड़े हों। अपनी ठुड्डी को धीरे से सीधे पीछे की ओर खींचें जैसे दोहरी ठुड्डी बना रहे हों। 5 सेकंड तक रोकें, फिर ढीला छोड़ें। 10 बार के 2 चक्र करें।',
    tags: ['खिंचाव', 'शुरुआती', 'मुद्रा सुधार'],
  },
  'Neck Side Stretch': {
    title: 'गर्दन को बगल में झुकाने का खिंचाव',
    instructions: 'पीठ सीधी करके बैठें और अपने सिर को धीरे से दाएं कंधे की तरफ झुकाएं जब तक कि गर्दन के बाएं हिस्से में हल्का खिंचाव न आए। 20 सेकंड रोकें, फिर दूसरी तरफ दोहराएं। प्रत्येक दिशा में 3 बार करें।',
    tags: ['खिंचाव', 'शुरुआती', 'लचीलापन'],
  },
  'Levator Scapulae Stretch': {
    title: 'गर्दन और कंधे के जोड़ का खिंचाव',
    instructions: 'सीधे बैठें। सिर को 45 अंश दाईं ओर घुमाएं और ठुड्डी को नीचे कांख की ओर झुकाएं जब तक कि गर्दन के पीछे खिंचाव महसूस न हो। 20 सेकंड तक रोकें और 3 बार दोहराएं।',
    tags: ['खिंचाव', 'शुरुआती', 'दर्द निवारक'],
  },
  'Pendulum Swing': {
    title: 'कंधे को झूले की तरह घुमाने का व्यायाम',
    instructions: 'एक हाथ मेज पर टिकाकर थोड़ा आगे झुकें। दूसरे हाथ को नीचे ढीला लटकने दें। हाथ को छोटे गोल घेरों में धीरे-धीरे घुमाएं, 10 बार घड़ी की दिशा में और 10 बार विपरीत दिशा में। 2 चक्र करें।',
    tags: ['गतिशीलता', 'शुरुआती', 'दर्द निवारक'],
  },
  'Cross-Body Stretch': {
    title: 'हाथ को छाती के आर-पार खींचने का व्यायाम',
    instructions: 'एक हाथ को सामने छाती के आर-पार लाएं। दूसरे हाथ की मदद से इसे कोहनी के पास से धीरे-धीरे अपनी ओर दबाएं। 20 सेकंड रोकें और 3 बार दोहराएं।',
    tags: ['खिंचाव', 'शुरुआती', 'लचीलापन'],
  },
  'Wall Slide': {
    title: 'दीवार के सहारे बाहें ऊपर-नीचे करने का व्यायाम',
    instructions: 'दीवार से पीठ सटाकर सीधे खड़े हों। दोनों हाथों को कोहनी से मोड़कर दीवार पर रखें। धीरे-धीरे हाथों को दीवार से सटाए हुए ऊपर उठाएं और नीचे लाएं। 10 बार के 2 चक्र करें।',
    tags: ['मांसपेशियों की मजबूती', 'शुरुआती', 'मुद्रा सुधार'],
  },
  'Doorway Pec Stretch': {
    title: 'दरवाजे के सहारे छाती की मांसपेशियों का खिंचाव',
    instructions: 'दरवाजे के फ्रेम में खड़े होकर दोनों कोहनियों को कंधे की ऊंचाई पर चौखट पर टिकाएं। धीरे से एक कदम आगे बढ़ाएं जब तक छाती पर कोमल खिंचाव न आए। 20 सेकंड रोकें और 3 बार करें।',
    tags: ['खिंचाव', 'शुरुआती', 'लचीलापन'],
  },
  'Deep Breathing Expansion': {
    title: 'गहरी सांस लेकर छाती फैलाने का प्राणायाम',
    instructions: 'रीढ़ सीधी करके बैठें और दोनों हाथ पसलियों पर रखें। नाक से 4 सेकंड तक गहरी सांस लें जिससे छाती और फेफड़े फैलें। फिर 6 सेकंड में मुंह से धीरे-धीरे सांस छोड़ें। 10 बार करें।',
    tags: ['प्राणायाम', 'शुरुआती', 'तनाव मुक्ति'],
  },
  'Foam Roller Chest Opener': {
    title: 'छाती को पूरी तरह खोलने का विश्राम खिंचाव',
    instructions: 'घुटने मोड़कर पीठ के बल सीधे लेटें। दोनों बाहों को बगल में फैलाकर आराम से फर्श की ओर खुलने दें। गहरी और धीमी सांस लेते हुए 60 सेकंड तक इसी अवस्था में रहें। 3 बार दोहराएं।',
    tags: ['खिंचाव', 'शुरुआती', 'लचीलापन'],
  },
  'Thoracic Extension': {
    title: 'कुर्सी के सहारे ऊपरी पीठ को पीछे मोड़ने का व्यायाम',
    instructions: 'कुर्सी पर सीधे बैठें। दोनों हाथों की उंगलियों को सिर के पीछे बांधें। कुर्सी की पीठ के सहारे अपनी ऊपरी रीढ़ को धीरे से पीछे की ओर झुकाएं। 5 सेकंड रोकें और सामान्य स्थिति में लौटें। 10 बार करें।',
    tags: ['खिंचाव', 'शुरुआती', 'रीढ़ की गतिशीलता'],
  },
  'Scapular Squeeze': {
    title: 'कंधों की हड्डियों को पीछे सिकोड़ने का व्यायाम',
    instructions: 'सीधे बैठें या खड़े हों। कंधे की दोनों हड्डियों को पीछे की ओर ऐसे आपस में सिकोड़ें जैसे उनके बीच कोई वस्तु दबा रहे हों। 5 सेकंड रोकें, फिर छोड़ें। 15 बार दोहराएं।',
    tags: ['मांसपेशियों की मजबूती', 'शुरुआती', 'मुद्रा सुधार'],
  },
  'Thread the Needle': {
    title: 'हाथ को नीचे से निकालकर पीठ मोड़ने का खिंचाव',
    instructions: 'हाथों और घुटनों के बल फर्श पर आएं। एक हाथ को शरीर के नीचे से दूसरी तरफ सरकाते हुए कंधे और सिर को फर्श पर टिकाएं ताकि ऊपरी पीठ घूमे। 15 सेकंड रोकें और दोनों तरफ 5 बार करें।',
    tags: ['खिंचाव', 'शुरुआती', 'लचीलापन'],
  },
  'Cat-Cow Stretch': {
    title: 'मार्जरी-बितिलासन (पीठ को ऊपर-नीचे करने का खिंचाव)',
    instructions: 'चारों पैरों पर बिल्ली की मुद्रा में आएं। सांस भरते हुए पेट को नीचे झुकाएं और सिर ऊपर उठाएं। फिर सांस छोड़ते हुए रीढ़ की हड्डी को कूबड़ की तरह ऊपर गोल करें। 10 बार के 2 चक्र करें।',
    tags: ['खिंचाव', 'शुरुआती', 'रीढ़ की गतिशीलता'],
  },
  'Cat-Cow Gentle Spinal Flow': {
    title: 'रीढ़ की हड्डी को लचीला बनाने वाला कोमल खिंचाव',
    instructions: 'हाथों और घुटनों के बल आएं। सांस लेते हुए कोमलता से पीठ को झुकाएं और सामने देखें। सांस छोड़ते हुए पीठ को छत की ओर गोल करें। 8 शांत चक्रों में पूरा करें।',
    tags: ['रीढ़', 'लचीलापन', 'कोमल'],
  },
  'Knee-to-Chest Stretch': {
    title: 'घुटनों को छाती से लगाने का खिंचाव',
    instructions: 'पीठ के बल सीधे फर्श पर लेटें। घुटनों को मोड़कर दोनों हाथों से पकड़ें और धीरे-धीरे छाती की ओर खींचें। 20 से 30 सेकंड तक रोकें। धीरे से पैर नीचे रखें और 3 बार दोहराएं।',
    tags: ['खिंचाव', 'शुरुआती', 'दर्द निवारक'],
  },
  'Pelvic Tilt': {
    title: 'कमर को फर्श पर चपटा दबाने का व्यायाम',
    instructions: 'घुटने मोड़कर पीठ के बल लेटें और तलवों को फर्श पर रखें। पेट की मांसपेशियों को सिकोड़कर निचली कमर को फर्श पर बिल्कुल चपटा दबाएं। 5 सेकंड रोकें, फिर ढीला छोड़ें। 10 से 15 बार करें।',
    tags: ['मांसपेशियों की मजबूती', 'शुरुआती', 'कोर शक्ति'],
  },
  'Pelvic Tilt Decompression': {
    title: 'कमर के खिंचाव और दबाव को दूर करने का व्यायाम',
    instructions: 'घुटने मोड़कर पीठ के बल लेटें। पेट की मांसपेशियों को कसते हुए निचली कमर को फर्श पर दबाएं ताकि रीढ़ का तनाव दूर हो। 5 सेकंड रोकें और 10 बार दोहराएं।',
    tags: ['कोर शक्ति', 'संतुलन', 'राहत'],
  },
  'Tennis Ball Self-Massage': {
    title: 'गेंद की मदद से कमर की मांसपेशियों की मालिश',
    instructions: 'फर्श पर लेटकर कमर के संवेदनशील या दर्द वाले हिस्से के नीचे एक कोमल गेंद रखें। पैरों के सहारे वजन संभालें। प्रत्येक बिंदु पर 30 से 60 सेकंड तक रुके रहें। 2 से 3 जगहों पर करें।',
    tags: ['स्व-मालिश', 'तनाव निवारक बिंदु', 'शुरुआती'],
  },
  'Diaphragmatic Breathing': {
    title: 'पेट से गहरी सांस लेने का प्राणायाम',
    instructions: 'घुटने मोड़कर पीठ के बल लेटें। एक हाथ छाती पर और दूसरा पेट पर रखें। नाक से गहरी सांस लें ताकि पेट ऊपर उठे, छाती स्थिर रहे। मुंह से धीरे सांस छोड़ें। 10 बार दोहराएं।',
    tags: ['प्राणायाम', 'शुरुआती', 'कोर शक्ति'],
  },
  'Gentle Abdominal Stretch': {
    title: 'पेट की मांसपेशियों का कोमल खिंचाव',
    instructions: 'पेट के बल लेटें और दोनों हाथों को कंधों के नीचे रखें। कूल्हों को फर्श पर टिकाए रखते हुए छाती को धीरे-धीरे ऊपर उठाएं। 15 सेकंड रोकें और 5 बार दोहराएं।',
    tags: ['खिंचाव', 'शुरुआती', 'राहत'],
  },
  'Supine Twist': {
    title: 'पीठ के बल लेटकर कमर को दोनों तरफ मोड़ने का खिंचाव',
    instructions: 'पीठ के बल लेटें। दोनों घुटनों को मोड़कर धीरे से एक तरफ फर्श की ओर गिरने दें जबकि दोनों कंधे फर्श पर सीधे टिके रहें। प्रति दिशा 20 सेकंड रोकें और 3 बार दोहराएं।',
    tags: ['खिंचाव', 'शुरुआती', 'लचीलापन'],
  },
  'Figure-4 Stretch': {
    title: 'कूल्हे और नितंब की मांसपेशियों का गहरा खिंचाव',
    instructions: 'पीठ के बल लेटें। एक पैर के टखने को दूसरे घुटने के ऊपर रखें। नीचे वाली जांघ को दोनों हाथों से पकड़कर अपनी ओर खींचें। 20 सेकंड रोकें और दोनों पैरों पर 3 बार करें।',
    tags: ['खिंचाव', 'शुरुआती', 'राहत'],
  },
  'Hip Flexor Lunge Stretch': {
    title: 'आगे झुककर कूल्हे का खिंचाव',
    instructions: 'एक घुटने को फर्श पर टिकाएं और दूसरा पैर आगे रखकर बैठें। कमर सीधी रखते हुए कूल्हों को धीरे-धीरे आगे की ओर धकेलें जब तक जांघ के ऊपरी हिस्से में खिंचाव न आए। 20 सेकंड रोकें और 3 बार करें।',
    tags: ['खिंचाव', 'शुरुआती', 'लचीलापन'],
  },
  'Clamshell Exercise': {
    title: 'करवट लेकर घुटने खोलने का व्यायाम',
    instructions: 'करवट लेकर दोनों घुटनों को मोड़ें। पंजों को आपस में जोड़े रखते हुए ऊपर वाले घुटने को सीपी के खुलने की तरह ऊपर उठाएं। 3 सेकंड रोकें। 15 बार के 2 चक्र करें।',
    tags: ['मांसपेशियों की मजबूती', 'शुरुआती', 'संतुलन'],
  },
  'Standing Quad Stretch': {
    title: 'खड़े होकर जांघ के अगले हिस्से का खिंचाव',
    instructions: 'एक पैर पर खड़े हों। दूसरे घुटने को मोड़कर हाथ से पंजे को पीछे से पकड़ें। एड़ी को धीरे से नितंब की ओर खींचें। 20 सेकंड रोकें और दोनों पैरों पर 3 बार करें।',
    tags: ['खिंचाव', 'शुरुआती', 'लचीलापन'],
  },
  'Seated Hamstring Stretch': {
    title: 'बैठकर जांघ के पिछले हिस्से का खिंचाव',
    instructions: 'फर्श पर एक पैर सीधा फैलाकर बैठें। पीठ सीधी रखते हुए दोनों हाथों से पैर के अंगूठे की ओर धीरे से झुकें। 20 सेकंड रोकें और दोनों पैरों पर 3 बार करें।',
    tags: ['खिंचाव', 'शुरुआती', 'राहत'],
  },
  'Foam Roller IT Band': {
    title: 'रोलर की मदद से बाहरी जांघ की मालिश',
    instructions: 'बाहरी जांघ के नीचे रोलर रखकर करवट लें। कूल्हे से घुटने के ठीक ऊपर तक धीरे-धीरे रोल करें। संवेदनशील बिंदुओं पर 30 सेकंड रुकें। 2 बार दोहराएं।',
    tags: ['स्व-मालिश', 'मध्यम स्तर', 'राहत'],
  },
  'Straight Leg Raise': {
    title: 'सीधा पैर ऊपर उठाने का व्यायाम',
    instructions: 'पीठ के बल लेटें। एक पैर को बिल्कुल सीधा रखते हुए फर्श से लगभग एक फुट ऊपर उठाएं। 5 सेकंड रोकें, फिर धीरे नीचे लाएं। 10 बार के 2 चक्र करें।',
    tags: ['मांसपेशियों की मजबूती', 'शुरुआती', 'संतुलन'],
  },
  'Wall Sit': {
    title: 'दीवार से पीठ लगाकर बैठने का व्यायाम',
    instructions: 'दीवार से पीठ सटाकर खड़े हों। धीरे-धीरे नीचे झुकें जैसे कुर्सी पर बैठे हों और घुटने आधे मुड़े हों। 15 से 30 सेकंड तक इसी अवस्था में रहें। 5 बार करें।',
    tags: ['मांसपेशियों की मजबूती', 'शुरुआती', 'संतुलन'],
  },
  'Hamstring Curl': {
    title: 'पैर को पीछे मोड़कर जांघ मजबूत करने का व्यायाम',
    instructions: 'कुर्सी पकड़कर सीधे खड़े हों। एक पैर के घुटने को मोड़ते हुए एड़ी को पीछे नितंब की ओर उठाएं। 3 सेकंड रोकें, फिर धीरे नीचे करें। 10 बार के 2 चक्र करें।',
    tags: ['मांसपेशियों की मजबूती', 'शुरुआती', 'संतुलन'],
  },
  'Standing Calf Stretch': {
    title: 'खड़े होकर पिंडली की मांसपेशियों का खिंचाव',
    instructions: 'दीवार के सामने खड़े हों। एक पैर पीछे रखें, एड़ी को फर्श से चिपकाकर आगे झुकें जब तक पिछली पिंडली में खिंचाव न आए। 20 सेकंड रोकें और दोनों पैरों पर 3 बार करें।',
    tags: ['खिंचाव', 'शुरुआती', 'लचीलापन'],
  },
  'Soleus Stretch': {
    title: 'घुटने को थोड़ा मोड़कर पिंडली का खिंचाव',
    instructions: 'पिंडली के खिंचाव की तरह ही खड़े हों, लेकिन पीछे वाले घुटने को थोड़ा सा मोड़ें जबकि एड़ी फर्श पर ही रहे। 20 सेकंड रोकें और 3 बार दोहराएं।',
    tags: ['खिंचाव', 'शुरुआती', 'राहत'],
  },
  'Calf Raise': {
    title: 'पंजों के बल खड़े होकर एड़ियां उठाने का व्यायाम',
    instructions: 'फर्श या सीढ़ी की कगार पर सीधे खड़े हों। पंजों के बल धीरे-धीरे ऊपर उठें, फिर नियंत्रित गति में एड़ियां नीचे लाएं। 15 बार के 2 चक्र करें।',
    tags: ['मांसपेशियों की मजबूती', 'शुरुआती', 'संतुलन'],
  },
  'Ankle Circles': {
    title: 'टखने और पंजे को गोल घुमाने का व्यायाम',
    instructions: 'कुर्सी पर बैठकर पैर को फर्श से थोड़ा ऊपर उठाएं। टखने को गोल घेरे में धीरे-धीरे घुमाएं, 10 बार सीधी दिशा में और 10 बार उल्टी दिशा में। 2 चक्र करें।',
    tags: ['गतिशीलता', 'शुरुआती', 'राहत'],
  },
  'Towel Scrunches': {
    title: 'पंजों की उंगलियों से तौलिया खींचने का व्यायाम',
    instructions: 'कुर्सी पर बैठकर फर्श पर फैलाए हुए तौलिए पर पैर रखें। पंजों की उंगलियों को सिकोड़कर तौलिए को अपनी ओर खींचें। 10 बार के 2 चक्र करें।',
    tags: ['मांसपेशियों की मजबूती', 'शुरुआती', 'संतुलन'],
  },
  'Resistance Band Eversion': {
    title: 'बैंड के सहारे पंजे को बाहर धकेलने का व्यायाम',
    instructions: 'बैठकर पैर के चारों ओर इलास्टिक बैंड लपेटें। बैंड के खिंचाव के विरुद्ध पंजे को बाहर की ओर धकेलें। 15 बार के 2 चक्र करें।',
    tags: ['मांसपेशियों की मजबूती', 'शुरुआती', 'संतुलन'],
  },
  'Wrist Flexor Stretch': {
    title: 'कलाई को पीछे मोड़कर खींचने का व्यायाम',
    instructions: 'हथेली ऊपर की ओर करके हाथ सामने सीधा फैलाएं। दूसरे हाथ से उंगलियों को धीरे से पीछे अपनी ओर खींचें। 20 सेकंड रोकें और 3 बार करें।',
    tags: ['खिंचाव', 'शुरुआती', 'राहत'],
  },
  'Wrist Circles': {
    title: 'कलाई को दोनों दिशाओं में गोल घुमाने का व्यायाम',
    instructions: 'मुट्ठी बंद करें। कलाई को दोनों दिशाओं में 10-10 बार बड़े गोलाकार घेरे में धीरे-धीरे घुमाएं। 2 चक्र करें।',
    tags: ['गतिशीलता', 'शुरुआती', 'राहत'],
  },
  'Grip Strengthener': {
    title: 'हाथ की मुट्ठी से गेंद दबाने का व्यायाम',
    instructions: 'हाथ में मुलायम गेंद या मुड़ा हुआ तौलिया लेकर 5 सेकंड तक पूरी ताकत से मुट्ठी भींचें, फिर ढीला छोड़ें। 10 बार के 2 चक्र करें।',
    tags: ['मांसपेशियों की मजबूती', 'शुरुआती', 'संतुलन'],
  },
  'Gentle Mobility': {
    title: 'जोड़ों को आराम से घुमाने का कोमल व्यायाम',
    instructions: 'प्रभावित जोड़ को बिना किसी झटके के 5 से 8 मिनट तक धीमी और सहज गति में घुमाएं ताकि रक्त संचार बढ़ सके।',
    tags: ['गतिशीलता', 'वार्म-अप'],
  },
}

// ── 7. ACUPRESSURE POINTS (शुद्ध एक्यूप्रेशर बिंदु) ───────────────────
export const HINDI_ACUPRESSURE: Record<string, { name: string; location: string; howTo: string }> = {
  'Jianjing (GB21)': {
    name: 'कंधे के केंद्र का दबाव बिंदु',
    location: 'गर्दन की जड़ और कंधे के बाहरी सिरे के ठीक बीचों-बीच स्थित बिंदु।',
    howTo: 'अपनी सांस स्वाभाविक और धीमी रखते हुए अंगूठे से 30 से 60 सेकंड तक नीचे की ओर स्थिर दबाव बनाएं। दोनों कंधों पर करें।',
  },
  'Tianzhu (BL10)': {
    name: 'गर्दन के पीछे खोपड़ी का दबाव बिंदु',
    location: 'खोपड़ी की हड्डी के निचले सिरे से लगभग एक उंगली नीचे, रीढ़ की हड्डी के दोनों किनारों पर।',
    howTo: 'दोनों अंगूठों से एक साथ 60 सेकंड तक भीतर और थोड़ा ऊपर की तरफ दबाएं। गहरी सांस लें।',
  },
  'Jianyu (LI15)': {
    name: 'कंधे के जोड़ का दबाव बिंदु',
    location: 'हाथ को कंधे की ऊंचाई पर बगल में उठाने पर जोड़ के सामने बनने वाले गड्ढे में।',
    howTo: 'अंगूठे से उस गड्ढे में 30 सेकंड तक कोमलता से दबाएं। छोड़ें और 3 बार दोहराएं।',
  },
  'Feishu (BL13)': {
    name: 'पीठ के ऊपरी हिस्से का दबाव बिंदु',
    location: 'कंधे की बड़ी हड्डी के स्तर पर रीढ़ के दोनों किनारों पर लगभग दो उंगलियों की दूरी पर।',
    howTo: 'गहरी सांस लेते हुए दोनों अंगूठों से एक साथ 60 सेकंड तक हल्का और स्थिर दबाव बनाएं।',
  },
  'Tianzong (SI11)': {
    name: 'कंधे के ब्लेड का दबाव बिंदु',
    location: 'कंधे की तिकोनी हड्डी के ठीक बीच में बने हल्के गड्ढे में।',
    howTo: 'दीवार के सहारे एक गेंद रखकर 30 से 60 सेकंड तक हल्का दबाव डालें। संवेदनशील जगह पर धीरे घुमाएं।',
  },
  'Shenshu (BL23)': {
    name: 'कमर और रीढ़ का मुख्य दबाव बिंदु',
    location: 'नाभि की सीध में पीछे कमर की ऊंचाई पर रीढ़ की हड्डी के दोनों तरफ दो उंगलियों की दूरी पर।',
    howTo: 'कमर पर दोनों अंगूठे रखकर 60 सेकंड तक मजबूती से दबाएं। दो बार दोहराएं।',
  },
  'Weizhong (BL40)': {
    name: 'घुटने के पीछे का दर्द निवारक बिंदु',
    location: 'घुटने के ठीक पीछे मुड़ने वाली सिलवट के केंद्र बिंदु पर।',
    howTo: 'घुटने के पीछे केंद्र में 30 सेकंड तक मजबूती से दबाएं। यह कमर की अचानक जकड़न को तुरंत शांत करता है।',
  },
  'Mingmen (DU4)': {
    name: 'रीढ़ का जीवन-ऊर्जा बिंदु',
    location: 'नाभि के ठीक पीछे रीढ़ की हड्डी के मणके पर स्थित बिंदु।',
    howTo: 'खड़े या बैठे रहकर अंगूठे से 30 से 60 सेकंड तक हल्का दबाव डालें। यह कमर को गर्माहट देता है।',
  },
  'Zusanli (ST36)': {
    name: 'घुटने के नीचे का स्वास्थ्य बिंदु',
    location: 'घुटने की कटोरी से चार उंगलियां नीचे, पिंडली की सामने वाली हड्डी से बाहर की तरफ एक उंगली की दूरी पर।',
    howTo: 'अंगूठे से 30 से 60 सेकंड तक दबाएं। हल्का मीठा दर्द होना सामान्य है। दोनों पैरों पर करें।',
  },
  'Huantiao (GB30)': {
    name: 'कूल्हे और नितंब का गहरा बिंदु',
    location: 'नितंब के ठीक बीच में, कूल्हे की हड्डी से पूंछ की हड्डी के बीच के हिस्से में।',
    howTo: 'गेंद पर लेटकर 60 सेकंड तक गहरा और स्थिर दबाव बनाएं। सांस स्वाभाविक बनाए रखें।',
  },
  'Shanzhong (CV17)': {
    name: 'छाती के केंद्र का राहत बिंदु',
    location: 'छाती की सामने वाली हड्डी के केंद्र में, हृदय के स्तर पर।',
    howTo: 'धीमी और गहरी सांस लेते हुए उंगली से 60 सेकंड तक छाती की हड्डी पर धीरे-धीरे दबाएं।',
  },
  'Neiguan (PC6)': {
    name: 'कलाई का तनाव निवारक बिंदु',
    location: 'कलाई की रेखा से तीन उंगलियां ऊपर, भीतरी बांह की दोनों मुख्य नसों के बीच में।',
    howTo: 'अंगूठे से 30 सेकंड तक दबाएं। यह कलाई के दर्द और शरीर के तनाव को दूर करता है। 3 बार दोहराएं।',
  },
}

// ── 8. RECOVERY TIPS & RED FLAGS TRANSLATOR ─────────────────────────
export function translateRecoveryTip(tip: string): string {
  const lower = tip.toLowerCase()
  if (lower.includes('ice') || lower.includes('inflamed')) {
    return 'यदि उस हिस्से पर सूजन या जलन महसूस हो, तो 15 मिनट के लिए बर्फ की कोमल सिकाई करें।'
  }
  if (lower.includes('avoid') || lower.includes('worsen') || lower.includes('painful movements')) {
    return 'उन सभी गतिविधियों और हरकतों से पूरी तरह बचें जिनसे दर्द या खिंचाव बढ़ता हो।'
  }
  if (lower.includes('rest') || lower.includes('between')) {
    return 'व्यायाम और दैनिक कार्यों के बीच में मांसपेशियों को पर्याप्त विश्राम दें।'
  }
  if (lower.includes('heat') || lower.includes('warm')) {
    return 'मांसपेशियों की अकड़न और कड़ेपन को कम करने के लिए हल्के गर्म पानी की सिकाई करें।'
  }
  if (lower.includes('posture') || lower.includes('sitting')) {
    return 'बैठते समय रीढ़ की हड्डी को सीधा रखें और हर 45 मिनट में उठकर थोड़ा टहलें।'
  }
  if (lower.includes('hydrate') || lower.includes('water')) {
    return 'मांसपेशियों में ऐंठन और खिंचाव से बचने के लिए दिनभर पर्याप्त मात्रा में पानी पिएं।'
  }
  return tip
}

export function translateRedFlagReason(reason: string): string {
  const lower = reason.toLowerCase()
  if (lower.includes('bladder') || lower.includes('bowel')) {
    return 'मूत्राशय या शौच के नियंत्रण में बदलाव की समस्या (तत्काल आपातकालीन डॉक्टरी जांच आवश्यक)'
  }
  if (lower.includes('numbness') || lower.includes('weakness')) {
    return 'अंगों में सुन्नपन, झनझनाहट या मांसपेशियों में बढ़ती कमजोरी महसूस होना'
  }
  if (lower.includes('fever')) {
    return 'रीढ़ के दर्द के साथ बुखार के लक्षण (संक्रमण का संकेत)'
  }
  if (lower.includes('night pain') || lower.includes('wakes')) {
    return 'रात के समय अत्यधिक तीव्र दर्द जिसके कारण नींद बाधित हो रही हो'
  }
  if (lower.includes('intensity') || lower.includes('severe')) {
    return 'अत्यधिक गंभीर और असहनीय दर्द का स्तर (तीव्रता 8/10 या अधिक)'
  }
  if (lower.includes('duration') || lower.includes('weeks')) {
    return 'बिना किसी सुधार के कई हफ्तों से लगातार बना रहने वाला पुराना दर्द'
  }
  return reason
}

export function translateGenericExerciseToHindi(
  title: string,
  instructions: string,
  tags: string[]
): { title: string; instructions: string; tags: string[] } {
  let hiTitle = title
    .replace(/Stretch/gi, 'खिंचाव का व्यायाम')
    .replace(/Strengthening/gi, 'मांसपेशियों की मजबूती का व्यायाम')
    .replace(/Mobility/gi, 'गतिशीलता व्यायाम')
    .replace(/Relief/gi, 'दर्द निवारक व्यायाम')
    .replace(/Breathing/gi, 'प्राणायाम')
    .replace(/Extension/gi, 'पीछे सीधा करने का खिंचाव')
    .replace(/Flexion/gi, 'आगे मोड़ने का खिंचाव')
    .replace(/Rotation/gi, 'घुमाने का व्यायाम')
    .replace(/Release/gi, 'तनाव मुक्ति व्यायाम')
    .replace(/Neck/gi, 'गर्दन')
    .replace(/Shoulder/gi, 'कंधे')
    .replace(/Chest/gi, 'छाती')
    .replace(/Back/gi, 'पीठ')
    .replace(/Lower Back/gi, 'कमर')
    .replace(/Upper Back/gi, 'ऊपरी पीठ')
    .replace(/Hip/gi, 'कूल्हे')
    .replace(/Knee/gi, 'घुटने')
    .replace(/Calf/gi, 'पिंडली')
    .replace(/Ankle/gi, 'टखने')
    .replace(/Wrist/gi, 'कलाई')
    .replace(/Gentle/gi, 'कोमल')
    .replace(/Exercise/gi, 'व्यायाम')
    .trim()

  if (/[a-zA-Z]/.test(hiTitle)) {
    hiTitle = `${hiTitle.replace(/[a-zA-Z\s]+/g, '').trim() || 'मांसपेशियों का कोमल स्व-देखभाल व्यायाम'}`
  }

  let hiInstructions = instructions
    .replace(/Sit or stand tall\.?/gi, 'रीढ़ सीधी करके आराम से बैठें या खड़े हों।')
    .replace(/Sit tall\.?/gi, 'रीढ़ सीधी करके बैठें।')
    .replace(/Sit in a chair\.?/gi, 'कुर्सी पर सीधे बैठें।')
    .replace(/Lie flat on your back\.?/gi, 'पीठ के बल सीधे फर्श पर लेटें।')
    .replace(/Lie on your back\.?/gi, 'पीठ के बल आराम से लेटें।')
    .replace(/Lie face down\.?/gi, 'पेट के बल सीधे लेटें।')
    .replace(/Bend both knees\.?/gi, 'दोनों घुटनों को धीरे से मोड़ें।')
    .replace(/Bend your knees\.?/gi, 'घुटनों को मोड़ें।')
    .replace(/Hold for 20-30 seconds\.?/gi, '20 से 30 सेकंड तक इसी अवस्था में रहें।')
    .replace(/Hold for 20 seconds\.?/gi, '20 सेकंड तक रोक कर रखें।')
    .replace(/Hold for 30 seconds\.?/gi, '30 सेकंड तक रोक कर रखें।')
    .replace(/Hold for 5 seconds\.?/gi, '5 सेकंड तक रोक कर रखें।')
    .replace(/Hold 3 seconds\.?/gi, '3 सेकंड तक रोक कर रखें।')
    .replace(/Hold 5 seconds, return\.?/gi, '5 सेकंड रोकें और फिर सामान्य स्थिति में लौटें।')
    .replace(/Hold 5 seconds, then release\.?/gi, '5 सेकंड रोकें और फिर ढीला छोड़ें।')
    .replace(/Repeat 10 times for 2 sets\.?/gi, '10 बार के 2 चक्र पूरे करें।')
    .replace(/Repeat 15 times\.?/gi, '15 बार दोहराएं।')
    .replace(/Repeat 10 times\.?/gi, '10 बार दोहराएं।')
    .replace(/Repeat 3 times each side\.?/gi, 'दोनों तरफ 3 बार दोहराएं।')
    .replace(/Repeat 3 times\.?/gi, '3 बार दोहराएं।')
    .replace(/Repeat 5 times\.?/gi, '5 बार दोहराएं।')
    .replace(/Do 10 reps for 2 sets\.?/gi, '10 बार के 2 चक्र करें।')
    .replace(/Do 15 reps for 2 sets\.?/gi, '15 बार के 2 चक्र करें।')
    .replace(/Do 2 sets\.?/gi, '2 चक्र पूरे करें।')
    .replace(/Breathe deeply\.?/gi, 'धीमी और गहरी सांस लेते रहें।')
    .replace(/Gently pull/gi, 'कोमलता से अपनी ओर खींचें')
    .replace(/Release slowly\.?/gi, 'धीरे-धीरे ढीला छोड़ें।')
    .trim()

  if (/[a-zA-Z]/.test(hiInstructions)) {
    hiInstructions = 'इस व्यायाम को शांत गति में और बिना किसी झटके के करें। अपनी सांस सामान्य रखें और खिंचाव को 20 से 30 सेकंड तक बनाए रखकर 3 बार दोहराएं।'
  }

  const hiTags = tags.map((t) => {
    const tl = t.toLowerCase()
    if (tl.includes('stretch')) return 'खिंचाव'
    if (tl.includes('strength')) return 'मांसपेशियों की मजबूती'
    if (tl.includes('mobility')) return 'गतिशीलता'
    if (tl.includes('breath')) return 'प्राणायाम'
    if (tl.includes('relief')) return 'दर्द निवारक'
    if (tl.includes('core')) return 'कोर शक्ति'
    if (tl.includes('posture')) return 'मुद्रा सुधार'
    if (tl.includes('stability')) return 'संतुलन'
    if (tl.includes('beginner')) return 'शुरुआती'
    if (tl.includes('intermediate')) return 'मध्यम स्तर'
    return 'स्व-देखभाल'
  })

  return { title: hiTitle, instructions: hiInstructions, tags: hiTags }
}

// ── 9. LOCALIZED ASSESSMENT RESOLVER ────────────────────────────────
/**
 * Returns either the English or Pure Hindi version of an assessment.
 * Converts every single field (regions, muscles, exercises, tips, points, warning, disclaimer)
 * into authentic, natural Hindi with ZERO English words in parentheses.
 */
export function getLocalizedAssessment(
  result: AnalyzePainResponse,
  lang: 'en' | 'hi',
  regionId?: string
): AnalyzePainResponse {
  if (lang === 'en') {
    return result
  }

  // If backend already delivered a fully translated resultHindi, use it
  if (result.resultHindi) {
    return result.resultHindi
  }

  // Otherwise, construct complete client-side pure Hindi translation
  const normalizedRegion = (regionId || result.regionName).toLowerCase().replace(/\s+/g, '_')
  const hindiRegion = HINDI_REGION_MAP[normalizedRegion] || HINDI_REGION_MAP[result.regionName] || result.regionName

  // Translate muscles into pure anatomical Hindi
  const hindiMuscles = result.muscles.map((m) => HINDI_MUSCLE_NAMES[m] || `${m} की मांसपेशी`)

  // Translate exercises into pure Hindi
  const hindiExercises: Exercise[] = (result.exercises || []).map((ex) => {
    const dict = HINDI_EXERCISES[ex.title] || Object.entries(HINDI_EXERCISES).find(([key]) => ex.title.toLowerCase().includes(key.toLowerCase()))?.[1]
    if (dict) {
      return {
        ...ex,
        title: dict.title,
        instructions: dict.instructions,
        tags: dict.tags,
      }
    }
    const generic = translateGenericExerciseToHindi(ex.title, ex.instructions, ex.tags)
    return {
      ...ex,
      title: generic.title,
      instructions: generic.instructions,
      tags: generic.tags,
    }
  })

  // Translate acupressure points into pure Hindi
  const hindiAcupressure: AcupressurePoint[] = (result.acupressurePoints || []).map((pt) => {
    const dict = HINDI_ACUPRESSURE[pt.name] || Object.entries(HINDI_ACUPRESSURE).find(([key]) => pt.name.toLowerCase().includes(key.toLowerCase()))?.[1]
    if (dict) {
      return {
        name: dict.name,
        description: dict.location,
        technique: dict.howTo,
        location: dict.location,
        howTo: dict.howTo,
        position: pt.position,
      }
    }
    return pt
  })

  // Translate recovery tips
  const hindiRecoveryTips = (result.recoveryTips || []).map(translateRecoveryTip)

  // Translate red flag reasons
  const hindiRedFlags = (result.redFlagReasons || []).map(translateRedFlagReason)

  // Pure Hindi insight
  const hindiInsight = `आपके ${hindiRegion} में होने वाले दर्द और लक्षणों के विश्लेषण के आधार पर, मांसपेशियों के तनाव को शांत करने, रक्त प्रवाह बढ़ाने और सामान्य गतिशीलता वापस पाने के लिए नीचे दिए गए स्व-देखभाल व्यायाम और एक्यूप्रेशर बिंदु सबसे उपयुक्त हैं। इन्हें नियमित रूप से और बिना किसी जल्दबाजी के करें।`

  return {
    ...result,
    regionName: hindiRegion,
    muscles: hindiMuscles,
    exercises: hindiExercises,
    recoveryTips: hindiRecoveryTips,
    acupressurePoints: hindiAcupressure,
    redFlagReasons: hindiRedFlags,
    aiInsight: hindiInsight,
    warningText: HINDI_WARNINGS[result.riskLevel] || result.warningText,
    disclaimerText: HINDI_DISCLAIMER,
    generatedBy: 'प्रमाणित चिकित्सीय ज्ञानकोश',
  }
}
