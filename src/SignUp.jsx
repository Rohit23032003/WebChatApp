import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignUp.css'
// import userImage from './images/user.JPG';
// import emailImage from './images/email.JPG';
// import  passwordImage from './images/password.JPG';


const SignUp = () => {

    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signUplogin , setSignUplogin] = useState("SignUp")
    const [isError , setIsError] = useState(false);
    const [errorMessage , setErrorMessage] = useState('')


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
        if(userName.length>0 && password.length>0 && email.length > 0){
            setIsError(false);
            const user = {
                userName, password , email
            }
            setEmail("");
            setPassword("");
            setUserName("");
            try {
                const response = await axios.post('http://localhost:8000/user', user, {
                    withCredentials: true
                });
                console.log(response.data.newUser._id);
                if(response.data.success){
                    const id = response.data.newUser._id;
                    navigate(`/login/:${id}`,{replace:true});
                }
            } catch (error) {
                setIsError(true);
                setErrorMessage(error.response.data.message);
                console.log("error message is" , error);    

            }
        }
        else {
            setIsError(true);
            setErrorMessage('Please fill all the fields');
        }
    }

   const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSignUplogin("Login");
    if(userName.length>0 && password.length>0){
        setIsError(false);

        const user = {
            userName, password 
        }
        setEmail("");
        setPassword("");
        setUserName("");
        try {
            const response = await axios.post('http://localhost:8000/user/login', user, {
                withCredentials: true
            });
            console.log(response.data);
            if (response.data.success) {
                const id = response.data.newUser._id;
                navigate(`/login/:${id}`,{replace:true});
            }
        } catch (error) {
            setIsError(true);
            setErrorMessage(error.response.data.message);
            console.log(error);
        }
    }
    else{
        setIsError(true)
        setErrorMessage('Please fill all the fields');
    }
   }

    useEffect(() => {
        const apiCall = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user/login', {
                    withCredentials: true
                })
                console.log(response.data);
                if (response.data.success) {
                    const id = response.data.user._id;
                    navigate(`/login/:${id}`,{replace:true});
                }
            } catch (error) {
                console.log(error.response.data.success);
            }
        };
        apiCall();
    }, [])


    return (
        < div className="container">
            <div className="SignUpLoginMainDiv">
                <h1>{signUplogin}</h1>
                <div className="InputValueDiv">
                    <input id="UserName" type="text" value={userName} onChange={handleUserNameChange}
                        placeholder="UserName" />
                </div>
                <div className="InputValueDiv">
                    {
                       signUplogin === "SignUp" && (<input id="Email" type="email" value={email} onChange={handleEmailChange}
                            placeholder="Email" />)
                    }
                </div>
                <div className="InputValueDiv">
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
    )
}


export default SignUp;