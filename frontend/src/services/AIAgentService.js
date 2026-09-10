import axios from 'axios';

// ============================================================
// SMART AI AGENT - Context-Aware & Intelligent
// ============================================================

class SmartAIAgent {
  constructor() {
    // Comprehensive Knowledge Base with categories
    this.knowledgeBase = {
      // ===== HEALTH & MEDICAL =====
      health: {
        'normal body temperature': 'The normal human body temperature is 98.6°F (37°C). However, it can vary between 97°F (36.1°C) and 99°F (37.2°C).',
        'fever': 'A fever is typically considered a body temperature of 100.4°F (38°C) or higher.',
        'blood pressure': 'Normal blood pressure is considered to be 120/80 mmHg or lower.',
        'heart rate': 'A normal resting heart rate for adults ranges from 60 to 100 beats per minute.',
        'dementia': 'Dementia is a general term for loss of memory, language, and problem-solving abilities severe enough to interfere with daily life.',
        'alzheimer': "Alzheimer's disease is a progressive neurologic disorder that causes brain cells to die. It's the most common cause of dementia.",
        'diabetes': 'Diabetes is a chronic disease that occurs when blood glucose (blood sugar) is too high.',
        'stroke': 'A stroke occurs when blood supply to part of the brain is interrupted, preventing brain tissue from getting oxygen.',
        'cancer': 'Cancer is a disease where body cells grow uncontrollably and spread to other parts of the body.',
        'covid': 'COVID-19 is an infectious disease caused by the SARS-CoV-2 virus. Symptoms include fever, cough, and breathing difficulty.',
        'cholesterol': 'Cholesterol is a waxy substance in your blood. High levels can increase heart disease risk.',
        'acne': 'Acne is a common skin condition that occurs when hair follicles become clogged with oil and dead skin cells. To treat it: wash your face twice daily, use non-comedogenic products, avoid touching your face, and consider over-the-counter treatments with benzoyl peroxide or salicylic acid. For severe acne, consult a dermatologist.',
        'skin care': 'Good skin care includes: washing face twice daily, using sunscreen, moisturizing, drinking plenty of water, and eating a balanced diet rich in fruits and vegetables.',
        'headache': 'Headaches can be tension-related, sinus-related, or migraines. Common remedies: rest, hydration, over-the-counter pain relievers like ibuprofen or acetaminophen, cold or warm compresses, and stress reduction techniques.',
        'cold': 'The common cold is a viral infection of the upper respiratory tract. Symptoms include runny nose, sore throat, cough, and congestion. Rest, hydration, and over-the-counter remedies can help manage symptoms.',
        'flu': 'Influenza (flu) is a contagious respiratory illness caused by influenza viruses. Symptoms include fever, cough, sore throat, body aches, and fatigue. Annual flu vaccination is recommended for prevention.',
        'allergy': 'Allergies occur when the immune system reacts to foreign substances like pollen, dust, or certain foods. Common symptoms include sneezing, itching, runny nose, and skin rashes.',
        'anxiety': 'Anxiety is a feeling of worry, nervousness, or unease about something with an uncertain outcome. Managing anxiety includes deep breathing, mindfulness, regular exercise, and seeking professional help when needed.',
        'depression': 'Depression is a mood disorder that causes persistent feelings of sadness and loss of interest. It can be managed with therapy, medication, lifestyle changes, and social support.',
        'sleep': 'Good sleep hygiene includes: consistent sleep schedule, comfortable sleep environment, limiting screen time before bed, avoiding caffeine in the evening, and regular exercise.',
        'nutrition': 'A balanced diet includes: fruits, vegetables, whole grains, lean proteins, and healthy fats. Recommended daily water intake is about 8 glasses. Limit processed foods, sugar, and saturated fats.',
        'exercise': 'Regular physical activity is essential for good health. Aim for at least 150 minutes of moderate exercise or 75 minutes of vigorous exercise per week.',
        'stress': 'Stress management techniques include: deep breathing, meditation, regular exercise, adequate sleep, social connection, and taking time for hobbies and relaxation.',
        'meditation': 'Meditation is a practice of focused attention that can reduce stress, improve concentration, and promote emotional well-being. Start with 5-10 minutes daily.',
        'yoga': 'Yoga is a mind-body practice combining physical postures, breathing exercises, and meditation. It improves flexibility, strength, and mental well-being.',
      },

      // ===== INDIA =====
      india: {
        'national animal': 'The national animal of India is the Bengal Tiger (Panthera tigris tigris).',
        'national bird': 'The national bird of India is the Indian Peacock (Pavo cristatus).',
        'national flower': 'The national flower of India is the Lotus (Nelumbo nucifera).',
        'national tree': 'The national tree of India is the Banyan Tree (Ficus benghalensis).',
        'national fruit': 'The national fruit of India is the Mango (Mangifera indica).',
        'national river': 'The national river of India is the Ganges (Ganga).',
        'national anthem': 'The national anthem of India is "Jana Gana Mana" written by Rabindranath Tagore.',
        'national song': 'The national song of India is "Vande Mataram" written by Bankim Chandra Chatterjee.',
        'capital': 'The capital of India is New Delhi.',
        'prime minister': 'The Prime Minister of India is Narendra Modi.',
        'president': 'The President of India is Droupadi Murmu.',
        'largest state': 'The largest state in India by area is Rajasthan.',
        'smallest state': 'The smallest state in India by area is Goa.',
        'population': 'The population of India is approximately 1.4 billion (2024 estimate).',
        'currency': 'The currency of India is the Indian Rupee (INR).',
        'independence day': 'India celebrates Independence Day on August 15th each year.',
        'republic day': 'India celebrates Republic Day on January 26th each year.',
        'gandhi': 'Mahatma Gandhi was born on October 2, 1869. He was the leader of the Indian independence movement known for non-violence (Ahimsa).',
        'mumbai': 'Mumbai is the financial capital of India, located on the west coast. It is the most populous city in India.',
        'delhi': 'Delhi is the capital city of India. It is divided into Old Delhi and New Delhi, with many historical monuments and government buildings.',
        'kolkata': 'Kolkata is the cultural capital of India, known for its art, literature, and festivals. It was the former capital of British India.',
        'chennai': 'Chennai is a major city in South India, known for its beaches, temples, and cultural heritage.',
        'bangalore': 'Bangalore (Bengaluru) is the IT hub of India, known as the "Silicon Valley of India."',
        'hyderabad': 'Hyderabad is known for its rich history, culture, and technology industry. It is famous for the Charminar and biryani.',
        'taj mahal': 'The Taj Mahal is a white marble mausoleum in Agra, built by Emperor Shah Jahan in memory of his wife Mumtaz Mahal. It is one of the Seven Wonders of the World.',
        'qutub minar': 'Qutub Minar is a 73-meter tall minaret in Delhi, built in 1193. It is a UNESCO World Heritage Site.',
        'red fort': 'The Red Fort is a historic fort in Delhi, built in the 17th century. It was the main residence of the Mughal emperors.',
        'gateway of india': 'The Gateway of India is a monument in Mumbai, built in 1924 to commemorate the visit of King George V and Queen Mary.',
        'india gate': 'India Gate is a war memorial in Delhi, built to honor soldiers who died in World War I and the Third Anglo-Afghan War.',
      },

      // ===== SCIENCE & NATURE =====
      science: {
        'photosynthesis': 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.',
        'gravity': 'Gravity is a force that attracts objects toward each other. It keeps you on the ground and makes things fall.',
        'water': 'Water is a clear, colorless, odorless liquid essential for all known forms of life. Its chemical formula is H2O.',
        'oxygen': 'Oxygen is a chemical element with symbol O and atomic number 8. It is essential for human respiration.',
        'dna': 'DNA (deoxyribonucleic acid) is the hereditary material in humans and almost all organisms. It contains genetic instructions for development and function.',
        'virus': 'A virus is a microscopic infectious agent that can only replicate inside living cells. Viruses can infect all types of life forms.',
        'bacteria': 'Bacteria are microscopic single-celled organisms found in almost every habitat on Earth.',
        'climate change': 'Climate change refers to long-term shifts in temperatures and weather patterns, mainly caused by human activities like burning fossil fuels.',
        'solar system': 'The solar system is the collection of 8 planets, moons, asteroids, and comets that orbit the Sun. Earth is the third planet from the Sun.',
        'moon': 'The Moon is Earth\'s only natural satellite. It orbits Earth at about 238,855 miles (384,400 kilometers) away.',
        'mars': 'Mars is the fourth planet from the Sun, known as the "Red Planet" due to iron oxide on its surface.',
        'earth': 'Earth is the third planet from the Sun and the only known planet with life. About 71% of its surface is covered with water.',
        'sun': 'The Sun is a star at the center of our solar system. It provides light and energy to all planets in the solar system.',
        'galaxy': 'A galaxy is a system of stars, stellar remnants, interstellar gas, dust, and dark matter. The Milky Way is our home galaxy.',
        'black hole': 'A black hole is a region of spacetime with gravitational pull so strong that nothing can escape from it, not even light.',
        'evolution': 'Evolution is the process by which species change over time through natural selection and genetic variation. Charles Darwin first proposed the theory.',
        'cell': 'The cell is the basic structural and functional unit of all living organisms. It was first discovered by Robert Hooke in 1665.',
        'atom': 'An atom is the smallest unit of matter that retains the properties of an element. It consists of protons, neutrons, and electrons.',
        'energy': 'Energy is the capacity to do work. It exists in many forms including kinetic, potential, thermal, chemical, and electrical energy.',
        'light': 'Light is electromagnetic radiation visible to the human eye. It travels at about 186,282 miles per second (299,792 kilometers per second).',
      },

      // ===== TECHNOLOGY =====
      technology: {
        'ai': 'AI (Artificial Intelligence) is the simulation of human intelligence processes by computer systems. It includes learning, reasoning, and self-correction.',
        'machine learning': 'Machine learning is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed.',
        'blockchain': 'Blockchain is a decentralized, distributed ledger that records transactions across many computers, ensuring the record cannot be altered retroactively.',
        'cryptocurrency': 'Cryptocurrency is digital or virtual currency that uses cryptography for security. Bitcoin is the most well-known cryptocurrency.',
        'internet': 'The Internet is a global network of interconnected computers that communicate using standardized protocols to share information.',
        'wifi': 'Wi-Fi is a wireless networking technology that allows devices to connect to the Internet without cables.',
        '5g': '5G is the fifth generation of cellular network technology, offering faster speeds, lower latency, and better connectivity for more devices.',
        'computer': 'A computer is an electronic device that processes data and performs calculations. Charles Babbage is considered the "father of the computer."',
        'smartphone': 'A smartphone is a mobile phone with computer-like features, including internet access, apps, and touchscreen interface.',
        'software': 'Software is a set of instructions that tells a computer what to do. It includes applications, operating systems, and programs.',
        'hardware': 'Hardware refers to the physical components of a computer or electronic device, including CPU, memory, storage, and peripherals.',
        'robotics': 'Robotics is the field of engineering focused on designing, building, and operating robots for various applications.',
        'quantum computing': 'Quantum computing uses quantum-mechanical phenomena like superposition and entanglement to perform calculations much faster than traditional computers.',
      },

      // ===== GEOGRAPHY =====
      geography: {
        'largest ocean': 'The largest ocean is the Pacific Ocean, covering approximately 63 million square miles (165 million square kilometers).',
        'longest river': 'The longest river is the Nile River, stretching about 4,132 miles (6,650 kilometers).',
        'highest mountain': 'The highest mountain is Mount Everest, standing at 29,029 feet (8,848 meters) above sea level.',
        'smallest country': 'The smallest country is Vatican City, with an area of about 0.44 square kilometers.',
        'largest country': 'The largest country is Russia, covering about 17,098,242 square kilometers.',
        'hottest place': 'The hottest place on Earth is Death Valley, California, reaching 134°F (56.7°C) in 1913.',
        'coldest place': 'The coldest place on Earth is Antarctica, reaching as low as -128.6°F (-89.2°C).',
        'amazon river': 'The Amazon River is the second-longest river in the world and the largest by volume, flowing through South America.',
        'great wall': 'The Great Wall of China is a series of fortifications built along the northern borders of China, stretching over 13,000 miles.',
        'desert': 'The Sahara Desert is the largest hot desert in the world, covering most of North Africa. It is about 9.2 million square kilometers.',
        'rainforest': 'The Amazon Rainforest is the largest tropical rainforest in the world, covering much of South America. It is home to incredible biodiversity.',
      },

      // ===== HISTORY =====
      history: {
        'world war 2': 'World War II was a global war from 1939 to 1945, involving most of the world\'s nations. It was the deadliest conflict in human history.',
        'cold war': 'The Cold War was geopolitical tension between the US and USSR and their allies from 1947 to 1991.',
        'telephone invented': 'Alexander Graham Bell invented the telephone in 1876.',
        'light bulb invented': 'Thomas Edison invented the practical incandescent light bulb in 1879.',
        'computer invented': 'Charles Babbage designed the first mechanical computer in the 1830s.',
        'internet invented': 'The internet was developed in the 1960s by ARPA (Advanced Research Projects Agency). Tim Berners-Lee invented the World Wide Web in 1989.',
        'wheel invented': 'The wheel was invented around 3500 BC in Mesopotamia. It is considered one of the most important inventions in human history.',
        'printing press': 'Johannes Gutenberg invented the printing press around 1440, which revolutionized the spread of knowledge.',
        'electricity': 'Benjamin Franklin conducted experiments with electricity. Thomas Edison developed the first practical electric light bulb.',
        'penicillin': 'Alexander Fleming discovered penicillin, the first antibiotic, in 1928, revolutionizing medicine.',
      },

      // ===== FOOD & NUTRITION =====
      food: {
        'protein': 'Protein is a nutrient essential for building and repairing tissues. It is found in meat, eggs, beans, and nuts.',
        'carbohydrate': 'Carbohydrates provide energy for the body. They are found in bread, rice, pasta, fruits, and vegetables.',
        'vitamin c': 'Vitamin C protects cells, maintains healthy skin, blood vessels, bones, and cartilage. Found in citrus fruits, tomatoes, and peppers.',
        'calcium': 'Calcium is essential for strong bones and teeth. Found in dairy products, leafy greens, and fortified foods.',
        'fiber': 'Dietary fiber promotes digestive health and helps maintain healthy blood sugar and cholesterol levels.',
        'organic food': 'Organic food is produced without synthetic pesticides, fertilizers, or GMOs.',
        'vitamin d': 'Vitamin D helps the body absorb calcium and supports immune function. It is produced by the body when exposed to sunlight and found in fatty fish, eggs, and fortified foods.',
        'iron': 'Iron is essential for making red blood cells and transporting oxygen. Found in red meat, beans, spinach, and fortified cereals.',
      },
    };
  }

