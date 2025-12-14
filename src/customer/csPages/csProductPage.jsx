import CustomerHeader from "../csComponents/csHeader.jsx";
import React, { useEffect, useState, useMemo } from "react";

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v3.586l-2 2V12.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

function CsProductPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/inventory/all")
      .then((res) => res.json())
      .then((result) => {
        const inventoryData = Array.isArray(result.message)
          ? result.message
          : [];
        setData(inventoryData);
        setFilteredData(inventoryData);
      })
      .catch((e) => console.error("Error fetching inventory:", e));
  }, []);

  useEffect(() => {
    let filtered = data;
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        String(item.id).includes(search)
    );
    if (filterSize)
      filtered = filtered.filter((item) => item.size === filterSize);
    if (filterCategory)
      filtered = filtered.filter((item) => item.category === filterCategory);
    if (priceRange) {
      filtered = filtered.filter((item) => {
        const price = Number(item.price);
        if (priceRange === "below500") return price < 500;
        if (priceRange === "500to1000") return price >= 500 && price <= 1000;
        if (priceRange === "1000to2000") return price >= 1000 && price <= 2000;
        if (priceRange === "above2000") return price > 2000;
        return true;
      });
    }
    setFilteredData(filtered);
  }, [search, filterSize, filterCategory, priceRange, data]);

  const sizes = useMemo(
    () => [...new Set(data.map((item) => item.size).filter(Boolean))],
    [data]
  );
  const categories = useMemo(
    () => [...new Set(data.map((item) => item.category).filter(Boolean))],
    [data]
  );

  const FilterPanel = ({ isMobile }) => (
    <div className=" p-4 space-y-5 text-sm bg-white md:bg-gray-50/70  rounded-lg shadow-xl md:shadow-none">
      <div>
        <p className="font-extrabold mb-3 text-[#1C3D5A] border-b border-[#1C3D5A]/20 pb-2 uppercase tracking-wider">
          Size
        </p>
        <div className="flex flex-col space-y-1">
          <label className="flex items-center cursor-pointer hover:bg-[#E5E7EB] p-1.5 rounded transition">
            <input
              type="radio"
              name="size"
              value=""
              checked={filterSize === ""}
              onChange={() => setFilterSize("")}
              className="accent-[#1C3D5A] h-4 w-4"
            />
            <span className="ml-3 text-[#1C3D5A] font-medium">All Sizes</span>
          </label>
          {sizes.map((size) => (
            <label
              key={size}
              className="flex items-center cursor-pointer hover:bg-[#E5E7EB] p-1.5 rounded transition"
            >
              <input
                type="radio"
                name="size"
                value={size}
                checked={filterSize === size}
                onChange={() => setFilterSize(size)}
                className="accent-[#1C3D5A] h-4 w-4"
              />
              <span className="ml-3 text-[#1C3D5A]">{size}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="font-extrabold mb-3 text-[#1C3D5A] border-b border-[#1C3D5A]/20 pb-2 uppercase tracking-wider">
          Category
        </p>
        <div className="flex flex-col space-y-1">
          <label className="flex items-center cursor-pointer hover:bg-[#E5E7EB] p-1.5 rounded transition">
            <input
              type="radio"
              name="category"
              value=""
              checked={filterCategory === ""}
              onChange={() => setFilterCategory("")}
              className="accent-[#1C3D5A] h-4 w-4"
            />
            <span className="ml-3 text-[#1C3D5A] font-medium">
              All Categories
            </span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center cursor-pointer hover:bg-[#E5E7EB] p-1.5 rounded transition"
            >
              <input
                type="radio"
                name="category"
                value={cat}
                checked={filterCategory === cat}
                onChange={() => setFilterCategory(cat)}
                className="accent-[#1C3D5A] h-4 w-4"
              />
              <span className="ml-3 text-[#1C3D5A]">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="font-extrabold mb-3 text-[#1C3D5A] border-b border-[#1C3D5A]/20 pb-2 uppercase tracking-wider">
          Price Range
        </p>
        <div className="flex flex-col space-y-1">
          {[
            { value: "", label: "All Prices" },
            { value: "below500", label: "Below ₱500" },
            { value: "500to1000", label: "₱500 - ₱1000" },
            { value: "1000to2000", label: "₱1000 - ₱2000" },
            { value: "above2000", label: "Above ₱2000" },
          ].map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center cursor-pointer hover:bg-[#E5E7EB] p-1.5 rounded transition"
            >
              <input
                type="radio"
                name="price"
                value={value}
                checked={priceRange === value}
                onChange={() => setPriceRange(value)}
                className="accent-[#1C3D5A] h-4 w-4"
              />
              <span className="ml-3 text-[#1C3D5A]">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {isMobile && (
        <button
          onClick={() => setIsFilterPanelOpen(false)}
          className="w-full mt-6 py-2 bg-[#1C3D5A] text-white font-bold rounded-lg shadow-lg hover:bg-[#153047] transition"
        >
          Show Results ({filteredData.length})
        </button>
      )}
    </div>
  );

  const ProductDetailModal = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100">
        <div className="p-6 md:p-8 overflow-y-auto max-h-[95vh]">
          <div className="flex justify-between items-start mb-4 border-b border-gray-200 pb-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1C3D5A] tracking-tight">
              {selectedData.name}
            </h3>
            <button
              className="ml-4 text-3xl text-[#1C3D5A] hover:text-red-500 transition-transform hover:scale-110"
              onClick={() => setSelectedData(null)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="flex justify-center items-start">
              <img
                src={`http://localhost:4000/uploads/${selectedData.image}`}
                alt={selectedData.name}
                className="w-full max-h-[55vh] object-cover rounded-xl shadow-xl border-4 border-[#1C3D5A]/10"
              />
            </div>

            <div className="space-y-4 text-gray-700">
              <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-300">
                <p className="font-extrabold text-[#60A5FA] text-3xl">
                  ₱ {Number(selectedData.price).toLocaleString()}
                </p>
                <span
                  className={`
                    text-sm uppercase font-extrabold px-4 py-1.5 rounded-full shadow-lg
                    ${
                      selectedData.status === "Available"
                        ? "bg-[#1C3D5A] text-white"
                        : "bg-red-500 text-white"
                    }
                  `}
                >
                  {selectedData.status}
                </span>
              </div>

              <div className="pt-2">
                <p className="text-xs uppercase text-[#1C3D5A] mb-1 font-bold tracking-widest border-b border-gray-100 pb-1">
                  Product Description
                </p>
                <p className="text-[#1C3D5A] text-base leading-relaxed">
                  {selectedData.description ||
                    "No detailed description available for this item."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                {[
                  { label: "Category", value: selectedData.category },
                  { label: "Gender", value: selectedData.gender },
                  { label: "Size", value: selectedData.size },
                  { label: "Color", value: selectedData.color },
                  { label: "Material", value: selectedData.material },
                  {
                    label: "Date Added",
                    value: new Date(selectedData.date_added).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    ),
                  },
                ].map((attr) => (
                  <div
                    key={attr.label}
                    className="bg-gray-50/70 p-3 rounded-lg border border-gray-200"
                  >
                    <p className="text-xs uppercase text-gray-500 mb-0.5 font-semibold tracking-wider">
                      {attr.label}
                    </p>
                    <p className="font-bold text-[#1C3D5A] text-base">
                      {attr.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="relative bg-[#1C3D5A] text-white">
        <CustomerHeader />
      </div>

      <div className="min-h-screen flex flex-col md:flex-row p-4 md:p-10 bg-gray-50 gap-6 md:gap-7">
        <div className="hidden md:block w-full md:w-[200px] lg:w-[240px] flex-shrink-0 sticky top-4 self-start">
          <FilterPanel isMobile={false} />
        </div>

        <div className="w-full md:flex-grow">
          <h1 className="hidden md:block  font-serif font-extrabold text-[#1C3D5A] text-3xl mb-6">
            Product Catalog
          </h1>

          <div className="flex flex-col gap-4 mb-5">
            <div className="flex md:hidden justify-between items-center w-full">
              <h1 className="font-serif font-extrabold text-[#1C3D5A] text-2xl max-[365px]:text-xl pl-1">
                Product Catalog
              </h1>
              <button
                onClick={() => setIsFilterPanelOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#1C3D5A] text-white font-semibold rounded-lg shadow-md hover:bg-[#60A5FA] transition text-sm"
                aria-label="Open Filters"
              >
                <FilterIcon />
                <span>Filter</span>
              </button>
            </div>

            <div className="w-full">
              <input
                type="text"
                placeholder="Search by name or ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA] outline-none text-[#1C3D5A] shadow-sm transition duration-200"
              />
            </div>
          </div>

          <p className="text-gray-600 mb-6 text-base border-b border-gray-200 pl-0.5 pb-2">
            Displaying{" "}
            <strong className="font-extrabold text-[#1C3D5A]">
              {filteredData.length}
            </strong>{" "}
            {filteredData.length === 1 ? "item" : "items"}
          </p>

          <ul className="grid grid-cols-4 max-[990px]:grid-cols-2 max-[1290px]:grid-cols-3 gap-4 md:gap-6 w-full">
            {filteredData.map((item) => (
              <li
                key={item.id}
                className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-[#60A5FA] border border-gray-100 transition duration-300 cursor-pointer flex flex-col relative"
                onClick={() => setSelectedData(item)}
              >
                <div className="relative w-full aspect-square overflow-hidden">
                  <img
                    src={`http://localhost:4000/uploads/${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-3 flex flex-col flex-grow">
                  <strong className="text-sm sm:text-base font-extrabold text-[#1C3D5A] mb-2 leading-tight truncate">
                    {item.name}
                  </strong>
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-1 truncate">
                    {item.category}
                  </p>

                  <div className="mt-auto pt-2 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-[#60A5FA] font-extrabold text-lg">
                      ₱ {Number(item.price).toLocaleString()}
                    </p>
                    <p
                      className={`text-white text-[0.65rem] font-bold tracking-widest uppercase py-1 px-3 rounded-lg absolute bottom-28.5 left-1.5
                        ${
                          item.status === "Available"
                            ? "bg-[#1C3D5A]"
                            : item.status === "Rented"
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        }`}
                    >
                      {item.status}
                    </p>
                  </div>
                </div>
              </li>
            ))}

            {filteredData.length === 0 && (
              <p className="text-gray-600 col-span-full text-center p-12 italic text-lg bg-white rounded-xl shadow-inner border border-gray-100">
                No Items Found
              </p>
            )}
          </ul>
        </div>

        {isFilterPanelOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden flex items-start justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto transform transition-all duration-300 ease-in-out mt-4">
              <div className="p-5">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pt-1 pb-3 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-[#1C3D5A]">
                    Filter Options
                  </h2>
                  <button
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="text-3xl text-[#1C3D5A] hover:text-red-500"
                    aria-label="Close Filters"
                  >
                    &times;
                  </button>
                </div>
                <FilterPanel isMobile={true} />
              </div>
            </div>
          </div>
        )}

        {selectedData && <ProductDetailModal />}
      </div>
    </div>
  );
}

export default CsProductPage;
