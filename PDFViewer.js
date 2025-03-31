import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up the worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ file, onTextExtracted }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    if (file) {
      extractTextFromPDF(file);
    }
  }, [file]);

  const extractTextFromPDF = async (pdfFile) => {
    setIsExtracting(true);
    try {
      const fileReader = new FileReader();
      
      fileReader.onload = async function() {
        const typedArray = new Uint8Array(this.result);
        
        // Load the PDF document using PDF.js
        const loadingTask = pdfjsLib.getDocument({ data: typedArray });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        
        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const textItems = textContent.items;
          
          // Concatenate the text of all items on the page
          const pageText = textItems.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        setExtractedText(fullText);
        // Pass the extracted text to the parent component
        if (onTextExtracted) {
          onTextExtracted(fullText);
        }
        setIsExtracting(false);
      };
      
      fileReader.readAsArrayBuffer(pdfFile);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      setIsExtracting(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 3));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.5));

  return (
    <div className="pdf-viewer">
      {file && (
        <>
          <div className="pdf-controls">
            <button onClick={previousPage} disabled={pageNumber <= 1}>
              Previous
            </button>
            <span>
              Page {pageNumber} of {numPages}
            </span>
            <button onClick={nextPage} disabled={pageNumber >= numPages}>
              Next
            </button>
            <button onClick={zoomOut}>Zoom Out</button>
            <button onClick={zoomIn}>Zoom In</button>
          </div>
          
          <div className="pdf-document">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              loading="Loading PDF..."
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
          
          <div className="extracted-text">
            <h3>Extracted Text</h3>
            {isExtracting ? (
              <p>Extracting text from PDF...</p>
            ) : (
              <div className="text-content">
                {extractedText.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PDFViewer;
