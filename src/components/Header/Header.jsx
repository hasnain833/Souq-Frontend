import React, { useEffect, useRef, useState } from 'react';
import { Search, Menu, X, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import MegaMenu from './MegaMenu';
import HeaderCategories from './HeaderCategories';
import Logo from '../common/Logo';
import MobileMenu from './MobileMenu';
import {
  LuBell,
  LuHeart,
  LuUser,
  LuSettings,
  LuWallet,
  LuPackage,
  LuGift,
  LuLogOut,
  LuUsers,
  LuSparkles,
  LuMail,
} from "react-icons/lu";
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../api/AuthService';
import { clearTokens } from '../../utils/TokenStorage';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { mockNotifications } from '../../data/notification';
import NotificationDropdown from '../Notification/NotificationDropdown';
import { getAllCategory, getSuggestions } from "../../api/ProductService";
import { fetchCategories } from '../../redux/slices/CategoryDataSlice';
import { setSearchText } from '../../redux/slices/FilterSlice';
import { persistor } from '../../redux/store';

const Header = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    setAuthMode,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setActiveCategory
  } = useAppContext();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const token = localStorage.getItem("user")
  const navigate = useNavigate()
  const profileImage = useSelector((state) => state.profile.profileImage);
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const dropdownRef = useRef(null);
  const { t, i18n } = useTranslation();
  const [selectedOption, setSelectedOption] = useState('catalog');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // const [categoryData, setCategoryData] = useState([])

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  const dispatch = useDispatch();
  const categoryData = useSelector((state) => state.categoryData.data);

  useEffect(() => {
    if (categoryData.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoryData]);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setShowAllNotifications(false);
  };

  const handleToggleShowAll = () => {
    setShowAllNotifications(!showAllNotifications);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "en";
    setLanguage(savedLang);
    document.documentElement.lang = savedLang;
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ref = useRef();
  const profileRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsCatalogOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleCatalog = () => {
    setIsCatalogOpen(!isCatalogOpen);
  };

  const handleLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const isAuthenticated = localStorage.getItem("user");

  const handleSellNow = () => {
    if (isAuthenticated) {
      navigate("/sell-now")
    } else {
      setAuthMode('login');
      setIsAuthModalOpen(true);
    }
  };

  const handleSignup = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout();
      clearTokens();
      await persistor.purge();
      navigate("/");
    } catch (error) {
      clearTokens();
      await persistor.purge();
      navigate("/");
    }
  };

  // useEffect(() => {
  //   const fetchedCategories = async () => {
  //     try {
  //       const res = await getAllCategory();

  //       if (res?.data?.success) {
  //         const transformed = res.data.data.map((cat) => ({
  //           id: cat._id,
  //           name: cat.name,
  //           subCategories: cat.subCategories.map((sub) => ({
  //             id: sub._id,
  //             name: sub.name,
  //             slug: sub.slug, // optional, for icon mapping
  //             childCategories: sub.childCategories.map((child) => ({
  //               id: child._id,
  //               name: child.name,
  //               items: child.items.map((item) => ({
  //                 id: item._id,
  //                 name: item.name,
  //               })),
  //             })),
  //           })),
  //         }));

  //         setCategoryData(transformed);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch categories:", error);
  //     }
  //   };

  //   fetchedCategories();
  // }, []);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (selectedOption !== 'catalog') return;  // ✅ must be 'catalog'

    if (value.trim().length > 0) {
      try {
        const res = await getSuggestions({ q: value, type: 'catalog' });
        const titles = Array.isArray(res?.data) ? res.data.map(item => item.title) : [];
        setFilteredSuggestions(titles.slice(0, 10));
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
    if (e.key === 'Enter' && searchValue.trim().length > 0) {
      if (selectedOption === 'member') {
        // ✅ Navigate to MemberSearch page with query
        navigate(`/member-search?q=${encodeURIComponent(searchValue)}&type=member`);
      } else {
        // ✅ For catalog, just dispatch or filter locally
        dispatch(setSearchText(searchValue));
        setShowSuggestions(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsCatalogOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuOptions = ['catalog', 'member'];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm' : 'bg-white'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <div className="flex items-center">
          <Logo />
          {/* {t('welcome')} */}
        </div>

        {/* Search Bar and Catalog Dropdown */}
        <div className="hidden lg:flex items-center flex-grow mx-8">
          <div ref={ref} className="relative flex items-center bg-gray-100 w-full h-12 rounded-lg">
            <div
              className={`px-4 py-2 cursor-pointer flex items-center whitespace-nowrap overflow-hidden text-ellipsis`}
              onClick={toggleCatalog}
            >
              {t(selectedOption)}
              <span className="ml-2 rtl:mr-2">
                {isCatalogOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>

            {isCatalogOpen && (
              <div className="absolute bg-white border rounded-lg shadow-lg py-2 z-50 min-w-[12rem] max-w-md top-12">
                {menuOptions.map((key) => (
                  <div
                    key={key}
                    onClick={() => {
                      setSelectedOption(key)
                      setIsCatalogOpen(false);
                    }}
                    title={t(key)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer whitespace-nowrap text-ellipsis overflow-hidden"
                  >
                    {t(key)}
                  </div>
                ))}

              </div>
            )}

            {/* Divider */}
            <div className="h-full w-px bg-gray-300 mx-2"></div>

            {/* Search Input and Suggestions */}
            <div className="flex flex-col relative w-full">
              <div className="flex items-center w-full h-12 relative">
                <Search className="text-gray-400 ml-3 mr-2 rtl:ml-2 rtl:rotate-90" size={18} />

                <input
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`${selectedOption === 'member' ? t('search_for_member') : t('search_for_item')}`}
                  className="bg-transparent focus:outline-none w-full h-full rounded-lg p-2 ltr:pr-8 rtl:pl-8"
                  onFocus={() => searchValue && setShowSuggestions(true)}
                />

                {searchValue && (
                  <XCircle
                    size={16}
                    className="absolute ltr:right-3 rtl:left-3 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={clearSearch}
                  />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-12 left-0 w-full bg-white border rounded-lg shadow-lg z-50">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-5 py-3 cursor-pointer hover:bg-gray-100 
                  first:rounded-t-lg last:rounded-b-lg 
                  border-b border-gray-200 last:border-b-0"
                      >
                        {suggestion}
                      </div>
                    ))
                  ) : (
                    <div
                      className="px-5 py-3 cursor-pointer hover:bg-gray-100 rounded-lg"
                      onClick={() => handleSuggestionClick(searchValue)}
                    >
                      Search for "<span className="font-semibold">{searchValue}</span>"
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Auth and Sell Buttons */}
        <div className="hidden lg:flex items-center space-x-4 rtl:space-x-reverse">
          <>
            {token ? (
              <div className="flex items-center gap-4 relative" ref={profileRef}>
                <svg className="w-5 h-5 text-gray-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" onClick={() => navigate("/chat-layout")}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {/* <LuMail className="w-5 h-5 text-gray-600 cursor-pointer" onClick={() => navigate("/chat-layout")} /> */}
                {/* <LuBell className="w-5 h-5 text-gray-600 cursor-pointer" onClick={toggleNotifications} />
                <NotificationDropdown
                  notifications={mockNotifications}
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                  showAll={showAllNotifications}
                  onToggleShowAll={handleToggleShowAll}
                /> */}
                <NotificationDropdown />
                <LuHeart className="w-5 h-5 text-gray-600 cursor-pointer" onClick={() => navigate("/favorites-item")} />

                {/* Profile Picture */}
                <div className="relative">
                  <img
                    src={profileImage ? profileImage : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt="Profile"
                    onClick={() => setProfileOpen(true)}
                    className="w-8 h-8 rounded-full cursor-pointer border border-gray-300 rtl:ml-4"
                  />

                  {/* Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
                      <ul className="text-gray-500">
                        <li className="px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 cursor-pointer" onClick={() => { navigate("/member-profile"); setProfileOpen(false) }}>
                          <LuUser /> {t("profile")}
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer" onClick={() => { navigate("/settings/profile_details"); setProfileOpen(false) }}>
                          <LuSettings /> {t("settings")}
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer" onClick={() => { navigate("/personalization"); setProfileOpen(false) }}>
                          <LuSparkles /> {t("personalization")}
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer" onClick={() => { navigate("/wallet"); setProfileOpen(false) }}>
                          <LuWallet /> {t("wallet")}
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                          onClick={() => { navigate("/orders"); setProfileOpen(false) }}
                        >
                          <LuPackage /> {t("my_orders")}
                        </li>
                        {/* <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                          <LuGift /> {t("donation")}
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                          <LuUsers /> {t("invite_friends")}
                        </li> */}
                        <li
                          onClick={handleLogout}
                          className="px-4 py-2 hover:bg-red-50 text-red-500 flex items-center gap-2 cursor-pointer border-t first:rounded-t-lg last:rounded-b-lg "
                        >
                          <span className="rtl:rotate-180">
                            <LuLogOut />
                          </span> {t("logout")}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-teal-500 flex items-center rounded-lg rtl:ml-4">
                <button
                  onClick={handleSignup}
                  className="text-teal-500 px-4 py-2 hover:bg-teal-50 rounded-l-lg"
                >
                  {t('sign_up')}
                </button>
                <div className="h-6 w-px bg-teal-500" />
                <button
                  onClick={handleLogin}
                  className="text-teal-500 px-4 py-2 hover:bg-teal-50 rounded-r-lg"
                >
                  {t('log_in')}
                </button>
              </div>
            )}
          </>

          <button
            type="button"
            onClick={handleSellNow}
            className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition-colors"
            aria-label={t('sell_now')}
          >
            {t('sell_now')}
          </button>


          <div className="relative inline-block ltr:text-left rtl:text-right" ref={dropdownRef}>
            <button
              aria-haspopup="true"
              aria-expanded={isOpen}
              className="text-gray-600 hover:bg-gray-100 py-2 px-4 rounded-lg flex items-center gap-1"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              {language.toUpperCase()}
              <span className="text-sm">▼</span>
            </button>

            {isOpen && (
              <div
                className="absolute ltr:right-0 rtl:left-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-50 animate-fadeIn"
                role="menu"
              >
                <button
                  onClick={() => {
                    handleLanguageChange("en");
                    setIsOpen(false);
                  }}
                  className={`block w-full px-4 py-2 text-left rtl:text-right hover:bg-gray-100 ${language === "en"
                    ? "font-semibold text-black"
                    : "text-gray-500"
                    }`}
                  role="menuitem"
                >
                  English
                </button>
                <button
                  onClick={() => {
                    handleLanguageChange("ar");
                    setIsOpen(false);
                  }}
                  className={`block w-full px-4 py-2 text-left rtl:text-right hover:bg-gray-100 ${language === "ar"
                    ? "font-semibold text-black"
                    : "text-gray-500"
                    }`}
                  role="menuitem"
                >
                  العربية
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Mobile Menu Toggle - visible on mobile and tablet */}
        <button
          className="lg:hidden flex items-center"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Navigation Categories and Mega Menu - desktop only */}
      {
        location.pathname === ("/") ? <>
          <div className="border-t border-gray-200" />
          <div
            className="relative w-full"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => {
              setIsMegaMenuOpen(false);
              setActiveCategory(null);
            }}
          >

            <div className="container mx-auto hidden lg:flex items-center space-x-4 py-2 px-4 w-full overflow-x-auto">
              <HeaderCategories categoryData={categoryData} />
            </div>

            {isMegaMenuOpen && (
              <div className="absolute top-full left-0 w-full bg-white shadow-lg z-50">
                <MegaMenu categoryData={categoryData} />
              </div>
            )}
          </div>
        </> : <></>
      }

      <div className="border-t border-gray-200" />

      {/* Mobile Menu */}
      {isMobileMenuOpen && <MobileMenu />}
    </header>
  );
};

export default Header;
