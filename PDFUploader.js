import React, { useState } from 'react';

const PDFUploader = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    setFileName(file.name);
    onFileUpload(file);
  };

  return (
    <div className="pdf-uploader">
      <div 
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <h3>Upload PDF</h3>
          <p>Drag and drop your PDF file here or click to browse</p>
          {fileName && <p className="file-name">Selected: {fileName}</p>}
          <input 
            type="file" 
            id="pdf-file" 
            accept=".pdf" 
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="pdf-file" className="upload-button">
            Browse Files
          </label>
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;
