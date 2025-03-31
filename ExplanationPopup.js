import React, { useState } from 'react';
import OpenAIService from './OpenAIService';

const ExplanationPopup = ({ word, context, language, onClose }) => {
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { getExplanation } = OpenAIService();

  // Get explanation when component mounts
  React.useEffect(() => {
    const fetchExplanation = async () => {
      setIsLoading(true);
      const result = await getExplanation(word, context, language);
      setExplanation(result);
      setIsLoading(false);
    };

    fetchExplanation();
  }, [word, context, language]);

  return (
    <div className="explanation-popup">
      <div className="explanation-header">
        <h3>Word Explanation</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="explanation-content">
        <div className="word-info">
          <span className="word-label">Word/Phrase:</span>
          <span className="word-value">{word}</span>
        </div>
        
        {isLoading ? (
          <div className="loading-explanation">
            <p>Getting detailed explanation...</p>
          </div>
        ) : (
          <div 
            className="explanation-text"
            dangerouslySetInnerHTML={{ __html: explanation }}
          />
        )}
      </div>
    </div>
  );
};

export default ExplanationPopup;
