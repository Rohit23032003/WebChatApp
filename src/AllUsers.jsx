import React, { useEffect, useState } from 'react'
import './AllUsers.css'
import  axios  from 'axios';
import sendBtn from './images/sendBtn.png';
import cancelImg  from './images/Group1176.png';
const MainUrl ="https://webchatapp-backend.onrender.com/" 

 const  AllUsers = (props) => {
    const [Users , setUsers] = useState([]);
    const [CopyUserList , setCopyUserList] = useState([...Users]);


    useEffect(()=>{
        const fetchAllUsers = async()=>{
                try {
                    const response = await axios.get(`${MainUrl}user`, { withCredentials: true });
                    setUsers(response.data.users);
                    setCopyUserList(response.data.users);
                } catch (error) {
                    console.log(error);            
                }            
        }
        fetchAllUsers();
    },[]);

    const handleSearch = (e) => {
        const newList  = Users.filter((user)=>{
            return user.userName.includes(e.target.value.trim());
        });
        setCopyUserList(newList);
    }
    const handleReqSent = async(e , user)=>{
        const found = props.SenderUser.find((users)=>users.senderId === user._id);
        if(!found ){
            const newUser = {
                senderId:user._id,
                userName:user.userName,
                userProfile:user.userProfile
            }
            props.setUsers([...props.SenderUser , {...newUser}]);
                try {
                    const res = await axios.post(`${MainUrl}user/RequestAccept`,{
                        currentUser:props.SenderUser[0].senderId,
                        ...newUser
                    },{withCredentials:true});
                } catch (error) {
                    console.log(error);
                }
        }
}

  return (
    <div className="AllUserMainDiv">
      <div className='AllUserContainer'>
        <img src={cancelImg} className='cancelImg'
            onClick={(e)=>{
                props?.setAllUserModelBox(false);
            }}
        />
        <input className='SearchBar' placeholder='userName'
        onChange={handleSearch}
        ></input>
        {
            CopyUserList.map((user)=>{
                return (
                    <div key={user._id} className='usersDiv'>
                        <img className="userPic" src = {user.userProfile}  alt = ''/>
                        <div className='username'> {user.userName}</div>
                        <img className='sendBtn' src={sendBtn} 
                            onClick={(e) => handleReqSent(e , user)}
                        />
                    </div>
                )
            })
        }
      </div>
     </div>
  )
}

export default AllUsers;
