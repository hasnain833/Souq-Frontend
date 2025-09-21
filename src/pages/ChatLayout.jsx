import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import useMobile from "../utils/UseMobile"
import ChatList from "../components/Chat/ChatList"
import ChatRoomSplit from "../components/Chat/ChatRoomSplit"
import { getUserChats, createOrGetChat } from "../api/ChatService"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { toast } from "react-toastify"
import { getAccessToken } from "../utils/TokenStorage"
import ChatSkeleton from "../components/Skeleton/ChatSkeleton"
import { Helmet } from "react-helmet"

// WhatsApp-like Chat Layout Component
function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState(null)
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMobile = useMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = JSON.parse(localStorage.getItem('user'))

  // Check if we're coming from a product page with a specific product to chat about
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const productId = searchParams.get('productId')
    const offerAmount = searchParams.get('offerAmount')

    if (productId) {
      // Check if this is a fresh navigation or a page refresh
      const offerKey = `offer_processed_${productId}_${offerAmount}`
      const offerAlreadyProcessed = sessionStorage.getItem(offerKey)

      // Only process offer if it hasn't been processed before
      const shouldProcessOffer = offerAmount && !offerAlreadyProcessed

      if (shouldProcessOffer) {
        // Mark this offer as being processed
        sessionStorage.setItem(offerKey, 'true')
      }

      // Create or get chat for this product and select it
      handleProductChat(productId, shouldProcessOffer ? offerAmount : null)

      // Clean up URL parameters after handling them to prevent re-execution on refresh
      if (offerAmount) {
        const newUrl = new URL(window.location)
        newUrl.searchParams.delete('offerAmount')
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [location])

  // Fetch all chats
  useEffect(() => {
    fetchChats()
  }, [])

  // Cleanup session storage on unmount
  useEffect(() => {
    return () => {
      // Clean up any offer processing flags when component unmounts
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.startsWith('offer_processed_')) {
          sessionStorage.removeItem(key)
        }
      })
    }
  }, [])
  // console.log('Chats', ch || 0)

  const fetchChats = async () => {
    try {
      console.log('=== FETCHING CHATS ===')
      console.log('User:', currentUser)
      console.log('Token:', !!getAccessToken())

      setLoading(true)
      setError(null)

      const response = await getUserChats(1, 50)
      console.log('Fetch chats response:', response)

      if (response.success) {
        const { chats: fetchedChats } = response.data.data
        setChats(fetchedChats || [])
        console.log('Chats loaded successfully:', fetchedChats?.length || 0)
      } else {
        console.error('Failed to fetch chats:', response)
        setError(response.error || 'Failed to fetch chats')
      }
    } catch (err) {
      console.error('Fetch chats error:', err)
      console.error('Error details:', err.response?.data || err.message)
      setError('Failed to fetch chats')
    } finally {
      setLoading(false)
    }
  }

  const handleProductChat = async (productId, offerAmount = null) => {
    try {
      console.log('=== CHAT CREATION DEBUG ===')
      console.log('Product ID:', productId)
      console.log('Product ID type:', typeof productId)
      console.log('Product ID length:', productId?.length)
      console.log('Current user:', currentUser)
      console.log('Current user ID:', currentUser?.id)
      console.log('Access token exists:', !!getAccessToken())
      console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)

      // Check if user is logged in
      if (!currentUser || !getAccessToken()) {
        toast.error('Please log in to start a chat')
        setError('Please log in to start a chat')
        navigate('/login')
        return
      }

      const response = await createOrGetChat(productId)
      console.log('=== API RESPONSE ===')
      console.log('Full response:', response)
      console.log('Response success:', response.success)
      console.log('Response data:', response.data)
      console.log('Response data type:', typeof response.data)
      console.log('Response data keys:', response.data ? Object.keys(response.data) : 'No data')
      console.log('Response.data.data:', response.data?.data)
      console.log('Response.data.chat:', response.data?.chat)
      console.log('Response error:', response.error)
      console.log('Response status:', response.status)

      if (response.success) {
        // Try different possible paths for chat data

        let chatData = response.data.data?.chat || response.data.chat || response.data
        console.log('Chat data:', chatData)

        // Add safety check
        if (!chatData || typeof chatData !== 'object') {
          console.error('Full response structure:', response)
          console.error('Tried paths: response.data.data.chat, response.data.chat, response.data')
          throw new Error('Chat data is missing from response')
        }

        const isExisting = chatData.isExisting

        // Show appropriate message to user
        if (isExisting) {
          toast.info('Redirecting to existing chat with seller')
        } else {
          toast.success('Starting new chat with seller')
        }

        // Transform the createOrGetChat response to match the getUserChats structure
        const transformedChat = {
          ...chatData,
          // Add otherUser field for consistency
          otherUser: chatData.buyer?.id === currentUser?.id ? chatData.seller : chatData.buyer,
          // Ensure product photos are in the right format
          product: chatData.product ? {
            ...chatData.product,
            photos: chatData.product.product_photos || chatData.product.photos
          } : null
        }

        console.log('Setting transformed chat:', transformedChat)
        console.log('Product data:', transformedChat.product)

        // Only set the chat if it has valid product data
        if (transformedChat.product) {
          console.log('Setting selected chat:', transformedChat)
          setSelectedChat(transformedChat)
        } else {
          console.error('Chat data missing product information:', chatData)
          toast.error('Chat data is incomplete. Please try again.')
          setError('Chat data is incomplete')
        }

        // If there's an offer amount, create the offer after setting up the chat
        // Only create offer for new chats or if explicitly requested
        if (offerAmount && parseFloat(offerAmount) > 0) {
          try {
            const { createOffer } = await import('../api/OfferService')

            // Check if this is a new chat or if we should create an offer
            console.log('Creating offer for chat:', chatData.id, 'Amount:', offerAmount)

            const offerResponse = await createOffer(chatData.id, {
              offerAmount: parseFloat(offerAmount),
              message: `I'd like to offer $${offerAmount} for this item.`
            })

            if (offerResponse.success) {
              toast.success(`Offer of $${offerAmount} sent successfully!`)
              // Clear the session storage flag since offer was successful
              const offerKey = `offer_processed_${chatData.product?.id || 'unknown'}_${offerAmount}`
              sessionStorage.removeItem(offerKey)
            } else {
              console.error('Offer creation failed:', offerResponse)
              // Check if it's because an offer already exists
              if (offerResponse.message && offerResponse.message.includes('already an active offer')) {
                toast.info('You already have an active offer for this item.')
              } else {
                toast.warning('Chat created but offer failed to send. You can try again in the chat.')
              }
            }
          } catch (offerError) {
            console.error('Offer creation error:', offerError)

            // Handle specific error cases
            const errorMessage = offerError.message || offerError.error || ''
            if (errorMessage.includes('already an active offer')) {
              toast.info('You already have an active offer for this item.')
            } else if (errorMessage.includes('not found')) {
              toast.error('Chat not found. Please try again.')
            } else {
              toast.warning('Chat created but offer failed to send. You can try again in the chat.')
            }
          }
        }

        // Refresh chats to include the new/existing chat
        fetchChats()
      } else {
        console.error('Failed to create/get chat:', response)
        const errorMessage = response.message || response.error || 'Please try again.'
        toast.error(`Failed to start chat: ${errorMessage}`)
        setError(`Failed to start chat: ${errorMessage}`)
      }
    } catch (err) {
      console.error('Product chat error:', err)
      console.error('Error details:', err.response?.data || err.message)

      let errorMessage = 'Please try again.'

      if (err.response?.status === 401) {
        errorMessage = 'Please log in to start a chat'
      } else if (err.response?.status === 400) {
        const backendMessage = err.response.data?.message || 'Invalid request'
        if (backendMessage.includes('cannot chat with yourself')) {
          errorMessage = 'You cannot chat with yourself'
        } else {
          errorMessage = backendMessage
        }
      } else if (err.response?.status === 404) {
        errorMessage = 'Product not found'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      toast.error(`Failed to start chat: ${errorMessage}`)
      setError(`Failed to start chat: ${errorMessage}`)
    }
  }

  const handleChatSelect = (chatId) => {
    const chat = chats.find(c => c.id === chatId)
    console.log('Selecting chat:', chat)
    console.log('Chat product:', chat?.product)

    // Only set the chat if it has valid data
    if (chat && chat.product) {
      setSelectedChat(chat)
    } else {
      console.error('Selected chat is missing product data:', chat)
      toast.error('Chat data is incomplete. Please refresh the page.')
      setError('Selected chat is missing product data')
    }
  }

  const handleBackToList = () => {
    setSelectedChat(null)
  }

  // Function to find product details by product ID from chats state
  const getProductDetailsFromChats = (productId) => {
    console.log('🔍 Searching for product ID in chats:', {
      searchProductId: productId,
      totalChats: chats?.length || 0,
      chatsProductIds: chats?.map(chat => chat?.product?.id) || []
    })

    if (!productId || !chats || chats.length === 0) {
      console.log('❌ No product ID or chats available')
      return null
    }

    // Find the chat with matching product ID
    const matchingChat = chats.find(chat => chat?.product?.id === productId)

    if (matchingChat && matchingChat.product) {
      const result = {
        productId: matchingChat.product.id,
        productPrice: matchingChat.product.price,
        productImage: matchingChat.product.photos?.[0] || null,
        productTitle: matchingChat.product.title,
        productPhotos: matchingChat.product.photos || []
      }
      console.log('✅ Found matching product in chats:', result)
      return result
    }

    console.log('❌ No matching product found in chats for ID:', productId)
    return null
  }

  // Test function for debugging
  const testChatCreation = async () => {
    console.log('=== TESTING CHAT CREATION ===')
    console.log('Current user:', currentUser)
    console.log('Access token:', getAccessToken())

    // Test with a sample product ID - replace with actual product ID
    const testProductId = '6756b8b8b8b8b8b8b8b8b8b8' // Replace with actual product ID

    try {
      const response = await createOrGetChat(testProductId)
      console.log('Test response:', response)
    } catch (error) {
      console.error('Test error:', error)
    }
  }

  // Test function for product API
  const testProductAPI = async () => {
    console.log('=== TESTING PRODUCT API ===')
    const testProductId = '68497b9d588aec0773fc41ff' // From your chat data

    try {
      console.log('Testing product API with ID:', testProductId)
      const response = await getProductDetails(testProductId)
      console.log('Product API response:', response)
      console.log('Product API success:', response.success)
      console.log('Product API data:', response.data)
      console.log('Product API item:', response.data?.item)
      console.log('Product API data.data:', response.data?.data)
    } catch (error) {
      console.error('Product API test error:', error)
      console.error('Error response:', error.response?.data)
    }
  }

  // Add this to window for manual testing
  if (typeof window !== 'undefined') {
    window.testChatCreation = testChatCreation
    window.testProductAPI = testProductAPI
  }

  if (loading) {
    return (
      <ChatSkeleton />
    )
  }

  return (
    <div className="flex mx-auto max-w-[1200px] border border-gray-200 mt-5 mb-5 bg-white min-h-[750px] max-h-[800px] overflow-y-auto">
      <Helmet>
        <title>Chat - Souq</title>
        <meta
          name="description"
          content="Welcome to My Website. We provide the best services for your needs."
        />
      </Helmet>
      {/* Debug Info - Remove this after testing */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 left-0 bg-yellow-100 p-2 text-xs z-50 max-w-xs">
          <div>User: {currentUser ? currentUser.userName : 'Not logged in'}</div>
          <div>Token: {getAccessToken() ? 'Present' : 'Missing'}</div>
          <div>API: {import.meta.env.VITE_API_BASE_URL}</div>
          <button
            onClick={() => window.testChatCreation && window.testChatCreation()}
            className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded"
          >
            Test API
          </button>
        </div>
      )} */}

      {/* Chat List Sidebar */}
      {(!isMobile || (isMobile && !selectedChat)) && (
        <div className={`${isMobile ? "w-full" : "w-1/3 ltr:border-r rtl:border-l border-gray-200"} bg-white`}>
          <ChatList
            chats={chats}
            onSelectChat={handleChatSelect}
            selectedChatId={selectedChat?.id}
            loading={loading}
            error={error}
            onRetry={fetchChats}
            onChatDeleted={(deletedChatId) => {
              // Remove the deleted chat from the list
              setChats(prev => prev.filter(chat => chat.id !== deletedChatId));
              // If the deleted chat was selected, clear selection
              if (selectedChat?.id === deletedChatId) {
                setSelectedChat(null);
              }
            }}
          />
        </div>
      )}

      {/* Chat Room */}
      {(!isMobile || (isMobile && selectedChat)) && (
        <div className={`${isMobile ? "w-full" : "w-2/3"} bg-gray-50`}>
          <ChatRoomSplit
            chat={selectedChat}
            onBack={isMobile ? handleBackToList : null}
            getProductDetailsFromChats={getProductDetailsFromChats}
            onChatDeleted={() => {
              // Refresh chat list and clear selected chat
              fetchChats();
              setSelectedChat(null);
              if (isMobile) {
                handleBackToList();
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ChatLayout
