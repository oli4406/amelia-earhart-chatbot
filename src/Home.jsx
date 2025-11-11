import {Link} from 'react-router'

export default function Home() {
    return(
        <div>
        <h1>Welcome to the Amelia Earhart Chatbot!</h1>
        <p>Ask me anything about your flight plans.</p>
        <Link to="/chat">Go to Chat</Link>
        </div>
    );
}