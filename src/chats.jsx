import { useEffect, useState } from "react";
import axios from 'axios';
import { useParams } from "react-router-dom";
import { io } from 'socket.io-client';

const ChatPage = () => {
    const [socket, setSocket] = useState(null);
    const [users, setUsers] = useState([]);
    const [receiverId, setReceiverId] = useState(null);
    const [chats, setChats] = useState([]);
    const { Id } = useParams();
    const senderId = Id.slice(1);
    const [message, setMessage] = useState("");


    useEffect(() => {
        // Initialize socket connection
        const newSocket = io('http://localhost:8000'
        //  {
            // reconnection: false // Disable automatic reconnection
        // }
        );

        // Set up socket event listeners
        newSocket.on('connect', () => {
            console.log("connected", newSocket.id);
            // Emit setUserId only once when the user connects
            newSocket.emit('setUserId', senderId);
        });

        newSocket.on('ReceiveMessage', (newChat) => {
            console.log(newChat);
            if(senderId === newChat.receiverId){
                setChats(chats => [...chats, newChat]);
            }
        });

        // Handle connection errors
        newSocket.on('connect_error', (error) => {
            console.error("Socket connection error:", error);
            // You can handle the error here, e.g., display an error message to the user
        });

        // Save the socket instance to state
        setSocket(newSocket);

        // Clean up function to disconnect socket when unmounting
        return () => {
            newSocket.disconnect();
        };
    }, [senderId]);

    useEffect(() => {
        // Fetch users when component mounts
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user', { withCredentials: true });
                setUsers(response.data.users);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        // Fetch chats when receiverId changes
        const fetchChats = async () => {
            try {
                if (!receiverId) return; // Skip if receiverId is not set
                const response = await axios.post('http://localhost:8000/user/personalchats', { senderId, receiverId }, { withCredentials: true });
                if (response.data.success) {
                    setChats(response.data.chats);
                }
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
        };
        fetchChats();
    }, [receiverId, senderId]);

    const sendMessage = async () => {
        try {
            if (!message.trim()) return; // Skip if message is empty
            const chat = { senderId, receiverId, message };
            const response = await axios.post("http://localhost:8000/user/chats", chat, { withCredentials: true });
            if (response.data.success) {
                const msg = response.data.newChat;
                setChats(chats => [...chats, msg]);
                socket.emit('sendingMessage', { receiverId, msg });
            }
            setMessage(""); // Clear message input
        } catch (error) {
            console.error("Error sending chat:", error);
        }
    };

    return (
        <>
            {users.map(user => (
                <div key={user._id} onClick={() => setReceiverId(user._id)}>
                    {user._id + " " + user.userName}
                </div>
            ))}
            <br /><br />
            {chats.map((chat, index) => (
                <div key={index}>{`${chat.message} from ${senderId} to ${receiverId}`}</div>
            ))}
            <br /><br />
            <div>
                <input
                    type="text"
                    value={message}
                    placeholder="Type message"
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </>
    );
};

export default ChatPage;
