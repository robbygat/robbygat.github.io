import React from 'react';

const Navigation = ({ activeSection, onSectionChange }) => {
  const sections = [
    { id: 'upload', label: 'Upload PDF' },
    { id: 'view', label: 'View PDF' },
    { id: 'translate', label: 'Translate' },
    { id: 'listen', label: 'Listen' },
    { id: 'about', label: 'About' }
  ];

  return (
    <nav className="app-nav">
      {sections.map(section => (
        <div
          key={section.id}
          className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
          onClick={() => onSectionChange(section.id)}
          role="button"
          tabIndex={0}
          aria-label={`Switch to ${section.label} section`}
        >
          {section.label}
        </div>
      ))}
    </nav>
  );
};

export default Navigation;
