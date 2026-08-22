// Comprehensive Conversational Engine for General Questions & Chit-Chat (Hindi, Hinglish & English)

export interface ConversationalReply {
  isConversational: boolean
  replyHindi: string
  replyEnglish: string
}

interface PatternRule {
  patterns: RegExp[]
  replyHindi: string | (() => string)
  replyEnglish: string | (() => string)
}

const JOKES_HINDI = [
  "Doctor ne kaha, 'Aapko fresh sabziyan aur phal khane chahiye.' Maine pucha, 'Kharidne ke baad dhona padega kya?'",
  "Pappu ne dukaandar se kaha: 'Bhaiya, ek packet doodh aur 50 gram confidence dena!'",
  "Shopping list ka sabse bada jhooth: 'Bas doodh lene ja raha hoon, kuch aur nahi loonga!'",
]

const JOKES_ENGLISH = [
  "Why did the tomato blush? Because it saw the salad dressing!",
  "I told my grocery list a joke. It couldn't hold its items together!",
  "What is a grocery shopper's biggest lie? 'I'm only going to buy milk and leave.'",
]

const RULES: PatternRule[] = [
  // 1. "How are you?" / "Kaise ho?"
  {
    patterns: [
      /\b(how are you|how are you doing|how do you do|how\'s it going|how r u)\b/i,
      /\b(kaise ho|kaisi ho|kya haal|kya haal chaal|aap kaise ho|aap kaisi hain|kaise hain)\b/i,
    ],
    replyHindi: "Main bilkul badhiya hoon! Aapki grocery shopping mein madad karne ke liye tayar hoon. Aaj list mein kya add karna hai?",
    replyEnglish: "I'm doing wonderful! Ready to help you with your smart grocery list. What would you like to add today?",
  },

  // 2. "Who are you?" / "What is your name?"
  {
    patterns: [
      /\b(who are you|what is your name|what\'s your name|introduce yourself)\b/i,
      /\b(tum kaun ho|aap kaun ho|tera naam kya hai|aapka naam kya hai|kaun ho tum)\b/i,
    ],
    replyHindi: "Main VocaCart hoon, aapka smart bilingual voice shopping assistant. Main aapki grocery list manage karta hoon aur suggestions deta hoon!",
    replyEnglish: "I'm VocaCart, your intelligent bilingual voice shopping assistant. I help you build, organize, and manage your grocery shopping effortlessly!",
  },

  // 3. "What can you do?" / "Help" / "Features"
  {
    patterns: [
      /\b(what can you do|how to use|help me|what are your features|commands)\b/i,
      /\b(tum kya kar sakte ho|kya kya kar sakte ho|madad|kaise use karein|kya features hain)\b/i,
    ],
    replyHindi: "Aap aawaaz se koi bhi item add ya remove kar sakte hain (jaise '1 kilo tamatar add karo'), saare items clear kar sakte hain, recipe ke samaan maang sakte hain, ya list read karne ko keh sakte hain!",
    replyEnglish: "You can add or remove items using your voice (e.g. 'Add 2 bottles of milk'), clear your cart, ask for recipe ingredients like 'Chai ka samaan', check off items, or ask 'What is in my list?'!",
  },

  // 4. Greetings (Hello, Hi, Good Morning, etc.)
  {
    patterns: [
      /\b(hello|hi|hey|good morning|good afternoon|good evening|namaste|pranam|kem cho|vanakkam)\b/i,
      /\b(namaskar|satsriakal|adab)\b/i,
    ],
    replyHindi: "Namaste! Bataiye, aaj shopping list mein kya kya jodna hai?",
    replyEnglish: "Hello there! What grocery items would you like to add to your cart today?",
  },

  // 5. "Thank you" / "Thanks" / "Dhanyawad"
  {
    patterns: [
      /\b(thank you|thanks|thank u|thx|appreciate it)\b/i,
      /\b(dhanyawad|shukriya|bohot shukriya|meherbani)\b/i,
    ],
    replyHindi: "Aapka swagat hai! Main hamesha aapki shopping asaan banane ke liye yahan hoon.",
    replyEnglish: "You're most welcome! Always happy to make your grocery shopping quick and easy.",
  },

  // 6. "Who made you?" / "Who created you?"
  {
    patterns: [
      /\b(who created you|who made you|who is your developer|who built you)\b/i,
      /\b(tumhe kisne banaya|kisne banaya hai|aapke creator kaun hain)\b/i,
    ],
    replyHindi: "Mujhe ek talented developer ne banaya hai taaki aap grocery shopping bolkar asani se kar sakein!",
    replyEnglish: "I was created as an AI-powered voice shopping assistant to make Indian & global grocery shopping seamless!",
  },

  // 7. "Tell me a joke" / "Chutkula sunao"
  {
    patterns: [
      /\b(tell me a joke|say a joke|make me laugh|joke)\b/i,
      /\b(joke sunao|chutkula sunao|hasao|koi joke)\b/i,
    ],
    replyHindi: () => JOKES_HINDI[Math.floor(Math.random() * JOKES_HINDI.length)],
    replyEnglish: () => JOKES_ENGLISH[Math.floor(Math.random() * JOKES_ENGLISH.length)],
  },

  // 8. "What should I cook / buy today?" / "Aaj kya banau?"
  {
    patterns: [
      /\b(what should i buy|what should i cook|dinner ideas|lunch ideas|what to eat)\b/i,
      /\b(aaj kya banau|aaj kya khayein|aaj kya pakau|kya khareedu|kya suggestions hain)\b/i,
    ],
    replyHindi: "Aap Chai aur Sandwich bana sakte hain, ya phir garam Aloo Paratha! Bas kahiye 'Chai ka samaan add karo' aur main saare ingredients add kar dunga.",
    replyEnglish: "How about fresh Sandwich, Maggi, or Masala Chai with Aloo Parathas? Just say 'Add ingredients for Tea' and I'll add everything to your list!",
  },

  // 9. Compliments ("You are good / smart / great")
  {
    patterns: [
      /\b(you are smart|you are awesome|good job|great assistant|well done|nice)\b/i,
      /\b(tum bohot acche ho|shabash|badhiya|kamaal ho|smart ho)\b/i,
    ],
    replyHindi: "Tareef ke liye shukriya! Aapke saath shopping karna mera pasandeeda kaam hai.",
    replyEnglish: "Thank you so much! It's always a pleasure helping you with your grocery list.",
  },

  // 10. Goodbyes ("Bye", "See you", "Alvida")
  {
    patterns: [
      /\b(bye|goodbye|see you later|see ya|tata)\b/i,
      /\b(alvida|phir milenge|chalta hoon|chal)\b/i,
    ],
    replyHindi: "Alvida! Jab bhi shopping karni ho, bas mic dabaiye!",
    replyEnglish: "Goodbye! Have a great day, and tap the mic anytime you need groceries!",
  },
]

export function checkConversationalQuery(transcript: string): ConversationalReply {
  const t = transcript.toLowerCase().trim()
  if (!t) return { isConversational: false, replyHindi: '', replyEnglish: '' }

  for (const rule of RULES) {
    for (const p of rule.patterns) {
      if (p.test(t)) {
        const hindi = typeof rule.replyHindi === 'function' ? rule.replyHindi() : rule.replyHindi
        const english = typeof rule.replyEnglish === 'function' ? rule.replyEnglish() : rule.replyEnglish
        return {
          isConversational: true,
          replyHindi: hindi,
          replyEnglish: english,
        }
      }
    }
  }

  // Question patterns (e.g. "Kya haal hai?", "What is this?", "Weather", "Why are you here?")
  if (/^(what|why|where|how|who|when|kya|kyun|kaise|kab|kahan)\b/i.test(t) && !/\b(add|remove|delete|price|bill|total|cost|list|cart|item|tamatar|doodh|milk|bread|apple)\b/i.test(t)) {
    return {
      isConversational: true,
      replyHindi: "Main aapki grocery shopping assistant hoon! Main items add, remove, search aur organize kar sakti hoon. Aap mujhse shopping se juda kuch bhi pooch sakte hain.",
      replyEnglish: "I'm your voice shopping assistant! I can add, remove, search, and manage your grocery list. Feel free to ask me anything about your shopping!",
    }
  }

  return { isConversational: false, replyHindi: '', replyEnglish: '' }
}
