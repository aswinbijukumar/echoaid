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

const SignLearningChatbot = () => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const bg = darkMode ? 'bg-gray-800/50' : 'bg-white/50';

  // Sign learning knowledge base
  const signKnowledge = {
    'how to make': {
      responses: [
        "To make a sign clearly, follow these steps:",
        "1. Position your hand correctly",
        "2. Move with purpose and clarity", 
        "3. Maintain good posture",
        "4. Use appropriate facial expressions",
        "5. Practice slowly at first, then increase speed"
      ]
    },
    'hand position': {
      responses: [
        "Hand position is crucial for clear communication:",
        "• Keep your hands in the signing space (chest to forehead)",
        "• Maintain consistent hand shapes",
        "• Use proper palm orientation",
        "• Keep fingers relaxed but controlled"
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
        "• Inconsistent hand shapes",
        "• Poor lighting or background",
        "• Not using facial expressions",
        "• Practicing without feedback"
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

  // Video explanations for common signs
  const videoExplanations = {
    'A': {
      title: 'Letter A',
      description: 'Make a fist with your thumb extended upward',
      tips: 'Keep your thumb straight and other fingers curled tightly'
    },
    'B': {
      title: 'Letter B', 
      description: 'Hold your hand flat with all fingers extended',
      tips: 'Keep your thumb tucked in and fingers close together'
    },
    'C': {
      title: 'Letter C',
      description: 'Form a C-shape with your hand',
      tips: 'Make sure the opening is clear and visible'
    },
    'hello': {
      title: 'Hello',
      description: 'Wave your hand from side to side',
      tips: 'Use a friendly, welcoming gesture'
    },
    'thank you': {
      title: 'Thank You',
      description: 'Touch your chin with your fingertips and move forward',
      tips: 'Make the movement smooth and appreciative'
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for specific topics
    for (const [topic, data] of Object.entries(signKnowledge)) {
      if (lowerMessage.includes(topic)) {
        return data.responses;
      }
    }

    // Check for specific signs
    for (const [sign, data] of Object.entries(videoExplanations)) {
      if (lowerMessage.includes(sign.toLowerCase())) {
        return [
          `Here's how to sign "${data.title}":`,
          data.description,
          `💡 Tip: ${data.tips}`,
          "Try practicing this sign with the webcam feature!"
        ];
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

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponses = getBotResponse(inputValue);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: botResponses,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "How do I improve my signing?",
    "What are common mistakes to avoid?",
    "How do I sign the letter A?",
    "What's the best way to practice?",
    "How important are facial expressions?"
  ];

  return (
    <div className={`p-4 rounded-lg border ${border} ${bg} backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center">
          <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-blue-400" />
          Sign Learning Assistant
        </h4>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
        >
          {isOpen ? (
            <XMarkIcon className="w-4 h-4" />
          ) : (
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* Chat Messages */}
          <div className="h-64 overflow-y-auto space-y-3 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {Array.isArray(message.content) ? (
                    <div className="space-y-1">
                      {message.content.map((line, index) => (
                        <div key={index} className="text-sm">
                          {line}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm">{message.content}</div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 p-3 rounded-lg">
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
            <p className="text-xs text-gray-500">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(question)}
                  className="text-xs bg-gray-700/50 hover:bg-gray-700 px-2 py-1 rounded-full transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about sign language..."
              className={`flex-1 p-2 rounded-lg border ${border} ${
                darkMode 
                  ? 'bg-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignLearningChatbot;