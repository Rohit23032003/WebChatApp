import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignUp.css'
import SignUpPAgeLogo from './images/SignUpPAgeLogo.jpg'
// http://localhost:8000
import ProgressBar from "./ProgressBar";

const SignUp = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signUplogin , setSignUplogin] = useState("SignUp")
    const [isError , setIsError] = useState(false);
    const [errorMessage , setErrorMessage] = useState('')
    const [isSigUp , setIsSignUp] = useState(true);
    const [isLogin , setISLogin] = useState(false);

    const navigate = useNavigate();
    const handleUserNameChange = (e) => {
        e.preventDefault();
        setUserName(e.target.value.trim());
    }

    const handleEmailChange = (e) => {
        e.preventDefault();
        setEmail(e.target.value.trim());
    }
    
    const handlePasswordChange = (e) => {
        e.preventDefault();
        setPassword(e.target.value.trim());
    }

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        setSignUplogin("SignUp");
        setErrorMessage("");
        if(userName.length>0 && password.length>0 && email.length > 0){
            setIsError(false);
            const user = {
                userName, password , email
            }
            setEmail("");
            setPassword("");
            setUserName("");
            setIsLoading(true);
            try {
                const response = await axios.post('http://localhost:8000/user', user, {
                    withCredentials: true
                });
                if(response.data.success){
                    const id = response.data.newUser._id;
                    navigate(`/login/:${id}`,{replace:true});
                }
            } catch (error) {
                setIsError(true);
                setErrorMessage(error.response.data.message);
                console.log("error message is" , error);    

            }finally {
                setIsLoading(false);
              }
        }
        else if(isSigUp === true){
            setIsError(true);
            setErrorMessage('Please fill all the fields');
        }
        setIsSignUp(true);
        setISLogin(false);
    }

   const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSignUplogin("Login");
    setErrorMessage("");
    if(userName.length>0 && password.length>0){
        setIsError(false);
        const user = {
            userName, password 
        }
        setEmail("");
        setPassword("");
        setUserName("");          
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/user/login', user, {
                withCredentials: true
            });
            if (response.data.success) {
                const id = response.data.newUser._id;
                navigate(`/login/:${id}`,{replace:true});
            }
        } catch (error) {
            setIsError(true);
            console.log(error);
            setErrorMessage(error.message);
        }finally {
            setIsLoading(false);
        }
    }
    else if(isLogin === true){
      setIsError(true)
      setErrorMessage('Please fill all the fields');
    }
    setISLogin(true);
    setIsSignUp(false);
   }

    useEffect(() => {
        const apiCall = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user/login', {
                    withCredentials: true
                })
                if (response.data.success) {
                    const id = response.data.user._id;
                    navigate(`/login/:${id}`,{replace:true});
                }
            } catch (error) {
                console.log(error);
            }
        };
        apiCall();
    }, [])


    return (
        < div  className="container">
        { isLoading &&<ProgressBar/>}
            <div className="SignUpLoginMainDiv">
                    <img className="SignUpLogo" src={SignUpPAgeLogo}/>
                <div  className="SignUpDetail">
                    <h1>{signUplogin}</h1>
                    <div className="InputValueDiv">
                        <img width="25" height="25" src="https://img.icons8.com/ios-filled/50/user-male-circle.png" 
                        alt="user-male-circle"/>
                        <input id="UserName" type="text" value={userName} onChange={handleUserNameChange}
                            placeholder="UserName" />
                    </div>
                    <div className="InputValueDiv">
                        {
                        signUplogin === "SignUp" && (
                            <>
                                <img width="25" height="25" src="https://img.icons8.com/ios-glyphs/30/new-post.png" alt="new-post"/>
                                <input id="Email" type="email" value={email} onChange={handleEmailChange}
                                placeholder="Email" />
                            </>
                            )
                        }
                    </div>
                    <div className="InputValueDiv">
                    <img width="25" height="25" src="https://img.icons8.com/ios-glyphs/30/password--v1.png" alt="password--v1"/>
                        <input id="Password" type="password" onChange={handlePasswordChange} value={password}
                            placeholder="password" />
                    </div>
                    <div className="BtnDiv">
                        <button id="SignUpBtn" className={signUplogin==="SignUp" ? 'btn-blue' : 'btn-white'}
                            onClick={handleSignUpSubmit}>SignUp</button>

                        <button id="SignUpBtn" className={signUplogin === "Login" ? 'btn-blue' : 'btn-white'}
                        onClick={handleLoginSubmit}>Login</button>
                    </div>
                    {
                    isError  && (<div className="Error_Field">{errorMessage}</div>)
                    }
                </div>
            </div>
        </div>
    )
}


export default SignUp;