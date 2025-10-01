
import React, { useState, useEffect, useRef } from 'react';
import { getChatMessages, markMessagesAsSeen } from '../../api/ChatService';
import useWebSocketChat from '../../hooks/useWebSocketChat';
import LoadingSpinner from '../common/LoadingSpinner';
// import { formatDistanceToNowStrict } from 'date-fns';
import {
  compressImage,
  fileToBase64,
  validateImageFile,
  createImagePreview,
  revokeImagePreview,
  formatFileSize
} from '../../utils/imageUtils';
// import ChatDebug from './ChatDebug';
import ImagePreviewModal from './ImagePreviewModal';
import MakeOfferModal from '../Products/MakeOffer';
import OfferMessage from './OfferMessage';
import { getChatOffer } from '../../api/OfferService';
import { useLocation, useNavigate } from 'react-router-dom';
import UserInfoModal from './UserInfoModal';
import { Info, X } from 'lucide-react';
import UserInformation from './UserInformation';
import { useTranslation } from 'react-i18next';

const ChatRoomSplit = ({ chat, onBack, getProductDetailsFromChats, onChatDeleted }) => {
  console.log(chat, "chat")
  const location = useLocation();
  const status = location.state?.status; 
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [userInforMation, setUserInformation] = useState(false)
  // Image preview modal state
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewImageSender, setPreviewImageSender] = useState('');
  const [previewImageTimestamp, setPreviewImageTimestamp] = useState(null);

  // Offer modal state
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);

  // State to store matched product details from chats
  const [matchedProductDetails, setMatchedProductDetails] = useState(null);

  // Note: Using product data directly from chat object (now enhanced with product details from ChatLayout)
  // Get product details from chats state by comparing product ID
  const productDetailsFromChats = getProductDetailsFromChats ? getProductDetailsFromChats(chat?.product?.id) : null
  console.log('Product details from chats comparison:', productDetailsFromChats)
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const sendingTimeouts = useRef(new Map());
  const initializingRef = useRef(false);
  const lastChatIdRef = useRef(null);

  const {
    // socket,
    connected,
    error: socketError,
    messageError,
    setMessageError,
    messages,
    setMessages,
    clearMessages,
    currentChat,
    otherUserTyping,
    joinChat,
    leaveChat,
    sendMessage,
    handleTyping,
    markAsSeen
  } = useWebSocketChat();

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  // Update matched product details when chat or getProductDetailsFromChats changes
  useEffect(() => {
    if (getProductDetailsFromChats && chat?.product?.id) {
      const productDetails = getProductDetailsFromChats(chat.product.id);
      setMatchedProductDetails(productDetails);
      console.log('🔍 Product ID comparison result:', {
        searchingForProductId: chat.product.id,
        foundMatch: !!productDetails,
        matchedDetails: productDetails
      });
    } else {
      setMatchedProductDetails(null);
      console.log('🔍 No product ID or comparison function available');
    }
  }, [chat?.product?.id, getProductDetailsFromChats]);

  // Initialize chat when chat prop changes
  // useEffect(() => {
  //   const initializeChat = async () => {
  //     // Prevent multiple initializations for the same chat
  //     if (initializingRef.current || !chat || lastChatIdRef.current === chat.id) {
  //       return;
  //     }

  //     if (!chat) {
  //       clearMessages();
  //       lastChatIdRef.current = null;
  //       return;
  //     }

  //     initializingRef.current = true;
  //     lastChatIdRef.current = chat.id;

  //     try {
  //       setLoading(true);
  //       setError(null);

  //       // Clear previous messages when switching chats
  //       clearMessages();

  //       // Leave previous chat if any and wait for it to complete
  //       if (currentChat && currentChat.chatId !== chat.id) {
  //         console.log('🚪 Leaving previous chat:', currentChat);
  //         leaveChat();
  //         // Add a small delay to ensure leave operation completes
  //         await new Promise(resolve => setTimeout(resolve, 100));
  //       }

  //       // Join the chat room via WebSocket
  //       console.log('🚪 Joining chat:', { chatId: chat.id, roomId: chat.roomId });
  //       joinChat(chat.id, chat.roomId);

  //       // Add a small delay to ensure join operation completes
  //       await new Promise(resolve => setTimeout(resolve, 200));

  //       // Fetch existing messages and set them in the WebSocket hook
  //       const messagesResponse = await getChatMessages(chat.id);
  //       if (messagesResponse.success) {
  //         const existingMessages = messagesResponse.data.data.messages || [];
  //         console.log('📥 Loaded existing messages:', existingMessages.length);

  //         // Debug: Log image messages specifically
  //         const imageMessages = existingMessages.filter(msg => msg.messageType === 'image');
  //         if (imageMessages.length > 0) {
  //           console.log('🖼️ Image messages found:', imageMessages.map(msg => ({
  //             id: msg.id,
  //             messageType: msg.messageType,
  //             hasImageUrl: !!msg.imageUrl,
  //             hasAttachments: !!msg.attachments?.length,
  //             imageUrlPreview: msg.imageUrl ? msg.imageUrl.substring(0, 50) + '...' : 'none'
  //           })));
  //         }

  //         // Debug: Check for duplicate offer messages
  //         const offerMessages = existingMessages.filter(m =>
  //           ['offer', 'offer_accepted', 'offer_declined', 'offer_expired'].includes(m.messageType)
  //         );
  //         console.log('🎯 Offer messages found:', offerMessages.length, offerMessages.map(m => ({
  //           id: m.id,
  //           type: m.messageType,
  //           offer: m.offer,
  //           status: m.offerData?.status,
  //           text: m.text
  //         })));

  //         setMessages(existingMessages);
  //       }

  //       // Fetch current offer for this chat
  //       try {
  //         const offerResponse = await getChatOffer(chat.id);
  //         if (offerResponse.success && offerResponse.data) {
  //           setCurrentOffer(offerResponse.data);
  //         }
  //       } catch (error) {
  //         console.log('No active offer found for this chat');
  //         setCurrentOffer(null);
  //       }

  //       // Log chat product data for debugging
  //       console.log('� Using chat product data:', chat?.product);
  //       console.log('️ Product photos:', chat?.product?.photos);
  //       console.log('💰 Product price:', chat?.product?.price);
  //       console.log('📝 Product title:', chat?.product?.title);

  //       setLoading(false);
  //     } catch (err) {
  //       console.error('Initialize chat error:', err);
  //       setError(err.message || 'Failed to initialize chat');
  //       setLoading(false);
  //     } finally {
  //       initializingRef.current = false;
  //     }
  //   };

  //   // Debounce the initialization
  //   const timeoutId = setTimeout(() => {
  //     if (connected && chat) {
  //       initializeChat();
  //     } else if (!chat) {
  //       clearMessages();
  //       lastChatIdRef.current = null;
  //     } else if (!connected) {
  //       console.log('⏳ Waiting for connection before initializing chat:', chat?.id);
  //     }
  //   }, 100); // 100ms debounce

  //   return () => clearTimeout(timeoutId);
  // }, [chat?.id, connected]); // Only depend on chat ID and connection status


  useEffect(() => {
    const initializeChat = async () => {
      // Prevent multiple initializations for the same chat
      if (initializingRef.current || !chat || lastChatIdRef.current === chat.id) {
        return;
      }

      if (!chat) {
        clearMessages();
        lastChatIdRef.current = null;
        setCurrentOffer(null)
        return;
      }

      initializingRef.current = true;
      lastChatIdRef.current = chat.id;

      try {
        setLoading(true);
        setError(null);
        setCurrentOffer(null);
        setUserInformation(false)
        // Clear previous messages when switching chats
        clearMessages();

        // Leave previous chat if any and wait for it to complete
        if (currentChat && currentChat.chatId !== chat.id) {
          console.log('🚪 Leaving previous chat:', currentChat);
          leaveChat();
          // Add a small delay to ensure leave operation completes
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Join the chat room via WebSocket
        console.log('🚪 Joining chat:', { chatId: chat.id, roomId: chat.roomId });
        joinChat(chat.id, chat.roomId);

        // Add a small delay to ensure join operation completes
        await new Promise(resolve => setTimeout(resolve, 200));

        // Fetch existing messages and set them in the WebSocket hook
        const messagesResponse = await getChatMessages(chat.id);
        if (messagesResponse.success) {
          const existingMessages = messagesResponse.data.data.messages || [];
          console.log('📥 Loaded existing messages:', existingMessages.length);

          // Debug: Log image messages specifically
          const imageMessages = existingMessages.filter(msg => msg.messageType === 'image');
          if (imageMessages.length > 0) {
            console.log('🖼️ Image messages found:', imageMessages.map(msg => ({
              id: msg.id,
              messageType: msg.messageType,
              hasImageUrl: !!msg.imageUrl,
              hasAttachments: !!msg.attachments?.length,
              imageUrlPreview: msg.imageUrl ? msg.imageUrl.substring(0, 50) + '...' : 'none'
            })));
          }

          // Debug: Check for duplicate offer messages
          const offerMessages = existingMessages.filter(m =>
            ['offer', 'offer_accepted', 'offer_declined', 'offer_expired'].includes(m.messageType)
          );
          console.log('🎯 Offer messages found:', offerMessages.length, offerMessages.map(m => ({
            id: m.id,
            type: m.messageType,
            offer: m.offer,
            status: m.offerData?.status,
            text: m.text
          })));

          setMessages(existingMessages);
        }

        // Fetch current offer for this chat
        try {
          const offerResponse = await getChatOffer(chat.id);
          if (offerResponse.success && offerResponse.data) {
            if (lastChatIdRef.current === chat.id) {
              setCurrentOffer(offerResponse.data);
            }
          } else {
            setCurrentOffer(null); // 🔧 Clear if no offer
          }
        } catch (error) {
          console.log('No active offer found for this chat');
          setCurrentOffer(null); // 🔧 Clear on error
        }
        // Log chat product data for debugging
        console.log('� Using chat product data:', chat?.product);
        console.log('️ Product photos:', chat?.product?.photos);
        console.log('💰 Product price:', chat?.product?.price);
        console.log('📝 Product title:', chat?.product?.title);

        setLoading(false);
      } catch (err) {
        console.error('Initialize chat error:', err);
        setError(err.message || 'Failed to initialize chat');
        setLoading(false);
      } finally {
        initializingRef.current = false;
      }
    };

    // Debounce the initialization
    const timeoutId = setTimeout(() => {
      if (connected && chat) {
        initializeChat();
      } else if (!chat) {
        clearMessages();
        lastChatIdRef.current = null;
        setCurrentOffer(null)
      } else if (!connected) {
        console.log('⏳ Waiting for connection before initializing chat:', chat?.id);
      }
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [chat?.id, connected]); // Only depend on chat ID and connection status

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!loading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Mark messages as seen when chat is viewed
  useEffect(() => {
    if (chat && messages.length > 0) {
      markAsSeen();
      markMessagesAsSeen(chat.id);
    }
  }, [chat?.id, messages.length]); // Only depend on chat ID and message count

  const handleSendMessage = async () => {
    const text = newMessage.trim();
    if (!text && !imageFile) return;

    if (imageUploading) return; // Prevent sending while uploading

    // Clear any previous errors
    setImageError(null);
    setMessageError(null);

    // Ensure we're properly connected to the chat room before sending
    if (!currentChat || currentChat.chatId !== chat?.id) {
      console.log('🔄 Re-joining chat before sending message:', { chatId: chat?.id, roomId: chat?.roomId });
      if (chat?.id && chat?.roomId) {
        joinChat(chat.id, chat.roomId);
        // Wait a moment for the join to complete
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        setMessageError('Cannot send message - invalid chat information');
        return;
      }
    }

    try {
      // Handle text message
      if (text && !imageFile) {
        // Add optimistic message to UI immediately
        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          text,
          messageType: 'text',
          sender: {
            id: currentUser?.id || currentUser?._id,
            userName: currentUser?.userName,
            firstName: currentUser?.firstName,
            lastName: currentUser?.lastName,
            profile: currentUser?.profile
          },
          createdAt: new Date().toISOString(),
          seen: false,
          status: 'sending'
        };

        setMessages(prev => [...prev, optimisticMessage]);

        // Set timeout to remove "sending" status if no response
        const timeoutId = setTimeout(() => {
          setMessages(prev => prev.map(msg =>
            msg.id === optimisticMessage.id
              ? { ...msg, status: 'sent' }
              : msg
          ));
        }, 10000); // 10 seconds timeout

        sendingTimeouts.current.set(optimisticMessage.id, timeoutId);

        sendMessage({
          text,
          messageType: 'text'
        });
        setNewMessage('');
      }

      // Handle image message
      else if (imageFile) {
        setImageUploading(true);

        // Compress the image before sending
        const compressedImage = await compressImage(imageFile, 800, 600, 0.8);
        const base64Image = await fileToBase64(compressedImage);

        // Validate the base64 image
        if (!base64Image || !base64Image.startsWith('data:image/')) {
          throw new Error('Failed to process image. Please try a different image.');
        }

        // Check final image size
        const imageSizeBytes = (base64Image.length * 3) / 4;
        const maxSizeBytes = 5 * 1024 * 1024; // 5MB
        if (imageSizeBytes > maxSizeBytes) {
          throw new Error('Processed image is too large. Please select a smaller image.');
        }

        // Ensure base64Image is a string
        if (typeof base64Image !== 'string') {
          throw new Error('Invalid image format. Please try again.');
        }

        console.log('📸 Sending image:', {
          type: typeof base64Image,
          length: base64Image.length,
          preview: base64Image.substring(0, 50) + '...'
        });

        // Add optimistic image message to UI immediately
        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          text: text || '',
          messageType: 'image',
          imageUrl: base64Image,
          sender: {
            id: currentUser?.id || currentUser?._id,
            userName: currentUser?.userName,
            firstName: currentUser?.firstName,
            lastName: currentUser?.lastName,
            profile: currentUser?.profile
          },
          createdAt: new Date().toISOString(),
          seen: false,
          status: 'sending'
        };

        setMessages(prev => [...prev, optimisticMessage]);

        sendMessage({
          text: text.trim() || '', // Send empty string if no text
          messageType: 'image',
          imageUrl: base64Image
        });

        setNewMessage('');
        removeImage();
      }

      // Handle combined text + image
      else if (text && imageFile) {
        setImageUploading(true);

        // Add optimistic text message
        const optimisticTextMessage = {
          id: `temp-text-${Date.now()}`,
          text,
          messageType: 'text',
          sender: {
            id: currentUser?.id || currentUser?._id,
            userName: currentUser?.userName,
            firstName: currentUser?.firstName,
            lastName: currentUser?.lastName,
            profile: currentUser?.profile
          },
          createdAt: new Date().toISOString(),
          seen: false,
          status: 'sending'
        };

        setMessages(prev => [...prev, optimisticTextMessage]);

        // Send text message first
        sendMessage({
          text,
          messageType: 'text'
        });

        // Then send image
        const compressedImage = await compressImage(imageFile, 800, 600, 0.8);
        const base64Image = await fileToBase64(compressedImage);

        // Validate the base64 image
        if (!base64Image || !base64Image.startsWith('data:image/')) {
          throw new Error('Failed to process image. Please try a different image.');
        }

        // Check final image size
        const imageSizeBytes = (base64Image.length * 3) / 4;
        const maxSizeBytes = 5 * 1024 * 1024; // 5MB
        if (imageSizeBytes > maxSizeBytes) {
          throw new Error('Processed image is too large. Please select a smaller image.');
        }

        // Add optimistic image message
        const optimisticImageMessage = {
          id: `temp-image-${Date.now()}`,
          text: '',
          messageType: 'image',
          imageUrl: base64Image,
          sender: {
            id: currentUser?.id || currentUser?._id,
            userName: currentUser?.userName,
            firstName: currentUser?.firstName,
            lastName: currentUser?.lastName,
            profile: currentUser?.profile
          },
          createdAt: new Date().toISOString(),
          seen: false,
          status: 'sending'
        };

        setMessages(prev => [...prev, optimisticImageMessage]);

        sendMessage({
          text: '', // Empty text for image-only message
          messageType: 'image',
          imageUrl: base64Image
        });

        setNewMessage('');
        removeImage();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.message || 'Failed to send message. Please try again.';

      // Show error based on message type
      if (imageFile) {
        setImageError(errorMessage);
      } else {
        setMessageError(errorMessage);
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping(e.target.value.length > 0);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    setImageError(null);

    if (!file) return;

    // Validate the image file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error);
      e.target.value = null;
      return;
    }

    setImageFile(file);
    setImagePreview(createImagePreview(file));
    e.target.value = null;
  };

  const removeImage = () => {
    setImageFile(null);
    setImageError(null);
    if (imagePreview) {
      revokeImagePreview(imagePreview);
      setImagePreview(null);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      const validation = validateImageFile(imageFile);
      if (!validation.valid) {
        setImageError(validation.error);
        return;
      }

      setImageFile(imageFile);
      setImagePreview(createImagePreview(imageFile));
      setImageError(null);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const retryMessage = (message) => {
    // Remove the failed message from the list
    setMessages(prev => prev.filter(msg => msg.id !== message.id));

    // Clear errors
    setImageError(null);
    setMessageError(null);

    // Resend the message
    if (message.messageType === 'image') {
      sendMessage({
        text: message.text || '',
        messageType: 'image',
        imageUrl: message.imageUrl
      });
    } else {
      sendMessage({
        text: message.text,
        messageType: 'text'
      });
    }
  };

  // Handle opening image preview modal
  const handleImageClick = (imageUrl, message) => {
    const senderName = message.sender.userName ||
      `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim() ||
      'Unknown User';

    setPreviewImageUrl(imageUrl);
    setPreviewImageSender(senderName);
    setPreviewImageTimestamp(message.createdAt);
    setShowImagePreview(true);
  };

  // Handle closing image preview modal
  const handleCloseImagePreview = () => {
    setShowImagePreview(false);
    setPreviewImageUrl('');
    setPreviewImageSender('');
    setPreviewImageTimestamp(null);
  };

  const getOtherUser = () => {
    if (!chat || !currentUser) return null;
    // Check if chat has otherUser (from getUserChats) or buyer/seller (from createOrGetChat)
    if (chat.otherUser) {
      return chat.otherUser;
    }
    // Fallback for createOrGetChat response structure
    if (chat.buyer && chat.seller) {
      return chat.buyer.id === currentUser.id ? chat.seller : chat.buyer;
    }
    return null;
  };

  // Check if current user is the buyer
  const isBuyer = () => {
    if (!chat || !currentUser) return false;

    const parts = chat.roomId?.split('_');
    const buyerId = parts?.[2]; // last part is buyer

    return buyerId === currentUser.id || buyerId === currentUser._id;
  };

  // Check if current user is the seller
  const isSeller = () => {
    if (!chat || !currentUser) return false;
    return chat.seller?.id === currentUser.id || chat.seller?._id === currentUser.id ||
      chat.product?.user === currentUser.id || chat.product?.user?._id === currentUser.id;
  };



  // Handle offer updates (accept/decline)
  const handleOfferUpdate = (offerData) => {
    setCurrentOffer(offerData.offer);
    // The status update message will be added via WebSocket
  };

  // Handle buy now for accepted offers
  const handleBuyNow = () => {

    if (currentOffer?.status !== "accepted") {

      const productForCheckout = {

        // Original product data
        id: chat.product?.id,
        title: chat.product?.title,
        product_photos: chat.product?.photos || [], // Map photos to product_photos
        brand: chat.product?.brand, // Default since chat API doesn't include brand
        size: chat.product?.size, // Default since chat API doesn't include size
        condition: chat.product?.condition,
        material: chat.product?.material,
        colors: chat.product?.colors,
        // Use offer amount as the price for checkout
        price: chat.product?.price,
        shipping_cost: chat.product?.shippingCost, // Default shipping cost, can be updated based on your business logic

        // Additional offer-related data
        // isOfferPurchase: true,
        // offerId: currentOffer.id,
        originalPrice: getProductPrice(),
        sellerId: otherUser?.id,
        sellerName: `${otherUser?.firstName} ${otherUser?.lastName}`,
        chatId: chat?.id
      };
      // console.log(productForCheckout, "productForCheckout")
      navigate('/checkout', {
        state: { product: productForCheckout }
      });
    } else {
      // console.log('Buy now clicked for offer:', currentOffer);
      // Prepare product data in the format expected by checkout page
      const productForCheckout = {

        // Original product data
        id: chat.product?.id,
        title: chat.product?.title,
        product_photos: chat.product?.photos || [], // Map photos to product_photos
        brand: chat.product?.brand, // Default since chat API doesn't include brand
        size: chat.product?.size, // Default since chat API doesn't include size
        condition: chat.product?.condition,
        material: chat.product?.material,
        colors: chat.product?.colors,
        // Use offer amount as the price for checkout
        price: currentOffer.offerAmount,
        shipping_cost: chat.product?.shippingCost, // Default shipping cost, can be updated based on your business logic

        // Additional offer-related data
        isOfferPurchase: true,
        offerId: currentOffer.id,
        originalPrice: getProductPrice(),
        sellerId: otherUser?.id,
        sellerName: `${otherUser?.firstName} ${otherUser?.lastName}`,
        chatId: chat?.id
      };

      // console.log(chat.product, "chat.product")

      // console.log('Navigating to checkout with product data:', productForCheckout);

      // Navigate to checkout page with product data
      navigate('/checkout', {
        state: { product: productForCheckout }
      });
    }
  };


  // Handle view product
  const handleViewProduct = () => {
    const productId = chat.product?.id;
    if (productId) {
      navigate(`/product-details/${productId}`);
    }
  };

  // Handle navigate to seller profile
  const handleSellerProfileClick = () => {
    const otherUser = getOtherUser();
    const sellerId = otherUser?.id || otherUser?._id || chat?.product?.user?.id || chat?.product?.user?._id;

    if (sellerId) {
      console.log('Navigating to seller profile:', sellerId);
      navigate(`/profile/${sellerId}`);
    } else {
      console.warn('Seller ID not found for profile navigation');
    }
  };

  // Get the product to display - prioritize matched product details from chats state
  const getDisplayProduct = () => {
    const product = chat?.product;
    console.log('🎯 getDisplayProduct using enhanced chat product data:', {
      chatProduct: chat?.product,
      matchedProductDetails,
      hasPhotos: !!product?.photos,
      hasProductPhotos: !!product?.product_photos,
      hasPrice: !!product?.price,
      photosLength: product?.photos?.length,
      productPhotosLength: product?.product_photos?.length,
      productId: product?.id,
      productTitle: product?.title,
      productPrice: product?.price
    });
    return product;
  };

  // Get product price - prioritize matched details from chats state
  const getProductPrice = () => {
    if (matchedProductDetails?.productPrice !== undefined) {
      console.log('Using price from matched chats:', matchedProductDetails.productPrice);
      return matchedProductDetails.productPrice;
    }
    console.log('Using price from chat product:', chat?.product?.price);
    return chat?.product?.price;
  };

  // Get product image - prioritize matched details from chats state
  const getProductImage = () => {
    if (matchedProductDetails?.productImage) {
      console.log('Using image from matched chats:', matchedProductDetails.productImage);
      return matchedProductDetails.productImage;
    }
    const image = chat?.product?.photos?.[0] || chat?.product?.product_photos?.[0];
    console.log('Using image from chat product:', image);
    return image;
  };

  // Get enhanced product object for MakeOfferModal with matched details
  const getEnhancedProductForModal = () => {
    const baseProduct = getDisplayProduct();
    if (!baseProduct) return null;

    return {
      ...baseProduct,
      // Override price and photos with matched details if available
      price: getProductPrice(),
      photos: matchedProductDetails?.productPhotos || baseProduct.photos || baseProduct.product_photos || [],
      product_photos: matchedProductDetails?.productPhotos || baseProduct.product_photos || baseProduct.photos || []
    };
  };

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">{t("select_conversation")}</h3>
          <p className="text-gray-500">{t("choose_chat")}</p>
        </div>
      </div>
    );
  }

  // Additional safety check for chat without product
  if (chat && !chat.product) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Chat data incomplete</h3>
          <p className="text-gray-500">This chat is missing product information. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const otherUser = getOtherUser();
  console.log(isSeller(), "otheruser111111111");



  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-gray-200 md:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {(otherUser?.profile || chat.product?.seller?.profile) ? (
          <img
            // src={`${normalizedURL}${otherUser?.profile || chat.product?.seller?.profile}`}
            src={otherUser?.profile || chat.product?.seller?.profile}
            alt={otherUser?.userName || chat.product?.seller?.userName}
            className="h-10 w-10 rounded-full object-cover border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleSellerProfileClick}
            title={`View ${otherUser?.userName || chat.product?.seller?.userName}'s profile`}
          />
        ) : (
          <div
            className="bg-pink-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleSellerProfileClick}
            title={`View ${otherUser?.userName || chat.product?.seller?.userName}'s profile`}
          >
            {(otherUser?.userName || chat.product?.seller?.userName)?.[0]?.toUpperCase()}
          </div>
        )}

        <div className="flex-1">
          <h3 className="font-medium">{otherUser?.userName || chat.product?.seller?.userName}</h3>
          {/* <div className="flex items-center gap-2 mt-1">
            {getProductImage() ? (
              <img
                src={`${normalizedURL}/${getProductImage()}`}
                alt={chat?.product?.title}
                className="h-5 w-5 rounded object-cover border border-gray-100"
                onError={(e) => {
                  console.log('❌ Product image failed to load:', e.target.src);
                  e.target.style.display = 'none';
                }}
                onLoad={(e) => {
                  console.log('✅ Product image loaded successfully:', e.target.src);
                }}
              />
            ) : (
              <div className="h-5 w-5 rounded bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-400">📷</span>
              </div>
            )}
            <span className="text-xs text-gray-600">
              {chat?.product?.title || 'Product title'}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-sm font-semibold text-teal-600">
              {getProductPrice() ? `$${Number(getProductPrice()).toFixed(2)}` : 'Price not available'}
            </span>
          </div> */}
        </div>

        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500">
              {connected ? t('online') : 'Connecting...'}
            </div>

            <button
              onClick={() => setUserInformation(prev => !prev)}
              className="w-6 h-6 flex items-center justify-center p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="User information"
            >
              {userInforMation ? (
                <X size={16} className="text-gray-600" />
              ) : (
                <Info size={16} className="text-gray-600" />
              )}
            </button>
          </div>

          {/* <div className="flex items-center space-x-2"> */}
          {/* Make Offer Button in Header - Only for buyers */}
          {/* {isBuyer() && (!currentOffer || currentOffer.status === 'declined') && ( */}
          {/* <button
              onClick={() => setShowMakeOfferModal(true)}
              className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 transition-colors"
            >
              Make Offer
            </button> */}
          {/* )}  */}
          {/* {isBuyer() && (!currentOffer || currentOffer.status === 'accepted') && ( */}
          {/* <button
              onClick={handleBuyNow}
              className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 transition-colors"
            >
              Buy now
            </button> */}
          {/* )}  */}
          {/* View Product Button */}
          {/* <button
              onClick={handleViewProduct}
              className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
            >
              View Product
            </button>

            {/* Debug: Refresh Product Button */}
          {/* {process.env.NODE_ENV === 'development' && (
              <button
                onClick={async () => {
                  console.log('🧪 Testing API with product ID:', chat.product?.id);
                  if (chat.product?.id) {
                    setProductLoading(true);
                    try {
                      // Test the API call directly
                      const testUrl = `http://localhost:5000/api/user/product/${chat.product.id}`;
                      console.log('🌐 Testing URL:', testUrl);

                      const response = await getProductDetails(chat.product.id);
                      console.log('🔄 Manual refresh result:', response);

                      if (response.success) {
                        const productData = response.data.item || response.data.data;
                        console.log('✅ Setting product data:', productData);
                        setProductDetails(productData);
                      } else {
                        console.log('❌ API call failed:', response);
                      }
                    } catch (error) {
                      console.error('💥 Manual refresh error:', error);
                    } finally {
                      setProductLoading(false);
                    }
                  } else {
                    console.log('❌ No product ID available');
                  }
                }}
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              >
                🔄 Test
              </button>
            )} */}
          {/* </div> */}
        </div>
      </div>

      {/* Product Banner */}
      {!userInforMation ?
        <>
          <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
            {/* Left: Image + Product Title + Price */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleViewProduct}>
              {getProductImage() ? (
                <img
                  // src={`${normalizedURL}/${getProductImage()}`}
                  src={getProductImage()}
                  alt={chat?.product?.title}
                  className="h-12 w-12 rounded object-cover border border-gray-100"
                  onError={(e) => {
                    console.log('❌ Product image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                  onLoad={(e) => {
                    console.log('✅ Product image loaded successfully:', e.target.src);
                  }}
                />
              ) : (
                <div className="h-5 w-5 rounded bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-400">📷</span>
                </div>
              )}
              <div className="flex flex-col justify-center">
                <span className="text-xs text-gray-600">
                  {chat?.product?.title || 'Product title'}
                </span>
                <span className="text-sm font-semibold text-teal-600">
                  {getProductPrice() ? `$${Number(getProductPrice()).toFixed(2)}` : 'Price not available'}
                </span>
              </div>
            </div>

            {/* Right: Action Buttons */}
            {!isBuyer() &&
              <div className="flex items-center gap-2">
                {!currentOffer &&
                  <button
                    onClick={() => setShowMakeOfferModal(true)}
                    className={`px-3 py-1 rounded text-sm text-white transition-colors 
    ${chat?.product.status === 'sold' || status
                        ? 'bg-teal-600 opacity-50 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700'}`}
                    disabled={chat?.product.status === 'sold' || status}
                  >
                    {t("makeAnOffer")}
                  </button>
                }
                <button
                  onClick={handleBuyNow}
                  className={`px-3 py-1 rounded text-sm text-white transition-colors 
    ${chat?.product.status === 'sold'|| status
                      ? 'bg-teal-600 opacity-50 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700'}`}
                  disabled={chat?.product.status === 'sold' || status}
                >
                  {t("buyNow")}
                </button>

              </div>
            }

          </div>

          {/* <div className="flex items-center space-x-2"> */}
          {/* Make Offer Button - Only for buyers */}
          {/* {isBuyer() && (!currentOffer || currentOffer.status === 'declined') && (
              <button
                onClick={() => setShowMakeOfferModal(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center space-x-1 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Make Offer</span>
              </button>
            )} */}

          {/* Buy Now Button - Show for buyers when offer is accepted or no offer exists */}
          {/* {isBuyer() && (!currentOffer || currentOffer.status === 'accepted') && (
              <button
                onClick={handleBuyNow}
                className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 transition-colors"
              >
                Buy now
              </button>
            )} */}

          {/* View Product Button */}
          {/* <button
              onClick={handleViewProduct}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
            >
              View Product
            </button> */}
          {/* </div> */}




          {/* </div>
      )} */}

          {/* Messages */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 relative ${dragOver ? 'bg-blue-50' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            {dragOver && (
              <div className="absolute inset-0 bg-blue-100 bg-opacity-75 flex items-center justify-center z-10 border-2 border-dashed border-blue-400 rounded-lg">
                <div className="text-center">
                  <svg className="w-12 h-12 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-blue-600 font-medium">Drop image here to send</p>
                </div>
              </div>
            )}
            {messages
              // Removed filtering of offer-related messages to allow showing all
              .map((message) => {
                // Handle offer-related messages with special component
                if (['offer', 'offer_accepted', 'offer_declined', 'offer_expired'].includes(message.messageType)) {
                  return (
                    <OfferMessage
                      key={message._id || message.id}
                      message={message}
                      currentUserId={currentUser?.id || currentUser?._id}
                      onOfferUpdate={handleOfferUpdate}
                      product={chat?.product}
                    />
                  );
                }

                // Handle regular messages
                return (
                  <div
                    key={message._id || message.id}
                    className={`flex ${message.sender.id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[75%]">
                      {message.sender.id !== currentUser?.id && otherUser?.profile && (
                        <img
                          // src={`${normalizedURL}${otherUser.profile}`}
                          src={otherUser.profile}
                          alt={otherUser.userName}
                          className="h-6 w-6 rounded-full object-cover border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={handleSellerProfileClick}
                          title={`View ${otherUser?.userName}'s profile`}
                        />
                      )}
                      <div
                        className={`${message.messageType === 'image' ? 'p-1' : 'p-3'} rounded-2xl break-words relative ${message.status === 'failed'
                          ? 'bg-red-50 border border-red-200 text-red-800'
                          : message.sender.id === currentUser?.id
                            ? 'bg-teal-600 text-white rounded-br-none'
                            : 'bg-white border rounded-bl-none'
                          }`}
                      >
                        {/* Retry button */}
                        {message.status === 'failed' && message.sender.id === currentUser?.id && (
                          <button
                            onClick={() => retryMessage(message)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-xs transition-colors"
                            title="Retry sending message"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        )}

                        {/* Image message */}
                        {message.messageType === 'image' ? (
                          <div className="relative">
                            {(() => {
                              const imageUrl = message.imageUrl || message.attachments?.[0]?.url;
                              return imageUrl;
                            })() && (
                                <div className="relative group">
                                  <img
                                    src={message.imageUrl || message.attachments[0].url}
                                    alt="Shared image"
                                    className="max-w-xs max-h-64 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() =>
                                      handleImageClick(message.imageUrl || message.attachments[0].url, message)
                                    }
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.parentElement.querySelector('.image-fallback').style.display = 'block';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                    <div className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="image-fallback hidden max-w-xs p-4 bg-gray-100 rounded-lg text-center">
                                    <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-xs text-gray-500">Image not available</p>
                                  </div>
                                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                    {formatTime(message.createdAt)}
                                    {message.status === 'sending' && (
                                      <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                  </div>
                                </div>
                              )}
                            {!message.imageUrl && !message.attachments?.[0]?.url && (
                              <div className="max-w-xs p-4 bg-gray-100 rounded-lg text-center">
                                <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-xs text-gray-500">Image not available</p>
                              </div>
                            )}
                            {message.text && message.text.trim() && (
                              <div className="mt-2 px-2 pb-2">
                                <p className="text-sm">{message.text}</p>
                                <div className={`text-xs flex items-center justify-end gap-1 mt-1 ${message.status === 'failed'
                                  ? 'text-red-400'
                                  : message.sender.id === currentUser?.id ? 'text-teal-100' : 'text-gray-500'
                                  }`}>
                                  {formatTime(message.createdAt)}
                                  {message.status === 'sending' && (
                                    <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin"></div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            {message.text.split('\n').map((line, index) => (
                              <p key={index} className="text-sm">{line}</p>
                            ))}
                            <div className={`text-xs flex items-center justify-end gap-1 mt-1 ${message.status === 'failed'
                              ? 'text-red-400'
                              : message.sender.id === currentUser?.id ? 'text-teal-100' : 'text-gray-500'
                              }`}>
                              {formatTime(message.createdAt)}
                              {message.status === 'sending' && (
                                <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            {otherUserTyping && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-2xl p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t p-4">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-3 p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                    {imageUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {imageUploading ? 'Preparing image...' : 'Image ready to send'}
                    </p>
                    <p className="text-xs text-gray-500">{imageFile?.name}</p>
                    <p className="text-xs text-gray-400">{imageFile && formatFileSize(imageFile.size)}</p>
                  </div>
                  <button
                    onClick={removeImage}
                    disabled={imageUploading}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Message Errors */}
            {(imageError || messageError) && (
              <div className="mb-3 p-3 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-red-600 font-medium">Failed to send message</p>
                    <p className="text-sm text-red-500">{imageError || messageError}</p>
                  </div>
                  <button
                    onClick={() => {
                      setImageError(null);
                      setMessageError(null);
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                title="Attach image"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              <textarea
                rows={1}
                placeholder="Type a message..."
                className="flex-1 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
              />

              <button
                className={`p-2 rounded-full bg-teal-600 text-white transition-colors ${(!newMessage.trim() && !imageFile) || imageUploading || !connected || (!currentChat && !chat?.roomId) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700'
                  }`}
                onClick={handleSendMessage}
                disabled={(!newMessage.trim() && !imageFile) || imageUploading || !connected || (!currentChat && !chat?.roomId)}
                title={
                  !connected ? "Connecting to chat..." :
                    (!currentChat && !chat?.roomId) ? "Chat room not available" :
                      (!newMessage.trim() && !imageFile) ? "Type a message" :
                        imageUploading ? "Uploading image..." :
                          "Send message"
                }
              >
                {imageUploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Debug Component - only in development */}
          {/* {import.meta.env.DEV && (
        <div className="bg-gray-100 p-2 text-xs border-t">
          <div><strong>Debug Info:</strong></div>
          <div>Connected: {connected ? '✅' : '❌'}</div>
          <div>Current Chat: {currentChat ? `${currentChat.chatId} (${currentChat.roomId})` : 'None'}</div>
          <div>Messages Count: {messages.length}</div>
          <div>Socket Error: {socketError || 'None'}</div>
          <div>Message Error: {messageError || 'None'}</div>
          <div>Image Error: {imageError || 'None'}</div>
          <div>Last Message: {messages[messages.length - 1]?.text || 'None'}</div>
          <div>Failed Messages: {messages.filter(m => m.status === 'failed').length}</div>
        </div>
      )} */}
        </> : <>
          <UserInformation
            otherUser={getOtherUser()}
            chat={chat}
            onChatDeleted={() => {
              // Use the provided onChatDeleted callback or fallback
              if (onChatDeleted) {
                onChatDeleted();
              } else if (onBack) {
                onBack();
              } else {
                // Refresh the page or navigate to chat list
                window.location.href = '/chat-layout';
              }
            }}
            onClose={() => setUserInformation(false)} // Optional
          />
        </>
      }
      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={showImagePreview}
        imageUrl={previewImageUrl}
        onClose={handleCloseImagePreview}
        senderName={previewImageSender}
        timestamp={previewImageTimestamp}
      />

      {/* Make Offer Modal */}
      <MakeOfferModal
        isOpen={showMakeOfferModal}
        onClose={() => setShowMakeOfferModal(false)}
        product={getEnhancedProductForModal()}
        chatId={chat?.id}
        onOfferCreated={(offerData) => {
          setCurrentOffer(offerData.offer);
          // The offer message will be added via WebSocket
        }}
      />

      <UserInfoModal
        isOpen={showUserInfoModal}
        onClose={() => setShowUserInfoModal(false)}
        otherUser={getOtherUser()}
        chat={chat}
        onChatDeleted={() => {
          // Use the provided onChatDeleted callback or fallback
          if (onChatDeleted) {
            onChatDeleted();
          } else if (onBack) {
            onBack();
          } else {
            // Refresh the page or navigate to chat list
            window.location.href = '/chat-layout';
          }
        }}
      />
    </div>
  );
};

export default ChatRoomSplit;
