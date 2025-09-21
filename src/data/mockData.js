// Mock data for chat conversations
const mockChats = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      avatar: "https://via.placeholder.com/40",
    },
    product: {
      name: "Vintage Denim Jacket",
      price: "$45.00",
      image: "https://via.placeholder.com/60",
    },
    lastMessage: "Is this still available?",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    user: {
      name: "Michael Chen",
      avatar: "https://via.placeholder.com/40",
    },
    product: {
      name: "Nike Running Shoes",
      price: "$65.00",
      image: "https://via.placeholder.com/60",
    },
    lastMessage: "Would you accept $55?",
    time: "5 hours ago",
    unread: false,
  },
  {
    id: "3",
    user: {
      name: "Emma Wilson",
      avatar: "https://via.placeholder.com/40",
    },
    product: {
      name: "Leather Crossbody Bag",
      price: "$38.00",
      image: "https://via.placeholder.com/60",
    },
    lastMessage: "Thanks! I'll let you know when I ship it.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "4",
    user: {
      name: "David Rodriguez",
      avatar: "https://via.placeholder.com/40",
    },
    product: {
      name: "Graphic T-shirt",
      price: "$18.00",
      image: "https://via.placeholder.com/60",
    },
    lastMessage: "Perfect, thank you!",
    time: "2 days ago",
    unread: false,
  },
]

// Mock data for chat details
const mockChatDetails = {
  1: {
    user: {
      id: "u1",
      name: "Sarah Johnson",
      avatar: "https://via.placeholder.com/40",
    },
    product: {
      id: "p1",
      name: "Vintage Denim Jacket",
      price: "$45.00",
      image: "https://via.placeholder.com/80",
    },
    messages: [
      {
        id: "m1",
        senderId: "u1",
        text: "Hi there! I'm interested in your vintage denim jacket.",
        timestamp: "2023-06-15T14:30:00Z",
      },
      {
        id: "m2",
        senderId: "me",
        text: "Hello! Thanks for your interest. It's still available.",
        timestamp: "2023-06-15T14:35:00Z",
      },
      {
        id: "m3",
        senderId: "u1",
        text: "Great! Is the size true to fit? I usually wear a medium.",
        timestamp: "2023-06-15T14:40:00Z",
      },
      {
        id: "m4",
        senderId: "me",
        text: "Yes, it fits like a standard medium. It's in excellent condition too, barely worn.",
        timestamp: "2023-06-15T14:45:00Z",
      },
      {
        id: "m5",
        senderId: "u1",
        text: "Perfect! Is the price negotiable at all?",
        timestamp: "2023-06-15T15:00:00Z",
      },
      {
        id: "m6",
        senderId: "me",
        text: "I could do $40 if you're interested.",
        timestamp: "2023-06-15T15:10:00Z",
      },
      {
        id: "m7",
        senderId: "u1",
        text: "That sounds fair. Is this still available?",
        timestamp: "2023-06-15T16:30:00Z",
      },
    ],
  },
  2: {
    user: {
      id: "u2",
      name: "Michael Chen",
      avatar: "https://via.placeholder.com/40",
    },
    product: {
      id: "p2",
      name: "Nike Running Shoes",
      price: "$65.00",
      image: "https://via.placeholder.com/80",
    },
    messages: [
      {
        id: "m1",
        senderId: "u2",
        text: "Hi, are these shoes still available?",
        timestamp: "2023-06-15T10:30:00Z",
      },
      {
        id: "m2",
        senderId: "me",
        text: "Yes, they are!",
        timestamp: "2023-06-15T10:45:00Z",
      },
      {
        id: "m3",
        senderId: "u2",
        text: "Would you accept $55?",
        timestamp: "2023-06-15T11:00:00Z",
      },
    ],
  },
  3: {
    user: {
      id: "u3",
      name: "Emma Wilson",
      avatar: "https://via.placeholder.com/40",
    },
    product: {
      id: "p3",
      name: "Leather Crossbody Bag",
      price: "$38.00",
      image: "https://via.placeholder.com/80",
    },
    messages: [
      {
        id: "m1",
        senderId: "u3",
        text: "I'd like to buy this bag!",
        timestamp: "2023-06-14T09:30:00Z",
      },
      {
        id: "m2",
        senderId: "me",
        text: "Great! I can ship it tomorrow.",
        timestamp: "2023-06-14T09:45:00Z",
      },
      {
        id: "m3",
        senderId: "u3",
        text: "Perfect, I've just made the payment.",
        timestamp: "2023-06-14T10:15:00Z",
      },
      {
        id: "m4",
        senderId: "me",
        text: "Thanks! I'll let you know when I ship it.",
        timestamp: "2023-06-14T10:30:00Z",
      },
    ],
  },
  4: {
    user: {
      id: "u4",
      name: "David Rodriguez",
      avatar: "https://via.placeholder.com/40",
    },
    product: {
      id: "p4",
      name: "Graphic T-shirt",
      price: "$18.00",
      image: "https://via.placeholder.com/80",
    },
    messages: [
      {
        id: "m1",
        senderId: "u4",
        text: "Is this t-shirt still available?",
        timestamp: "2023-06-13T14:30:00Z",
      },
      {
        id: "m2",
        senderId: "me",
        text: "Yes it is!",
        timestamp: "2023-06-13T15:00:00Z",
      },
      {
        id: "m3",
        senderId: "u4",
        text: "Great, I'll take it. Just purchased.",
        timestamp: "2023-06-13T15:30:00Z",
      },
      {
        id: "m4",
        senderId: "me",
        text: "Perfect, thank you!",
        timestamp: "2023-06-13T15:45:00Z",
      },
    ],
  },
}
