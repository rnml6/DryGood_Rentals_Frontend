import CustomerHeader from "../csComponents/csHeader.jsx";
import React, { useEffect, useState, useMemo } from "react";

function CsProductPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);

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

  const sizes = useMemo(
    () => [...new Set(data.map((item) => item.size).filter(Boolean))],
    [data]
  );
  const categories = useMemo(
    () => [...new Set(data.map((item) => item.category).filter(Boolean))],
    [data]
  );

  return (
    <div>
      <div className="relative bg-[#1C3D5A] text-white">
        <CustomerHeader />
      </div>

      <div className="min-h-screen flex flex-col md:flex-row p-4 md:p-10 bg-gray-50 gap-6 md:gap-7">
        <div className="w-full md:flex-grow">
          <h1 className="hidden md:block  font-serif font-extrabold text-[#1C3D5A] text-3xl mb-6">
            Product Catalog
          </h1>

          <div className="flex flex-col gap-4 mb-5">
            <div className="flex md:hidden justify-between items-center w-full">
              <h1 className="font-serif font-extrabold text-[#1C3D5A] text-2xl max-[365px]:text-xl pl-1">
                Product Catalog
              </h1>
            </div>
          </div>

          <p className="text-gray-600 mb-6 text-base border-b border-gray-200 pl-0.5 pb-2">
            Displaying{" "}
            <strong className="font-extrabold text-[#1C3D5A]">
              {filteredData.length}
            </strong>{" "}
            {filteredData.length === 1 ? "item" : "items"}
          </p>
        </div>

        {selectedData && <ProductDetailModal />}
      </div>
    </div>
  );
}

export default CsProductPage;
