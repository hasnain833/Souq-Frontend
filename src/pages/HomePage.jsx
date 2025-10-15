import React, { useEffect, useState, useRef } from "react";
import ProductGrid from "../components/Products/ProductGrid";
import { useAppContext } from "../context/AppContext";
import Filter from "../components/Navigation/Filter";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAllProduct } from "../api/ProductService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
// import FilterModal from "../components/Filters/FilterModal";
import { FilterIcon } from "lucide-react";
import ProductCardSkeleton from "../components/Skeleton/ProductCardSkeleton";
import SouqBanner from "../public/images/souqbanner.jpg";
import SouqBannerMobile from "../public/images/souqbanner-1.jpg";
import { Helmet } from "react-helmet";
import { resolveImageUrl } from "../utils/urlResolvers";

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const pageRef = useRef(1);
  const isFetching = useRef(false);
  const [limit] = useState(10); // Reduced initial limit for better UX
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [apiRefresh, setApiRefresh] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState(null);
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
      setAuthMode("login");
      setIsAuthModalOpen(true);
    }
  };

  const getSelectedCategoryId = (categorySelect) => {
    return (
      categorySelect?.selectedItem?.id ||
      categorySelect?.selectedItem?._id ||
      categorySelect?.selectedChildCategory?.id ||
      categorySelect?.selectedChildCategory?._id ||
      categorySelect?.selectedSubcategory?.id ||
      categorySelect?.selectedSubcategory?._id ||
      categorySelect?.selectedCategory?.id ||
      categorySelect?.selectedCategory?._id ||
      undefined
    );
  };

  const fetchProducts = async () => {
    try {
      const res = await getAllProduct({
        sortBy: filters.sortBy || "createdAt",
        order: "desc",
        brand: filters.brand || undefined,
        q: filters.searchText || undefined,
        condition: filters.condition?.value || undefined,
        color: filters.color || undefined,
        material: filters.material || undefined,
        size: filters.size || undefined,
        minPrice: filters.price?.from || undefined,
        maxPrice: filters.price?.to || undefined,
        category: getSelectedCategoryId(categorySelect),
      });

      let items = res?.data?.data?.items || [];
      let next = res?.data?.data?.hasNextPage;

      return { items, hasNextPage: next };
    } catch (err) {
      console.error(`Error fetching page ${page}:`, err);
      return { items: [], hasNextPage: false };
    }
  };

  const normalizePhotos = (photos) => {
    if (!Array.isArray(photos)) return [];
    return photos
      .map((p) => {
        if (!p) return null;
        if (typeof p === "object") return resolveImageUrl(p);
        let safe = String(p).replace(/\\/g, "/");
        const idx = safe.toLowerCase().indexOf("/uploads/products/");
        if (idx >= 0) safe = safe.slice(idx);
        return resolveImageUrl(safe);
      })
      .filter(Boolean);
  };

  const loadMoreProducts = async () => {
    if (isFetching.current || !hasNextPage) return;

    isFetching.current = true;
    const isInitialLoad = products.length === 0;

    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    const currentPage = pageRef.current;

    const { items, hasNextPage: next } = await fetchProducts({
      page: currentPage,
      limit,
    });

    try {
      setProducts((prev) =>
        currentPage === 1
          ? items.map((item) => ({
              ...item,
              normalizedPhotos: normalizePhotos(
                item?.product_photos || item?.photos || [item?.imageUrl]
              ),
            }))
          : [
              ...prev,
              ...items.map((item) => ({
                ...item,
                normalizedPhotos: normalizePhotos(
                  item?.product_photos || item?.photos || [item?.imageUrl]
                ),
              })),
            ]
      );

      setHasNextPage(next);

      // Only increment page if there are more items to load
      if (items.length > 0) {
        pageRef.current += 1;
      }
    } catch (err) {
      console.error("Error loading more products:", err);
      setError("Failed to load more products. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetching.current = false;
    }
  };

  const refreshProducts = async () => {
    if (isFetching.current) return; // prevent if already fetching
    isFetching.current = true;
    setIsLoading(true);
    setInitialLoad(true);

    pageRef.current = 1;
    const { items, hasNextPage: next } = await fetchProducts({
      page: 1,
      limit,
    });

    setProducts(
      items.map((item) => ({
        ...item,
        normalizedPhotos: normalizePhotos(
          item?.product_photos || item?.photos || [item?.imageUrl]
        ),
      }))
    );

    setHasNextPage(!!next);
    // pageRef.current = items.length > 0 ? 2 : 2;

    setIsLoading(false);
    setInitialLoad(false);
    isFetching.current = false;
  };

  // Run only once on mount
  useEffect(() => {
    const loadInitialProducts = async () => {
      await refreshProducts();
      // Set a small timeout to ensure the DOM is fully rendered
      setTimeout(() => {
        setShowLoadMoreButton(true);
      }, 500);
    };

    loadInitialProducts();

    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
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
      if (isFetching.current || !hasNextPage) return;

      // Get the scroll position and container height
      const scrollContainer =
        scrollContainerRef.current || document.documentElement;
      const scrollPosition =
        window.innerHeight + document.documentElement.scrollTop;
      const containerHeight = scrollContainer.offsetHeight;

      // Load more when we're within 300px of the bottom
      if (scrollPosition > containerHeight - 300) {
        loadMoreProducts();
      }
    };

    // Add scroll event listener with passive: true for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore, hasNextPage]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching.current && !initialLoad) {
      loadMoreProducts();
    }
  };

  return (
    <>
      {/* Banner Section */}
      <Helmet>
        <title>Home - Habibi ماركت</title>
        <meta
          name="description"
          content="Welcome to My Website. We provide the best services for your needs."
        />
      </Helmet>
      <div className="relative w-full h-[500px] mb-0 md:mb-12">
        <picture>
          <source srcSet={SouqBannerMobile} media="(max-width: 640px)" />
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
              {t("ready_to_declutter")}
            </h2>
            <button
              className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-colors mb-2 mt-2"
              onClick={handleLogin}>
              {t("sell_now")}
            </button>
            <Link
              to="/how-it-work"
              className="block text-center text-sm text-teal-600 hover:underline mt-2">
              {t("learn_how_it_works")}
            </Link>
          </div>
        </div>
      </div>

      <Filter />

      {/* Products Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <div className="flex-grow">
            {location.pathname === "/" && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {t("newsfeed")}
                </h2>

                {/* Show only on small screens */}
                <div className="block md:hidden">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-1 p-2 rounded-md hover:bg-gray-100 transition">
                    <span className="text-teal-600 font-medium">
                      {t("filter")}
                    </span>
                    <FilterIcon
                      className="w-5 h-5 text-teal-600"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            )}
            {initialLoad && products.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <>
                {products.length > 0 ? (
                  <ProductGrid products={products} />
                ) : !isLoading && !error ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No products found</p>
                  </div>
                ) : null}
              </>
            )}

            {/* Loading indicator at the bottom */}
            {isLoadingMore && (
              <div className="flex justify-center my-8">
                <LoadingSpinner />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="text-center my-4 text-red-500">
                {error}
                <button
                  onClick={loadMoreProducts}
                  className="ml-2 text-blue-600 hover:underline">
                  Retry
                </button>
              </div>
            )}

            {/* Load more button (optional) */}
            {showLoadMoreButton &&
              hasNextPage &&
              !isLoadingMore &&
              !isLoading && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                    Load More
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
