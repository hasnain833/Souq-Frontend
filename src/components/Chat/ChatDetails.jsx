import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { getChatMessages, markMessagesAsSeen } from "../../api/ChatService"
import useWebSocketChat from "../../hooks/useWebSocketChat"
import LoadingSpinner from "../common/LoadingSpinner"
import { formatDistanceToNowStrict } from 'date-fns'

// This component is now deprecated in favor of the new ChatRoom component
// Keeping it for backward compatibility but redirecting to new chat system
export default function ChatDetail({ chatId, onBack }) {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to the new chat system
    // Since we don't have the product ID here, we'll redirect to chat layout
    navigate('/chat-layout')
  }, [navigate])

  return (
    <div className="flex items-center justify-center h-full">
      <LoadingSpinner />
    </div>
  )
}

