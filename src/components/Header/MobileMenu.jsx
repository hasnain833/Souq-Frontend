import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import {
  LuBell, LuHeart, LuSettings, LuLogOut, LuWallet, LuPackage, LuSparkles,
} from "react-icons/lu";
import { useAppContext } from '../../context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../api/AuthService';
import { clearTokens } from '../../utils/TokenStorage';
import { useTranslation } from 'react-i18next';
import { persistor } from '../../redux/store';
import { getSuggestions } from '../../api/ProductService';
import { setSearchText } from '../../redux/slices/FilterSlice';
import { setCategory } from '../../redux/slices/CategorySlice';
import { categories as localCategories } from "../../data/categories";

const MobileMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation()
  const { t, i18n } = useTranslation();
  const { setIsAuthModalOpen, setAuthMode, setIsMobileMenuOpen } = useAppContext();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('catalog');
  const [searchValue, setSearchValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [language, setLanguage] = useState('en');
  const token = localStorage.getItem("user");
  const profileImage = useSelector((state) => state.profile.profileImage);
  const categoryData = useSelector((state) => state.categoryData.data);
  const effectiveCategories = (categoryData && categoryData.length > 0) ? categoryData : (localCategories || []).map(c => ({ id: c.id, name: c.name }));

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "en";
    setLanguage(savedLang);
    document.documentElement.lang = savedLang;
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
  }, []);

  const toggleCatalog = () => {
    setIsCatalogOpen(!isCatalogOpen);
  };


  const handleLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleSignup = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleSellNow = () => {
    if (token) {
      navigate("/sell-now");
      setIsMobileMenuOpen(false)
    } else {
      handleLogin();
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();         // optional API call
      clearTokens();          // clear localStorage/sessionStorage if needed
      await persistor.purge(); // ✅ clears persisted redux state
      navigate("/");
      window.location.reload(); // force full reload
    } catch (error) {
      clearTokens();
      await persistor.purge();
      navigate("/");
      window.location.reload();
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (selectedOption !== 'catalog') return;  // ✅ must be 'catalog'

    if (value.trim().length > 0) {
      try {
        const res = await getSuggestions({ q: value, type: 'catalog' });
        const titles = Array.isArray(res?.data) ? res.data.map(item => item.title) : [];
        setFilteredSuggestions(titles.slice(0, 5));
        setShowSuggestions(true);
      } catch (err) {
        console.error('Catalog suggestions error:', err);
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion);
    dispatch(setSearchText(suggestion));
    setShowSuggestions(false);
    navigate("/")
  };

  const clearSearch = () => {
    setSearchValue('');
    setShowSuggestions(false);
    dispatch(setSearchText(''));
  };

  const handleKeyDown = (e) => {
    if (selectedOption === 'member') {
      // ✅ Navigate to MemberSearch page with query
      navigate(`/member-search?q=${encodeURIComponent(searchValue)}&type=member`);
    } else {
      // ✅ For catalog, just dispatch or filter locally
      dispatch(setSearchText(searchValue));
      setShowSuggestions(false);
    }
  };

  const menuOptions = ['catalog', 'member'];


  return (
    <div className="lg:hidden bg-white border-t border-gray-100 absolute left-0 right-0 z-50 shadow-lg">
      <div className="p-4 space-y-5">
        {/* 🔍 Search */}
        <div className="lg:hidden">
          <div className="relative">
            {/* Toggle + Input Container with bg */}
            <div className="bg-gray-100 rounded-full relative w-full">
              {/* Dropdown Button */}
              <button
                onClick={toggleCatalog}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-sm text-gray-700 font-medium z-10"
              >
                {t(selectedOption)}
                <span className="ml-1">
                  {isCatalogOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </button>

              {/* Search Icon */}
              <Search
                className="absolute left-24 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                size={18}
              />

              {/* Search Input */}
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder={
                  selectedOption === 'member'
                    ? t('search_for_member')
                    : t('search_for_item')
                }
                onFocus={() => {
                  if (selectedOption === 'catalog' && searchValue) {
                    setShowSuggestions(true);
                  }
                }}
                className="pl-32 pr-10 py-2 w-full rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-100"
              />

              {/* Clear button */}
              {searchValue && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Catalog Dropdown */}
            {isCatalogOpen && (
              <div className="absolute top-12 left-0 w-60 bg-white border rounded-lg shadow-lg z-50">
                {menuOptions.map((key) => (
                  <div
                    key={key}
                    onClick={() => {
                      setSelectedOption(key);
                      setIsCatalogOpen(false);
                      setShowSuggestions(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {t(key)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggestions */}
          {showSuggestions && selectedOption === 'catalog' && (
            <div className="mt-2 bg-white border rounded-lg shadow-lg z-50">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                  >
                    {suggestion}
                  </div>
                ))
              ) : (
                <div
                  className="px-4 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSuggestionClick(searchValue)}
                >
                  Search for "<span className="font-semibold">{searchValue}</span>"
                </div>
              )}
            </div>
          )}

          {/* Member Submit Button */}
          {selectedOption === 'member' && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleKeyDown}
                className="px-4 py-2 bg-teal-600 text-white rounded-full text-sm hover:bg-teal-700"
              >
                Search
              </button>
            </div>
          )}
        </div>

        {/* 👤 Auth/Profile */}
        {token ? (
          <>
            <div className="flex items-center gap-3" onClick={() => { navigate("/member-profile"); setIsMobileMenuOpen(false) }}>
              <img
                src={profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full border"
              />
              <button className="font-medium">
                {t("my_profile")}
              </button>
            </div>

            <div className="flex justify-around text-gray-600 pt-2">
              {/* <LuMail onClick={() => navigate("/chat-layout")} className="cursor-pointer" /> */}
              <svg className="w-5 h-5 text-gray-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" onClick={() => { navigate("/chat-layout"); setIsMobileMenuOpen(false) }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <LuBell onClick={() => { navigate("/notification"); setIsMobileMenuOpen(false) }} className="cursor-pointer" />
              <LuHeart onClick={() => { navigate("/favorites-item"); setIsMobileMenuOpen(false) }} className="cursor-pointer" />
            </div>

            <ul className="pt-4 text-sm grid grid-cols-2 gap-3 text-gray-700">
              <li className="flex items-center gap-2 cursor-pointer" onClick={() => { navigate("/settings/profile_details"); setIsMobileMenuOpen(false) }}>
                <LuSettings /> {t("settings")}
              </li>
              <li className="flex items-center gap-2 cursor-pointer" onClick={() => { navigate("/personalization"); setProfileOpen(false) }}>
                <LuSparkles /> {t("personalization")}
              </li>
              <li className="flex items-center gap-2 cursor-pointer" onClick={() => { navigate("/wallet"); setIsMobileMenuOpen(false) }}>
                <LuWallet /> {t("wallet")}
              </li>
              <li className="flex items-center gap-2 cursor-pointer"
                onClick={() => { navigate("/orders"); setIsMobileMenuOpen(false) }}
              >
                <LuPackage /> {t("my_orders")}
              </li>
              {/* <li className="flex items-center gap-2 cursor-pointer">
                <LuGift /> {t("donation")}
              </li>
              <li className="flex items-center gap-2 cursor-pointer">
                <LuUsers /> {t("invite_friends")}
              </li> */}
              <li className="flex items-center gap-2 cursor-pointer text-red-500 col-span-2" onClick={handleLogout}>
                <span className="rtl:rotate-180">
                  <LuLogOut />
                </span> {t("logout")}
              </li>
            </ul>
          </>
        ) : (
          <div className="border border-teal-500 flex items-center rounded-full overflow-hidden">
            <button onClick={handleSignup} className="text-teal-500 flex-1 py-2 text-center hover:bg-teal-50">{t("sign_up")}</button>
            <div className="h-6 w-px bg-teal-500" />
            <button onClick={handleLogin} className="text-teal-500 flex-1 py-2 text-center hover:bg-teal-50">{t("log_in")}</button>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleSellNow}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-full font-semibold"
          >
            {t("sell_now")}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleLanguageChange("en")}
              className={`px-3 py-1 rounded-full border text-sm ${language === "en" ? "bg-teal-600 text-white" : "text-gray-600"}`}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageChange("ar")}
              className={`px-3 py-1 rounded-full border text-sm ${language === "ar" ? "bg-teal-600 text-white" : "text-gray-600"}`}
            >
              AR
            </button>
          </div>
        </div>
        {location.pathname === ("/") &&
          <div>
            <h3 className="font-semibold text-gray-800">{t("categories")}</h3>
            <ul className="grid grid-cols-2 gap-3 pt-2">
              {effectiveCategories?.map((category) => (
                <li key={category?.id}>
                  <button
                    onClick={() => { dispatch(setCategory(category)); setIsMobileMenuOpen(false) }}
                    className="text-gray-700 hover:text-teal-600 font-medium text-left"
                  >
                    {category?.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        }

      </div>
    </div>
  );
};

export default MobileMenu;