  // ===== CATEGORIZE THE QUESTION =====
  categorizeQuestion(query) {
    const q = query.toLowerCase();
    
    // Health keywords
    const healthKeywords = ['health', 'medical', 'disease', 'symptom', 'treatment', 'doctor', 'medicine', 'pain', 'ache', 'sick', 'illness', 
      'fever', 'cold', 'flu', 'cough', 'headache', 'stomach', 'heart', 'blood', 'diabetes', 'cancer', 'covid', 'virus', 'bacteria', 'acne', 
      'skin', 'rash', 'allergy', 'asthma', 'arthritis', 'depression', 'anxiety', 'stress', 'sleep', 'insomnia', 'nutrition', 'diet', 'exercise',
      'yoga', 'meditation', 'mental health', 'wellness', 'hygiene', 'vaccine', 'immunity', 'infection'];
    
    // India keywords
    const indiaKeywords = ['india', 'indian', 'hindi', 'gandhi', 'delhi', 'mumbai', 'kolkata', 'chennai', 'bangalore', 'hyderabad', 'taj mahal',
      'national', 'capital', 'state', 'pm', 'prime minister', 'president', 'rupai', 'currency', 'festival', 'diwali', 'holi', 'independence',
      'republic', 'monument', 'kashmir', 'punjab', 'rajasthan', 'kerala', 'tamil', 'bengal', 'assam', 'gujarat'];
    
    // Science keywords
    const scienceKeywords = ['science', 'physics', 'chemistry', 'biology', 'astronomy', 'planet', 'star', 'galaxy', 'solar', 'moon', 'sun',
      'earth', 'mars', 'venus', 'jupiter', 'water', 'oxygen', 'carbon', 'dna', 'cell', 'atom', 'molecule', 'evolution', 'gravity', 'force',
      'energy', 'light', 'sound', 'magnet', 'electricity', 'climate', 'weather', 'rain', 'cloud', 'volcano', 'earthquake'];
    
    // Technology keywords
    const techKeywords = ['tech', 'technology', 'computer', 'software', 'hardware', 'internet', 'wifi', '5g', 'ai', 'artificial intelligence',
      'machine learning', 'blockchain', 'crypto', 'bitcoin', 'smartphone', 'mobile', 'app', 'website', 'email', 'hack', 'cyber', 'robotics',
      'quantum', 'programming', 'code', 'developer', 'data', 'cloud', 'server', 'network'];
    
    // Geography keywords
    const geoKeywords = ['geography', 'ocean', 'river', 'mountain', 'desert', 'forest', 'continent', 'country', 'city', 'capital', 'population',
      'area', 'borders', 'island', 'peninsula', 'plateau', 'valley', 'lake', 'sea', 'coast', 'glacier', 'tropical', 'polar'];
    
    // History keywords
    const historyKeywords = ['history', 'historical', 'ancient', 'medieval', 'modern', 'world war', 'empire', 'king', 'queen', 'dynasty',
      'discovery', 'invention', 'exploration', 'revolution', 'independence', 'civil war', 'cold war', 'renaissance', 'colonial', 'imperial'];

    // Determine the category
    if (healthKeywords.some(k => q.includes(k))) return 'health';
    if (indiaKeywords.some(k => q.includes(k))) return 'india';
    if (scienceKeywords.some(k => q.includes(k))) return 'science';
    if (techKeywords.some(k => q.includes(k))) return 'technology';
    if (geoKeywords.some(k => q.includes(k))) return 'geography';
    if (historyKeywords.some(k => q.includes(k))) return 'history';
    
    return 'general';
  }

