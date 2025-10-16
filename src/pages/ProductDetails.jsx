import React, { useEffect, useRef, useState } from "react";
import {
  resolveImageUrl as resolveImageUrlUtil,
  resolveProfileUrl as resolveProfileUrlUtil,
} from "../utils/urlResolvers";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  bumpProduct,
  deleteProduct,
  getAllCategory,
  getProductDetails,
  getUserProduct,
  hideProduct,
  markProductAsReserved,
  markProductAsSold,
  reactivateProduct,
} from "../api/ProductService";
import { Star, X } from "lucide-react";
import ProductGrid from "../components/Products/ProductGrid";
import LoginModal from "../components/Auth/LoginModal";
import ForgotPasswordModal from "../components/Auth/ForgotPasswordModal";
import SignUpModal from "../components/Auth/SignUpModal";
import { useAppContext } from "../context/AppContext";
import DeleteConfirmationModal from "../components/Products/DeleteConfirmation";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PriceBreakdownModal from "../components/Products/PriceBreakDownModal";
import MakeOfferModal from "../components/Products/MakeOffer";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import ProductDetailsSkeleton from "../components/Skeleton/ProductDetailsSkeleton";
import StatusConfirmationModal from "../components/Products/StatusConfirmationModal";
import {
  setCategory,
  setSubcategory,
  setChildCategory,
  setItem,
} from "../redux/slices/CategorySlice";
import { Helmet } from "react-helmet";

const ProductDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [priceShowModal, setPriceShowModal] = useState(false);
  const [makeOfferModal, setMakeOfferModal] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [apiRefresh, setApiRefresh] = useState(0);
  const authUser = JSON.parse(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHidden, setIsHidden] = useState(product?.hide);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    action: "",
    isLoading: false,
  });
  const [categoryPath, setCategoryPath] = useState("");
  const categoryData = useSelector((state) => state.categoryData.data);
  const [page, setPage] = useState(1);
  const [limit] = useState(9); // fixed page size
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");
  const [filters, setFilters] = useState({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { setIsAuthModalOpen, setAuthMode } = useAppContext();

  // Prime with product from navigation state (e.g., from Home/Product list)
  useEffect(() => {
    const stateProduct = location?.state?.product;
    if (stateProduct && String(stateProduct.id) === String(id)) {
      setProduct(stateProduct);
      setIsHidden(stateProduct?.hide);
    }
  }, [location?.state?.product, id]);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getProductDetails(id)
      .then((res) => {
        // apiService wraps responses as { success, data, error }
        if (res?.success) {
          const item = res?.data?.data?.item;
          if (item) {
            setProduct(item);
            setIsHidden(item?.hide);
          }
        } else {
          console.error("Error fetching product:", res?.error);
          // Do not clear existing product if request fails
        }
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, apiRefresh]);

  const [mainCategoryId, setMainCategoryId] = useState(null);

  useEffect(() => {
    const findPathRecursive = (nodes, targetId, path = []) => {
      for (const node of nodes) {
        const newPath = [...path, node.name];

        if (node.id === targetId) return newPath;

        for (const key of ["subCategories", "childCategories", "items"]) {
          if (Array.isArray(node[key]) && node[key].length > 0) {
            const found = findPathRecursive(node[key], targetId, newPath);
            if (found) return found;
          }
        }
      }
      return null;
    };

    const fetchData = () => {
      if (!Array.isArray(categoryData)) return;

      const mainCategory = categoryData.find((cat) =>
        findPathRecursive([cat], product?.category)
      );

      if (!mainCategory) {
        setCategoryPath("Category not found");
        return;
      }

      // Store for click handler
      setMainCategoryId(mainCategory.id);

      const pathArray = findPathRecursive([mainCategory], product?.category);
      if (pathArray) {
        setCategoryPath(pathArray.join(" > "));
      } else {
        setCategoryPath("Category not found");
      }
    };

    if (product?.category) {
      fetchData();
    }
  }, [product?.category, categoryData]);

  const handleCategoryClick = (name, level, mainCategoryId) => {
    if (!Array.isArray(categoryData)) return;

    const mainCategory = categoryData.find((cat) => cat.id === mainCategoryId);
    if (!mainCategory) return;

    if (level === "main" && mainCategory.name === name) {
      dispatch(setCategory({ id: mainCategory.id, name: mainCategory.name }));
      navigate("/");
      return;
    }

    const subCats = mainCategory?.subCategories || [];
    for (const sub of subCats) {
      if (level === "sub" && sub.name === name) {
        dispatch(setSubcategory({ id: sub.id, name: sub.name }));
        navigate("/");
        return;
      }

      const childCats = sub?.childCategories || [];
      for (const child of childCats) {
        if (level === "child" && child.name === name) {
          dispatch(setChildCategory({ id: child.id, name: child.name }));
          navigate("/");
          return;
        }

        const items = child?.items || [];
        for (const item of items) {
          if (level === "item" && item.name === name) {
            dispatch(setItem({ id: item.id, name: item.name }));
            navigate("/");
            return;
          }
        }
      }
    }
  };

  const loadedPages = useRef(new Set());
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);

  const fetchUserProducts = async (currentPage = 1) => {
    if (!product?.user?.id) return;

    // ✅ Prevent duplicate fetch
    if (loadedPages.current.has(currentPage)) return;
    loadedPages.current.add(currentPage);

    setIsLoadingMore(true);

    const query = {
      page: currentPage,
      limit,
      sortBy,
      ...filters,
    };

    try {
      const res = await getUserProduct(product.user.id, query);
      if (!res?.success) {
        console.error("Failed to fetch user products:", res?.error);
        return;
      }

      const items = res?.data?.data?.items || [];

      setProducts((prev) => {
        if (currentPage === 1) {
          return items;
        }
        // ✅ Deduplicate by ID
        const existingIds = new Set(prev.map((p) => p.id));
        const newItems = items.filter((item) => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });

      setUser(res?.data?.data?.user);
      setTotalPages(res?.data?.data?.totalPages || 0);
    } catch (err) {
      console.error("Failed to fetch user products:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setProducts([]);
    setPage(1);
    loadedPages.current.clear(); // ✅ Reset loaded pages
    fetchUserProducts(1);
  }, [product?.user?.id, sortBy, filters, apiRefresh]);

  // ✅ Throttle scroll handler
  useEffect(() => {
    let timeout;
    const handleScroll = () => {
      if (timeout) return;
      timeout = setTimeout(() => {
        if (
          window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 300 &&
          !isLoadingMore &&
          page < totalPages
        ) {
          handleLoadMore();
        }

        if (page >= 3) {
          setShowLoadMoreButton(true);
        }
        timeout = null;
      }, 250); // 250ms throttle
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore, page, totalPages]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUserProducts(nextPage);
  };

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const userNavigate = () => {
    const loggedInUserId = authUser?.id || authUser?._id;
    const sellerId = product?.user?.id || product?.user?._id;
    const isOwner = !!(
      loggedInUserId &&
      sellerId &&
      String(loggedInUserId) === String(sellerId)
    );
    if (isOwner) {
      navigate("/member-profile");
    } else {
      navigate(`/profile/${product?.user?.id}`);
    }
  };

  const userBuyNow = () => {
    if (authUser) {
      console.log("ProductDetails - userBuyNow - product:", product);
      console.log("ProductDetails - userBuyNow - product._id:", product?._id);
      console.log("ProductDetails - userBuyNow - product.id:", product?.id);
      navigate("/continue-checkout", {
        state: {
          product: product,
        },
      });
    } else {
      setAuthMode("login");
      setIsAuthModalOpen(true);
    }
  };

  if (isLoading && !product) return <ProductDetailsSkeleton />;
  if (!product)
    return (
      <div className="text-center py-20 text-gray-600">Product not found</div>
    );

  // Build photos array from API (product_photos) or local mock (imageUrl)
  const resolveImageUrl = (url) => resolveImageUrlUtil(url);
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

  // Normalize user profile photo URL (backend may return local filesystem path)
  const resolveProfileUrl = (val) => resolveProfileUrlUtil(val);

  const rawPhotos = (() => {
    const candidates = [
      // Prefer new streamed URLs (images)
      product?.images,
      // Fallbacks
      product?.product_photos,
      product?.photos,
      product?.imageUrls,
    ];
    for (const list of candidates) {
      if (Array.isArray(list) && list.length > 0) {
        const normalized = normalizePhotos(list);
        if (normalized.length > 0) return normalized;
      }
    }
    if (product?.imageUrl) return [resolveImageUrl(product.imageUrl)];
    return [];
  })();

  const photosSrc = rawPhotos.length > 0 ? rawPhotos : ["/default-product.png"];
  const maxVisibleImages = 3;
  // const visibleImages = photosSrc.slice(0, maxVisibleImages);
  // const hiddenImageCount = photosSrc.length - maxVisibleImages;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProduct(product?.id);
      toast.success("Product deleted successfully!");
      navigate("/member-profile");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowModal(false);
    }
  };

  const productHideUnhide = () => {
    const payload = {
      hide: !isHidden,
    };
    hideProduct(product?.id, payload).then((res) => {
      console.log(res?.data?.message, "res");
      toast.success(res?.data?.message);
      setIsHidden(!isHidden);
    });
  };

  const handleBumpProduct = async (e) => {
    e.stopPropagation(); // Prevent card click navigation

    try {
      const response = await bumpProduct(product?.id);
      const data = response?.data;
      const success = data?.success ?? data?.status === "success";

      if (success) {
        toast.success(
          data?.message || data?.data?.message || "Product bumped successfully!"
        );
        setApiRefresh((prev) => prev + 1);
      } else {
        // Show error if success is false
        toast.error(
          data?.error ||
            data?.message ||
            "Failed to bump product. Please try again."
        );
      }
    } catch (error) {
      console.error("Bump failed:", error);
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const handleMarkAsSold = () => {
    setStatusModal({ isOpen: true, action: "sold", isLoading: false });
  };

  const handleMarkAsReserved = () => {
    setStatusModal({ isOpen: true, action: "reserved", isLoading: false });
  };

  const handleReactivateProduct = () => {
    setStatusModal({ isOpen: true, action: "reactivate", isLoading: false });
  };

  const confirmStatusChange = async () => {
    setStatusModal((prev) => ({ ...prev, isLoading: true }));

    try {
      let response;
      const { action } = statusModal;

      if (action === "sold") {
        response = await markProductAsSold(product?.id);
        setProduct((prev) => ({ ...prev, status: "sold" }));
      } else if (action === "reserved") {
        response = await markProductAsReserved(product?.id);
        setProduct((prev) => ({ ...prev, status: "reserved" }));
      } else if (action === "reactivate") {
        response = await reactivateProduct(product?.id);
        setProduct((prev) => ({ ...prev, status: "active" }));
      }

      toast.success(
        response?.data?.message || "Product status updated successfully!"
      );
      setApiRefresh((prev) => prev + 1);
      setStatusModal({ isOpen: false, action: "", isLoading: false });
    } catch (error) {
      console.error("Status change failed:", error);
      toast.error(
        error?.response?.data?.error ||
          "Failed to update product status. Please try again."
      );
      setStatusModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const makeOfferOpen = () => {
    if (authUser) {
      // Check if user is trying to make offer on their own product
      const loggedInUserId = authUser?.id || authUser?._id;
      const sellerId = product?.user?.id || product?.user?._id;
      const isOwner = !!(
        loggedInUserId &&
        sellerId &&
        String(loggedInUserId) === String(sellerId)
      );
      if (isOwner) {
        toast.error("You cannot make an offer on your own product");
        return;
      }
      setMakeOfferModal(true);
    } else {
      setAuthMode("login");
      setIsAuthModalOpen(true);
    }
  };

  const messageToSeller = () => {
    if (authUser) {
      // Check if user is trying to message themselves
      const loggedInUserId = authUser?.id || authUser?._id;
      const sellerId = product?.user?.id || product?.user?._id;
      const isOwner = !!(
        loggedInUserId &&
        sellerId &&
        String(loggedInUserId) === String(sellerId)
      );
      if (isOwner) {
        toast.error("You cannot message yourself");
        return;
      }
      // Navigate to chat layout with the product ID as a query parameter
      navigate(`/chat-layout?productId=${product.id}`);
    } else {
      setAuthMode("login");
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="bg-white min-h-screen p-4 max-w-[1200px] mx-auto">
      <Helmet>
        <title>Product details - Habibi ماركت</title>
        <meta
          name="description"
          content="Welcome to Habibi ماركت. We provide the best services for your needs."
        />
      </Helmet>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image Gallery + Product Grid */}
        <div className="md:col-span-2 flex flex-col md:overflow-y-auto md:h-full hide-scrollbar">
          {/* Main Image */}
          {photosSrc.length > 0 && (
            <img
              src={photosSrc[currentImageIndex]}
              alt={product.title || "Product"}
              className="w-full h-[400px] object-cover rounded border"
            />
          )}

          {/* Thumbnails */}
          {photosSrc.length > 0 && (
            <div className="mt-2 flex gap-2">
              {photosSrc.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  onClick={() => setCurrentImageIndex(idx)} // ✅ switch image
                  className={`w-20 h-20 object-cover rounded border cursor-pointer ${
                    idx === currentImageIndex ? "ring-2 ring-teal-600" : ""
                  }`}
                />
              ))}
            </div>
          )}

          {/* Breadcrumbs */}
          <div className="mt-4 text-sm text-gray-500">
            <span
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/")}>
              Home
            </span>
            {categoryPath &&
              categoryPath.split(" > ").map((part, i) => {
                const level = ["main", "sub", "child", "item"][i];
                return (
                  <span key={i}>
                    {" / "}
                    <span
                      className="hover:underline cursor-pointer"
                      onClick={() =>
                        handleCategoryClick(part, level, mainCategoryId)
                      }>
                      {part}
                    </span>
                  </span>
                );
              })}
          </div>

          {/* Product Grid (desktop only) */}
          <div className="mt-6 hidden md:block">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t("membersItems")} ({products?.length})
            </h2>
            <ProductGrid
              products={products}
              user={user}
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
                  className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                  disabled={isLoadingMore}>
                  {isLoadingMore ? "Loading..." : t("load_more")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="order-2 md:order-2 md:col-span-1 w-full md:h-full md:overflow-y-auto">
          <div className="border rounded-md shadow-sm sticky h-fit">
            {isHidden && (
              <div className="w-full bg-gray-800 bg-opacity-75 text-white p-0 text-center text-sm font-semibold py-2 rounded-t-md mb-2">
                {t("hidden")}
              </div>
            )}
            {product.status !== "active" && (
              <div
                className={`w-full text-white p-0 text-center text-sm font-semibold py-2 rounded-t-md mb-2
  ${
    product.status === "sold"
      ? "bg-teal-600"
      : product.status === "reserved"
      ? "bg-yellow-500 text-black"
      : product.status === "rejected"
      ? "bg-red-600"
      : "bg-gray-800 bg-opacity-75"
  }`}>
                {product.status === "sold"
                  ? t("sold")
                  : product.status === "reserved"
                  ? t("reserved")
                  : product.status === "rejected"
                  ? t("rejected")
                  : "Mark as Available"}
              </div>
            )}
            <div className="p-4">
              <h1 className="text-lg font-semibold leading-5 mb-1">
                {product.title}
              </h1>
              <p className="text-sm text-gray-500 mb-2 capitalize">
                {product.size} • {product.condition} •{" "}
                <span className="text-teal-600 font-medium underline">
                  {product.brand}
                </span>
              </p>

              <p className="text-sm text-gray-600">
                ${Number(product.price).toFixed(2)}
              </p>
              <p
                className="text-l font-bold text-teal-600 mb-1 hover:underline cursor-pointer"
                onClick={() => setPriceShowModal(true)}>
                ${Number((Number(product.price) * 1.05).toFixed(2))}
              </p>
              <p
                className="text-sm text-teal-600 mb-4 hover:underline cursor-pointer"
                onClick={() => setPriceShowModal(true)}>
                {t("includesBuyerProtection")}
              </p>

              <div className="text-sm text-gray-600 mb-4 space-y-1">
                <div className="flex justify-between">
                  <span>{t("brand")}</span>{" "}
                  <strong className="text-teal-600">{product.brand}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{t("size")}</span> <span>{product.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("condition")}</span> <span>{product.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("color")}</span> <span>{product.colors}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("uploaded")}</span>
                </div>
              </div>

              <div className="mb-3 text-sm">
                <p
                  className={`overflow-hidden text-gray-700 ${
                    showFullDescription ? "" : "line-clamp-2"
                  }`}>
                  {product.description}
                </p>
                {product.description?.length > 100 && (
                  <button
                    className="text-teal-600 font-semibold mt-1 flex justify-end hover:underline"
                    onClick={() =>
                      setShowFullDescription(!showFullDescription)
                    }>
                    {showFullDescription ? t("showLess") : t("more")}
                  </button>
                )}
              </div>

              {/* Shipping */}
              <div className="mb-3 text-sm flex justify-between">
                <span>{t("shipping")}:</span>
                <span className="text-gray-600">
                  ${Number(product.shipping_cost).toFixed(2)}
                </span>
              </div>

              {/* Actions */}

              {(() => {
                const loggedInUserId = authUser?.id || authUser?._id;
                const sellerId = product?.user?.id || product?.user?._id;
                const isOwner = !!(
                  loggedInUserId &&
                  sellerId &&
                  String(loggedInUserId) === String(sellerId)
                );
                return isOwner;
              })() ? (
                <>
                  <button
                    className={`w-full py-2 rounded-md mb-2 font-medium ${
                      product?.status !== "active"
                        ? "bg-teal-600 hover:bg-teal-700 opacity-50 text-white cursor-not-allowed"
                        : "bg-teal-600 hover:bg-teal-700 text-white"
                    }`}
                    disabled={product?.status !== "active"}
                    onClick={handleBumpProduct}>
                    {t("bump")}
                  </button>
                  {product.status !== "rejected" &&
                    (!product?.status || product.status === "active" ? (
                      <>
                        <button
                          className="text-teal-700 rounded-md font-semibold border border-teal-600 w-full py-2 mb-2"
                          onClick={handleMarkAsSold}>
                          {t("markAsSold")}
                        </button>
                        <button
                          className="text-teal-700 rounded-md font-semibold border border-teal-600 w-full py-2 mb-2"
                          onClick={handleMarkAsReserved}>
                          {t("markAsReserved")}
                        </button>
                      </>
                    ) : (
                      <button
                        className="text-green-700 rounded-md font-semibold border border-green-600 w-full py-2 mb-2 hover:bg-green-50"
                        onClick={handleReactivateProduct}>
                        {product.status === "sold"
                          ? t("mark-as-unsold")
                          : product.status === "reserved"
                          ? t("mark-as-unreserved")
                          : "Mark as Available"}
                      </button>
                    ))}
                  {product.status !== "rejected" && (
                    <button
                      className="text-teal-700 rounded-md font-semibold border border-teal-600 w-full py-2 mb-2"
                      onClick={productHideUnhide}>
                      {isHidden ? t("unhide") : t("hide")}
                    </button>
                  )}
                  <button
                    className="text-teal-700 rounded-md font-semibold border border-teal-600 w-full py-2 mb-2"
                    onClick={() =>
                      navigate("/sell-now", {
                        state: {
                          product: product,
                        },
                      })
                    }>
                    {t("editListing")}
                  </button>
                  <button
                    className="text-red-700 border border-red-600 w-full py-2 rounded-md font-medium"
                    onClick={() => setShowModal(true)}>
                    {t("delete")}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`bg-teal-600 hover:bg-teal-700 text-white w-full py-2 rounded-md mb-2 font-medium transition
    ${
      product.status === "sold"
        ? "opacity-50 cursor-not-allowed hover:bg-teal-600"
        : ""
    }`}
                    onClick={userBuyNow}
                    disabled={product.status === "sold"}>
                    {t("buyNow")}
                  </button>

                  <button
                    className={`text-teal-700 rounded-md font-semibold border border-teal-600 w-full py-2 mb-2 transition
    ${product.status === "sold" ? "opacity-50 cursor-not-allowed" : ""}`}
                    // onClick={makeOfferOpen}
                    disabled={product.status === "sold"}>
                    {t("makeAnOffer")}
                  </button>

                  <button
                    className={`text-teal-700 rounded-md font-semibold border border-teal-600 w-full py-2 mb-2 transition
    ${product.status === "sold" ? "opacity-50 cursor-not-allowed" : ""}`}
                    // onClick={messageToSeller}
                    disabled={product.status === "sold"}>
                    {t("messageSeller")}
                  </button>
                </>
              )}

              {/* Buyer Protection */}
              {authUser?.id !== product?.user?.id && (
                <div className="mt-6">
                  <div className="border rounded-md p-4 shadow-sm text-xs text-gray-500">
                    <strong className="text-teal-600">
                      {t("buyerProtectionFee")}
                    </strong>
                    <br />
                    {t("buyerProtectionInfo")}
                  </div>
                </div>
              )}

              {/* Seller Info */}
              <div className="mt-4">
                <div
                  className="border rounded-md p-4 shadow-sm cursor-pointer"
                  onClick={userNavigate}>
                  {/* Top section: profile image and user info */}
                  <div className="flex items-start gap-3 border-b pb-3">
                    {/* Profile photo */}
                    {product?.user?.profile_photo ? (
                      <img
                        src={resolveProfileUrl(product.user.profile_photo)}
                        alt={product.user.userName}
                        className="h-10 w-10 rounded-full object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="bg-pink-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                        {product?.user?.userName?.[0]?.toUpperCase()}
                      </div>
                    )}

                    {/* Username and ratings */}
                    <div>
                      <p className="font-semibold">{product?.user?.userName}</p>
                      {product?.sellerRatings?.totalRatings > 0 ? (
                        <div className="flex items-center gap-1 text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i <
                                Math.floor(product.sellerRatings.averageRating)
                                  ? "fill-yellow-500"
                                  : "fill-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600">
                            {product.sellerRatings.totalRatings}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {t("no-reviews-yet")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid (mobile only) */}
      <div className="mt-8 block md:hidden">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t("membersItems")} ({products?.length})
        </h2>
        <ProductGrid
          products={products}
          user={user}
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
              className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
              disabled={isLoadingMore}>
              {isLoadingMore ? "Loading..." : t("load_more")}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <LoginModal />
      <ForgotPasswordModal />
      <SignUpModal />
      <DeleteConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
      <PriceBreakdownModal
        isOpen={priceShowModal}
        onClose={() => setPriceShowModal(false)}
        itemPrice={product.price}
        protectionFee={Number((product.price * 0.05).toFixed(2))}
      />
      <MakeOfferModal
        product={product}
        onClose={() => setMakeOfferModal(false)}
        isOpen={makeOfferModal}
      />
      <StatusConfirmationModal
        isOpen={statusModal.isOpen}
        onClose={() =>
          setStatusModal({ isOpen: false, action: "", isLoading: false })
        }
        onConfirm={confirmStatusChange}
        action={statusModal.action}
        productTitle={product?.title}
        currentStatus={product?.status}
        isLoading={statusModal.isLoading}
      />

      {/* Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
          <div className="relative bg-white rounded-xl shadow-lg p-4 max-w-3xl w-full flex flex-col items-center">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={closeModal}>
              <X size={24} />
            </button>
            {currentImageIndex > 0 && (
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black text-3xl z-10"
                onClick={() => setCurrentImageIndex((prev) => prev - 1)}>
                ‹
              </button>
            )}
            <img
              src={photosSrc[currentImageIndex]}
              alt="Modal View"
              className="w-full max-h-[70vh] object-contain rounded"
            />
            {currentImageIndex < photosSrc.length - 1 && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black text-3xl z-10"
                onClick={() => setCurrentImageIndex((prev) => prev + 1)}>
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
