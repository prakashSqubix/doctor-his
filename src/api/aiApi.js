import axios from 'axios';

// AI API Configuration - separate from main app API
export const AI_API_CONFIG = {
  BASE_URL: 'https://ai.squbix.com',
  ENDPOINTS: {
    TRANSCRIPTION: '/conversation',
    TRANSCRIPTION_MULTI: '/conversation/od-en',
    TRANSCRIPTION_CHUNK: '/transcribe/chunk',
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
  transcribeAudio: async (base64AudioString, endpoint = AI_API_CONFIG.ENDPOINTS.TRANSCRIPTION) => {
    try {
      const response = await aiAxiosInstance.post(endpoint, {
        b64_str: base64AudioString,
      });
      return response.data;
    } catch (error) {
      console.error('AI Transcription Error:', error);
      throw error;
    }
  },

  // Chunked Transcription
  transcribeChunk: async ({ sessionId, isFinal, audioBase64 }) => {
    try {
      const payload = {
        sessionId,
        isFinal,
      };
      if (audioBase64) {
        payload.audioBase64 = audioBase64;
      }
      const response = await aiAxiosInstance.post(AI_API_CONFIG.ENDPOINTS.TRANSCRIPTION_CHUNK, payload);
      return response.data;
    } catch (error) {
      console.error('AI Chunk Transcription Error:', error);
      throw error;
    }
  },
  
  // Delete Audio Session
  deleteSession: async (sessionId) => {
    try {
      const response = await aiAxiosInstance.delete(`/audio/session/${sessionId}`, {
        data: {
          sessionId,
          status: 'deleted'
        }
      });
      return response.data;
    } catch (error) {
      console.error('AI Delete Session Error:', error);
      throw error;
    }
  },
};

export default aiAPI;