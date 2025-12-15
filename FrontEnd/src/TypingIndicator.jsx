import React from "react";
import "./TypingIndicator.css";

/**
 * TypingIndicator component that displays an animated typing indicator.
 * 
 * Renders three animated dots that simulate a typing effect, commonly used
 * to indicate that a message or response is being loaded or composed.
 * 
 * @component
 * @returns {JSX.Element} A div element with the class "typing-indicator" containing three span elements.
 * 
 * @example
 * return <TypingIndicator />
 */
const TypingIndicator = () => {
  return (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default TypingIndicator;

