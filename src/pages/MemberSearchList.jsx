import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSuggestions } from '../api/ProductService';
import { MemberListSkeleton } from '../components/Skeleton/MemberListSkeleton';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// import AuthModal from '../components/Auth/AuthModal';
import LoginModal from '../components/Auth/LoginModal';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
import SignUpModal from '../components/Auth/SignUpModal';

const MemberSearchList = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const normalizedURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const q = searchParams.get('q');
    const type = searchParams.get('type');
    const authUser = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchMembers = async () => {
            if (!q || type !== 'member') return;

            try {
                const res = await getSuggestions({ q, type: 'member' });
                setMembers(res?.data || []);
            } catch (err) {
                console.error('Failed to fetch members:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [q, type]);

    return (
        <div className="container mx-auto p-4">
            <Helmet>
                <title>Member list - Souq</title>
                <meta
                    name="description"
                    content="Welcome to My Website. We provide the best services for your needs."
                />
            </Helmet>
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2" />
                {t("back")}
            </button>

            <h2 className="text-xl font-semibold mb-4">
                Member Search Results for "<span className="text-teal-600">{q}</span>"
            </h2>

            {loading ? (
                <MemberListSkeleton />
            ) : members.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="bg-white shadow-sm rounded-lg p-3 border hover:shadow-md transition"
                        >
                            <div className="flex items-center gap-4">
                                <img
                                    // src={member.profile ? `${normalizedURL}${member.profile}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                    src={member.profile ? member.profile : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                    onClick={() => navigate(authUser?.id === member.id ? "/member-profile" : `/profile/${member?.id}`)}
                                    alt={member.fullName}
                                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                />
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {member.fullName}
                                    </p>
                                    <p className="text-sm text-gray-500">@{member.userName}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No members found.</p>
            )}
            <AuthModal />
            <LoginModal />
            <ForgotPasswordModal />
            <SignUpModal />
        </div>
    );
};

export default MemberSearchList;
