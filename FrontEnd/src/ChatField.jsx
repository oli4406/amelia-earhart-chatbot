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

