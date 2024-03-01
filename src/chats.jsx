// import { useEffect, useState, useMemo } from "react"
// import axios from 'axios';
// import { useParams } from "react-router-dom";
// import { io } from 'socket.io-client';


// const ChatPage = () =>{

//     const [socket, setSocket] = useState(io('http://localhost:8000', {
//         reconnection: false // Disable automatic reconnection
//     }));
//     const [users , setUsers] =useState([{}]);
//     const [receiverId , setReceiverId] = useState();
//     const [chats , setChats] = useState([]);
//     const { Id } = useParams();
//     const senderId = Id.slice(1);
//     const [message , setMessage] = useState();


//     useEffect(() => {
//         // Setup socket connection and event listeners
//         socket.on('connect', () => {
//             console.log("connected", socket.id);
//             socket.emit('setUserId', senderId);
//         });
    
//         socket.on('ReceiveMessage', (newChat) => {
//             setChats((chats) => ([...chats, newChat]));
//         });
    
//         // Clean up function to remove event listeners
//         return () => {
//             socket.disconnect();
//             socket.off('ReceiveMessage');
//         };
//     }, [senderId]);
    

//     useEffect(()=>{
//         const fethingUsers = async() => {
//             try {
//                 const fetchedUsers = await axios.get('http://localhost:8000/user',
//                 {withCredentials:true});
//                 setUsers(fetchedUsers.data.users);
//             } catch (error) {
//                 console.log(error);
//             }
//         }
//         fethingUsers();

//     },[]);


//     useEffect(()=>{
//         const fetchChats = async () =>{
//             try {
//                 console.log('sender id in params ' , senderId , "receiver id " , receiverId);
//                 const user = {
//                     senderId , receiverId
//                 }
//                 const fetchedChats = await axios.post( 'http://localhost:8000/user/personalchats',user ,
//                     {withCredentials:true});
//                 console.log(fetchedChats.data);
//                 if(fetchedChats.data.success){
//                     console.log("data is " , fetchedChats.data.chats);
//                     setChats([...fetchedChats.data.chats]);
//                 }

//             } catch (error) {
//                 console.log(error);
//             }
//         }
//         fetchChats();
        
//     },[receiverId]);

//     const sendMessage = async()=>{

//         setMessage((message) => message.trim());

//             if(message.length > 0) {
//                 const storeMessageDb = async() => {
//                     try {
//                         const chat = {
//                             senderId , receiverId , message
//                         }
//                         const response = await axios.post("http://localhost:8000/user/chats", chat , {
//                             withCredentials:true
//                         } );

//                             console.log(response.data);
//                         if(response.data.success){
//                             console.log(response.data.newChat);
//                             const msg = response.data.newChat
//                             setChats((chats) => ([...chats , msg]));
//                             socket.emit('sendingMessage' , {receiverId , msg});
//                         }
//                     } catch (error) {
//                         console.log("error while sending chat " , error);
//                     }
//                 }
//                 storeMessageDb();
//                 setMessage("");
//             }
//     }

//     return (
//         <>
//             {
//                 users.map((user)=>{
//                     return (   
//                         <div onClick={()=> setReceiverId(user._id)}>
//                             {
//                                user._id + " " + user.userName
//                             }
//                         </div>
//                     )
//                 })
//             }
//             <br/>
//             <br/>
//             {
//                 chats.map((chat)=>{
//                     return (
//                         <div>
//                             {`${chat.message} from ${senderId} to ${receiverId}`}
//                         </div>
//                     )
//                 })
//             }
//             <br/>
//             <br/>
//             <div>
//                 <input type="text" value={message}
//                 placeholder="type message"  
//                     onChange={(e)=> setMessage(e.target.value)}
//                 />
//                 <button onClick={sendMessage}>send</button>
//             </div>
//         </>
//     )
// }

// export default ChatPage;



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
            setChats(chats => [...chats, newChat]);
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
