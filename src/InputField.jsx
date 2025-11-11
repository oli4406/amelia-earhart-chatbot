export default function InputField({ value, onChange, onSubmit }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <div style={{ display: "flex", gap: "8px" }}>
      <input
        type="text"
        placeholder="Type your question here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ flex: 1, padding: "8px" }}
      />
      <button onClick={onSubmit}>Send</button>
    </div>
    );
}

