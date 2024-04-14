import axios from "axios";
import { useEffect , useState  , useRef} from "react";
import './ChatBox.css';
import ProgressBar from "./ProgressBar";
const MainUrl ="https://webchatapp-backend.onrender.com/" 

const imgUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQoYalG0iZwdwwSFMhNL4aDADjcSJFcuo31Y9OY6saF8ZG5dq3lLc8uXw0eJfUwvdwjTw&usqp=CAU"

const ChatBox = ({receiverId , senderId ,socket , receiverUserProfile ,receiverUserName , 
    chats , setChats , setdisplayProperty , displayProperty
}) => {
    const userChatsRef = useRef(null);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        if (userChatsRef.current) {
            userChatsRef.current.scrollTop = userChatsRef.current.scrollHeight;
        }
    }, [chats]);


    useEffect(() => {
        // Fetch chats when receiverId changes
        const fetchChats = async () => {
            setIsLoading(true);
            try {
                if (!receiverId) return; // Skip if receiverId is not set
                const response = await axios.post(`${MainUrl}user/personalchats`, 
                { senderId, receiverId }, { withCredentials: true });
                if (response.data.success) {
                    setChats(response.data.chats);
                }
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
            finally{setIsLoading(false);}
        };
        fetchChats();
    }, [receiverId, senderId]);

    const sendMessage = async () => {
        try {
            if (!message.trim()) return; // Skip if message is empty
            const chat = { senderId, receiverId, message };
            setMessage(""); // Clear message input
            const response = await axios.post(`${MainUrl}user/chats`,
             chat, { withCredentials: true });
            if (response.data.success) {
                const msg = response.data.newChat;
                setChats(chats => [...chats, msg]);
               if(msg.senderId !== msg.receiverId) {
                    socket.emit('sendingMessage', {msg});
               }
            }
        } catch (error) {
            console.error("Error sending chat:", error);
        }
    };

    const DeleteChats = async(e,id) => {
        e.preventDefault();
        setChats((chats) => (chats.filter((chat)=>(chat._id!==id))));
        try {
                await axios.delete(`${MainUrl}user/chats/:${id}`)
            } catch (error) {  
                console.log(error);          
        }
    }


    return (
        <div  className="chatsContainer">
                    <div className="receiverUser">
                        <div className="Menue" onClick={()=>(setdisplayProperty(!displayProperty))}>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                        <img  src={receiverUserProfile||imgUrl}
                                    className="userImage"
                                /> 
                         <span style={{fontSize:'1.25rem'}}>{receiverUserName}</span>                          
                    </div>
                    <div className="userChats" ref={userChatsRef}>
                       { isLoading && <ProgressBar/>}
                        {chats.map((chat, index) => (
                            <div key = {chat._id} className={`chatText ${senderId == chat.senderId?'sender':'receiver'}`}>
                                {`${chat.message}`}
                                {senderId === chat.senderId?(
                                <span className="DeleteBtn" onClick={(e)=>{DeleteChats(e,chat._id)}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path fillRule="evenodd" clipRule="evenodd" d="M7.5 1.25C6.46447 1.25 5.625 2.08947 5.625 3.125V3.75H3.125H2.4406H1.875C1.52982 3.75 1.25 4.02982 1.25 4.375C1.25 4.72018 1.52982 5 1.875 5H2.55424L3.54587 15.9079C3.6922 17.5175 5.04178 18.75 6.65804 18.75H13.342C14.9582 18.75 16.3078 17.5175 16.4541 15.9079L17.4458 5H18.125C18.4702 5 18.75 4.72018 18.75 4.375C18.75 4.02982 18.4702 3.75 18.125 3.75L17.5594 3.75H16.875H14.375V3.125C14.375 2.08947 13.5355 1.25 12.5 1.25H7.5ZM13.125 3.75V3.125C13.125 2.77982 12.8452 2.5 12.5 2.5H7.5C7.15482 2.5 6.875 2.77982 6.875 3.125V3.75H13.125ZM6.25 5H3.8094L4.79074 15.7948C4.87853 16.7605 5.68828 17.5 6.65804 17.5H13.342C14.3117 17.5 15.1215 16.7605 15.2093 15.7948L16.1906 5H13.75H6.25ZM8.75 7.5C8.75 7.15482 8.47018 6.875 8.125 6.875C7.77982 6.875 7.5 7.15482 7.5 7.5V13.75C7.5 14.0952 7.77982 14.375 8.125 14.375C8.47018 14.375 8.75 14.0952 8.75 13.75V7.5ZM11.875 6.875C12.2202 6.875 12.5 7.15482 12.5 7.5V13.75C12.5 14.0952 12.2202 14.375 11.875 14.375C11.5298 14.375 11.25 14.0952 11.25 13.75V7.5C11.25 7.15482 11.5298 6.875 11.875 6.875Z" fill="#D33852"/>
                                </svg>
                                </span>):null}
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
    )
}

export default ChatBox;