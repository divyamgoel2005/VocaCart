import type { LanguageCode, LanguageOption } from '@/lib/api/types'

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English', hint: 'Buy 2 bottles of milk', bcp47: 'en-US' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', hint: 'दो बोतल दूध खरीदो', bcp47: 'hi-IN' },
  { code: 'hinglish', label: 'Hinglish', native: 'Hinglish', hint: '2 milk aur 5 apple add karo', bcp47: 'en-IN' },
]

// UI copy keyed by language. Adding a language = add one entry here.
export interface Strings {
  greeting: string
  prompt: string
  tapToSpeak: string
  listening: string
  processing: string
  success: string
  errorGeneric: string
  hint: string
  assistantMode: string
  searchMode: string
  cartTitle: string
  cartEmpty: string
  cartEmptyHint: string
  smartPicks: string
  smartPicksSub: string
  searchTitle: string
  searchSub: string
  activityTitle: string
  activitySub: string
  add: string
  noResults: string
  noSuggestions: string
  items: string
  interpreted: string
}

export const TRANSLATIONS: Record<LanguageCode, Strings> = {
  en: {
    greeting: 'Good to see you',
    prompt: 'What are we shopping for?',
    tapToSpeak: 'Tap to speak',
    listening: 'Listening…',
    processing: 'Making sense of that…',
    success: 'Got it',
    errorGeneric: "I didn't catch that",
    hint: 'Try: “I want 2 bottles of milk and 5 apples”',
    assistantMode: 'Voice Assistant',
    searchMode: 'Search & Add',
    cartTitle: 'Your cart',
    cartEmpty: 'Your cart is quiet',
    cartEmptyHint: 'Say what you need and it lands here, sorted for you.',
    smartPicks: 'Smart picks',
    smartPicksSub: 'Based on how you shop',
    searchTitle: 'Search & Add Products',
    searchSub: 'Type or speak to search catalog or add custom items',
    activityTitle: 'Recent voice activity',
    activitySub: 'Everything you said, in order',
    add: 'Add',
    noResults: 'Nothing in catalog matched that query',
    noSuggestions: 'No picks right now — your cart looks complete',
    items: 'items',
    interpreted: 'Interpreted as',
  },
  hi: {
    greeting: 'आपको देखकर अच्छा लगा',
    prompt: 'आज क्या खरीदना है?',
    tapToSpeak: 'बोलने के लिए दबाएँ',
    listening: 'सुन रहा हूँ…',
    processing: 'समझ रहा हूँ…',
    success: 'हो गया',
    errorGeneric: 'मैं समझ नहीं पाया',
    hint: 'बोलें: “दो बोतल दूध और पाँच सेब”',
    assistantMode: 'वॉइस सहायक',
    searchMode: 'खोजें और जोड़ें',
    cartTitle: 'आपकी सूची',
    cartEmpty: 'सूची खाली है',
    cartEmptyHint: 'जो चाहिए बोलें, यह अपने-आप यहाँ जुड़ जाएगा।',
    smartPicks: 'स्मार्ट सुझाव',
    smartPicksSub: 'आपकी खरीदारी के आधार पर',
    searchTitle: 'खोजें और जोड़ें',
    searchSub: 'कैटलॉग खोजें या नया सामान जोड़ें',
    activityTitle: 'हाल की गतिविधि',
    activitySub: 'आपने जो कहा, क्रम में',
    add: 'जोड़ें',
    noResults: 'कुछ नहीं मिला',
    noSuggestions: 'अभी कोई सुझाव नहीं — सूची पूरी लगती है',
    items: 'वस्तुएँ',
    interpreted: 'इस रूप में समझा',
  },
  hinglish: {
    greeting: 'Aapko dekh ke acha laga',
    prompt: 'Aaj kya shopping karni hai?',
    tapToSpeak: 'Bolne ke liye tap karo',
    listening: 'Sun raha hoon…',
    processing: 'Samajh raha hoon…',
    success: 'Ho gaya',
    errorGeneric: 'Samajh nahi aaya',
    hint: 'Bolo: “2 bottle milk aur 5 apple add karo”',
    assistantMode: 'Voice Assistant',
    searchMode: 'Search & Add',
    cartTitle: 'Aapki list',
    cartEmpty: 'List abhi khaali hai',
    cartEmptyHint: 'Jo chahiye bolo, yahan sort hoke aa jayega.',
    smartPicks: 'Smart picks',
    smartPicksSub: 'Aapki shopping ke hisaab se',
    searchTitle: 'Search & Add Products',
    searchSub: 'Type karo ya bolo to search or add custom items',
    activityTitle: 'Recent activity',
    activitySub: 'Jo aapne kaha, order mein',
    add: 'Add karo',
    noResults: 'Kuch match nahi hua',
    noSuggestions: 'Abhi koi pick nahi — list poori lag rahi hai',
    items: 'items',
    interpreted: 'Samjha gaya',
  },
}

export function getStrings(code: LanguageCode): Strings {
  return TRANSLATIONS[code] ?? TRANSLATIONS.en
}
