import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

const RatingTestButton = () => {
  const navigate = useNavigate();

  const handleTestRating = () => {
    // Navigate to rating page with test transaction ID
    const testTransactionId = 'TXN_1751282374805_6SIKF7';
    const testType = 'escrow';
    
    navigate(`/rating?transaction=${testTransactionId}&type=${testType}`);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* <button
        onClick={handleTestRating}
        className="bg-yellow-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
        title="Test Rating Page"
      >
        <Star className="w-5 h-5" />
        <span>Test Rating</span>
      </button> */}
    </div>
  );
};

export default RatingTestButton;
