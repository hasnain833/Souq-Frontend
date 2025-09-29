import React, { useEffect, useState, useRef } from 'react';
// import AuthModal from '../components/Auth/authModal';
import ProductGrid from '../components/Products/ProductGrid';
import { useAppContext } from '../context/AppContext';
import LoginModal from '../components/Auth/LoginModal';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
import SignUpModal from '../components/Auth/SignUpModal';
import Filter from '../components/Navigation/Filter';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAllProduct } from '../api/ProductService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import FilterModal from '../components/Filters/FilterModal';
import { FilterIcon } from 'lucide-react';
import ProductCardSkeleton from '../components/Skeleton/ProductCardSkeleton';
import SouqBanner from "../public/images/souqbanner.jpg"
import SouqBannerMobile from "../public/images/souqbanner-1.jpg"
import { Helmet } from 'react-helmet';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation()
  const { t } = useTranslation();
  const pageRef = useRef(1);
  const isFetching = useRef(false);
  const [limit] = useState(10);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiRefresh, setApiRefresh] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);
  const { setIsAuthModalOpen, setAuthMode } = useAppContext();
  const isAuthenticated = localStorage.getItem("user");
  const filters = useSelector((state) => state.filters);
  const categorySelect = useSelector((state) => state.category);

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate("/sell-now");
    } else {
      setAuthMode('login');
      setIsAuthModalOpen(true);
    }
  };

  const getSelectedCategoryId = (categorySelect) => {
    return (
      categorySelect?.selectedItem?.id || categorySelect?.selectedItem?._id ||
      categorySelect?.selectedChildCategory?.id || categorySelect?.selectedChildCategory?._id ||
      categorySelect?.selectedSubcategory?.id || categorySelect?.selectedSubcategory?._id ||
      categorySelect?.selectedCategory?.id || categorySelect?.selectedCategory?._id ||
      undefined
    );
  };

  const fetchProducts = async ({ page = 1, limit = 10 }) => {
    try {
      const res = await getAllProduct({
        page,
        limit,
        sortBy: filters.sortBy || 'createdAt',
        order: "",
        brand: filters.brand || undefined,
        q: filters.searchText || undefined,
        condition: filters.condition?.value || undefined,
        color: filters.color || undefined,
        material: filters.material || undefined,
        size: filters.size || undefined,
        minPrice: filters.price?.from || undefined,
        maxPrice: filters.price?.to || undefined,
        category: getSelectedCategoryId(categorySelect)
      });

      const items = res?.data?.data?.items || [];
      const next = res?.data?.data?.hasNextPage;
      return { items, hasNextPage: next };
    } catch (err) {
      console.error(`Error fetching page ${page}:`, err);
      return { items: [], hasNextPage: false };
    }
  };

  const loadMoreProducts = async () => {
    if (isFetching.current || !hasNextPage) return;

    isFetching.current = true;
    setIsLoading(true);

    const currentPage = pageRef.current;

    const { items, hasNextPage: next } = await fetchProducts({ page: currentPage, limit });

    setProducts(prev => currentPage === 1 ? items : [...prev, ...items]);
    setHasNextPage(next);

    // Increment page only after fetch is complete
    pageRef.current += 1;

    setIsLoading(false);
    isFetching.current = false;
  };

  const refreshProducts = async () => {
    if (isFetching.current) return; // prevent if already fetching
    isFetching.current = true;
    setIsLoading(true);
    setInitialLoad(true);

    pageRef.current = 1;
    const { items, hasNextPage: next } = await fetchProducts({ page: 1, limit });

    setProducts(items);
    setHasNextPage(next);
    pageRef.current = 2; // Set next page correctly

    setIsLoading(false);
    setInitialLoad(false);
    isFetching.current = false;
  };

  // Run only once on mount
  useEffect(() => {
    refreshProducts();
  }, []);


  useEffect(() => {
    const timeout = setTimeout(() => {
      refreshProducts();
    }, 200);
    return () => clearTimeout(timeout);
  }, [apiRefresh]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      refreshProducts();
    }, 200);
    return () => clearTimeout(timeout);
  }, [filters, categorySelect]);
  

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !isFetching.current &&
        !isLoading &&
        hasNextPage &&
        pageRef.current <= 5
      ) {
        loadMoreProducts();
      }

      if (pageRef.current > 5) {
        setShowLoadMoreButton(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasNextPage]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching.current && !initialLoad) {
      loadMoreProducts();
    }
  }

  return (
    <>
      {/* Banner Section */}
      <Helmet>
        <title>Home - Souq</title>
        <meta
          name="description"
          content="Welcome to My Website. We provide the best services for your needs."
        />
      </Helmet>
      <div className="relative w-full h-[500px] mb-0 md:mb-12">
        <picture>
          <source
            srcSet={SouqBannerMobile}
            media="(max-width: 640px)"
          />
          <img
            src={SouqBanner}
            alt="People with clothes"
            className="absolute inset-0 w-full h-full object-cover"
            width={889}
            height={500}
            loading="eager"
            fetchpriority="high" // lowercase
          />

        </picture>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex items-center h-full container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-sm">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 text-center sm:text-left">
              {t('ready_to_declutter')}
            </h2>
            <button
              className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-colors mb-2 mt-2"
              onClick={handleLogin}
            >
              {t('sell_now')}
            </button>
            <Link to="/how-it-work" className="block text-center text-sm text-teal-600 hover:underline mt-2">
              {t('learn_how_it_works')}
            </Link>
          </div>
        </div>
      </div>

      <Filter />

      {/* Products Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <div className="flex-grow">
            {location.pathname === "/" &&
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{t("newsfeed")}</h2>

                {/* Show only on small screens */}
                <div className="block md:hidden">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-1 p-2 rounded-md hover:bg-gray-100 transition"
                  >
                    <span className="text-teal-600 font-medium">{t("filter")}</span>
                    <FilterIcon className="w-5 h-5 text-teal-600" aria-hidden="true" />
                  </button>

                </div>
              </div>

            }
            {initialLoad && products.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center text-gray-500 py-10">{t("no_products_found")}</div>
            ) : (
              <>
                <ProductGrid
                  products={products}
                  apiRefresh={apiRefresh}
                  setApiRefresh={setApiRefresh}
                />

                {isLoading && (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                )}

                {showLoadMoreButton && hasNextPage && !isLoading && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={handleLoadMore}
                      className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition"
                    >
                      {t("load_more")}
                    </button>
                  </div>
                )}

              </>
            )}
          </div>
        </div>
        <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
        {/* <AuthModal /> */}
        <LoginModal />
        <ForgotPasswordModal />
        <SignUpModal />
      </div>
    </>
  );
};

export default HomePage;
