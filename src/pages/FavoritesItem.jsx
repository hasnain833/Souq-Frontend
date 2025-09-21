import React, { useEffect, useRef, useState } from 'react';
import { getFevItems } from '../api/ProductService';
import ProductGrid from '../components/Products/ProductGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCardSkeleton from '../components/Skeleton/ProductCardSkeleton';
import { Helmet } from 'react-helmet';

const FavoritesItem = () => {
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiRefresh, setApiRefresh] = useState("")
    const navigate = useNavigate()
    const { t } = useTranslation();
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);
    const isFetchingRef = useRef(false);

    // 🔹 Fetch Favorites
    const fetchFavorites = async (pageNumber = 1, append = false) => {
        const query = { page: pageNumber, limit: 10 };

        if (append) setIsLoadingMore(true);
        else setLoading(true);

        isFetchingRef.current = true;

        try {
            const res = await getFevItems(query);
            const items = res?.data?.data?.favorites || [];
            const newPage = res?.data?.data?.currentPage || 1;
            const total = res?.data?.data?.totalPages || 1;

            setFavoriteProducts(prev => {
                if (!append) return items;

                // ✅ duplicate avoid by id
                const existingIds = new Set(prev.map(p => p.id));
                const filteredNew = items.filter(p => !existingIds.has(p.id));
                return [...prev, ...filteredNew];
            });

            setPage(newPage);
            setTotalPages(total);
        } catch (err) {
            console.error("Error fetching favorites:", err);
        } finally {
            if (append) setIsLoadingMore(false);
            else setLoading(false);

            isFetchingRef.current = false;
        }
    };

    // 🔹 First Load
    useEffect(() => {
        fetchFavorites(1, false);
    }, [apiRefresh]);

    // 🔹 Load More
    const handleLoadMore = () => {
        if (isFetchingRef.current || page >= totalPages) return;
        const nextPage = page + 1;
        fetchFavorites(nextPage, true);
    };

    // 🔹 Infinite Scroll for first 3 pages
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
                !isLoadingMore &&
                !isFetchingRef.current &&
                page < 3 &&
                page < totalPages
            ) {
                handleLoadMore();
            }

            if (page >= 3) {
                setShowLoadMoreButton(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isLoadingMore, page, totalPages]);

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <Helmet>
                <title>Favorites item - Souq</title>
                <meta
                    name="description"
                    content="Welcome to My Website. We provide the best services for your needs."
                />
            </Helmet>
            <h1 className="text-xl sm:text-2xl font-semibold mb-6">{t("favourited_item")}</h1>
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            ) : favoriteProducts.length === 0 ? (
                <div className="min-h-[60vh] flex flex-col justify-center items-center text-center space-y-4">
                    <p className="text-base sm:text-lg font-medium text-gray-500">
                        {t('no_favorite_items')}.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
                    >
                        {t("browse")}
                    </button>
                </div>
            ) : (
                <>
                    <ProductGrid
                        products={favoriteProducts}
                        apiRefresh={apiRefresh}
                        setApiRefresh={setApiRefresh}
                    />
                    
                    {isLoadingMore && (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner />
                        </div>
                    )}

                    {showLoadMoreButton && page < totalPages && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
                            >
                                {isLoadingMore ? "Loading..." : t("load_more")}
                            </button>
                        </div>
                    )}
                </>
            )}

        </div>

    );
};

export default FavoritesItem;
