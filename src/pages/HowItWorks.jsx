import React from "react";
import { useTranslation } from "react-i18next";
import sell1 from "../public/images/how-to-sell-step1.png"
import sell2 from "../public/images/how-to-sell-step2.png"
import sell3 from "../public/images/how-to-sell-step3.png"
import shopping1 from "../public/images/shopping-step1.png"
import shopping2 from "../public/images/shopping-step2.png"
import shopping3 from "../public/images/shopping-step3.png"
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
// import AuthModal from "../components/Auth/AuthModal";
import LoginModal from "../components/Auth/LoginModal";
import ForgotPasswordModal from "../components/Auth/ForgotPasswordModal";
import SignUpModal from "../components/Auth/SignUpModal";

export default function HowItWorks() {
    const navigate = useNavigate()
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";
    const isAuthenticated = localStorage.getItem("user");
    const { setIsAuthModalOpen, setAuthMode } = useAppContext();

    const handleLogin = () => {
        if (isAuthenticated) {
            navigate("/sell-now");
        } else {
            setAuthMode('login');
            setIsAuthModalOpen(true);
        }
    };

    const sellingSteps = [
        { key: "step1", img: sell1 },
        { key: "step2", img: sell2 },
        { key: "step3", img: sell3 }
    ];

    const buyingSteps = [
        { key: "step1", img: shopping1 },
        { key: "step2", img: shopping2 },
        { key: "step3", img: shopping3 }
    ];

    return (
        <div className="w-full bg-white text-gray-800" dir={isRTL ? "rtl" : "ltr"}>
            <div className="bg-gray-50">

          
            {/* Hero Section */}
            <section className="bg-teal-100 py-16 px-6 text-center">
                <h1 className="text-3xl md:text-4xl font-bold leading-snug">
                    {t("howitworks.hero.title")}{" "}
                    <span className="text-teal-600">{t("howitworks.hero.highlight")}</span>
                </h1>
                <p className="mt-4 text-lg max-w-2xl mx-auto">
                    {t("howitworks.hero.subtitle")}
                </p>
            </section>

            <section className="py-16 px-6 max-w-6xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                    {t("howitworks.selling.title")}
                </h2>
                <div className="grid md:grid-cols-3 gap-10 text-center">
                    {sellingSteps.map((step, idx) => (
                        <div className="space-y-4" key={idx}>
                            <img
                                src={step.img}
                                alt={t(`howitworks.selling.${step.key}.title`)}
                                className="w-full rounded-xl shadow"
                            />
                            <h3 className="text-lg font-semibold">
                                {t(`howitworks.selling.${step.key}.title`)}
                            </h3>
                            <p className="text-gray-600">
                                {t(`howitworks.selling.${step.key}.desc`)}
                            </p>
                            <button className="text-teal-600 font-medium underline" onClick={() => navigate("/help")}>
                                {t("common.learnMore")}
                            </button>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-10">
                    <button className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition" onClick={handleLogin}>
                        {t("howitworks.selling.cta")}
                    </button>
                </div>
            </section>

            {/* Buying Section */}
            <section className="py-16 px-6 max-w-6xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                    {t("howitworks.buying.title")}
                </h2>
                <div className="grid md:grid-cols-3 gap-10 text-center">
                    {buyingSteps.map((step, idx) => (
                        <div className="space-y-4" key={idx}>
                            <img
                                src={step.img}
                                alt={t(`howitworks.buying.${step.key}.title`)}
                                className="w-full rounded-xl shadow"
                            />
                            <h3 className="text-lg font-semibold">
                                {t(`howitworks.buying.${step.key}.title`)}
                            </h3>
                            <p className="text-gray-600">
                                {t(`howitworks.buying.${step.key}.desc`)}
                            </p>
                            <button className="text-teal-600 font-medium underline" onClick={() => navigate("/help")}>
                                {t("common.learnMore")}
                            </button>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-10">
                    <button className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition" onClick={() => navigate("/")}>
                        {t("howitworks.buying.cta")}
                    </button>
                </div>
            </section>

            {/* Safety Section */}
            <section className="py-16 px-6 max-w-6xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                    {t("howitworks.safety.title")}
                </h2>
                <div className="grid md:grid-cols-2 gap-10 text-center">
                    {["item1", "item2"].map((item, idx) => (
                        <div className="space-y-4" key={idx}>
                            <h3 className="text-lg font-semibold">
                                {t(`howitworks.safety.${item}.title`)}
                            </h3>
                            <p className="text-gray-600">
                                {t(`howitworks.safety.${item}.desc`)}
                            </p>
                            <button className="text-teal-600 font-medium underline" onClick={() => navigate("/help")}>
                                {t("common.learnMore")}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
  </div>
            {/* CTA Section */}
            <section className="bg-teal-600 text-white py-20 px-6 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                    {t("howitworks.cta.title")}
                </h2>
                <div className="flex justify-center gap-4 flex-wrap">
                    <button className="px-6 py-3 bg-white text-teal-600 rounded-lg shadow hover:bg-gray-100 transition" onClick={() => navigate("/")}>
                        {t("howitworks.cta.shop")}
                    </button>
                    <button className="px-6 py-3 bg-white text-teal-600 rounded-lg shadow hover:bg-gray-100 transition" onClick={handleLogin}>
                        {t("howitworks.cta.sell")}
                    </button>
                </div>
            </section>

            {/* <AuthModal /> */}
            <LoginModal />
            <ForgotPasswordModal />
            <SignUpModal />
        </div>
    );
}
