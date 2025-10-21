# 🎓 Complete Guide: Creating Learning Modules in EchoAid

## 🎯 **What You Can Create**

### **1. Flashcards Module**
- **Purpose**: Visual learning with images and meanings
- **Best for**: Learning new signs, memorization
- **Structure**: Image → Word → Meaning

### **2. Quiz Module** 
- **Purpose**: Interactive questions and answers
- **Best for**: Testing knowledge, assessment
- **Structure**: Question → Options → Answer

### **3. Mixed Module (Recommended)**
- **Purpose**: Learn first, then test
- **Best for**: Complete learning experience
- **Structure**: Flashcards → Quiz

## 🏗️ **Module Structure Explained**

### **Basic Information**
```javascript
{
  title: "Hello & Goodbye",           // Module name (max 100 chars)
  description: "Learn basic greetings", // Description (max 300 chars)
  category: "basics",                 // Category: basics, alphabet, numbers, phrases, family, activities, advanced
  order: 1,                          // Display order (1-100)
  xpReward: 20,                      // XP points for completion (5-100)
  level: 0,                          // Difficulty level (0-5)
  moduleType: "mixed"                // flashcards, quiz, or mixed
}
```

### **Flashcard Structure**
```javascript
{
  word: "Hello",                     // The sign word (REQUIRED)
  meaning: "A greeting gesture",     // What it means (REQUIRED)
  imagePath: "/assets/signs/hello.jpg", // Sign image (REQUIRED)
  videoPath: "/assets/videos/hello.mp4", // Optional video
  audioPath: "/assets/audio/hello.mp3",  // Optional audio
  difficulty: "beginner"             // beginner, intermediate, advanced
}
```

### **Quiz Question Structure**
```javascript
{
  questionType: "image-to-word",     // image-to-word, word-to-image, audio-to-image
  question: "What does this sign mean?", // Question text (REQUIRED)
  correctAnswer: "Hello",            // Correct answer (REQUIRED)
  options: ["Hello", "Goodbye", "Please", "Thank You"], // Answer choices (REQUIRED, min 2)
  imagePath: "/assets/signs/hello.jpg", // Optional image
  audioPath: "/assets/audio/hello.mp3", // Optional audio
  explanation: "This is a greeting gesture" // Optional explanation
}
```

## 🎨 **Question Types Explained**

### **1. Image-to-Word**
- **Purpose**: Show image, ask what it means
- **Example**: Show "Hello" sign → "What does this sign mean?"
- **Options**: ["Hello", "Goodbye", "Please", "Thank You"]

### **2. Word-to-Image**
- **Purpose**: Show word, ask which image matches
- **Example**: "Hello" → Which image shows "Hello"?
- **Options**: [Image A, Image B, Image C, Image D]

### **3. Audio-to-Image**
- **Purpose**: Play audio, ask which image matches
- **Example**: Play "Hello" audio → Which image matches this audio?
- **Options**: [Image A, Image B, Image C, Image D]

## 📝 **Step-by-Step Creation Process**

### **Step 1: Basic Information**
1. **Title**: Choose a clear, descriptive name
2. **Description**: Explain what the module teaches
3. **Category**: Select appropriate category
4. **Order**: Set display order (1 = first)
5. **XP Reward**: Set points for completion (20-50 recommended)
6. **Module Type**: Choose flashcards, quiz, or mixed

### **Step 2: Add Flashcards (if applicable)**
1. **Click "Add Flashcard"**
2. **Fill in required fields**:
   - Word: The sign word
   - Meaning: What it means
   - Image Path: Path to sign image
3. **Add optional fields**:
   - Video Path: For video demonstrations
   - Audio Path: For pronunciation
   - Difficulty: Set difficulty level

### **Step 3: Add Quiz Questions (if applicable)**
1. **Click "Add Question"**
2. **Choose question type**:
   - Image-to-Word: Show image, ask meaning
   - Word-to-Image: Show word, ask for image
   - Audio-to-Image: Play audio, ask for image
