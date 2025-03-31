import React from 'react';

const OpenAIService = () => {
  // OpenAI API Key from the requirements
  const apiKey = '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';
  
  const getExplanation = async (word, context, targetLanguage) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a helpful language learning assistant. Provide a detailed explanation of words or phrases, including their meaning, usage examples, and cultural context. Format your response in simple HTML with <p>, <b>, <i> tags only. Keep responses concise (max 150 words).`
            },
            {
              role: 'user',
              content: `Explain the word or phrase "${word}" in ${targetLanguage || 'English'}. Context: "${context}"`
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error getting explanation from OpenAI:', error);
      return `<p>Error getting explanation. Please try again later.</p>`;
    }
  };
  
  return {
    getExplanation
  };
};

export default OpenAIService;
