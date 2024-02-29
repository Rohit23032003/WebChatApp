import { useEffect, useState } from "react"
import axios from 'axios';
import { useParams } from "react-router-dom";

const ChatPage = () =>{

    const [users , setUsers] =useState([{}]);
    const [receiverId , setReceiverId] = useState();
    const [chats , setChats] = useState([]);
    const { Id } = useParams();

    useEffect(()=>{
        const fethingUsers = async() => {
            try {
                const fetchedUsers = await axios.get('http://localhost:8000/user',{withCredentials:true});
                // console.log(fetchedUsers.data.users) ;  
                setUsers(fetchedUsers.data.users);
            } catch (error) {
                console.log(error);
            }
        }
        fethingUsers();
    },[]);

    useEffect(()=>{
        const fetchChats = async () =>{
            try {
                const senderId = Id.slice(1);
                console.log('sender id in params ' , senderId , "receiver id " , receiverId);
                const user = {
                    senderId , receiverId
                }
                const fetchedChats = await axios.post( 'http://localhost:8000/user/personalchats',user ,
                    {withCredentials:true});
                console.log(fetchedChats.data);
                if(fetchedChats.data.success){
                    console.log("data is " , fetchedChats.data.chats);
                    setChats([...fetchedChats.data.chats]);
                }

            } catch (error) {
                console.log(error);
            }
        }
        fetchChats();
        
    },[receiverId]);

    return (
        <>
            {
                users.map((user)=>{
                    return (   
                        <div onClick={()=> setReceiverId(user._id)}>
                            {
                               user._id + " " + user.userName
                            }
                        </div>
                    )
                })
            }
            <br/>
            <br/>
            {
                chats.map((chat)=>{
                    return (
                        <div>
                            {`${chat.message} from ${Id} to ${receiverId}`}
                        </div>
                    )
                })
            }
        </>
    )
}

export default ChatPage;



