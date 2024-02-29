import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

function App() {
  const socket = useMemo(()=>{return io('http://localhost:3000')},[]);

  const [message , setMessage] = useState("");
  const [room , setRoom] = useState("");
  const [messages , setMessages] = useState([]);
  const [roomName  , setRoomName] = useState("");

  const handleChange = (e) =>{
    e.preventDefault();
    setMessage(e.target.value);
  }

  const handleChangeRoomName = (e) =>{
    e.preventDefault();
    setRoomName(e.target.value);
  }

  const handleClick = (e) =>{
    e.preventDefault();
    if(message.length>0 && room.length>0 ) socket.emit('message' ,{ message , room });
    setMessage("");
    setRoom("");
    
  }

  const handleChangeRoom = (e) =>{
    e.preventDefault();
    setRoom(e.target.value);
  }

  const joinRoom  = (e) =>{
    e.preventDefault();
    socket.emit('join-room' , roomName);
    setRoomName('');
  }
 
  useEffect(()=>{
    socket.on('connect',()=>{
      console.log("connected" , socket.id);
    });
    socket.on('welcome',(data)=>{
      console.log(data);
    });
    socket.on("message-received",(data)=>{
      // console.log(data);
      setMessages((messages) => ([...messages , {chat:data.message , senderId:data.senderId}]));
    })

  },[])
  return (
    <>
     <input type='text' placeholder='Enter roomName ' 
    onChange={handleChangeRoomName}
    value = {roomName}
    />
    <button onClick={joinRoom}>join</button>

    <br></br>
    <input type='text' placeholder='Enter something ' 
    onChange={handleChange}
    value = {message}
    />
    <button onClick={handleClick}>submit</button>
    <input type='text' placeholder='Enter roomID ' 
    onChange={handleChangeRoom}
    value = {room}
    />
    <br />
    {
      messages.map((Data)=>(
        <div>{Data.senderId + "    " + Data.chat}</div>
      ))
    }
    </>
  )
}

export default App
