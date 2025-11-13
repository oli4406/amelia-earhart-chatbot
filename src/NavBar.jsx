import {Link} from 'react-router';

const loggedIn = true; // Placeholder for actual authentication logic

export default function NavBar() {
    return(
        <nav>
            <Link style={{display:'block',margin: '10px auto'}} to="/">Home</Link>
            <Link style={{display:'block',margin: '10px auto'}} to="/chat">Chat</Link>
            {loggedIn && <Link style={{display:'block',margin: '10px auto'}} to="/history">History</Link>}

            <div className='navButtons'>
                <button>{ loggedIn ? 'Log out' : 'Login/Signup'}</button>
                <button>Settings</button>
            </div>
        </nav>
    );
}