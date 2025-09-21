import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// This component redirects to the new WhatsApp-like chat layout
const ChatRoom = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new chat layout with product ID
    if (productId) {
      navigate(`/chat-layout?productId=${productId}`, { replace: true });
    } else {
      navigate('/chat-layout', { replace: true });
    }
  }, [productId, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to chat...</p>
      </div>
    </div>
  );
};

export default ChatRoom;
