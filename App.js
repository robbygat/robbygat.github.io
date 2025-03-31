import React, { useState } from 'react';
import PDFUploader from './components/PDFUploader';
import PDFViewer from './components/PDFViewer';
import TranslationUI from './components/TranslationUI';
import TextToSpeechPlayer from './components/TextToSpeechPlayer';
import Navigation from './components/Navigation';
import './App.css';
import './responsive.css';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [activeSection, setActiveSection] = useState('upload');

  const handleFileUpload = (file) => {
    setPdfFile(file);
    setExtractedText('');
    setTranslatedText('');
    setActiveSection('view');
  };

  const handleTextExtracted = (text) => {
    setExtractedText(text);
  };

  const handleTextTranslated = (text) => {
    setTranslatedText(text);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleSectionChange = (section) => {
    // Only allow navigation to sections that make sense based on current state
    if (section === 'upload' || 
        (pdfFile && ['view', 'translate', 'listen'].includes(section)) ||
        section === 'about') {
      setActiveSection(section);
    }
  };

  // Render content based on active section
  const renderContent = () => {
    if (!pdfFile && activeSection !== 'about') {
      return <PDFUploader onFileUpload={handleFileUpload} />;
    }

    switch (activeSection) {
      case 'view':
        return <PDFViewer file={pdfFile} onTextExtracted={handleTextExtracted} />;
      case 'translate':
        return extractedText ? (
          <TranslationUI 
            text={extractedText} 
            onTranslated={handleTextTranslated}
            onLanguageChange={handleLanguageChange}
          />
        ) : (
          <div className="section-message">
            <p>Text extraction in progress. Please wait...</p>
          </div>
        );
      case 'listen':
        return (extractedText || translatedText) ? (
          <TextToSpeechPlayer 
            text={translatedText || extractedText} 
            language={selectedLanguage}
          />
        ) : (
          <div className="section-message">
            <p>No text available for speech. Please extract text first.</p>
          </div>
        );
      case 'about':
        return (
          <div className="about-section">
            <h2>About Multilingual PDF Reader</h2>
            <p>This application allows you to upload PDF files, extract and parse the text, translate the content into numerous languages, and listen to the text with synchronized highlighting.</p>
            <h3>Features:</h3>
            <ul>
              <li>PDF upload and text extraction using PDF.js</li>
              <li>Translation to multiple languages via Google Translate API</li>
              <li>Text-to-speech with synchronized highlighting using Speechify API</li>
              <li>Detailed word explanations powered by OpenAI ChatGPT</li>
            </ul>
            <p>Perfect for language learning, accessibility, and working with documents in foreign languages.</p>
          </div>
        );
      default:
        return <PDFUploader onFileUpload={handleFileUpload} />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Multilingual PDF Reader</h1>
        <p>Upload, translate, and listen to PDF documents in multiple languages</p>
      </header>
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange} 
      />
      <main>
        {renderContent()}
      </main>
      <footer className="App-footer">
        <p>Powered by PDF.js, Google Translate, Speechify, and OpenAI</p>
      </footer>
    </div>
  );
}

export default App;
