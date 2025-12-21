export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Track API quota status
let isQuotaExceeded = false;
let lastQuotaCheck = 0;
const QUOTA_CHECK_COOLDOWN = 60000; // 1 minute

// Intelligent fallback responses based on context
export const getChatbotFallbackResponse = (
  userInput: string, 
  plan: { name: string; features: string[] }, 
  conversationContext?: string
): string => {
  
  const inputLower = userInput.toLowerCase();
  const planName = plan.name;
  const planFeatures = plan.features;
  
  // Greeting responses
  if (inputLower.includes('hi') || inputLower.includes('hello') || inputLower.includes('hey')) {
    return `Hello! I'm here to help you with your ${planName} project. What's the name of your project?`;
  }
  
  // Name-related responses
  if (inputLower.includes('name') && inputLower.includes('project')) {
    return `Great! What's the name you'd like to give your ${planName} project?`;
  }
  
  // Help requests
  if (inputLower.includes('help') || inputLower.includes('assist')) {
    return `I'd be happy to help! With the ${planName} plan, you get ${planFeatures.join(', ')}. What would you like to know more about?`;
  }
  
  // Finalization triggers
  const finalizeKeywords = ['okay go ahead', 'finalize', 'proceed', 'let\'s do it', 'yes', 'ready'];
  if (finalizeKeywords.some(keyword => inputLower.includes(keyword))) {
    return `Perfect! I can help you finalize your ${planName} project. Based on our conversation, here's what I understand: ${planFeatures.slice(0, 2).join(' and ')}. Let me prepare a summary for you. [FINALIZE]`;
  }
  
  // Technical questions
  if (inputLower.includes('how') || inputLower.includes('what') || inputLower.includes('explain')) {
    return `The ${planName} plan includes ${planFeatures.join(', ')}. This will help you build a comprehensive project. What specific aspect interests you most?`;
  }
  
  // General project discussion
  if (inputLower.includes('project') || inputLower.includes('build') || inputLower.includes('create')) {
    return `Excellent! For your ${planName} project, you'll have access to ${planFeatures.join(', ')}. Tell me more about what you want to build.`;
  }
  
  // Default intelligent response
  return `I understand you're working on a ${planName} project. With this plan, you get ${planFeatures.join(', ')}. What would you like to focus on first?`;
};

// Check if API quota is exceeded
export const checkQuotaStatus = (error: any): boolean => {
  if (error.response?.status === 429) {
    const errorMessage = JSON.stringify(error.response.data);
    if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      isQuotaExceeded = true;
      lastQuotaCheck = Date.now();
      return true;
    }
  }
  return false;
};

// Reset quota check after cooldown
export const resetQuotaCheck = (): void => {
  if (Date.now() - lastQuotaCheck > QUOTA_CHECK_COOLDOWN) {
    isQuotaExceeded = false;
  }
};

// Get intelligent fallback for idea generation
export const getIdeaFallbackResponse = (interests: string): string => {
  const interestsLower = interests.toLowerCase();
  
  const fallbackIdeas = [
    `Build a smart task management app using React and Firebase with AI-powered priority suggestions based on ${interests} interests.`,
    `Create an IoT-based home automation system using Arduino/Raspberry Pi focusing on ${interests} with mobile app integration.`,
    `Develop a machine learning project for ${interests} using Python, TensorFlow, and Flask for web deployment.`,
    `Design a full-stack e-commerce platform for ${interests} using MERN stack with payment gateway integration.`,
    `Build a real-time chat application with ${interests} focus using Socket.io, Node.js, and React with MongoDB.`
  ];
  
  // Select based on interests
  if (interestsLower.includes('ai') || interestsLower.includes('machine learning')) {
    return fallbackIdeas[2];
  } else if (interestsLower.includes('web') || interestsLower.includes('react')) {
    return fallbackIdeas[0];
  } else if (interestsLower.includes('iot') || interestsLower.includes('arduino')) {
    return fallbackIdeas[1];
  } else if (interestsLower.includes('commerce') || interestsLower.includes('business')) {
    return fallbackIdeas[3];
  } else if (interestsLower.includes('chat') || interestsLower.includes('real-time')) {
    return fallbackIdeas[4];
  }
  
  return fallbackIdeas[Math.floor(Math.random() * fallbackIdeas.length)];
};