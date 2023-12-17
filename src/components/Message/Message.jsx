import React, { useEffect, useRef, useState } from 'react'
import './Message.css'
import { useInfoContext } from '../../context/Context'
import Loader from '../Loader/Loader'
import { addMessage, deleteMessage, getMessage } from '../../api/messageRequests'
import {UilServer} from '@iconscout/react-unicons'
import Profile from '../../img/defauld_img.jpg'
import { getUser } from '../../api/userRequests'
import InputEmoji  from 'react-input-emoji'
import {format}  from 'timeago.js'
import { toast } from 'react-toastify'
const serverURL = process.env.REACT_APP_SERVER_URL


const Message = () => {
    const {onlineUsers, currentChat, setModal, modal, setUserModal, currentUser, exit,} = useInfoContext()
    const [userData, setUserData] = useState(null)
    const [messages, setMessages] = useState([])

    const imgRef = useRef()

    const userId = currentChat?.members?.find(id => id !== currentUser._id)

    useEffect(()=>{
        const getUsers = async () => {
            try {
                const res = await getUser(userId)
                setUserData(res.data.user);
            } catch (error) {
                if(error.response.data.message === 'jwt exprired'){
                    exit()
                }
            }
        }
        if(currentChat){
            getUsers()
        }
    },[userId])

    useEffect(()=>{
        const fetchMessage = async () => {
            try {
                const {data} = await getMessage(currentChat._id)
                setMessages(data.messages)
            } catch (error) {
                if(error.response.data.message === 'jwt exprired'){
                    exit()
                }
            }
        }
        if(currentChat){
            fetchMessage()
        }
    }, [currentChat])

    const online = () => {
        const onlineUser = onlineUsers.find(user => user.userId === userId)
        return onlineUser ? true : false
    }

    const deleteOneMessage = async (id) => {
        try {
            const res = await deleteMessage(id);
            toast.dismiss()
            toast.success(res?.data.message)
        } catch (error) {
            if(error.response.data.message === 'jwt exprired'){
                exit()
            }
        }
    }

   
  return (
    <div className="message-box cssanimation blurIn">
        {userData ? <div className="message-list" key={userData._id}>
            <div className="profile-box cssanimation blurInBottom">
                <img onClick={() => {setModal(!modal); setUserModal(userData) }}  src={userData?.profilePicture ? `${serverURL}/${userData?.profilePicture}` : Profile} alt="profile_img" className="message-img" />
                <div className='profile-content'>
                    <b>{userData?.firstname} {userData?.lastname}</b>
                    <div style={online() ? {color: 'greenyellow'} : {color: 'white'}}>{online() ? 'online' : 'offline'}</div>
                </div>
                <div className="profile-set">
                    <UilServer />
                </div>
            </div>
            <div className="send-message cssanimation blurInTop">
            {messages?.length > 0 ? messages.map(chat => {
                return(<div key={chat._id} className={chat.senderId === currentUser._id ? "messages own" : "messages"}>
                    <div>
                        <b>{chat.text} </b>
                        <span className='message-time'>{format(chat.createdAt)}</span>
                        <i onClick={() => deleteOneMessage(chat._id)}  className="fa-solid fa-ellipsis-vertical del"></i>
                    </div>
                </div>)}) : <h3 style={{position: "relative", top: '200px',}}>Hali yozishmalar mavjud emas!</h3>}
            </div>
            <div className="send-input-box">
                <div className="sender-file-btn">
                    <button className='send-file-btn'>file</button>
                    <InputEmoji/>
                    <button className='message-btn'>Send</button>
                    <input ref={imgRef} type="file" name="image" className='message-file-input'/>
                </div>
            </div>
        </div> : <Loader/>}
    </div>
  )
}

export default Message