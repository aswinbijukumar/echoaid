import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { 
  ChatBubbleLeftRightIcon, 
  PlayIcon, 
  AcademicCapIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SignLearningChatbot = ({ detectedSign, isOpen, onClose, signDictionary }) => {
  const { darkMode } = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your sign language learning assistant. I can help you understand signs, provide tips, and answer questions about sign language. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const border = darkMode ? 'border-gray-700' : 'border-gray-200';
  const bg = 'bg-transparent';

  // Sign learning knowledge base
  const signKnowledge = {
    'how to make': {
      responses: [
        "To make a sign clearly, follow these steps:",
        "1. Position your hand correctly in the signing space (chest to forehead)",
        "2. Use the exact hand shape for each letter/number", 
        "3. Keep your fingers straight or curled as required",
        "4. Maintain consistent palm orientation",
        "5. Hold the sign steady for 2-3 seconds",
        "6. Practice slowly at first, then increase speed",
        "7. Use good lighting and clear background"
      ]
    },
    'hand position': {
      responses: [
        "Hand position is crucial for clear communication:",
        "• Keep your hands in the signing space (chest to forehead)",
        "• Maintain consistent hand shapes for each letter/number",
        "• Use proper palm orientation (facing forward or to the side)",
        "• Keep fingers straight when required, curled when required",
        "• Position your hand at the right height and distance from camera",
        "• Avoid blocking your hand with your body or other objects"
      ]
    },
    'facial expressions': {
      responses: [
        "Facial expressions are essential in sign language:",
        "• Use eyebrows to show questions",
        "• Express emotions through your face",
        "• Match your expression to the meaning",
        "• Practice in front of a mirror"
      ]
    },
    'practice tips': {
      responses: [
        "Here are some effective practice strategies:",
        "• Practice daily, even for just 10 minutes",
        "• Record yourself to check form",
        "• Practice with a partner when possible",
        "• Start with basic signs and build up",
        "• Use the webcam feature for instant feedback"
      ]
    },
    'common mistakes': {
      responses: [
        "Avoid these common mistakes:",
        "• Rushing through signs too quickly",
        "• Inconsistent hand shapes (fingers not straight when they should be)",
        "• Poor lighting or cluttered background",
        "• Hand too close or too far from camera",
        "• Fingers touching when they should be spread apart",
        "• Fingers spread when they should be touching",
        "• Thumb not positioned correctly (tucked vs extended)",
        "• Not holding the sign steady long enough",
        "• Making signs too small or too large"
      ]
    },
    'alphabet': {
      responses: [
        "The sign language alphabet is fundamental:",
        "• Each letter has a specific hand shape",
        "• Practice spelling words letter by letter",
        "• Use fingerspelling for names and places",
        "• Start with your name and practice daily"
      ]
    },
    'numbers': {
      responses: [
        "Number signs are important for communication:",
        "• Numbers 1-5 use one hand",
        "• Numbers 6-10 use both hands",
        "• Practice counting and basic math",
        "• Use numbers in everyday contexts"
      ]
    }
  };

  // Enhanced sign explanations with user-provided authoritative instructions
  const videoExplanations = {
    // Alphabet A-Z
    'A': {
      title: 'Letter A',
      description: 'Make a closed fist with your thumb resting along the side of your index finger.',
      tips: 'Keep the fist tight; thumb should not stick out.',
      commonMistakes: 'Thumb extended too far; loose fist.'
    },
    'B': {
      title: 'Letter B', 
      description: 'Lay your palm flat and open, with all fingers extended and together, and your thumb tucked into your palm.',
      tips: 'Keep fingers together and straight; hide the thumb.',
      commonMistakes: 'Thumb visible; fingers spread apart.'
    },
    'C': {
      title: 'Letter C',
      description: 'Curve your hand to form a "C" shape, with your fingers and thumb apart.',
      tips: 'Keep a clear curved opening between fingers and thumb.',
      commonMistakes: 'Opening too small/large; flat fingers.'
    },
    'D': {
      title: 'Letter D',
      description: 'Point your index finger straight up, with your thumb and other fingers forming a circle.',
      tips: 'Index stays vertical; circle should be clear.',
      commonMistakes: 'Index bent; circle collapsed.'
    },
    'E': {
      title: 'Letter E',
      description: 'Slightly curl all your fingers and thumb, as if holding a small object.',
      tips: 'Maintain a small, compact curl; wrist neutral.',
      commonMistakes: 'Over-curled fist; fingers too straight.'
    },
    'F': {
      title: 'Letter F',
      description: 'Touch the tips of your index finger and thumb, with other fingers extended upwards.',
      tips: 'Form a clean circle; other fingers straight.',
      commonMistakes: 'Circle not closed; fingers sagging.'
    },
    'G': {
      title: 'Letter G',
      description: 'Extend your index and thumb, pointing them towards each other, while other fingers are curled.',
      tips: 'Keep index and thumb parallel; others curled.',
      commonMistakes: 'Index angled up/down; loose curl.'
    },
    'H': {
      title: 'Letter H',
      description: 'Extend your index and middle fingers, pressing them together, with your thumb tucked in and other fingers curled.',
      tips: 'Keep the two fingers straight and touching.',
      commonMistakes: 'Fingers separated; fingers bent.'
    },
    'I': {
      title: 'Letter I',
      description: 'Point your pinky finger straight up, with all other fingers curled into your palm and your thumb resting on them.',
      tips: 'Only pinky up; keep the curl tight.',
      commonMistakes: 'Other fingers lifting; loose curl.'
    },
    'J': {
      title: 'Letter J',
      description: 'Start with an "I" handshape (pinky up) and make a downward curving motion, as if drawing a "J."',
      tips: 'Make the J motion smooth and visible.',
      commonMistakes: 'Motion too fast; other fingers extended.'
    },
    'K': {
      title: 'Letter K',
      description: 'Extend your index and middle fingers upwards in a "V" shape, with your thumb placed between them.',
      tips: 'Keep a clear V; thumb centered.',
      commonMistakes: 'V collapsed; thumb misplaced.'
    },
    'L': {
      title: 'Letter L',
      description: 'Extend your thumb and index finger, forming an "L" shape.',
      tips: 'Index vertical; thumb horizontal.',
      commonMistakes: 'Angles off; other fingers not curled.'
    },
    'M': {
      title: 'Letter M',
      description: 'Curl your index, middle, and ring fingers over your thumb, with your pinky finger slightly curled.',
      tips: 'Thumb covered by three fingers.',
      commonMistakes: 'Thumb visible; fingers too loose.'
    },
    'N': {
      title: 'Letter N',
      description: 'Curl your index and middle fingers over your thumb, with your ring and pinky fingers slightly curled.',
      tips: 'Two fingers cover the thumb only.',
      commonMistakes: 'Three fingers covering; thumb exposed.'
    },
    'O': {
      title: 'Letter O',
      description: 'Bring your fingers and thumb together to form an "O" shape.',
      tips: 'Keep a neat round shape; no gaps.',
      commonMistakes: 'Oval too flat; gaps between tips.'
    },
    'P': {
      title: 'Letter P',
      description: 'Point your index finger down, with your middle finger extended and your thumb touching the tip of your middle finger, forming an upside-down "K" shape.',
      tips: 'Wrist slightly turned so index points down.',
      commonMistakes: 'Index not down; unclear K form.'
    },
    'Q': {
      title: 'Letter Q',
      description: 'Point your index finger and thumb downwards, as if holding a small sphere, with other fingers curled.',
      tips: 'Pinch downward; curl the rest.',
      commonMistakes: 'Pointing sideways; loose curl.'
    },
    'R': {
      title: 'Letter R',
      description: 'Cross your middle finger over your index finger, with other fingers curled and your thumb tucked in.',
      tips: 'Make a clear cross; keep the curl tight.',
      commonMistakes: 'No crossing; fingers separated.'
    },
    'S': {
      title: 'Letter S',
      description: 'Make a fist, with your thumb wrapped over your fingers.',
      tips: 'Thumb across fingers, not tucked.',
      commonMistakes: 'Thumb tucked; loose fist.'
    },
    'T': {
      title: 'Letter T',
      description: 'Place your index finger between your thumb and middle finger, with other fingers curled.',
      tips: 'Let the thumb cover the index slightly.',
      commonMistakes: 'Index outside; loose curl.'
    },
    'U': {
      title: 'Letter U',
      description: 'Extend your index and middle fingers straight up and together, with your thumb tucked in and other fingers curled.',
      tips: 'Keep the two fingers touching and straight.',
      commonMistakes: 'Fingers spread; bent tips.'
    },
    'V': {
      title: 'Letter V',
      description: 'Extend your index and middle fingers upwards in a "V" shape.',
      tips: 'Make a clean V; other fingers curled.',
      commonMistakes: 'V too narrow/wide; fingers bent.'
    },
    'W': {
      title: 'Letter W',
      description: 'Extend your index, middle, and ring fingers upwards, with your thumb tucked in and pinky finger curled.',
      tips: 'Three fingers up; pinky down.',
      commonMistakes: 'Pinky up; thumb visible.'
    },
    'X': {
      title: 'Letter X',
      description: 'Curl your index finger into a hook shape, with your thumb extended and other fingers curled.',
      tips: 'Clear hook; keep others curled.',
      commonMistakes: 'Index straight; loose curl.'
    },
    'Y': {
      title: 'Letter Y',
      description: 'Extend your thumb and pinky finger outwards, with your middle three fingers curled into your palm.',
      tips: 'Thumb and pinky fully extended.',
      commonMistakes: 'Middle fingers not curled; weak extension.'
    },
    'Z': {
      title: 'Letter Z',
      description: 'Point your index finger and draw a "Z" in the air, with your other fingers curled and thumb tucked in.',
      tips: 'Make a clear Z path; keep others curled.',
      commonMistakes: 'Path too small/unclear; fingers extended.'
    },
    // Numbers 0-9 (0 kept from existing if not specified by user)
    '0': {
      title: 'Number 0',
      description: 'Form a perfect circle with your thumb and all four fingers touching each other, like you\'re holding a small ball.',
      tips: 'Ensure a closed round shape; no gaps.',
      commonMistakes: 'Gaps between tips; flattened circle.'
    },
    '1': {
      title: 'Number 1',
      description: 'Point your index finger straight up, keeping other fingers curled into your palm and your thumb resting on top.',
      tips: 'Index fully straight; curl tight.',
      commonMistakes: 'Index bent; thumb not resting.'
    },
    '2': {
      title: 'Number 2',
      description: 'Extend your index and middle fingers upwards in a "V" shape, while other fingers are curled and your thumb rests on them.',
      tips: 'Clear V; thumb resting on curled fingers.',
      commonMistakes: 'V too narrow; thumb floating.'
    },
    '3': {
      title: 'Number 3',
      description: 'Extend your index, middle, and ring fingers upwards, with your pinky and thumb curled into your palm.',
      tips: 'Three fingers up; thumb and pinky down.',
      commonMistakes: 'Thumb up; pinky up.'
    },
    '4': {
      title: 'Number 4',
      description: 'Extend all four fingers upwards, keeping your thumb curled into your palm.',
      tips: 'Thumb hidden; four straight fingers.',
      commonMistakes: 'Thumb visible; fingers bent.'
    },
    '5': {
      title: 'Number 5',
      description: 'Extend all five fingers, including your thumb, spread open.',
      tips: 'Spread evenly; fingers straight.',
      commonMistakes: 'Not fully spread; bent fingers.'
    },
    '6': {
      title: 'Number 6',
      description: 'Point your pinky finger straight up, with all other fingers curled into your palm and your thumb resting on them.',
      tips: 'Only pinky up; firm curl.',
      commonMistakes: 'Other fingers lifting; loose curl.'
    },
    '7': {
      title: 'Number 7',
      description: 'Extend your index and thumb, touching their tips, while other fingers are curled into your palm.',
      tips: 'Make a clean pinch; others curled.',
      commonMistakes: 'Gap at pinch; fingers not curled.'
    },
    '8': {
      title: 'Number 8',
      description: 'Point your middle finger up, with your index and thumb forming a circle, and other fingers curled.',
      tips: 'Middle up; index–thumb circle clear.',
      commonMistakes: 'Circle not formed; extra fingers up.'
    },
    '9': {
      title: 'Number 9',
      description: 'Make a fist with your thumb extended outwards to the side.',
      tips: 'Thumb points sideways; fist tight.',
      commonMistakes: 'Thumb up; loose fist.'
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-provide contextual help when a sign is detected
  useEffect(() => {
    if (detectedSign && detectedSign.label && detectedSign.label !== 'Unknown' && detectedSign.isValid) {
      const signInfo = signDictionary?.[detectedSign.label];
      if (signInfo) {
        const contextualMessage = {
          id: Date.now(),
          type: 'bot',
          content: [
            `🎉 Great! I detected you signed "${signInfo.name}"!`,
            `📊 Confidence: ${detectedSign.confidence}%`,
            `📝 ${signInfo.description}`,
            `💡 Pro tip: ${signInfo.tips?.[0] || 'Keep practicing for better accuracy!'}`,
            detectedSign.confidence >= 70 ? '🏆 Excellent work! You\'re mastering this sign!' : '💪 Keep practicing to improve your confidence!'
          ],
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, contextualMessage]);
      }
    }
  }, [detectedSign, signDictionary]);

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Contextual help based on detected sign
    if (detectedSign && detectedSign.label && detectedSign.label !== 'Unknown') {
      const signInfo = signDictionary?.[detectedSign.label];
      if (signInfo) {
        if (lowerMessage.includes('this sign') || lowerMessage.includes('current sign') || lowerMessage.includes('detected')) {
          return [
            `Great! I can see you just signed "${signInfo.name}"!`,
            `📝 Description: ${signInfo.description}`,
            `💬 Usage: ${signInfo.usage}`,
            `🎯 Difficulty: ${signInfo.difficulty}`,
            `📚 Category: ${signInfo.category}`,
            signInfo.tips && signInfo.tips.length > 0 ? `💡 Pro Tips: ${signInfo.tips.join(', ')}` : '',
            signInfo.commonMistakes && signInfo.commonMistakes.length > 0 ? `⚠️ Common Mistakes: ${signInfo.commonMistakes.join(', ')}` : '',
            `Your confidence was ${detectedSign.confidence}% - ${detectedSign.confidence >= 70 ? 'excellent work!' : 'keep practicing!'}`
          ].filter(Boolean);
        }
      }
    }
    
    // Check for specific topics
    for (const [topic, data] of Object.entries(signKnowledge)) {
      if (lowerMessage.includes(topic)) {
        return data.responses;
      }
    }

    // Check for specific signs in dictionary
    if (signDictionary) {
      for (const [sign, data] of Object.entries(signDictionary)) {
        if (lowerMessage.includes(sign.toLowerCase()) || lowerMessage.includes(data.name?.toLowerCase())) {
          return [
            `Here's how to sign "${data.name}":`,
            `📝 ${data.description}`,
            `💬 ${data.usage}`,
            `🎯 Difficulty: ${data.difficulty}`,
            `📚 Category: ${data.category}`,
            data.tips && data.tips.length > 0 ? `💡 Pro Tips: ${data.tips.join(', ')}` : '',
            data.commonMistakes && data.commonMistakes.length > 0 ? `⚠️ Common Mistakes: ${data.commonMistakes.join(', ')}` : '',
            "Try practicing this sign with the webcam feature!"
          ].filter(Boolean);
        }
      }
    }

    // Check for specific signs in video explanations
    for (const [sign, data] of Object.entries(videoExplanations)) {
      if (lowerMessage.includes(sign.toLowerCase())) {
        const response = [
          `Here's how to sign "${data.title}":`,
          `📝 ${data.description}`,
          `💡 Pro Tip: ${data.tips}`
        ];
        
        if (data.commonMistakes) {
          response.push(`⚠️ Common Mistakes: ${data.commonMistakes}`);
        }
        
        response.push("Try practicing this sign with the webcam feature!");
        return response;
      }
    }

    // General responses
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return [
        "I can help you with:",
        "• Explaining how to make specific signs",
        "• Providing practice tips and techniques", 
        "• Answering questions about sign language",
        "• Giving feedback on your signing",
        "• Suggesting practice exercises",
        "Just ask me anything about sign language!"
      ];
    }

    if (lowerMessage.includes('practice') || lowerMessage.includes('improve')) {
      return [
        "Great question! Here are some practice strategies:",
        "• Use the webcam feature for real-time feedback",
        "• Practice in front of a mirror",
        "• Record yourself and review the video",
        "• Start with basic signs and build up",
        "• Practice with a partner when possible",
        "• Set aside 10-15 minutes daily for practice"
      ];
    }

    if (lowerMessage.includes('mistake') || lowerMessage.includes('wrong')) {
      return [
        "Don't worry! Making mistakes is part of learning:",
        "• Check your hand position and shape",
        "• Ensure good lighting and clear background",
        "• Practice slowly and deliberately",
        "• Use the confidence feedback to guide you",
        "• Remember: practice makes perfect!"
      ];
    }

    // Default response
    return [
      "I'm here to help you learn sign language!",
      "You can ask me about:",
      "• How to make specific signs",
      "• Practice tips and techniques",
      "• Common mistakes to avoid",
      "• Learning strategies",
      "What would you like to know?"
    ];
  };

  const splitToLines = (text) => {
    if (!text) return [];
    return String(text)
      .split(/\r?\n+/)
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 12); // keep concise in UI
  };

  const askAICoach = async (text) => {
    try {
      const token = localStorage.getItem('token') || '';
      const label = detectedSign?.label;
      const info = label ? signDictionary?.[label] : null;
      const body = {
        question: text,
        detectedSign: detectedSign ? {
          label: detectedSign.label,
          confidence: detectedSign.confidence
        } : undefined,
        signKey: detectedSign?.label || undefined,
        level: detectedSign?.learningLevel || undefined,
        contextSignInfo: info ? {
          description: info.description,
          tips: info.tips,
          commonMistakes: info.commonMistakes
        } : undefined
      };

      const API_BASE = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000';
      const path = token ? '/api/ai/coach' : '/api/ai/coach/public';
      const resp = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });

      if (!resp.ok) throw new Error(`AI error ${resp.status}`);
      const data = await resp.json();
      if (!data.success) throw new Error(data.message || 'AI failed');
      return data.content;
    } catch (e) {
      console.warn('[ai] coach request failed:', e.message);
      throw e;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Respond via AI Coach if enabled, else local scripted
    try {
      if (aiEnabled) {
        const aiText = await askAICoach(inputValue);
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          content: aiText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const botResponses = getBotResponse(inputValue);
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          content: botResponses,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (e) {
      // Fallback to local if AI fails
      const botResponses = getBotResponse(inputValue);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: botResponses,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Hand alignment steps for this sign",
    "Common mistakes for this sign",
    "Pro tips to align hands",
    "How should my palm face?",
    "Correct finger spacing?",
    "Where in signing space?"
  ];

  return (
    <div className={`rounded-xl border ${border} ${bg} backdrop-blur supports-[backdrop-filter]:backdrop-blur`}> 
      <div className={`px-4 py-3 border-b ${border} flex items-center justify-between`}> 
        <div className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />
          <div className="leading-tight">
            <div className={`font-semibold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Sign Learning Assistant</div>
            <div className={`text-[11px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI Coach: DeepSeek</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Close assistant"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3">
          {/* Chat Messages */}
          <div className="h-64 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white shadow'
                      : (darkMode ? 'bg-transparent text-gray-200 border border-gray-700' : 'bg-transparent text-gray-800 border border-gray-200')
                  }`}
                >
                  {Array.isArray(message.content) ? (
                    <div className="space-y-1">
                      {message.content.map((line, index) => (
                        <div key={index}>
                          {line}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className={`${darkMode ? 'bg-transparent border border-gray-700' : 'bg-transparent border border-gray-200'} text-gray-500 px-3 py-2 rounded-2xl`}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="space-y-2">
            <p className={`text-[11px] ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quick questions</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(question)}
                  className={`text-[11px] px-3 py-1.5 rounded-full transition-colors border ${darkMode ? 'bg-transparent border-gray-700 text-gray-200 hover:bg-white/5' : 'bg-transparent border-gray-200 text-gray-700 hover:bg-black/5'}`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="flex gap-2 sticky bottom-0 pt-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about sign language..."
              className={`flex-1 px-3 py-2 rounded-lg border ${border} ${
                darkMode 
                  ? 'bg-transparent text-gray-100 placeholder-gray-500' 
                  : 'bg-transparent text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow"
            >
              Send
            </button>
          </div>
      </div>
    </div>
  );
};

export default SignLearningChatbot;