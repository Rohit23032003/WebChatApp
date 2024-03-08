import { useEffect, useState , useRef} from "react";
import axios from 'axios';
import { useParams } from "react-router-dom";
import { io } from 'socket.io-client';
import './chats.css';

import  cancelPng  from "./images/Group1176.png";

const ChatPage = () => {
    const [socket, setSocket] = useState(null);
    const [users, setUsers] = useState([]);
    const [receiverId, setReceiverId] = useState(null);
    const [chats, setChats] = useState([]);
    const { Id } = useParams();
    const senderId = Id.slice(1);
    const [message, setMessage] = useState("");
    const [receiverUserName , setReceiverUserName] = useState(""); 
    const userChatsRef = useRef(null);
    const [displayProperty ,setdisplayProperty] = useState(true);
    
    useEffect(() => {
        if (userChatsRef.current) {
            userChatsRef.current.scrollTop = userChatsRef.current.scrollHeight;
        }
    }, [chats]);

    useEffect(()=>{
        console.log(window.screen.width);
        const handleResize = () => {
            if (window.innerWidth <= 767) {
                setdisplayProperty(false);
            } else {
                setdisplayProperty(true);
            }
        };
    
        // Add event listener for window resize
        window.addEventListener('resize', handleResize);
    
        // Cleanup by removing event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    },[]);


    useEffect(() => {
        // Initialize socket connection
        const newSocket = io('http://localhost:8000');

        // Set up socket event listeners
        newSocket.on('connect', () => {
            console.log("connected", newSocket.id);
            // Emit setUserId only once when the user connects
            newSocket.emit('setUserId', senderId);
        });

        newSocket.on('ReceiveMessage', ({msg}) => {
                setChats(chats => [...chats, msg]);
        });

        newSocket.on('connect_error', (error) => {
            console.error("Socket connection error:", error);
            // You can handle the error here, e.g., display an error message to the user
        });

        // Save the socket instance to state
        setSocket(newSocket);

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
               if(msg.senderId !== msg.receiverId) {
                // console.log(msg.senderId , " " , msg.re);
                    socket.emit('sendingMessage', {msg});
               }
            }
            setMessage(""); // Clear message input
        } catch (error) {
            console.error("Error sending chat:", error);
        }
    };

    const handleUserClick = (e , id , name) => 
    {
        e.preventDefault();
        setReceiverId(id)
        console.log(name);
        setReceiverUserName(name);
        const receiveId = id;
        const sendId = senderId;
        console.log("receiveId ", receiveId , " sendId " , sendId);
        socket.emit('setReceiverId', {receiveId , sendId}); 
    }


    return (
        <div className="mainContainer">
            <div className="Container">
                <div className="Navbar">
                    <button className="SignOutBtn">ChangeDp</button>
                    <button className="SignOutBtn">SignOut</button>
                </div>
                { displayProperty && <div className="usersContainer" 
                >
                    <img id="cancelPngImage" src={cancelPng} onClick={()=>(setdisplayProperty(!displayProperty))}/>
                    {users.map((user , index) => (
                    <>
                        <div className = {`perticularUser `} key={user._id} onClick={(e) => {
                            handleUserClick(e,user._id , user.userName);
                            }}>
                                <img  src=" https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQoYalG0iZwdwwSFMhNL4aDADjcSJFcuo31Y9OY6saF8ZG5dq3lLc8uXw0eJfUwvdwjTw&usqp=CAU"
                                    className="userImage"
                                />
                                <div className="perticularUserName">
                                    {user.userName}
                                </div>
                        </div>
                                {
                                    index !== users.length - 1  && (
                                        <div className="DivideUserLine">
                                        </div>
                                    )
                                }
                        </>
                    ))}
                </div>
                }
                <br /><br />
            
                <br /><br />
                <div className="chatsContainer">
                
                    <div className="receiverUser">
                        <div className="Menue" onClick={()=>(setdisplayProperty(!displayProperty))}>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                        <img  src=" https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQoYalG0iZwdwwSFMhNL4aDADjcSJFcuo31Y9OY6saF8ZG5dq3lLc8uXw0eJfUwvdwjTw&usqp=CAU"
                                    className="userImage"
                                /> 
                         <span>{receiverUserName}</span>                          
                    </div>
                    <div className="userChats" ref={userChatsRef}>
                        {chats.map((chat, index) => (
                            <div className={`chatText ${senderId == chat.senderId?'sender':'receiver'}`}  key={index}>
                                {`${chat.message}`}
                                <span className="DeleteBtn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 1.25C6.46447 1.25 5.625 2.08947 5.625 3.125V3.75H3.125H2.4406H1.875C1.52982 3.75 1.25 4.02982 1.25 4.375C1.25 4.72018 1.52982 5 1.875 5H2.55424L3.54587 15.9079C3.6922 17.5175 5.04178 18.75 6.65804 18.75H13.342C14.9582 18.75 16.3078 17.5175 16.4541 15.9079L17.4458 5H18.125C18.4702 5 18.75 4.72018 18.75 4.375C18.75 4.02982 18.4702 3.75 18.125 3.75L17.5594 3.75H16.875H14.375V3.125C14.375 2.08947 13.5355 1.25 12.5 1.25H7.5ZM13.125 3.75V3.125C13.125 2.77982 12.8452 2.5 12.5 2.5H7.5C7.15482 2.5 6.875 2.77982 6.875 3.125V3.75H13.125ZM6.25 5H3.8094L4.79074 15.7948C4.87853 16.7605 5.68828 17.5 6.65804 17.5H13.342C14.3117 17.5 15.1215 16.7605 15.2093 15.7948L16.1906 5H13.75H6.25ZM8.75 7.5C8.75 7.15482 8.47018 6.875 8.125 6.875C7.77982 6.875 7.5 7.15482 7.5 7.5V13.75C7.5 14.0952 7.77982 14.375 8.125 14.375C8.47018 14.375 8.75 14.0952 8.75 13.75V7.5ZM11.875 6.875C12.2202 6.875 12.5 7.15482 12.5 7.5V13.75C12.5 14.0952 12.2202 14.375 11.875 14.375C11.5298 14.375 11.25 14.0952 11.25 13.75V7.5C11.25 7.15482 11.5298 6.875 11.875 6.875Z" fill="#D33852"/>
                                </svg>
                                </span>
                            </div>
                        ))}
                    </div>
                        <div className="inputAndSend">
                            <input
                                id="MessageInputFields"
                                type="text"
                                value={message}
                                placeholder="Type message"
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button onClick={sendMessage}  id="SendMessageBtn" >Send</button>
                        </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
