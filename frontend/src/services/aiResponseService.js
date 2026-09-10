// Multi-lingual AI Response Service - Complete with 11 Languages
const AIResponseService = {
  // Language-specific responses
  responses: {
    // ============ ENGLISH ============
    en: {
      greeting: ['Hello! How can I help you today?', 'Hi there! What would you like to do?', 'Greetings! I\'m here to assist you.'],
      navigation: {
        games: 'Opening games section...',
        dashboard: 'Going to dashboard...',
        doctor: 'Opening doctor dashboard...',
        patients: 'Opening patients list...',
        reminders: 'Opening reminders...',
        analytics: 'Opening analytics...',
        home: 'Going to home page...',
        profile: 'Opening profile...',
        settings: 'Opening settings...',
        back: 'Going back...'
      },
      games: {
        memory: 'Starting Memory Lane game...',
        routine: 'Starting Routine Builder game...',
        pattern: 'Starting Pattern Quest game...',
        story: 'Starting Story Weaver game...',
        face: 'Starting Face & Place game...',
        mindful: 'Starting Mindful Moments game...',
        gesture: 'Starting Gesture Drawing game...'
      },
      actions: {
        play: 'Starting the game...',
        pause: 'Pausing the game...',
        resume: 'Resuming the game...',
        restart: 'Restarting the game...',
        save: 'Saving your progress...',
        help: 'I can help you navigate the website, play games, check reminders, and more! Just tell me what you want to do.'
      },
      reminders: {
        add: 'I\'ll help you add a reminder. Please tell me the reminder details.',
        check: 'Checking your reminders...',
        complete: 'Marking reminder as complete...'
      },
      fallback: "I didn't quite understand that. You can say: Open Games, Go to Dashboard, Play Memory Lane, Check Reminders, or Help."
    },

    // ============ HINDI ============
    hi: {
      greeting: ['नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?', 'नमस्कार! आप क्या करना चाहेंगे?', 'हैलो! मैं आपकी सहायता के लिए यहाँ हूँ।'],
      navigation: {
        games: 'गेम्स सेक्शन खोल रहा हूँ...',
        dashboard: 'डैशबोर्ड पर जा रहा हूँ...',
        doctor: 'डॉक्टर डैशबोर्ड खोल रहा हूँ...',
        patients: 'मरीजों की सूची खोल रहा हूँ...',
        reminders: 'अनुस्मारक खोल रहा हूँ...',
        analytics: 'विश्लेषण खोल रहा हूँ...',
        home: 'होम पेज पर जा रहा हूँ...',
        profile: 'प्रोफ़ाइल खोल रहा हूँ...',
        settings: 'सेटिंग्स खोल रहा हूँ...',
        back: 'वापस जा रहा हूँ...'
      },
      games: {
        memory: 'मेमोरी लेन गेम शुरू कर रहा हूँ...',
        routine: 'रूटीन बिल्डर गेम शुरू कर रहा हूँ...',
        pattern: 'पैटर्न क्वेस्ट गेम शुरू कर रहा हूँ...',
        story: 'स्टोरी वीवर गेम शुरू कर रहा हूँ...',
        face: 'फेस एंड प्लेस गेम शुरू कर रहा हूँ...',
        mindful: 'माइंडफुल मोमेंट्स गेम शुरू कर रहा हूँ...',
        gesture: 'जेस्चर ड्रॉइंग गेम शुरू कर रहा हूँ...'
      },
      actions: {
        play: 'गेम शुरू कर रहा हूँ...',
        pause: 'गेम रोक रहा हूँ...',
        resume: 'गेम फिर से शुरू कर रहा हूँ...',
        restart: 'गेम पुनः प्रारंभ कर रहा हूँ...',
        save: 'आपकी प्रगति सहेज रहा हूँ...',
        help: 'मैं आपको वेबसाइट पर नेविगेट करने, गेम खेलने, अनुस्मारक चेक करने और बहुत कुछ में मदद कर सकता हूँ! बस मुझे बताएं कि आप क्या करना चाहते हैं।'
      },
      reminders: {
        add: 'मैं आपको अनुस्मारक जोड़ने में मदद करूँगा। कृपया मुझे अनुस्मारक का विवरण बताएं।',
        check: 'आपके अनुस्मारक चेक कर रहा हूँ...',
        complete: 'अनुस्मारक को पूर्ण के रूप में चिह्नित कर रहा हूँ...'
      },
      fallback: "मैं वह समझ नहीं पाया। आप कह सकते हैं: गेम्स खोलें, डैशबोर्ड पर जाएं, मेमोरी लेन खेलें, अनुस्मारक चेक करें, या मदद।"
    },

    // ============ ASSAMESE ============
    as: {
      greeting: ['নমস্কাৰ! মই আপোনাক কেনেকৈ সহায় কৰিব পাৰো?', 'নমস্কাৰ! আপুনি কি কৰিব বিচাৰে?', 'হেল্লো! মই আপোনাৰ সহায়ৰ বাবে ইয়াত আছো।'],
      navigation: {
        games: 'খেল বিভাগ খোলা হৈছে...',
        dashboard: 'ডেশ্বৰ্ডলৈ যাওঁ...',
        doctor: 'ডাক্তৰ ডেশ্বৰ্ড খোলা হৈছে...',
        patients: 'ৰোগীৰ তালিকা খোলা হৈছে...',
        reminders: 'স্মাৰক খোলা হৈছে...',
        analytics: 'বিশ্লেষণ খোলা হৈছে...',
        home: 'হোম পৃষ্ঠালৈ যাওঁ...',
        profile: 'প্ৰফাইল খোলা হৈছে...',
        settings: 'ছেটিংছ খোলা হৈছে...',
        back: 'উভতি যাওঁ...'
      },
      games: {
        memory: 'মেমৰি লেন খেল আৰম্ভ কৰা হৈছে...',
        routine: 'ৰুটিন বিল্ডাৰ খেল আৰম্ভ কৰা হৈছে...',
        pattern: 'পেটাৰ্ণ কোৱেষ্ট খেল আৰম্ভ কৰা হৈছে...',
        story: 'ষ্টৰি ৱীভাৰ খেল আৰম্ভ কৰা হৈছে...',
        face: 'ফেইছ এণ্ড প্লেইছ খেল আৰম্ভ কৰা হৈছে...',
        mindful: 'মাইণ্ডফুল মমেন্টছ খেল আৰম্ভ কৰা হৈছে...',
        gesture: 'জেচ্চাৰ ড্ৰয়িং খেল আৰম্ভ কৰা হৈছে...'
      },
      actions: {
        play: 'খেল আৰম্ভ কৰা হৈছে...',
        pause: 'খেল ৰখা হৈছে...',
        resume: 'খেল পুনৰ আৰম্ভ কৰা হৈছে...',
        restart: 'খেল পুনৰ প্ৰাৰম্ভ কৰা হৈছে...',
        save: 'আপোনাৰ অগ্ৰগতি সাঁচি থকা হৈছে...',
        help: 'মই আপোনাক ৱেবছাইটত নেভিগেট কৰাত, খেল খেলাত, স্মাৰক চেক কৰাত আৰু বহুত কামত সহায় কৰিব পাৰো! মোক কেৱল কওক আপুনি কি কৰিব বিচাৰে।'
      },
      reminders: {
        add: 'মই আপোনাক স্মাৰক যোগ কৰাত সহায় কৰিম। কৃপয়া মোক স্মাৰকৰ বিৱৰণ কওক।',
        check: 'আপোনাৰ স্মাৰক চেক কৰা হৈছে...',
        complete: 'স্মাৰক সম্পূৰ্ণ বুলি চিহ্নিত কৰা হৈছে...'
      },
      fallback: "মই সেইটো বুজা নাপালো। আপুনি ক'ব পাৰে: খেল খোলক, ডেশ্বৰ্ডলৈ যাওক, মেমৰি লেন খেলক, স্মাৰক চেক কৰক, বা সহায়।"
    },

    // ============ BENGALI ============
    bn: {
      greeting: ['নমস্কার! আমি আপনাকে কীভাবে সাহায্য করতে পারি?', 'নমস্কার! আপনি কী করতে চান?', 'হ্যালো! আমি আপনার সাহায্যের জন্য এখানে আছি।'],
      navigation: {
        games: 'গেম সেকশন খুলছি...',
        dashboard: 'ড্যাশবোর্ডে যাচ্ছি...',
        doctor: 'ডাক্তার ড্যাশবোর্ড খুলছি...',
        patients: 'রোগীদের তালিকা খুলছি...',
        reminders: 'রিমাইন্ডার খুলছি...',
        analytics: 'বিশ্লেষণ খুলছি...',
        home: 'হোম পেজে যাচ্ছি...',
        profile: 'প্রোফাইল খুলছি...',
        settings: 'সেটিংস খুলছি...',
        back: 'ফিরে যাচ্ছি...'
      },
      games: {
        memory: 'মেমরি লেন গেম শুরু করছি...',
        routine: 'রুটিন বিল্ডার গেম শুরু করছি...',
        pattern: 'প্যাটার্ন কোয়েস্ট গেম শুরু করছি...',
        story: 'স্টোরি উইভার গেম শুরু করছি...',
        face: 'ফেস এন্ড প্লেস গেম শুরু করছি...',
        mindful: 'মাইন্ডফুল মোমেন্টস গেম শুরু করছি...',
        gesture: 'জেসচার ড্রইং গেম শুরু করছি...'
      },
      actions: {
        play: 'গেম শুরু করছি...',
        pause: 'গেম থামাচ্ছি...',
        resume: 'গেম আবার শুরু করছি...',
        restart: 'গেম পুনরায় শুরু করছি...',
        save: 'আপনার অগ্রগতি সংরক্ষণ করছি...',
        help: 'আমি আপনাকে ওয়েবসাইটে নেভিগেট করতে, গেম খেলতে, রিমাইন্ডার চেক করতে এবং আরও অনেক কিছুতে সাহায্য করতে পারি! শুধু আমাকে বলুন আপনি কী করতে চান।'
      },
      reminders: {
        add: 'আমি আপনাকে রিমাইন্ডার যোগ করতে সাহায্য করব। দয়া করে আমাকে রিমাইন্ডারের বিবরণ বলুন।',
        check: 'আপনার রিমাইন্ডার চেক করছি...',
        complete: 'রিমাইন্ডার সম্পূর্ণ হিসেবে চিহ্নিত করছি...'
      },
      fallback: "আমি তা বুঝতে পারিনি। আপনি বলতে পারেন: গেম খুলুন, ড্যাশবোর্ডে যান, মেমরি লেন খেলুন, রিমাইন্ডার চেক করুন, বা সাহায্য।"
    },

    // ============ MARATHI ============
    mr: {
      greeting: ['नमस्कार! मी तुम्हाला कशी मदत करू शकतो?', 'नमस्कार! तुम्ही काय करू इच्छिता?', 'हॅलो! मी तुमच्या मदतीसाठी इथे आहे.'],
      navigation: {
        games: 'गेम्स सेक्शन उघडत आहे...',
        dashboard: 'डॅशबोर्डवर जात आहे...',
        doctor: 'डॉक्टर डॅशबोर्ड उघडत आहे...',
        patients: 'रुग्णांची यादी उघडत आहे...',
        reminders: 'स्मरणपत्रे उघडत आहे...',
        analytics: 'विश्लेषण उघडत आहे...',
        home: 'होम पेजवर जात आहे...',
        profile: 'प्रोफाइल उघडत आहे...',
        settings: 'सेटिंग्ज उघडत आहे...',
        back: 'मागे जात आहे...'
      },
      games: {
        memory: 'मेमरी लेन गेम सुरू करत आहे...',
        routine: 'रूटीन बिल्डर गेम सुरू करत आहे...',
        pattern: 'पॅटर्न क्वेस्ट गेम सुरू करत आहे...',
        story: 'स्टोरी वीवर गेम सुरू करत आहे...',
        face: 'फेस एंड प्लेस गेम सुरू करत आहे...',
        mindful: 'माइंडफुल मोमेंट्स गेम सुरू करत आहे...',
        gesture: 'जेस्चर ड्रॉइंग गेम सुरू करत आहे...'
      },
      actions: {
        play: 'गेम सुरू करत आहे...',
        pause: 'गेम थांबवत आहे...',
        resume: 'गेम पुन्हा सुरू करत आहे...',
        restart: 'गेम पुन्हा सुरू करत आहे...',
        save: 'तुमची प्रगती जतन करत आहे...',
        help: 'मी तुम्हाला वेबसाइटवर नेव्हिगेट करण्यात, गेम खेळण्यात, स्मरणपत्रे तपासण्यात आणि बरेच काही मदत करू शकतो! फक्त मला सांगा तुम्हाला काय करायचे आहे.'
      },
      reminders: {
        add: 'मी तुम्हाला स्मरणपत्र जोडण्यास मदत करेन. कृपया मला स्मरणपत्राचा तपशील सांगा.',
        check: 'तुमची स्मरणपत्रे तपासत आहे...',
        complete: 'स्मरणपत्र पूर्ण म्हणून चिन्हांकित करत आहे...'
      },
      fallback: "मला ते समजले नाही. तुम्ही म्हणू शकता: गेम्स उघडा, डॅशबोर्डवर जा, मेमरी लेन खेळा, स्मरणपत्रे तपासा, किंवा मदत."
    }
  },

  // Get response based on language and intent
  getResponse: (intent, lang = 'en', params = {}) => {
    const langResponses = AIResponseService.responses[lang] || AIResponseService.responses.en;
    
    const parts = intent.split('.');
    let response = langResponses;
    
    for (const part of parts) {
      if (response && response[part]) {
        response = response[part];
      } else {
        return langResponses.fallback || AIResponseService.responses.en.fallback;
      }
    }
    
    if (Array.isArray(response)) {
      return response[Math.floor(Math.random() * response.length)];
    }
    
    if (typeof response === 'string') {
      return response;
    }
    
    const keys = Object.keys(response);
    if (keys.length > 0) {
      for (const key of keys) {
        if (params[key] && response[key]) {
          return response[key];
        }
      }
      const firstKey = keys[0];
      const firstResponse = response[firstKey];
      if (Array.isArray(firstResponse)) {
        return firstResponse[Math.floor(Math.random() * firstResponse.length)];
      }
      return firstResponse;
    }
    
    return langResponses.fallback || AIResponseService.responses.en.fallback;
  },

  // AI Chat response - simulates answering questions
  getChatResponse: (question, lang = 'en') => {
    const q = question.toLowerCase();
    
    const responses = {
      en: {
        hello: ["Hello! How can I help you today?", "Hi there! Nice to meet you!", "Greetings! What can I do for you?"],
        how_are_you: ["I'm doing great, thank you for asking!", "I'm functioning perfectly! How are you?", "All systems operational!"],
        what_can_you_do: ["I can help you navigate the website, play games, set reminders, check your progress, and more!", 
                           "I'm your ReminiPlay assistant! I can open games, show your dashboard, manage reminders, and answer questions."],
        game_help: ["I can help you play Memory Lane, Routine Builder, Pattern Quest, Story Weaver, Face & Place, Mindful Moments, and Gesture Drawing!",
                    "We have 7 cognitive games designed to improve memory, attention, and cognitive skills."],
        reminder_help: ["I can help you set, check, and manage reminders for medications, appointments, and daily activities."],
        progress_help: ["You can check your cognitive score, game performance, and progress in the Dashboard or Analytics section."],
        thanks: ["You're welcome!", "Happy to help!", "Anytime!", "My pleasure!"],
        bye: ["Goodbye! Take care!", "See you later!", "Have a great day!", "Come back anytime!"],
        default: ["That's a good question! I'm still learning, but I can help you with navigation, games, reminders, and your cognitive health progress.",
                  "I'm here to help! You can ask me about games, reminders, your progress, or anything about the website."]
      },
      hi: {
        hello: ["नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?", "नमस्कार! आपसे मिलकर अच्छा लगा!", "हैलो! मैं आपके लिए क्या कर सकता हूँ?"],
        how_are_you: ["मैं बहुत अच्छा हूँ, पूछने के लिए धन्यवाद!", "मैं बिल्कुल ठीक हूँ! आप कैसे हैं?", "सब कुछ ठीक चल रहा है!"],
        what_can_you_do: ["मैं आपको वेबसाइट पर नेविगेट करने, गेम खेलने, अनुस्मारक सेट करने, आपकी प्रगति देखने और बहुत कुछ में मदद कर सकता हूँ!",
                          "मैं आपका रिमिनीप्ले सहायक हूँ! मैं गेम खोल सकता हूँ, आपका डैशबोर्ड दिखा सकता हूँ, अनुस्मारक प्रबंधित कर सकता हूँ और सवालों के जवाब दे सकता हूँ।"],
        game_help: ["मैं आपको मेमोरी लेन, रूटीन बिल्डर, पैटर्न क्वेस्ट, स्टोरी वीवर, फेस एंड प्लेस, माइंडफुल मोमेंट्स और जेस्चर ड्रॉइंग खेलने में मदद कर सकता हूँ!",
                    "हमारे पास 7 संज्ञानात्मक खेल हैं जो स्मृति, ध्यान और संज्ञानात्मक कौशल को सुधारने के लिए डिज़ाइन किए गए हैं।"],
        reminder_help: ["मैं आपको दवाओं, अपॉइंटमेंट और दैनिक गतिविधियों के लिए अनुस्मारक सेट करने, चेक करने और प्रबंधित करने में मदद कर सकता हूँ।"],
        progress_help: ["आप डैशबोर्ड या विश्लेषण अनुभाग में अपना संज्ञानात्मक स्कोर, खेल प्रदर्शन और प्रगति देख सकते हैं।"],
        thanks: ["आपका स्वागत है!", "मदद करके खुशी हुई!", "कभी भी!", "मुझे खुशी हुई!"],
        bye: ["अलविदा! ध्यान रखें!", "फिर मिलेंगे!", "आपका दिन शुभ हो!", "कभी भी वापस आएं!"],
        default: ["यह एक अच्छा सवाल है! मैं अभी भी सीख रहा हूँ, लेकिन मैं आपको नेविगेशन, खेल, अनुस्मारक और आपके संज्ञानात्मक स्वास्थ्य प्रगति में मदद कर सकता हूँ।",
                  "मैं मदद के लिए यहाँ हूँ! आप मुझसे खेल, अनुस्मारक, आपकी प्रगति या वेबसाइट के बारे में कुछ भी पूछ सकते हैं।"]
      },
      as: {
        hello: ["নমস্কাৰ! মই আপোনাক কেনেকৈ সহায় কৰিব পাৰো?", "নমস্কাৰ! আপোনাক লগ পাই ভাল লাগিল!", "হেল্লো! মই আপোনাৰ বাবে কি কৰিব পাৰো?"],
        how_are_you: ["মই বৰ ভাল, সুধিবলৈ ধন্যবাদ!", "মই সম্পূৰ্ণৰূপে ভাল কাম কৰি আছো! আপুনি কেনে?", "সব ভালে আছে!"],
        what_can_you_do: ["মই আপোনাক ৱেবছাইটত নেভিগেট কৰাত, খেল খেলাত, স্মাৰক ছেট কৰাত, আপোনাৰ অগ্ৰগতি চাবলৈ আৰু বহুত কামত সহায় কৰিব পাৰো!",
                          "মই আপোনাৰ ৰিমিনিপ্লে সহায়ক! মই খেল খুলিব পাৰো, আপোনাৰ ডেশ্বৰ্ড দেখুৱাব পাৰো, স্মাৰক পৰিচালনা কৰিব পাৰো আৰু প্ৰশ্নৰ উত্তৰ দিব পাৰো।"],
        game_help: ["মই আপোনাক মেমৰি লেন, ৰুটিন বিল্ডাৰ, পেটাৰ্ণ কোৱেষ্ট, ষ্টৰি ৱীভাৰ, ফেইছ এণ্ড প্লেইছ, মাইণ্ডফুল মমেন্টছ আৰু জেচ্চাৰ ড্ৰয়িং খেলিবলৈ সহায় কৰিব পাৰো!",
                    "আমাৰ ৭টা সংজ্ঞানাত্মক খেল আছে যি স্মৃতি, মনোযোগ আৰু সংজ্ঞানাত্মক দক্ষতা উন্নত কৰিবলৈ ডিজাইন কৰা হৈছে।"],
        reminder_help: ["মই আপোনাক ঔষধ, নিযুক্তি আৰু দৈনন্দিন কাৰ্যকলাপৰ বাবে স্মাৰক ছেট কৰাত, চেক কৰাত আৰু পৰিচালনা কৰাত সহায় কৰিব পাৰো।"],
        progress_help: ["আপুনি ডেশ্বৰ্ড বা বিশ্লেষণ বিভাগত আপোনাৰ সংজ্ঞানাত্মক স্কৰ, খেল প্ৰদৰ্শন আৰু অগ্ৰগতি চাব পাৰে।"],
        thanks: ["আপোনাক স্বাগতম!", "সহায় কৰি ভাল পালো!", "যিকোনো সময়তে!", "মোৰ আনন্দ!"],
        bye: ["বিদায়! ভালে থাকিব!", "পিছত লগ পাম!", "আপোনাৰ দিন শুভ হওক!", "যিকোনো সময়তে উভতি আহিব!"],
        default: ["এইটো এটা ভাল প্ৰশ্ন! মই এতিয়াও শিকি আছো, কিন্তু মই আপোনাক নেভিগেচন, খেল, স্মাৰক আৰু আপোনাৰ সংজ্ঞানাত্মক স্বাস্থ্য অগ্ৰগতিৰ সৈতে সহায় কৰিব পাৰো।",
                  "মই সহায়ৰ বাবে ইয়াত আছো! আপুনি মোক খেল, স্মাৰক, আপোনাৰ অগ্ৰগতি বা ৱেবছাইটৰ বিষয়ে যিকোনো কথা সোধিব পাৰে।"]
      }
    };

    const langResponses = responses[lang] || responses.en;
    
    // Check for keywords
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('namaste') || q.includes('नमस्ते') || q.includes('নমস্কাৰ')) {
      return langResponses.hello[Math.floor(Math.random() * langResponses.hello.length)];
    }
    if (q.includes('how are you') || q.includes('how are') || q.includes('आप कैसे हैं') || q.includes('আপুনি কেনে')) {
      return langResponses.how_are_you[Math.floor(Math.random() * langResponses.how_are_you.length)];
    }
    if (q.includes('what can you do') || q.includes('help me') || q.includes('आप क्या कर सकते हैं') || q.includes('আপুনি কি কৰিব পাৰে')) {
      return langResponses.what_can_you_do[Math.floor(Math.random() * langResponses.what_can_you_do.length)];
    }
    if (q.includes('game') || q.includes('play') || q.includes('खेल') || q.includes('গেম') || q.includes('খেল')) {
      return langResponses.game_help[Math.floor(Math.random() * langResponses.game_help.length)];
    }
    if (q.includes('reminder') || q.includes('remind') || q.includes('अनुस्मारक') || q.includes('স্মাৰক') || q.includes('রিমাইন্ডার')) {
      return langResponses.reminder_help;
    }
    if (q.includes('progress') || q.includes('score') || q.includes('प्रगति') || q.includes('অগ্ৰগতি') || q.includes('প্রগতি')) {
      return langResponses.progress_help;
    }
    if (q.includes('thank') || q.includes('thanks') || q.includes('धन्यवाद') || q.includes('ধন্যবাদ')) {
      return langResponses.thanks[Math.floor(Math.random() * langResponses.thanks.length)];
    }
    if (q.includes('bye') || q.includes('goodbye') || q.includes('अलविदा') || q.includes('বিদায়')) {
      return langResponses.bye[Math.floor(Math.random() * langResponses.bye.length)];
    }
    
    return langResponses.default[Math.floor(Math.random() * langResponses.default.length)];
  }
};

export default AIResponseService;