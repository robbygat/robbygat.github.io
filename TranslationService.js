import React, { useState, useEffect } from 'react';

const TranslationService = () => {
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Google API Key from the requirements
  const apiKey = 'AIzaSyAbPQl3mw5z4Ei6zzvxGHk1sriMTeMxed0';
  
  useEffect(() => {
    // Load available languages when component mounts
    fetchSupportedLanguages();
  }, []);
  
  const fetchSupportedLanguages = async () => {
    setIsLoading(true);
    try {
      // Google Translate API endpoint for supported languages
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2/languages?key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch supported languages');
      }
      
      const data = await response.json();
      
      if (data && data.data && data.data.languages) {
        setLanguages(data.data.languages);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching supported languages:', err);
      setError(err.message);
      
      // Fallback to a predefined list of common languages if API fails
      setLanguages([
        { language: 'en', name: 'English' },
        { language: 'es', name: 'Spanish' },
        { language: 'fr', name: 'French' },
        { language: 'de', name: 'German' },
        { language: 'it', name: 'Italian' },
        { language: 'ja', name: 'Japanese' },
        { language: 'ko', name: 'Korean' },
        { language: 'zh', name: 'Chinese (Simplified)' },
        { language: 'ru', name: 'Russian' },
        { language: 'ar', name: 'Arabic' },
        { language: 'hi', name: 'Hindi' },
        { language: 'pt', name: 'Portuguese' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const translateText = async (text, targetLanguage) => {
    if (!text || !targetLanguage) {
      return '';
    }
    
    try {
      // Google Translate API endpoint for text translation
      const response = await fetch(
        'https://translation.googleapis.com/language/translate/v2',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: targetLanguage,
            key: apiKey,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Translation failed');
      }
      
      const data = await response.json();
      
      if (data && data.data && data.data.translations && data.data.translations.length > 0) {
        return data.data.translations[0].translatedText;
      } else {
        throw new Error('Invalid translation response format');
      }
    } catch (err) {
      console.error('Translation error:', err);
      setError(err.message);
      return `Translation error: ${err.message}`;
    }
  };
  
  // Function to translate a specific word or phrase
  const translateSelection = async (text, targetLanguage) => {
    return await translateText(text, targetLanguage);
  };
  
  // Function to translate the entire document
  const translateDocument = async (text, targetLanguage) => {
    // For large documents, we might need to split the text into chunks
    // to avoid hitting API limits
    const maxChunkSize = 5000; // Characters per request
    
    if (text.length <= maxChunkSize) {
      return await translateText(text, targetLanguage);
    }
    
    // Split text into chunks
    const chunks = [];
    for (let i = 0; i < text.length; i += maxChunkSize) {
      chunks.push(text.substring(i, i + maxChunkSize));
    }
    
    // Translate each chunk
    const translatedChunks = await Promise.all(
      chunks.map(chunk => translateText(chunk, targetLanguage))
    );
    
    // Combine translated chunks
    return translatedChunks.join('');
  };
  
  return {
    languages,
    isLoading,
    error,
    translateSelection,
    translateDocument,
  };
};

export default TranslationService;
