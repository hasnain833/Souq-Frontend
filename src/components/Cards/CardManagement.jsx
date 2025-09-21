import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash2, Star, CreditCard, Shield } from 'lucide-react';
import { 
    getUserCards, 
    deleteCard, 
    setDefaultCard, 
    getCardBrandInfo 
} from '../../api/CardService';
import CardModal from '../Products/PaymentCard';

const CardManagement = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [deletingCardId, setDeletingCardId] = useState(null);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        try {
            setLoading(true);
            const response = await getUserCards(true);
            if (response.success) {
                setCards(response.data.cards);
            } else {
                toast.error('Failed to load cards');
            }
        } catch (error) {
            console.error('Load cards error:', error);
            toast.error('Failed to load cards');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!window.confirm('Are you sure you want to delete this card?')) {
            return;
        }

        try {
            setDeletingCardId(cardId);
            const response = await deleteCard(cardId);
            if (response.success) {
                toast.success('Card deleted successfully');
                loadCards(); // Refresh the list
            } else {
                toast.error(response.error || 'Failed to delete card');
            }
        } catch (error) {
            console.error('Delete card error:', error);
            toast.error('Failed to delete card');
        } finally {
            setDeletingCardId(null);
        }
    };

    const handleSetDefault = async (cardId) => {
        try {
            const response = await setDefaultCard(cardId);
            if (response.success) {
                toast.success('Default card updated');
                loadCards(); // Refresh the list
            } else {
                toast.error(response.error || 'Failed to set default card');
            }
        } catch (error) {
            console.error('Set default card error:', error);
            toast.error('Failed to set default card');
        }
    };

    const handleCardSaved = () => {
        loadCards(); // Refresh the list when a new card is saved
        toast.success('Card saved successfully!');
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Methods
                </h2>
                <button
                    onClick={() => setOpenCardModal(true)}
                    className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Card</span>
                </button>
            </div>

            {cards.length === 0 ? (
                <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                    <p className="text-gray-600 mb-4">Add a credit or debit card to get started</p>
                    <button
                        onClick={() => setOpenCardModal(true)}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        Add Your First Card
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {cards.map((card) => (
                        <div
                            key={card._id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <span 
                                            style={{ color: getCardBrandInfo(card.cardBrand).color }}
                                            className="text-2xl"
                                        >
                                            {getCardBrandInfo(card.cardBrand).icon}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-medium text-gray-900">
                                                {getCardBrandInfo(card.cardBrand).name} •••• {card.lastFourDigits}
                                            </h3>
                                            {card.isDefault && (
                                                <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    Default
                                                </span>
                                            )}
                                            {card.isVerified && (
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {card.cardholderName} • Expires {card.expiryMonth}/{card.expiryYear}
                                        </p>
                                        {card.lastUsed && (
                                            <p className="text-xs text-gray-500">
                                                Last used: {new Date(card.lastUsed).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {!card.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(card._id)}
                                            className="text-sm text-teal-600 hover:text-teal-700 px-3 py-1 rounded border border-teal-600 hover:bg-teal-50 transition-colors"
                                        >
                                            Set as Default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteCard(card._id)}
                                        disabled={deletingCardId === card._id}
                                        className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                        title="Delete card"
                                    >
                                        {deletingCardId === card._id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Card Modal */}
            <CardModal
                openCard={openCardModal}
                setOpenCard={setOpenCardModal}
                onCardSaved={handleCardSaved}
            />
        </div>
    );
};

export default CardManagement;
