import React, { useEffect, useState } from "react";
import ImageUploader from "../components/Sell/ImageUploader";
import ItemDetails from "../components/Sell/ItemDetails";
import CategorySelector from "../components/Sell/CategorySelector";
import CategoryAttributes from "../components/Sell/CategoryAttributes";
import PriceSection from "../components/Sell/PriceSection";
import PackageSize from "../components/Sell/PackageSize";
import ActionButtons from "../components/Sell/ActionButtons";
import { ArrowLeft } from "lucide-react";
import { addProduct, updateProduct, getAllCategory } from "../api/ProductService";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

const SellNowPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const product = location?.state?.product || null;
  const isEditMode = !!product;
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    product_photos: [],
    title: "",
    description: "",
    category: "",
    brand: "",
    size: "",
    condition: "",
    color: "",
    material: "",
    price: "",
    customShippingCost: "",
    packageSize: "medium",
  });

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        product_photos: product.product_photos || [],
        title: product.title || "",
        description: product.description || "",
        category: product.category || "",
        brand: product.brand || "",
        size: product.size || "",
        condition: product.condition || "",
        color: product.colors || "",
        material: product.material || "",
        price: product.price?.toString() || "",
        customShippingCost:
          product.package_size === "custom"
            ? product.shipping_cost?.toString() || ""
            : "",
        packageSize: product.package_size || "medium",
      });
    }
  }, [isEditMode, product]);

  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);

      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      if (formData.brand) payload.append("brand", formData.brand);
      if (formData.size) payload.append("size", formData.size);
      const validConditions = ["new", "like new", "used", "very used"];
      if (validConditions.includes((formData.condition || '').toLowerCase())) {
        payload.append("condition", formData.condition.toLowerCase());
      }
      if (formData.color) payload.append("colors", formData.color);
      if (formData.material) payload.append("material", formData.material);
      payload.append("price", String(formData.price || "0"));
      payload.append("package_size", formData.packageSize);
      if (formData.category) payload.append("category", formData.category);

      const price = parseFloat(formData.price) || 0;
      let shippingCost = 0;
      if (formData.packageSize === "small") {
        shippingCost = (price * 0.02).toFixed(2);
      } else if (formData.packageSize === "medium") {
        shippingCost = (price * 0.05).toFixed(2);
      } else if (formData.packageSize === "large") {
        shippingCost = (price * 0.07).toFixed(2);
      } else if (formData.packageSize === "custom") {
        shippingCost = formData.customShippingCost;
      }
      payload.append("shipping_cost", shippingCost);

      formData.product_photos.forEach((file) => {
        payload.append("product_photos", file);
      });

      let result;
      if (isEditMode) {
        result = await updateProduct(product.id, payload);
      } else {
        result = await addProduct(payload);
      }

      if (result?.success) {
        toast.success(
          result.message ||
            (isEditMode
              ? "Product updated successfully!"
              : "Product added successfully!")
        );
        navigate("/member-profile");
      } else {
        toast.error(result?.error || result?.message || "Failed to save product.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("brand", formData.brand || "N/A");
      payload.append("size", formData.size || "N/A");
      payload.append("condition", formData.condition || "N/A");
      payload.append("colors", formData.color || "N/A");
      payload.append("material", formData.material || "N/A");
      payload.append("price", String(formData.price || "0"));
      payload.append("package_size", formData.packageSize);
      if (formData.category) payload.append("category", formData.category);
      payload.append("status", "draft");
      const price = parseFloat(formData.price) || 0;
      let shippingCost = 0;
      if (formData.packageSize === "small") {
        shippingCost = (price * 0.02).toFixed(2);
      } else if (formData.packageSize === "medium") {
        shippingCost = (price * 0.05).toFixed(2);
      } else if (formData.packageSize === "large") {
        shippingCost = (price * 0.07).toFixed(2);
      } else if (formData.packageSize === "custom") {
        shippingCost = formData.customShippingCost;
      }

      payload.append("shipping_cost", shippingCost);

      formData.product_photos.forEach((file) => {
        payload.append("product_photos", file);
      });

      let result;
      if (isEditMode) {
        result = await updateProduct(product.id, payload);
      } else {
        result = await addProduct(payload);
      }

      if (result?.success) {
        toast.success(
          result.message ||
            (isEditMode
              ? "Draft updated successfully!"
              : "Draft added successfully!")
        );
        navigate("/member-profile");
      } else {
        toast.error(result?.error || result?.message || "Failed to save Draft.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
    }
  };

  return (
    <div className="bg-gray-100">
      <Helmet>
        <title>Sell now - Habibi ماركت</title>
        <meta
          name="description"
          content="Welcome to Habibi ماركت. We provide the best services for your needs."
        />
      </Helmet>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="flex items-center mb-6">
          <button
            className="rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Go back">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-semibold">
            {" "}
            {isEditMode ? t("editItem") : t("sellAnItem")}
          </h1>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">{t("photos")}</h2>
            <p className="text-gray-500 mb-4">{t("addPhotosHint")}</p>
            <ImageUploader
              images={formData.product_photos}
              onChange={(images) => updateFormData("product_photos", images)}
            />
          </section>

          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">{t("itemDetails")}</h2>
            <ItemDetails
              title={formData.title}
              description={formData.description}
              onTitleChange={(title) => updateFormData("title", title)}
              onDescriptionChange={(desc) =>
                updateFormData("description", desc)
              }
            />
          </section>

          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">{t("category")}</h2>

            <CategorySelector
              category={formData.category}
              onChange={(itemId) => updateFormData("category", itemId)}
              onSubcategoryChange={(selection) => {
                // `selection` will contain all levels: category, subcategory, childCategory, item
                // You can extract or use whatever you need
                if (selection?.childCategory) {
                  setSelectedSubcategory(selection.childCategory);
                } else if (selection?.subcategory) {
                  setSelectedSubcategory(selection.subcategory);
                } else if (selection?.category) {
                  setSelectedSubcategory(selection.category);
                } else {
                  setSelectedSubcategory(null);
                }
              }}
            />
          </section>

          {selectedSubcategory?.id && (
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">
                {t("itemAttributes")}
              </h2>
              <CategoryAttributes
                category={selectedSubcategory?.id}
                attributes={{
                  brand: formData.brand,
                  size: formData.size,
                  condition: formData.condition,
                  color: formData.color,
                  material: formData.material,
                }}
                onChange={(key, value) => updateFormData(key, value)}
              />
            </section>
          )}

          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">{t("price")}</h2>
            <PriceSection
              price={formData.price}
              onChange={(price) => updateFormData("price", price)}
            />
          </section>

          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">{t("packageSize")}</h2>
            <PackageSize
              packageSize={formData.packageSize}
              category={formData.category}
              customShippingCost={formData.customShippingCost || ""}
              onChange={(size) => updateFormData("packageSize", size)}
              onCustomCostChange={(cost) =>
                updateFormData("customShippingCost", cost)
              }
            />
          </section>

          <ActionButtons
            onUpload={handleUpload}
            onSaveDraft={handleSaveDraft}
            isUploading={isUploading}
            isValid={
              formData.title.length > 0 &&
              formData.product_photos.length > 0 &&
              formData.price !== "" &&
              formData.category !== "" &&
              formData.condition !== "" &&
              formData.size !== "" &&
              formData.brand !== "" &&
              formData.color !== "" &&
              formData.material !== "" &&
              formData.packageSize !== ""
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SellNowPage;
