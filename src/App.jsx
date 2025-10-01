import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage";
import { AppProvider } from "./context/AppContext";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import ScrollToTop from "./components/ScrollToTop";
import ChangePassword from "./pages/ChangePassword";
import EmailVerification from "./pages/EmailVerfication";
import NotReceiveMail from "./pages/NotReceiveMail";
import SendPhoneOTP from "./pages/SendPhoneOtp";
import PhoneVeriy from "./pages/PhoneVerify";
import MemberProfile from "./pages/MemberProfile";
import ProtectedRoute from "./route/ProtectedRoute";
import AuthCallback from "./pages/AuthPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-loading-skeleton/dist/skeleton.css";
import SellNowPage from "./pages/SellNow";
import LoginActivity from "./pages/LoginActivity";
import EmailChange from "./pages/EmailChange";
import FavoritesItem from "./pages/FavoritesItem";
import FollowingPage from "./pages/Following";
import Followers from "./pages/Followers";
import CheckOut from "./pages/Checkout";
import EscrowCheckout from "./pages/EscrowCheckout";
import EscrowTransaction from "./pages/EscrowTransaction";
import StandardTransactionView from "./pages/StandardTransactionView";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentSecurityWarning from "./components/Security/PaymentSecurityWarning";
import PaymentCancelled from "./pages/PaymentCancelled";
import StripePayment from "./pages/StripePayment";
import StripePaymentDebug from "./pages/StripePaymentDebug";
import DisabledStripePayment from "./components/Payment/DisabledStripePayment";
import PayPalCardPayment from "./pages/PayPalCardPayment";
import PaymentMethods from "./pages/PaymentMethods";
import ChatLayout from "./pages/ChatLayout";
import ChatRoom from "./components/Chat/ChatRoom";
import ChatTest from "./components/Chat/ChatTest";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import RatingTest from "./components/Rating/RatingTest";
import RatingPage from "./pages/RatingPage";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";
import NotFoundTest from "./components/Test/NotFoundTest";
import { isPaymentGatewayEnabled } from "./config/paymentConfig";
import { NetworkErrorProvider } from "./context/NetworkErrorContext";
import NotificationsPage from "./pages/Notification";
import SettingsPage from "./pages/Settings";
import MemberSearchList from "./pages/MemberSearchList";
import NewEmailChange from "./pages/NewEmailChange";
import Personalization from "./pages/Personalization";
import About from "./pages/About";
import Help from "./pages/Help";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Careers from "./pages/Careers";
import Press from "./pages/Press";
import Sustainability from "./pages/Sustainability";
import SafetyCenter from "./pages/SafetyCenter";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import ContactUs from "./pages/ContactUs";
import HowItWorks from "./pages/HowItWorks";
// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
// Auth modals mounted globally so Header buttons work everywhere
import AuthModal from "./components/Auth/AuthModal.jsx";
import LoginModal from "./components/Auth/LoginModal";
import ForgotPasswordModal from "./components/Auth/ForgotPasswordModal";
import SignUpModal from "./components/Auth/SignUpModal";

function App() {
  const location = useLocation();
  const isRTL = localStorage.getItem("lang") === "ar";
  const StripeComponent = isPaymentGatewayEnabled("stripe")
    ? StripePayment
    : DisabledStripePayment;
  return (
    <AppProvider>
      <NetworkErrorProvider>  
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <ToastContainer
            position={isRTL ? "top-left" : "top-right"}
            rtl={isRTL}
          />
          {/* Global auth modals */}
          <AuthModal />
          <LoginModal />
          <ForgotPasswordModal />
          <SignUpModal />
          <main className="flex-grow bg-white">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth-callback" element={<AuthCallback />} />
              <Route path="/product-details/:id" element={<ProductDetails />} />
              <Route path="/profile/:id/:tab?" element={<Profile />} />
              <Route path="/email-verify" element={<EmailVerification />} />
              <Route path="/email-not-receive" element={<NotReceiveMail />} />
              <Route path="/email-change-new" element={<NewEmailChange />} />
              <Route path="/send-phone-otp" element={<SendPhoneOTP />} />
              <Route path="/phone-verify" element={<PhoneVeriy />} />
              <Route path="/reset-password" element={<ChangePassword />} />
              <Route path="/following/:id" element={<FollowingPage />} />
              <Route path="/followers/:id" element={<Followers />} />
              <Route path="/member-search" element={<MemberSearchList />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Help />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/press" element={<Press />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/safety-center" element={<SafetyCenter />} />
              <Route
                path="/community-guidelines"
                element={<CommunityGuidelines />}
              />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/how-it-work" element={<HowItWorks />} />
              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              {/* <Route path="/chat-layout" element={<ChatLayout />} /> */}
              <Route
                path="/member-profile/:tab?"
                element={
                  <ProtectedRoute>
                    <MemberProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/:tab?"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sell-now"
                element={
                  <ProtectedRoute>
                    <SellNowPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites-item"
                element={
                  <ProtectedRoute>
                    <FavoritesItem />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckOut />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/personalization"
                element={
                  <ProtectedRoute>
                    <Personalization />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/continue-checkout"
                element={
                  <ProtectedRoute>
                    <EscrowCheckout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/escrow/transaction/:transactionId"
                element={
                  <ProtectedRoute>
                    <EscrowTransaction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/standard/transaction/:transactionId"
                element={
                  <ProtectedRoute>
                    <StandardTransactionView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/escrow/payment-success"
                element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-success"
                element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-security-warning"
                element={
                  <ProtectedRoute>
                    <PaymentSecurityWarning />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/escrow/stripe-payment"
                element={
                  <ProtectedRoute>
                    <StripeComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stripe-payment"
                element={
                  <ProtectedRoute>
                    <StripeComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/paypal-card-payment"
                element={
                  <ProtectedRoute>
                    <PayPalCardPayment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stripe-payment-debug"
                element={
                  <ProtectedRoute>
                    <StripePaymentDebug />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/escrow/payment-cancelled"
                element={
                  <ProtectedRoute>
                    <PaymentCancelled />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-cancelled"
                element={
                  <ProtectedRoute>
                    <PaymentCancelled />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-methods"
                element={
                  <ProtectedRoute>
                    <PaymentMethods />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/chat-layout"
                element={
                  <ProtectedRoute>
                    <ChatLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat-test"
                element={
                  <ProtectedRoute>
                    <ChatTest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:productId"
                element={
                  <ProtectedRoute>
                    <ChatRoom />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:productId/:roomId"
                element={
                  <ProtectedRoute>
                    <ChatRoom />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login-activity"
                element={
                  <ProtectedRoute>
                    <LoginActivity />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/email-change"
                element={
                  <ProtectedRoute>
                    <EmailChange />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notification"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/rating-test"
                element={
                  <ProtectedRoute>
                    <RatingTest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rating"
                element={
                  <ProtectedRoute>
                    <RatingPage />
                  </ProtectedRoute>
                }
              />
              <Route
              // path="/location-test"
              // element={<LocationTest />}
              />

              <Route path="/test-404" element={<NotFoundTest />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {!location.pathname.includes("chat") &&
            !location.pathname.includes("checkout") &&
            !location.pathname.includes("payment") &&
            !location.pathname.includes("stripe") && <Footer />}
        </div>
      </NetworkErrorProvider>
    </AppProvider>
  );
}

export default App;
