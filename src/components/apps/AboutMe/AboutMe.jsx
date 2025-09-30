import React, { useState } from 'react';
import './AboutMe.css';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';

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

  const renderSectionContent = () => {
    switch (activeSection) {
      case SECTIONS.ABOUT:
        return (
          <div>
            <h3>Education</h3>
            <p className="item">
              <strong>International Institute of Information Technology, Hyderabad</strong> <br />
              B.Tech in Computer Science + MS in Computational Natural Sciences <br />
              <em>July 2023 - May 2028</em> | <em>CGPA: 7.88/10</em>
            </p>
            <p className="item">
              <strong>Relevant Coursework:</strong> Data Structures and Algorithms, Machine Data & Learning, Design and Analysis of Software Systems, Computer Systems and Architecture.
            </p>
            <h3>Skills</h3>
            <ul>
              <li><strong>Languages:</strong> C, C++, Python, HTML/CSS, SQL, Bash</li>
              <li><strong>Frameworks/Web:</strong> React, MERN stack, Flask, Typescript, Jest</li>
              <li><strong>AI/ML libraries:</strong> Numpy, Pandas, OpenCV, scikit-learn, PyTorch</li>
              <li><strong>Dev Tools & Platforms:</strong> AWS, Git, Jenkins, Jira, MongoDB, SQL, REST APIS</li>
            </ul>
          </div>
        );
      case SECTIONS.PROJECTS:
        return (
          <div>
            <div className="item">
              <h4><a href="https://github.com/ineshshukla/BUY_SELL_RENT" target="_blank" rel="noopener noreferrer">Buy-Sell @ IIITH | MERN Stack</a></h4>
              <p>A MERN stack platform for IIIT Hyderabad students to buy and sell products securely. It features user authentication, role-based access, and an OTP-based transaction system. The React frontend supports cart management, order tracking, and seller reviews.</p>
            </div>
            <div className="item">
              <h4><a href="https://github.com/ineshshukla/athena" target="_blank" rel="noopener noreferrer">Athena Chess Engine | Python</a></h4>
              <p>A chess engine implementing game theory algorithms like negamax, alpha-beta pruning, quiescence search, move ordering, and piece-square tables for evaluation. Supports the UCI protocol for compatibility with GUIs like Lichess.</p>
            </div>
            <div className="item">
              <h4><a href="https://github.com/ineshshukla/Images-To-Video-Application" target="_blank" rel="noopener noreferrer">Image to Video Application | Flask, SQL, HTML/CSS</a></h4>
              <p>A Flask and SQL-based app that converts image sequences into videos with custom transitions and audio. The frontend is built with HTML, CSS, and JavaScript for smooth interaction.</p>
            </div>
          </div>
        );
      case SECTIONS.EXPERIENCE:
        return (
          <div>
            <div className="item">
              <h4>Software Engineering Intern | John Deere</h4>
              <p><em>Pune, India | Jun 2025 - Aug 2025</em></p>
              <ul>
                <li>Developed scalable React-based features improving real-time user interaction for internal systems.</li>
                <li>Contributed to intelligent support tooling using AI-driven logic, enhancing user experience and workflow efficiency.</li>
                <li>Worked in an Agile environment; gained experience with Jenkins CI/CD, Jira, AWS, and unit testing using Jest.</li>
              </ul>
            </div>
            <div className="item">
              <h4>Undergraduate Researcher | CCNSB, IIIT Hyderabad</h4>
              <p><em>Hyderabad, India | Apr 2025 - Present</em></p>
              <ul>
                <li>Research Areas: Epidemic modeling, time-series forecasting, statistical and network-based methods.</li>
                <li>Ongoing Work: Building epidemic-informed machine learning architectures for TB and dengue using multivariate epidemiological data.</li>
              </ul>
            </div>
            <div className="item">
              <h4>Software Development Intern | PenScan</h4>
              <p><em>Hyderabad, India | Jan 2025 - Apr 2025</em></p>
              <ul>
                <li>Built Flask-based microservices and REST APIs for a penetration testing automation platform.</li>
                <li>Integrated OWASP ZAP and optimized MongoDB/SQLite queries for improved performance.</li>
              </ul>
            </div>
          </div>
        );
      case SECTIONS.CONTACT:
        return (
          <div className="aboutme-contact-grid">
            <a href="tel:+919696622844" className="aboutme-contact-item">
              <PhoneIcon />
              <span>+91 9696622844</span>
            </a>
            <a href="mailto:inesh.shukla@research.iiit.ac.in" className="aboutme-contact-item">
              <EmailIcon />
              <span>inesh.shukla@research.iiit.ac.in</span>
            </a>
            <a href="https://www.linkedin.com/in/inesh-shukla/" target="_blank" rel="noopener noreferrer" className="aboutme-contact-item">
              <LinkedInIcon />
              <span>/in/inesh-shukla</span>
            </a>
            <a href="https://github.com/ineshshukla" target="_blank" rel="noopener noreferrer" className="aboutme-contact-item">
              <GitHubIcon />
              <span>/ineshshukla</span>
            </a>
          </div>
        );
      default:
        return null;
    }
  };

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
        {renderSectionContent()}
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