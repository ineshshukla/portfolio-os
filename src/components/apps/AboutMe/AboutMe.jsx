import React, { useState } from 'react';
import './AboutMe.css';

const SECTIONS = {
  ABOUT: 'About',
  PROJECTS: 'Projects',
  EXPERIENCE: 'Experience',
  CONTACT: 'Contact',
};

const AboutMe = () => {
  const [activeSection, setActiveSection] = useState(null);

  const renderInitialView = () => (
    <div className="aboutme-initial-view">
      <h1 className="aboutme-name">Inesh Shukla</h1>
      <h2 className="aboutme-title">Software Engineer</h2>
      <div className="aboutme-nav-buttons">
        <button onClick={() => setActiveSection(SECTIONS.ABOUT)}>About</button>
        <button onClick={() => setActiveSection(SECTIONS.PROJECTS)}>Projects</button>
        <button onClick={() => setActiveSection(SECTIONS.EXPERIENCE)}>Experience</button>
        <button onClick={() => setActiveSection(SECTIONS.CONTACT)}>Contact</button>
      </div>
    </div>
  );

  const renderSectionView = () => (
    <div className="aboutme-section-view">
      <nav className="aboutme-sidebar">
        {Object.values(SECTIONS).map(section => (
          <button
            key={section}
            className={activeSection === section ? 'active' : ''}
            onClick={() => setActiveSection(section)}
          >
            {section}
          </button>
        ))}
         <button className="aboutme-back-button" onClick={() => setActiveSection(null)}>
          &lt; Home
        </button>
      </nav>
      <main className="aboutme-content">
        <h2>{activeSection}</h2>
        {/* Placeholder content */}
        <p>Content for the {activeSection} section goes here.</p>
      </main>
    </div>
  );

  return (
    <div className="aboutme-container">
      {activeSection ? renderSectionView() : renderInitialView()}
    </div>
  );
};

export default AboutMe;