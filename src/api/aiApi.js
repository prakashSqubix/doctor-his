import axios from 'axios';

// AI API Configuration - separate from main app API
const AI_API_CONFIG = {
  BASE_URL: 'https://ai.squbix.com',
  ENDPOINTS: {
    TRANSCRIPTION: '/conversation',
  },
  TIMEOUT: 500000, // 30 seconds for AI processing
  HEADERS: {
    'Content-Type': 'application/json',
    'Authorization': '876590213f4b4e2a9f3e1c3d5e6f708', // Fixed token as specified
  },
};

// Create separate axios instance for AI API
const aiAxiosInstance = axios.create({
  baseURL: AI_API_CONFIG.BASE_URL,
  timeout: AI_API_CONFIG.TIMEOUT,
  headers: AI_API_CONFIG.HEADERS,
});

// AI API functions
export const aiAPI = {
  // Transcribe audio and get EMR data
  transcribeAudio: async (base64AudioString) => {
    try {
      const response = await aiAxiosInstance.post(AI_API_CONFIG.ENDPOINTS.TRANSCRIPTION, {
        b64_str: base64AudioString,
      });
      return response.data;
    } catch (error) {
      console.error('AI Transcription Error:', error);
      throw error;
    }
  },
};

export default aiAPI;