3. **Fill in required fields**:
   - Question: The question text
   - Correct Answer: The right answer
   - Options: At least 2 answer choices
4. **Add optional fields**:
   - Image Path: For image questions
   - Audio Path: For audio questions
   - Explanation: Helpful explanation

### **Step 4: Upload Images**
1. **Prepare your images**:
   - Format: JPG, PNG, GIF
   - Size: Max 5MB per image
   - Quality: Clear, well-lit sign images
2. **Upload via the interface**:
   - Click "Upload Image" button
   - Select your image files
   - Wait for upload to complete
3. **Use image paths**:
   - Copy the returned image path
   - Paste into flashcard/quiz imagePath field

## 🎯 **Example: Complete "Hello & Goodbye" Module**

### **Basic Information**
```javascript
{
  title: "Hello & Goodbye",
  description: "Learn basic greeting signs",
  category: "basics",
  order: 1,
  xpReward: 25,
  level: 0,
  moduleType: "mixed"
}
```

### **Flashcards**
```javascript
[
  {
    word: "Hello",
    meaning: "A greeting gesture",
    imagePath: "/assets/signs/hello.jpg",
    difficulty: "beginner"
  },
  {
    word: "Goodbye",
    meaning: "A farewell gesture",
    imagePath: "/assets/signs/goodbye.jpg",
    difficulty: "beginner"
  }
]
```

### **Quiz Questions**
```javascript
[
  {
    questionType: "image-to-word",
    question: "What does this sign mean?",
    correctAnswer: "Hello",
    options: ["Hello", "Goodbye", "Please", "Thank You"],
    imagePath: "/assets/signs/hello.jpg",
    explanation: "This is a common greeting gesture"
  },
  {
    questionType: "image-to-word",
    question: "What does this sign mean?",
    correctAnswer: "Goodbye",
    options: ["Hello", "Goodbye", "Please", "Thank You"],
    imagePath: "/assets/signs/goodbye.jpg",
    explanation: "This is a farewell gesture"
  }
]
```

## 🚀 **Best Practices**

### **For Flashcards**
- ✅ Use clear, high-quality images
- ✅ Keep meanings simple and clear
- ✅ Start with beginner difficulty
- ✅ Include 3-5 flashcards per module

### **For Quiz Questions**
- ✅ Mix different question types
- ✅ Provide 4 answer options
- ✅ Include helpful explanations
- ✅ Test what was taught in flashcards

### **For Mixed Modules**
- ✅ Start with 2-3 flashcards
- ✅ Follow with 2-3 quiz questions
- ✅ Make quiz questions test flashcard content
- ✅ Keep total time under 10 minutes

## 🔧 **Troubleshooting**

### **Common Issues**
1. **400 Bad Request**: Check required fields are filled
2. **Image not loading**: Verify image path is correct
3. **Quiz not working**: Ensure all options are filled
4. **Module not saving**: Check all validation requirements

### **Required Fields Checklist**
- ✅ Title (max 100 characters)
- ✅ Description (max 300 characters)
- ✅ Category (must be valid enum)
- ✅ Order (1-100)
- ✅ XP Reward (5-100)
- ✅ Module Type (flashcards, quiz, or mixed)

### **Flashcard Requirements**
- ✅ Word (required)
- ✅ Meaning (required)
- ✅ Image Path (required)

### **Quiz Question Requirements**
- ✅ Question Type (required)
- ✅ Question (required)
- ✅ Correct Answer (required)
- ✅ Options (minimum 2, maximum 4)

## 🎉 **Ready to Create!**

Now you have everything you need to create comprehensive learning modules. Start with a simple "Hello & Goodbye" module to test the system, then expand to more complex modules with multiple flashcards and quiz questions.

Remember: The key is to make learning engaging and progressive. Start simple, build complexity gradually, and always test your modules before publishing!