  // ===== SEARCH KNOWLEDGE BASE =====
  searchKnowledgeBase(query, category) {
    const q = query.toLowerCase().trim();
    const categoryData = this.knowledgeBase[category] || {};
    
    // Exact match in category
    for (const [key, value] of Object.entries(categoryData)) {
      if (q.includes(key) || key.includes(q)) {
        // Check if the query is actually asking about this topic
        const keyWords = key.split(' ');
        let matchCount = 0;
        for (const word of keyWords) {
          if (q.includes(word)) matchCount++;
        }
        // Only return if there's a reasonable match
        if (matchCount >= 1 && keyWords.length <= 4) {
          return value;
        }
      }
    }
    
    // Search all categories if not found in specific category
    for (const [cat, data] of Object.entries(this.knowledgeBase)) {
      if (cat === category) continue;
      for (const [key, value] of Object.entries(data)) {
        if (q.includes(key) || key.includes(q)) {
          return value;
        }
      }
    }
    
    return null;
  }

  // ===== SEARCH WIKIPEDIA =====
  async searchWikipedia(query) {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
      const searchResponse = await axios.get(searchUrl);
      
      if (searchResponse.data.query.search.length === 0) return null;
      
      const pageTitle = searchResponse.data.query.search[0].title;
      const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
      const contentResponse = await axios.get(contentUrl);
      
      const pages = contentResponse.data.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pageId === '-1') return null;
      
      const extract = pages[pageId].extract;
      let cleaned = extract.replace(/\[\d+\]/g, '').trim();
      
      const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
      if (sentences) {
        return sentences.slice(0, 3).join(' ');
      }
      
      return cleaned;
    } catch (error) {
      console.error('Wikipedia API error:', error);
      return null;
    }
  }

  // ===== GENERATE CONTEXT-AWARE RESPONSE =====
  async answerQuestion(question, lang = 'en') {
    const q = question.toLowerCase();
    
    // Step 1: Check if it's a greeting
    const greetings = ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening'];
    if (greetings.some(g => q.includes(g))) {
      const responses = [
        "Hello! How can I help you today? 😊",
        "Hi there! What would you like to know? 👋",
        "Namaste! I'm here to assist you. 🙏"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Step 2: Check if it's asking about me
    if (q.includes('how are you') || q.includes('how are you doing')) {
      return "I'm doing great! Thanks for asking 😊 I'm here to help you with any questions you have about health, India, science, technology, or general knowledge. What would you like to know?";
    }
    
    // Step 3: Thank you responses
    if (q.includes('thank you') || q.includes('thanks')) {
      const responses = [
        "You're welcome! Happy to help! 😊",
        "Anytime! Let me know if you need anything else.",
        "My pleasure! Have a great day! 🌟"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Step 4: Goodbye responses
    if (q.includes('bye') || q.includes('goodbye') || q.includes('see you')) {
      const responses = [
        "Goodbye! Take care and stay healthy! 👋",
        "See you later! Have a wonderful day! 🌟",
        "Bye! Remember, I'm always here when you need me! 😊"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Step 5: Categorize the question
    const category = this.categorizeQuestion(q);
    
    // Step 6: Search knowledge base
    const kbAnswer = this.searchKnowledgeBase(q, category);
    if (kbAnswer) {
      return kbAnswer;
    }
    
    // Step 7: Try Wikipedia
    try {
      const wikiAnswer = await this.searchWikipedia(q);
      if (wikiAnswer && wikiAnswer.length > 10) {
        return wikiAnswer;
      }
    } catch (error) {
      console.log('Wikipedia search failed');
    }
    
    // Step 8: Smart fallback
    const fallbacks = {
      health: "I'm not a doctor, but I can provide general health information. For any serious health concerns, please consult a healthcare professional. Would you like me to help with something else?",
      india: "That's an interesting question about India! I don't have specific information about that yet. Try asking about India's national symbols, history, or major cities.",
      science: "That's a fascinating science question! I'm still learning about this topic. Could you ask something else about science, nature, or the universe?",
      technology: "Great tech question! I don't have specific details on that yet. Try asking about AI, computers, internet, or blockchain.",
      geography: "That's a good geography question! I don't have that specific information yet. Try asking about oceans, mountains, rivers, or countries.",
      history: "History is fascinating! I don't have specific details on that topic yet. Try asking about World War 2, inventions, or ancient civilizations.",
      general: "That's a great question! I'm still learning, and I'll get better at answering over time. Try asking me about health, India, science, technology, geography, or history!"
    };
    
    return fallbacks[category] || fallbacks.general;
  }

  // ===== QUICK RESPONSE (for common questions without API call) =====
  quickAnswer(question) {
    const q = question.toLowerCase();
    const category = this.categorizeQuestion(q);
    const kbAnswer = this.searchKnowledgeBase(q, category);
    
    if (kbAnswer) {
      return { answer: kbAnswer, source: 'knowledge-base', confidence: 'high' };
    }
    
    // Check if it's a greeting or simple question
    if (['hello', 'hi', 'hey', 'namaste'].some(g => q.includes(g))) {
      return { answer: "Hello! How can I help you? 😊", source: 'greeting', confidence: 'high' };
    }
    
    return null;
  }
}

// Create a singleton instance
const aiAgent = new SmartAIAgent();

export default aiAgent;