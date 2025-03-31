import React, { useState, useEffect, useRef } from 'react';
import SpeechifyService from './SpeechifyService';

const TextToSpeechPlayer = ({ text, language }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [voiceOption, setVoiceOption] = useState('en-US-Standard-B');
  const textContainerRef = useRef(null);
  
  // Map of language codes to voice options
  const languageVoiceMap = {
    'en': 'en-US-Standard-B',
    'es': 'es-ES-Standard-A',
    'fr': 'fr-FR-Standard-A',
    'de': 'de-DE-Standard-A',
    'it': 'it-IT-Standard-A',
    'ja': 'ja-JP-Standard-A',
    'ko': 'ko-KR-Standard-A',
    'zh-CN': 'cmn-CN-Standard-A',
    'ru': 'ru-RU-Standard-A',
    'ar': 'ar-XA-Standard-A',
    'hi': 'hi-IN-Standard-A',
    'pt': 'pt-BR-Standard-A',
  };
  
  // Get the Speechify service
  const {
    isInitialized,
    isPlaying,
    currentPosition,
    error,
    generateAudio,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    setPlaybackSpeed: setAudioPlaybackSpeed,
  } = SpeechifyService();
  
  // Split text into sentences for highlighting
  const sentences = text ? text.match(/[^.!?]+[.!?]+/g) || [text] : [];
  
  // Update voice based on language
  useEffect(() => {
    if (language && languageVoiceMap[language.substring(0, 2)]) {
      setVoiceOption(languageVoiceMap[language.substring(0, 2)]);
    } else {
      setVoiceOption('en-US-Standard-B'); // Default to English
    }
  }, [language]);
  
  // Generate audio when text or voice changes
  useEffect(() => {
    if (text && isInitialized) {
      handleGenerateAudio();
    }
  }, [text, voiceOption, isInitialized]);
  
  const handleGenerateAudio = async () => {
    setIsLoading(true);
    const data = await generateAudio(text, voiceOption, playbackSpeed);
    setAudioData(data);
    setIsLoading(false);
  };
  
  const handlePlayAudio = async () => {
    if (isPlaying) {
      pauseAudio();
    } else if (audioData) {
      if (currentPosition > 0) {
        resumeAudio();
      } else {
        playAudio(audioData, handleHighlight);
      }
    } else {
      setIsLoading(true);
      const data = await generateAudio(text, voiceOption, playbackSpeed);
      setAudioData(data);
      setIsLoading(false);
      if (data) {
        playAudio(data, handleHighlight);
      }
    }
  };
  
  const handleStopAudio = () => {
    stopAudio();
    setHighlightedIndex(-1);
  };
  
  const handleHighlight = (position) => {
    if (sentences.length === 0) return;
    
    // Calculate which sentence to highlight based on position
    const index = Math.min(
      Math.floor(position * sentences.length),
      sentences.length - 1
    );
    
    setHighlightedIndex(index);
    
    // Scroll to highlighted sentence
    if (textContainerRef.current && index >= 0) {
      const sentenceElements = textContainerRef.current.querySelectorAll('.sentence');
      if (sentenceElements[index]) {
        sentenceElements[index].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  };
  
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    setAudioPlaybackSpeed(speed);
    
    // Regenerate audio with new speed if not playing
    if (!isPlaying) {
      handleGenerateAudio();
    }
  };
  
  return (
    <div className="text-to-speech-player">
      <div className="tts-controls">
        <button 
          onClick={handlePlayAudio} 
          disabled={isLoading || !text}
          className={isPlaying ? 'pause-button' : 'play-button'}
        >
          {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <button 
          onClick={handleStopAudio} 
          disabled={!isPlaying}
          className="stop-button"
        >
          Stop
        </button>
        
        <div className="speed-controls">
          <label htmlFor="speed-select">Speed:</label>
          <select 
            id="speed-select" 
            value={playbackSpeed} 
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1.0">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2.0">2.0x</option>
          </select>
        </div>
      </div>
      
      {error && <div className="tts-error">Error: {error}</div>}
      
      <div className="tts-text-container" ref={textContainerRef}>
        {sentences.map((sentence, index) => (
          <span 
            key={index} 
            className={`sentence ${index === highlightedIndex ? 'highlighted' : ''}`}
          >
            {sentence}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TextToSpeechPlayer;
