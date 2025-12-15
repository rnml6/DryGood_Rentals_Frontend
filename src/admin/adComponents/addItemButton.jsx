import React, { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../additional/cropImage.js";

function AddItemButton({ className = "" }) {
  const today = new Date().toISOString().split("T")[0];
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    gender: "",
    size: "",
    color: "",
    rentalPrice: "",
    material: "",
    status: "Available",
    img: null,
    dateAdded: today,
    description: "",
  });

  const [imgSrc, setImgSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "img" && files && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, img: file }));

      const reader = new FileReader();
      reader.onload = () => setImgSrc(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      gender: "",
      size: "",
      color: "",
      rentalPrice: "",
      material: "",
      status: "Available",
      img: null,
      dateAdded: today,
      description: "",
    });
    setImgSrc(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "name",
      "category",
      "gender",
      "size",
      "color",
      "material",
      "rentalPrice",
      "description",
      "dateAdded",
      "img",
    ];

    const missing = requiredFields.some((field) => {
      if (field === "img") return !formData.img;
      return !String(formData[field]).trim();
    });

    if (missing) {
      setError("Complete all required information fields.");
      return;
    }

    let finalImgFile = formData.img;

    if (imgSrc && croppedAreaPixels) {
      try {
        const croppedBlob = await getCroppedImg(imgSrc, croppedAreaPixels);
        finalImgFile = new File([croppedBlob], `item-${Date.now()}.jpg`, {
          type: croppedBlob.type,
        });
      } catch (err) {
        console.error("Cropping failed:", err);
        setError("Failed to crop image.");
        return;
      }
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "img") {
        data.append("img", finalImgFile);
      } else {
        if (formData[key] !== null && formData[key] !== "")
          data.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch("http://localhost:4000/inventory/new", {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (result.success) {
        setError("Item added successfully!");
        resetForm();
        setShowForm(false);
        window.location.reload();
      } else {
        setError(result.message || "Failed to add item.");
      }
    } catch (err) {
      console.error(err);
      setError(`Network Error: ${err.message}`);
    }
  };

  return (
    <>
      <button
        className={
          className ||
          "px-4 py-2.5 bg-[#1C3D5A] text-white rounded-lg font-semibold hover:bg-green-700 transition duration-300 shadow-md"
        }
        onClick={() => setShowForm(true)}
        type="button"
      >
        Add Item
      </button>

      {error && (
        <div
          className={`fixed z-[1000] top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-xl shadow-2xl transition duration-500 ease-in-out font-bold text-center ${
            error.includes("successfully")
              ? "bg-green-100 text-green-700 border-2 border-green-500"
              : "bg-red-100 text-red-700 border-2 border-red-500"
          }`}
        >
          {error}
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="form-title"
        >
          <div
            className="absolute inset-0"
            onClick={() => setShowForm(false)}
            aria-hidden="true"
          ></div>

          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
            <div className="sticky top-0 bg-[#1C3D5A] border-3 rounded-xl text-white rounded-t-xl py-4 px-6  z-10 flex justify-between items-center">
              <h2 id="form-title" className="text-2xl font-bold tracking-wider">
                ADD NEW ITEM
              </h2>
              <button
                type="button"
                className="text-white text-3xl opacity-70 hover:opacity-100 transition"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "name", type: "text" },
                  { name: "color", type: "text" },
                  { name: "material", type: "text" },
                ].map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-semibold text-[#1C3D5A] capitalize mb-1"
                    >
                      {field.name.replace(/([A-Z])/g, " $1")}
                      <span className="text-red-500">*</span>:
                    </label>
                    <input
                      id={field.name}
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm"
                      required
                    />
                  </div>
                ))}

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold text-[#1C3D5A] capitalize mb-1"
                  >
                    Category <span className="text-red-500">*</span>:
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm"
                    required
                  >
                    <option hidden value="">
                      Select category
                    </option>
                    <option value="Dress">Dress</option>
                    <option value="Gown">Gown</option>
                    <option value="Barong">Barong</option>
                    <option value="Coat">Coat</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-semibold text-[#1C3D5A] capitalize mb-1"
                  >
                    Gender <span className="text-red-500">*</span>:
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm"
                    required
                  >
                    <option hidden value="">
                      Select gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="size"
                    className="block text-sm font-semibold text-[#1C3D5A] capitalize mb-1"
                  >
                    Size <span className="text-red-500">*</span>:
                  </label>
                  <select
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm"
                    required
                  >
                    <option hidden value="">
                      Select size
                    </option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="rentalPrice"
                    className="block text-sm font-semibold text-[#1C3D5A] mb-1"
                  >
                    Rental Price <span className="text-red-500">*</span>:
                  </label>
                  <input
                    id="rentalPrice"
                    type="number"
                    name="rentalPrice"
                    value={formData.rentalPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="dateAdded"
                    className="block text-sm font-semibold text-[#1C3D5A] mb-1"
                  >
                    Date Added <span className="text-red-500">*</span>:
                  </label>
                  <input
                    id="dateAdded"
                    type="date"
                    name="dateAdded"
                    value={formData.dateAdded}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm"
                    max={today}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-[#1C3D5A] mb-1"
                >
                  Description <span className="text-red-500">*</span>:
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="img-upload"
                  className="block text-sm font-semibold text-[#1C3D5A] mb-1"
                >
                  Image <span className="text-red-500">*</span>:
                </label>
                <input
                  id="img-upload"
                  type="file"
                  name="img"
                  accept="image/*"
                  onChange={handleChange}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1C3D5A] file:text-white hover:file:bg-opacity-80 transition duration-300 cursor-pointer"
                  required={!imgSrc}
                />

                {imgSrc && (
                  <div className="relative mt-4 w-full h-80 md:h-96 bg-gray-100 rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <Cropper
                      image={imgSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1 / 1.3}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow hover:bg-gray-400 transition duration-300"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1C3D5A] text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition duration-300 tracking-wider"
                >
                  SAVE ITEM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AddItemButton;
