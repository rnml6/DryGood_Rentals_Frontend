import React, { useEffect, useState, useMemo } from "react";
import DeleteItem from "./deleteButton";
import UpdateItem from "./updateItems";
import AddItemButton from "../adComponents/addItemButton.jsx";

function ShowInventory() {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSize, setFilterSize] = useState("All");
  const [filterDiv, setFilterDiv] = useState(false);

  const showItems = async () => {
    try {
      const response = await fetch("http://localhost:4000/inventory/all");
      const data = await response.json();
      setItems(data.message);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    showItems();
  }, [selectedItems]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return ["All", ...set];
  }, [items]);

  const statuses = useMemo(() => {
    const set = new Set(items.map((i) => i.status).filter(Boolean));
    return ["All", ...set];
  }, [items]);

  const sizes = useMemo(() => {
    const set = new Set(items.map((i) => i.size).filter(Boolean));
    return ["All", ...set];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const text = searchText.toLowerCase();
      const matchesSearch =
        item.id?.toString().toLowerCase().includes(text) ||
        item.name?.toLowerCase().includes(text);

      const matchesCategory =
        filterCategory === "All" || item.category === filterCategory;

      const matchesStatus =
        filterStatus === "All" || item.status === filterStatus;

      const matchesSize = filterSize === "All" || item.size === filterSize;

      return matchesSearch && matchesCategory && matchesStatus && matchesSize;
    });
  }, [items, searchText, filterCategory, filterStatus, filterSize]);

  const totalItems = items.length;
  const availableItems = items.filter((i) => i.status === "Available").length;
  const rentedItems = items.filter((i) => i.status === "Rented").length;
  const maintenanceItems = items.filter(
    (i) => i.status === "Maintenance"
  ).length;

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-500";
      case "Rented":
        return "bg-yellow-500";
      case "Maintenance":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-5 sm:p-8 lg:p-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-md:mb-5">
        <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-[#1C3D5A] transition hover:shadow-xl">
          <p className="text-gray-700 font-semibold text-sm sm:text-base">
            Total Items
          </p>
          <p className="text-3xl font-extrabold text-[#1C3D5A] mt-1">
            {totalItems}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-green-500 transition hover:shadow-xl">
          <p className="text-gray-700 font-semibold text-sm sm:text-base">
            Available
          </p>
          <p className="text-3xl font-extrabold text-green-500 mt-1">
            {availableItems}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-yellow-500 transition hover:shadow-xl">
          <p className="text-gray-700 font-semibold text-sm sm:text-base">
            Rented
          </p>
          <p className="text-3xl font-extrabold text-yellow-500 mt-1">
            {rentedItems}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-red-500 transition hover:shadow-xl">
          <p className="text-gray-700 font-semibold text-sm sm:text-base">
            Maintenance
          </p>
          <p className="text-3xl font-extrabold text-red-500 mt-1">
            {maintenanceItems}
          </p>
        </div>
      </div>

      <div className="bg-white mb-8 max-md:mb-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="border border-gray-300  px-4 py-3 rounded-lg w-full focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm"
              aria-label="Search Inventory"
            />
          </div>

          <div className="flex  gap-3 w-full md:w-auto">
            <button
              onClick={() => setFilterDiv((prev) => !prev)}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-[#1C3D5A] bg-white text-[#1C3D5A] rounded-lg font-semibold hover:bg-[#1C3D5A] hover:text-white transition duration-300 shadow-md whitespace-nowrap max-md:w-full"
            >
              Filter Options
            </button>

            <AddItemButton className="flex items-center justify-center gap-2 bg-[#1C3D5A] text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 hover:bg-opacity-90 whitespace-nowrap max-md:w-full">
              <span className="text-xl">+</span>
              Add New Item
            </AddItemButton>
          </div>
        </div>

        {filterDiv && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-5 border-t border-gray-200">
            <div className="border border-gray-300 p-3 rounded-lg shadow-sm hover:border-[#1C3D5A] transition duration-300">
              <label
                htmlFor="filterCategory"
                className="block text-xs font-semibold text-gray-500 mb-1"
              >
                CATEGORY
              </label>
              <select
                id="filterCategory"
                className="w-full text-gray-800 text-sm focus:ring-0 outline-none bg-transparent transition duration-300"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="border border-gray-300 p-3 rounded-lg shadow-sm hover:border-[#1C3D5A] transition duration-300">
              <label
                htmlFor="filterStatus"
                className="block text-xs font-semibold text-gray-500 mb-1"
              >
                STATUS
              </label>
              <select
                id="filterStatus"
                className="w-full text-gray-800 text-sm focus:ring-0 outline-none bg-transparent transition duration-300"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="border border-gray-300 p-3 rounded-lg shadow-sm hover:border-[#1C3D5A] transition duration-300">
              <label
                htmlFor="filterSize"
                className="block text-xs font-semibold text-gray-500 mb-1"
              >
                SIZE
              </label>
              <select
                id="filterSize"
                className="w-full text-gray-800 text-sm focus:ring-0 outline-none bg-transparent transition duration-300"
                value={filterSize}
                onChange={(e) => setFilterSize(e.target.value)}
              >
                {sizes.map((sz) => (
                  <option key={sz}>{sz}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-2xl overflow-x-auto pb-2">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#1C3D5A] sticky top-0 z-10">
            <tr>
              <th className="px-4 py-4 pt-5 pl-7 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[50px]">
                ID
              </th>
              <th className="px-4 py-4 pt-5 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[150px]">
                Name
              </th>
              <th className="px-4 py-4 pt-5 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">
                Category
              </th>
              <th className="px-4 py-4 pt-5 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[80px] hidden sm:table-cell">
                Gender
              </th>
              <th className="px-4 py-4 pt-5 text-left pl-11 text-xs font-bold text-white uppercase tracking-wider min-w-[100px]">
                Price
              </th>
              <th className="px-4 py-4 pt-5 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[100px] hidden md:table-cell">
                Date
              </th>
              <th className="px-4 py-4 pt-5 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[100px]">
                Status
              </th>
              <th className="px-4 py-4 pt-5 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[100px]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-4 py-4 pl-7 whitespace-nowrap text-sm text-gray-500">
                    {item.id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-800">
                    {item.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                    {item.category}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-600 hidden sm:table-cell">
                    {item.gender}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap font-bold text-green-700 text-sm text-left pl-11 ">
                    ₱ {Number(item.price).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 hidden md:table-cell">
                    {new Date(item.date_added).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-white rounded-full text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <button
                      className="text-[#1C3D5A] font-semibold hover:text-blue-700 transition duration-150 focus:outline-none"
                      onClick={() => setSelectedItems(item)}
                      aria-label={`View details for ${item.name}`}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-10 text-center text-gray-500">
                  No items found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 transition-all duration-300 bg-black/80 backdrop-blur-md">
          <div
            className="bg-white rounded-3xl shadow-3xl w-full max-w-4xl animate-fadeInUp flex flex-col md:flex-row max-h-[65vh] max-md:max-h-[95vh] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="max-md:hidden absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-600 rounded-full hover:bg-gray-200 transition-all duration-200 text-xl font-medium border border-transparent"
              onClick={() => setSelectedItems(null)}
              aria-label="Close"
            >
              <svg
                className="w-5 h-5 "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="md:w-2/5 flex items-center justify-center p-6 md:p-8 bg-gray-50 relative">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={`http://localhost:4000/uploads/${selectedItems.image}`}
                  alt={selectedItems.name}
                  className="w-auto  max-w-full max-md:max-h-[40vh] max-h-[70vh] object-contain rounded-xl transition-transform duration-500 hover:scale-105 shadow-xl"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x400?text=No+Image";
                  }}
                />
              </div>
            </div>

            <div
              className="md:w-3/5 p-6 sm:p-8 flex flex-col overflow-y-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="mb-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 leading-snug">
                  {selectedItems.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span
                    className={` px-3 py-1.5 rounded-bl-xl rounded-tr-xl text-xs font-bold text-white shadow-lg ${getStatusColor(
                      selectedItems.status
                    )}`}
                  >
                    {selectedItems.status.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-semibold text-xs border border-indigo-200">
                    {selectedItems.category}
                  </span>
                </div>
              </div>

              <div className=" flex items-center justify-between pb-5">
                <span className="text-4xl font-black text-teal-600">
                  ₱ {Number(selectedItems.price).toLocaleString()}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Overview
                </h3>
                <p className="text-gray-600 leading-relaxed text-base wrap-break-word">
                  {selectedItems.description || "No description provided."}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Product Specifications
                </h3>
                <dl className="space-y-3">
                  {[
                    { label: "Gender", value: selectedItems.gender },
                    { label: "Size", value: selectedItems.size },
                    {
                      label: "Color",
                      value: (
                        <span className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                            style={{
                              backgroundColor:
                                selectedItems.color.toLowerCase(),
                            }}
                          ></span>
                          {selectedItems.color}
                        </span>
                      ),
                    },
                    { label: "Material", value: selectedItems.material },
                    {
                      label: "Date Added",
                      value: new Date(
                        selectedItems.date_added
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between border-b border-gray-100 pb-3"
                    >
                      <dt className="text-sm font-medium text-gray-500">
                        {item.label}
                      </dt>
                      <dd className="text-base font-semibold text-gray-800">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-auto hidden md:block">
                <div className="flex gap-3 justify-end">
                  <UpdateItem
                    updateItems={selectedItems}
                    onUpdateSuccess={() => setSelectedItems(null)}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 text-center flex items-center justify-center gap-2 text-base"
                  >
                    <svg
                      className="w-5 h-5 "
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Item
                  </UpdateItem>
                  <DeleteItem
                    deleteId={selectedItems.id}
                    onDeleted={() => setSelectedItems(null)}
                    className="flex-1 bg-red-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:bg-red-600 transition-all duration-300 text-center flex items-center justify-center gap-2 text-base"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Item
                  </DeleteItem>
                </div>
              </div>
            </div>

            <div className="md:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-top-lg">
              <div className="flex items-center justify-end gap-3">
                <div className="flex gap-2">
                  <UpdateItem
                    updateItems={selectedItems}
                    onUpdateSuccess={() => setSelectedItems(null)}
                    className="bg-teal-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:bg-teal-600 transition-all duration-200 text-sm"
                  >
                    <svg
                      className="w-4 h-4 inline mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </UpdateItem>
                  <DeleteItem
                    deleteId={selectedItems.id}
                    onDeleted={() => setSelectedItems(null)}
                    className="bg-red-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:bg-red-600 transition-all duration-200 text-sm"
                  >
                    <svg
                      className="w-4 h-4 inline mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </DeleteItem>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShowInventory;
