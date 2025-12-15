/**
 * @module components/ChatField
 */

/**
 * ChatField component for user input in the chat interface
 * @component
 * @param {Object} props - Component props
 * @param {string} props.value - The current input value
 * @param {Function} props.onChange - Callback function triggered when input value changes
 * @param {Function} props.onSubmit - Callback function triggered when form is submitted (Enter key or Send button)
 * @returns {JSX.Element} A chat input field with a send button
 */
export default function ChatField({ value, onChange, onSubmit }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
      <div className="input-row">
        <input
          className="input-field"
          type="text"
          placeholder="Type your question here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="chat-input"
        />
        <button className="send-button" onClick={onSubmit}>Send</button>
    </div>
    );
}

