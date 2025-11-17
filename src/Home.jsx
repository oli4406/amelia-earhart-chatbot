import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function Home() {
        useEffect(() => {
                document.title = 'Amelia Earhart Chatbot';
            }, []);

        return(
                <div>
                        <h1>Welcome to the Amelia Earhart Chatbot!</h1>
                        <p>Ask me anything about your flight plans.</p>
                        <Link to="/chat">Go to Chat</Link>
                </div>
        );
}