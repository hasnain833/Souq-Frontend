import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getSessionData, logoutSession } from "../api/SessionService";
import LoadingSpinner from "../components/common/LoadingSpinner";

const LoginActivity = () => {
    const { t } = useTranslation();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await getSessionData();
                setSessions(res.data);
            } catch (err) {
                toast.error("Failed to load login sessions.");
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const handleLogoutSession = async (sessionId) => {
        try {
            await logoutSession(sessionId);
            setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
            toast.success("Session logged out successfully.");
        } catch (err) {
            toast.error("Failed to logout this session.");
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md mt-5 mb-5">
            <h2 className="text-lg font-semibold">{t("login_activity")}</h2>
            <p className="text-sm text-gray-600 mb-6">{t("login_session")}</p>

            {[...sessions]
                .sort((a, b) => (b.current ? 1 : 0) - (a.current ? 1 : 0))
                .map((session, index) => (
                    <div
                        key={session.sessionId}
                        className={`flex items-center justify-between py-4 ${index !== sessions.length - 1 ? "border-b" : ""
                            }`}
                    >
                        <div className="text-start">
                            <p className="font-medium text-gray-800">
                                {session.location}{" "}
                                {session.current && (
                                    <span className="text-teal-600 rtl:ml-2 rtl:mr-2">
                                        {t("currentDevice")}
                                    </span>
                                )}
                            </p>
                            <p className="text-sm text-gray-500">
                                {session.lastActive} · {session.device}
                            </p>
                        </div>
                        {!session.current && (
                            <button
                                onClick={() => handleLogoutSession(session.sessionId)}
                                className="text-teal-600 text-sm hover:underline"
                            >
                                {t("logout")}
                            </button>
                        )}
                    </div>
                ))}
                
        </div>
    );
};

export default LoginActivity;
