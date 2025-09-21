import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import LoadingSpinner from "../common/LoadingSpinner"
import { formatDistanceToNowStrict } from 'date-fns'
import { deleteChat } from '../../api/ChatService'
import { toast } from 'react-toastify'
import ConfirmationModal from "../common/ConfirmationModal"
import { useTranslation } from "react-i18next"

function ChatList({
  chats = [],
  onSelectChat,
  selectedChatId,
  loading = false,
  error = null,
  onRetry,
  onChatDeleted
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [chatToDelete, setChatToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const baseURL = import.meta.env.VITE_API_BASE_URL
  // const normalizedURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL

  // Format chat data for display
  const formatChatData = (chat) => {
    if (!chat || !chat.otherUser || !chat.product) {
      console.warn('Invalid chat data:', chat);
      return null;
    }

    // The backend already provides the otherUser directly
    const otherUser = chat.otherUser
    const lastMessage = chat.lastMessage

    // Debug image URL construction
    // const imageUrl = chat.product.photos?.[0] ? `${normalizedURL}/${chat.product.photos[0]}` : null;
    const imageUrl = chat.product.photos?.[0] ? chat.product.photos?.[0] : null;
    console.log('Chat product photos:', chat.product.photos);
    console.log('Constructed image URL:', imageUrl);

    return {
      id: chat.id,
      roomId: chat.roomId,
      productId: chat.product.id,
      user: {
        id: otherUser?.id,
        name: otherUser?.userName || `${otherUser?.firstName} ${otherUser?.lastName}`.trim(),
        // avatar: otherUser?.profile ? `${normalizedURL}${otherUser.profile}` : null,
        avatar: otherUser?.profile ? otherUser?.profile : null,
      },
      product: {
        id: chat.product.id,
        name: chat.product.title,
        price: `$${chat.product.price}`,
        image: imageUrl,
      },
      lastMessage: lastMessage?.messageType === 'image'
        ? '📷 Image'
        : lastMessage?.text || 'No messages yet',
      time: lastMessage?.createdAt ? formatDistanceToNowStrict(new Date(lastMessage.createdAt), { addSuffix: true }) : '',
      unread: chat.unreadCount > 0, // Use the unreadCount from backend
      lastMessageAt: chat.lastMessageAt
    }
  }

  const formattedChats = (chats || []).map(formatChatData).filter(Boolean)
  const authUser = JSON.parse(localStorage.getItem("user"));

  const filteredChats = formattedChats.filter(
    (chat) =>
      chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const location = useLocation();
  const status = location.state?.status;

  const handleChatClick = (chat) => {
    if (status) {
      navigate(location.pathname + location.search, {
        replace: true,
        state: { status: null }
      });
    }

    // For the split layout, just call onSelectChat
    if (onSelectChat) {
      onSelectChat(chat.id)
    }
  }

  const handleProfileClick = (e, chat) => {
    e.stopPropagation() // Prevent chat selection when clicking profile
    const userId = chat.user.id
    if (userId) {
      console.log('Navigating to profile:', userId)
      navigate(`/profile/${userId}`)
    }
  }

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation() // Prevent chat selection when clicking delete

    setChatToDelete(chatId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return

    try {
      setIsDeleting(true)
      await deleteChat(chatToDelete)
      toast.success('Chat deleted successfully')
      if (onChatDeleted) {
        onChatDeleted(chatToDelete)
      }
      setShowDeleteConfirm(false)
      setChatToDelete(null)
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast.error('Failed to delete chat')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t("messages")}</h2>
        </div>
        <div className="relative">
          {/* Search Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute ltr:left-3 rtl:right-3 top-2.5 text-gray-400 h-5 w-5 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Input */}
          <input
            type="text"
            placeholder={t("search_messages")}
            className="w-full ltr:pl-10 rtl:pr-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

      </div>

      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
            <button
              onClick={onRetry || (() => window.location.reload())}
              className="mt-2 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
            >
              Retry
            </button>
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors group relative ${selectedChatId === chat.id ? "bg-gray-100" : ""
                }`}
              onClick={() => handleChatClick(chat)}
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-12 w-12 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => handleProfileClick(e, chat)}
                  title={`View ${chat.user.name}'s profile`}
                >
                  {chat.user.avatar ? (
                    <img
                      src={chat.user.avatar}
                      alt={chat.user.name}
                      className="h-full w-full object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="bg-pink-500 text-white rounded-full h-full w-full flex items-center justify-center font-bold">
                      {chat.user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate">{chat.user.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">{chat.time}</span>
                      {/* Delete button - only visible on hover */}
                      <button
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full transition-all duration-200"
                        title="Delete chat"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className={`text-sm truncate ${chat.unread ? "font-semibold" : "text-gray-600"}`}>
                    {chat.lastMessage}
                  </p>

                  <div className="flex items-center mt-2 gap-2">
                    <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0">
                      {chat.product.image ? (
                        <img
                          src={chat.product.image}
                          alt={chat.product.name}
                          className="h-full w-full object-cover border border-gray-100"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="h-full w-full bg-gray-200 flex items-center justify-center"
                        style={{ display: chat.product.image ? 'none' : 'flex' }}
                      >
                        <span className="text-xs text-gray-500">No Image</span>
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs truncate">{chat.product.name}</span>
                      <span className="text-xs font-medium">{chat.product.price}</span>
                    </div>
                  </div>
                </div>

                {chat.unread && <div className="h-2.5 w-2.5 rounded-full bg-teal-500 flex-shrink-0 mt-2"></div>}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>{t("no_conversations")}</p>
            <p className="text-sm mt-1">{t("choose_chat")}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setChatToDelete(null)
        }}
        onConfirm={confirmDeleteChat}
        title={t("delete-chat")}
        message={t("delete-chat-warning")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        loading={isDeleting}
      />
    </div>
  )
}

export default ChatList
