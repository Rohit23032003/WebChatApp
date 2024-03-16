import './UserDisplay.css'
import  cancelPng  from "./images/Group1176.png";
import axios from 'axios';
import { useEffect , useState } from 'react';


const imgUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQoYalG0iZwdwwSFMhNL4aDADjcSJFcuo31Y9OY6saF8ZG5dq3lLc8uXw0eJfUwvdwjTw&usqp=CAU"



const UserDisplay = ({users , setUsers , setReceiverUserProfile ,setReceiverId ,
     setReceiverUserName ,senderId , socket , setdisplayProperty , displayProperty}) => {


    useEffect(() => {
        
        const fetchUsers = async () => {
            try {
                const response = await axios.get('https://webchatapp-backend.onrender.com/user', { withCredentials: true });
                setUsers(response.data.users);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    const handleUserClick = (e , id , name) => 
    {
        e.preventDefault();
        setReceiverId(id)
        setReceiverUserName(name);
        const receiveId = id;
        const sendId = senderId;
        socket.emit('setReceiverId', {receiveId , sendId}); 
    }


    return (
        <div className="usersContainer">
                    <img id="cancelPngImage" src={cancelPng} onClick={()=>(setdisplayProperty(!displayProperty))}/>
                    {users.map((user , index) => (
                    <>
                        <div className = {`perticularUser `} key={user._id} onClick={(e) => {
                                if(user.userProfile.length>0){
                                    setReceiverUserProfile(user.userProfile);
                                }
                                handleUserClick(e,user._id , user.userName);
                            }}>{
                            }
                                <img  src={ user.userProfile || imgUrl}
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
    )
}

export default UserDisplay;

