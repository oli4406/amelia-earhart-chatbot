import { useEffect } from 'react'

export default function History() {
    useEffect(() => {
        document.title = 'Chat History | Amelia Earhart Chatbot'
    }, [])

    return (
        <div>
            <h1>Chat History</h1>
            <p>Here you can view your past interactions with the chatbot.</p>
        </div>
    )
}