import { useEffect, useState , useRef} from "react";
import axios from 'axios';
import { useParams } from "react-router-dom";
import { io } from 'socket.io-client';
import './chats.css';
import { useNavigate } from 'react-router-dom';
import UserDisplay from './UserDisplay';
import ChatBox from "./ChatBox";
import AllUsers from "./AllUsers";

const ChatPage = () => {

    const [socket, setSocket] = useState(null);
    const [users, setUsers] = useState([]);
    const [receiverId, setReceiverId] = useState(null);
    const [chats, setChats] = useState([]);
    const { Id } = useParams();
    const senderId = Id.slice(1);
    const [receiverUserName , setReceiverUserName] = useState(""); 
    const [displayProperty ,setdisplayProperty] = useState(true);
    const fileInputRef = useRef(null);
    const [receiverUserProfile , setReceiverUserProfile] = useState("");
    const [AllUserModelBox , setAllUserModelBox] = useState(false);


    const navigate = useNavigate();

    useEffect(()=>{
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

    const SignOutFunc = async(e) =>{
        e.preventDefault();
        try {
            const res = await axios.delete('http://localhost:8000/user',
            {withCredentials:true});
        } catch (error) {
            console.log(error);
        }
        navigate(`/`,{replace:true});
    }

    const handleButtonClick = () => {
      fileInputRef.current.click();
    };
  

    const handleFileChange = async(event) => {
        const file = event.target.files[0];
        try {
            const formData = new FormData();
            formData.append('UserFile', file);
            formData.append('id', senderId);
            const response = await axios.post('http://localhost:8000/user/profile'
            ,formData,
            {withCredentials:true});
            if(response.data.success){
                const updatedUsers = users.map(user => {
                    if (user.senderId === senderId){
                      return { ...user, userProfile:response.data.userProfile};
                    }
                    return user;
                  });
                setUsers([...updatedUsers]);
            }
        } catch (error) {
            console.log(error);
        }
    };
  
    return (
            <div className="Container">
                <div className="Navbar">
                    <button className="AllUser" 
                        onClick={(e)=>{setAllUserModelBox(!AllUserModelBox)}}
                    >AllUsers</button>
                    <button className="ChangeDp" onClick={handleButtonClick}>Change DP</button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange} 
                    />
                    <button className="SignOutBtn"  
                        onClick={(e)=>{SignOutFunc(e)}}
                    >SignOut</button>
                </div>
                { displayProperty && 
                        <UserDisplay  users={users}  setUsers={setUsers}  
                        setReceiverUserProfile={setReceiverUserProfile} 
                        setReceiverId = {setReceiverId}
                        setReceiverUserName ={setReceiverUserName}
                        senderId ={senderId} socket ={socket} setdisplayProperty ={setdisplayProperty} 
                        displayProperty ={displayProperty} 
                        />
                }
                <ChatBox 
                    receiverId = {receiverId} senderId ={senderId}
                    socket ={socket}  receiverUserProfile ={receiverUserProfile} 
                    receiverUserName = {receiverUserName}
                    chats={chats} setChats={setChats}
                    setdisplayProperty ={setdisplayProperty} 
                    displayProperty ={displayProperty} 
                />
               {
                AllUserModelBox&&<AllUsers  setAllUserModelBox = {setAllUserModelBox}
                    SenderUser = {users} setUsers={setUsers}  
                />
               }

            </div>
    );
};

export default ChatPage;


