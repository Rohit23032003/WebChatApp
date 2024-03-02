import React from 'react'
import ReactDOM from 'react-dom/client'
import SignUp from './SignUp.jsx';
import {Route, RouterProvider, createBrowserRouter, createRoutesFromElements} from 'react-router-dom' ;
import Layout from './Layout.jsx';
import ChatPage  from './chats.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout/>}>
      <Route path='' element={<SignUp/>}/>
      <Route path='/login/:Id' element = {<ChatPage/>}/>
    </Route>
  )
);


ReactDOM.createRoot(document.getElementById('root')).render(
  <>
  <RouterProvider router={router}/>
  {/* <SignUp/> */}
  </>,
)
