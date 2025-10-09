import React, { useRef, useState } from 'react';
import { X, Upload, ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ImageUploader = ({ images, onChange }) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useTranslation()
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const isImageFile = (file) =>
    file.type.startsWith('image/') &&
    ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(isImageFile);

      if (newFiles.length === 0) {
        alert('Only image files (PNG, JPG, JPEG) are allowed.');
        return;
      }

      const totalImages = images.length + newFiles.length;

      if (totalImages > 20) {
        alert('You can upload a maximum of 20 images');
        return;
      }

      onChange([...images, ...newFiles]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter(isImageFile);

      if (newFiles.length === 0) {
        alert('Only image files (PNG, JPG, JPEG) are allowed.');
        return;
      }

      const totalImages = images.length + newFiles.length;

      if (totalImages > 20) {
        alert('You can upload a maximum of 20 images');
        return;
      }

      onChange([...images, ...newFiles]);
    }
  };

  const removeImage = (indexToRemove) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center cursor-pointer">
          <div className="bg-gray-100 p-3 rounded-full mb-3">
            <Upload className="h-6 w-6 text-gray-500" />
          </div>
          <p className="font-medium mb-1">{t("dragPhotosHere")}</p>
          <p className="text-sm text-gray-500 mb-2">{t("clickToBrowse")}</p>
          <button
            type="button"
            className="text-sm text-white bg-teal-600 hover:bg-teal-700 font-medium rounded-full px-4 py-2 transition-colors duration-200"
          >
            {t("uploadPhotos")}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square border border-gray-200 rounded-lg">
              <img
                src={typeof image === 'string' ? `${baseURL}/${image}` : URL.createObjectURL(image)}
                // src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-1 transition-opacity duration-200"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded-b-lg">
                  {t("coverPhoto")}
                </div>
              )}
            </div>
          ))}
          {images.length < 20 && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center aspect-square cursor-pointer hover:border-gray-400 transition-colors duration-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center">
                <ImagePlus className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">{t("addMore")}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
