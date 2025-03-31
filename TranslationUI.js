import React, { useState, useEffect } from 'react';
import ExplanationPopup from './ExplanationPopup';

const TranslationUI = ({ text, onTranslated, onLanguageChange }) => {
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedTranslation, setSelectedTranslation] = useState('');
  const [showTranslationPopup, setShowTranslationPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showExplanation, setShowExplanation] = useState(false);
  const [contextSentence, setContextSentence] = useState('');
  
  // Google API Key from the requirements
  const apiKey = 'AIzaSyAbPQl3mw5z4Ei6zzvxGHk1sriMTeMxed0';
  
  // Common languages list
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'tr', name: 'Turkish' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'th', name: 'Thai' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ms', name: 'Malay' },
    { code: 'he', name: 'Hebrew' },
    { code: 'el', name: 'Greek' },
    { code: 'cs', name: 'Czech' },
    { code: 'ca', name: 'Catalan' },
    { code: 'bn', name: 'Bengali' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'sq', name: 'Albanian' },
    { code: 'zu', name: 'Zulu' }
  ];

  useEffect(() => {
    if (text && targetLanguage) {
      translateFullText();
    }
  }, [text, targetLanguage]);

  const translateFullText = async () => {
    if (!text) return;
    
    setIsTranslating(true);
    try {
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
        const translated = data.data.translations[0].translatedText;
        setTranslatedText(translated);
        if (onTranslated) {
          onTranslated(translated);
        }
      }
    } catch (error) {
      console.error('Error translating text:', error);
      setTranslatedText('Translation error. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setTargetLanguage(newLanguage);
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  const handleTextSelection = async (e) => {
    const selection = window.getSelection();
    const selectedStr = selection.toString().trim();
    
    if (selectedStr) {
      setSelectedText(selectedStr);
      
      // Get position for popup
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setPopupPosition({
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY
      });
      
      // Try to get the sentence containing the selected text for context
      const textNode = range.startContainer;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const textContent = textNode.textContent || '';
        // Simple sentence extraction - not perfect but works for basic cases
        const sentenceRegex = /[^.!?]*(?:[.!?]|$)/g;
        let match;
        let contextFound = false;
        
        while ((match = sentenceRegex.exec(textContent)) !== null) {
          if (match[0].includes(selectedStr)) {
            setContextSentence(match[0].trim());
            contextFound = true;
            break;
          }
        }
        
        if (!contextFound) {
          // Fallback to paragraph or nearby text
          setContextSentence(textContent.substring(0, 200).trim());
        }
      }
      
      // Translate the selected text
      try {
        const response = await fetch(
          'https://translation.googleapis.com/language/translate/v2',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: selectedStr,
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
          setSelectedTranslation(data.data.translations[0].translatedText);
          setShowTranslationPopup(true);
        }
      } catch (error) {
        console.error('Error translating selection:', error);
        setSelectedTranslation('Translation error');
        setShowTranslationPopup(true);
      }
    } else {
      setShowTranslationPopup(false);
    }
  };

  const closePopup = () => {
    setShowTranslationPopup(false);
  };
  
  const handleExplainWord = () => {
    setShowExplanation(true);
    setShowTranslationPopup(false);
  };
  
  const closeExplanation = () => {
    setShowExplanation(false);
  };

  return (
    <div className="translation-ui">
      <div className="language-selector">
        <label htmlFor="language-select">Translate to:</label>
        <select 
          id="language-select" 
          value={targetLanguage} 
          onChange={handleLanguageChange}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <button onClick={translateFullText} disabled={isTranslating}>
          {isTranslating ? 'Translating...' : 'Translate'}
        </button>
      </div>
      
      <div className="text-content-container">
        <div 
          className="original-text" 
          onMouseUp={handleTextSelection}
        >
          <h3>Original Text</h3>
          <div className="text-content">
            {text.split('\n').map((line, index) => (
              <p key={`original-${index}`}>{line}</p>
            ))}
          </div>
        </div>
        
        <div className="translated-text">
          <h3>Translated Text ({languages.find(l => l.code === targetLanguage)?.name})</h3>
          {isTranslating ? (
            <p>Translating...</p>
          ) : (
            <div className="text-content">
              {translatedText.split('\n').map((line, index) => (
                <p key={`translated-${index}`}>{line}</p>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showTranslationPopup && (
        <div 
          className="translation-popup" 
          style={{ 
            left: `${popupPosition.x}px`, 
            top: `${popupPosition.y + 10}px` 
          }}
        >
          <div className="popup-content">
            <p><strong>Original:</strong> {selectedText}</p>
            <p><strong>Translation:</strong> {selectedTranslation}</p>
            <button 
              className="explain-button" 
              onClick={handleExplainWord}
            >
              Get Detailed Explanation
            </button>
          </div>
          <button className="close-popup" onClick={closePopup}>×</button>
        </div>
      )}
      
      {showExplanation && (
        <>
          <div className="explanation-backdrop" onClick={closeExplanation}></div>
          <ExplanationPopup 
            word={selectedText}
            context={contextSentence}
            language={targetLanguage}
            onClose={closeExplanation}
          />
        </>
      )}
    </div>
  );
};

export default TranslationUI;
