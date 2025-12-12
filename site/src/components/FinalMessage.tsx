import React from 'react';
import '../styles/FinalMessage.css';

export const FinalMessage: React.FC = () => {
  return (
    <div className="final-message">
      <h1 className="final-message-title">That's a wrap!</h1>
      <p className="final-message-subtitle">See you next year <img src="/images/dashboard/hello.png" alt="wave" className="wave-image" /></p>
    </div>
  );
};
