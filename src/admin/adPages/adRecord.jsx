import React, { useEffect, useState, useMemo } from "react";
import AddRecord from "../adComponents/addRecord.jsx";
import MarkReturn from "../adComponents/markReturn.jsx";

function AdRecord() {
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("Active");
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDiv, setFilterDiv] = useState(false);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDateStatus, setFilterDateStatus] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/record/all");
      const data = await res.json();
      setRecords(data.message || []);
    } catch (err) {
      console.error("Error fetching records:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedRecord, deleteConfirm, showForm]);

  const updateTotalAmountInDatabase = async (recordId, newTotalAmount) => {
    try {
      const response = await fetch(
        `http://localhost:4000/record/edit/total/${recordId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            total_amount: newTotalAmount,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update total amount");
      }

      const data = await response.json();
      console.log("Total amount updated successfully:", data);
      return data;
    } catch (error) {
      console.error("Error updating total amount:", error);
      throw error;
    }
  };

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue && status?.toLowerCase() !== "returned")
      return "bg-red-500 text-white";
    switch ((status || "").toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "returned":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getOverdueStatus = (record) => {
    if ((record.rental_status || "").toLowerCase() === "returned") return false;
    if (!record.expected_return_date) return false;
    const expectedReturn = new Date(record.expected_return_date);
    expectedReturn.setHours(0, 0, 0, 0);
    const diffDays = (today - expectedReturn) / (1000 * 60 * 60 * 24);
    return diffDays >= 1;
  };

  const calculateExtraDays = (record) => {
    if (!record.rental_date || !record.expected_return_date) {
      return { extraDays: 0, extraCharge: 0, totalDays: 0 };
    }

    try {
      const rentalDate = new Date(record.rental_date);
      const expectedReturn = new Date(record.expected_return_date);

      rentalDate.setHours(0, 0, 0, 0);
      expectedReturn.setHours(0, 0, 0, 0);

      const diffTime = expectedReturn.getTime() - rentalDate.getTime();
      const totalDays = Math.max(
        1,
        Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      );

      const baseRentalDays = 3;
      const extraDays = Math.max(0, totalDays - baseRentalDays);
      const extraCharge = extraDays * 200;

      return { extraDays, extraCharge, totalDays };
    } catch (error) {
      console.error("Error calculating extra days:", error);
      return { extraDays: 0, extraCharge: 0, totalDays: 0 };
    }
  };

  const calculateOverdueFees = (record) => {
    if ((record.rental_status || "").toLowerCase() === "returned") {
      if (!record.total_amount) return { overdueDays: 0, overdueCharge: 0 };

      const basePrice = Number(record.price || 0);
      const { extraCharge } = calculateExtraDays(record);
      const totalAmount = Number(record.total_amount || 0);

      const overdueCharge = totalAmount - (basePrice + extraCharge);
      const overdueDays = Math.max(0, Math.ceil(overdueCharge / 250));

      return { overdueDays, overdueCharge };
    }

    if (!record.expected_return_date)
      return { overdueDays: 0, overdueCharge: 0 };

    const expectedReturn = new Date(record.expected_return_date);
    expectedReturn.setHours(0, 0, 0, 0);

    const overdueDays = Math.max(
      0,
      Math.floor((today - expectedReturn) / (1000 * 60 * 60 * 24))
    );
    const overdueCharge = overdueDays * 250;

    return { overdueDays, overdueCharge };
  };

  const calculateTotalAmount = (record) => {
    const { rental_status } = record;

    if ((rental_status || "").toLowerCase() === "returned") {
      return Number(record.total_amount || 0);
    } else {
      const basePrice = Number(record.price || 0);
      const { extraCharge } = calculateExtraDays(record);
      const { overdueCharge } = calculateOverdueFees(record);
      return basePrice + extraCharge + overdueCharge;
    }
  };

  const calculateDisplayAmount = (record) => {
    const basePrice = Number(record.price || 0);
    const { extraCharge } = calculateExtraDays(record);
    const { overdueCharge } = calculateOverdueFees(record);
    return basePrice + extraCharge + overdueCharge;
  };

  const totalRentals = records.length;
  const totalActive = records.filter(
    (r) => (r.rental_status || "").toLowerCase() === "active"
  ).length;
  const totalOverdue = records.filter(
    (r) =>
      (r.rental_status || "").toLowerCase() === "active" && getOverdueStatus(r)
  ).length;

  const totalRevenue = records.reduce(
    (sum, r) => sum + calculateTotalAmount(r),
    0
  );

  const handleDelete = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/record/delete/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        console.log("Record deleted successfully");
        fetchRecords();
      } else {
        console.log("Failed to delete record");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting record");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const generateAndPrintReceipt = (record) => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Rental #${record.id}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .no-print { display: none !important; }
          }
          .receipt {
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 2px solid #000;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #1C3D5A;
          }
          .header p {
            margin: 5px 0;
            font-size: 14px;
          }
          .details {
            margin-bottom: 20px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px dashed #ddd;
          }
          .total {
            font-weight: bold;
            font-size: 18px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #000;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          .thank-you {
            text-align: center;
            margin: 20px 0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>Rental Return Receipt</h1>
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>Rental ID: ${record.id}</p>
          </div>
          
          <div class="details">
            <div class="row">
              <span>Customer:</span>
              <span><strong>${record.customer_name}</strong></span>
            </div>
            <div class="row">
              <span>Attire:</span>
              <span>${record.attire_name} (#${record.attire_id})</span>
            </div>
            <div class="row">
              <span>Rental Date:</span>
              <span>${new Date(record.rental_date).toLocaleDateString()}</span>
            </div>
            <div class="row">
              <span>Return Date:</span>
              <span>${new Date(
                record.expected_return_date
              ).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div class="details">
            <div class="row">
              <span>Base Price (3 days):</span>
              <span>₱${Number(record.price || 0).toLocaleString()}</span>
            </div>
            ${
              calculateExtraDays(record).extraDays > 0
                ? `
            <div class="row">
              <span>Extra Days (${
                calculateExtraDays(record).extraDays
              } × ₱200):</span>
              <span>₱${calculateExtraDays(
                record
              ).extraCharge.toLocaleString()}</span>
            </div>`
                : ""
            }
            ${
              calculateOverdueFees(record).overdueCharge > 0
                ? `
            <div class="row">
              <span>Overdue Fees (${
                calculateOverdueFees(record).overdueDays
              } × ₱250):</span>
              <span>₱${calculateOverdueFees(
                record
              ).overdueCharge.toLocaleString()}</span>
            </div>`
                : ""
            }
            <div class="row total">
              <span>Total Amount:</span>
              <span>₱${calculateTotalAmount(record).toLocaleString()}</span>
            </div>
          </div>
          
          <div class="thank-you">Thank you!</div>
          
          <div class="footer">
            <p>This is an official receipt</p>
            <p>For inquiries, please contact us</p>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #1C3D5A; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Receipt
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `;

    const receiptWindow = window.open("", "_blank");
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    receiptWindow.focus();

    receiptWindow.onload = function () {
      setTimeout(() => {
        receiptWindow.print();
      }, 500);
    };
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesStatus =
        (record.rental_status || "").toLowerCase() === activeTab.toLowerCase();

      const text = searchQuery.toLowerCase();
      const matchesSearch =
        record.customer_name?.toLowerCase().includes(text) ||
        record.attire_name?.toLowerCase().includes(text) ||
        record.attire_id?.toString().includes(searchQuery) ||
        record.id?.toString().includes(searchQuery);

      const rentalDate = record.rental_date
        ? new Date(record.rental_date)
        : null;
      const matchesYear = filterYear
        ? rentalDate?.getFullYear() === Number(filterYear)
        : true;
      const matchesMonth = filterMonth
        ? rentalDate?.getMonth() + 1 === Number(filterMonth)
        : true;

      let matchesDateStatus = true;
      if (activeTab === "Active" && filterDateStatus) {
        const expectedReturn = record.expected_return_date
          ? new Date(record.expected_return_date)
          : null;

        if (expectedReturn) {
          expectedReturn.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil(
            (expectedReturn - today) / (1000 * 60 * 60 * 24)
          );

          switch (filterDateStatus) {
            case "1-day-before":
              matchesDateStatus = diffDays === 1;
              break;
            case "due-today":
              matchesDateStatus = diffDays === 0;
              break;
            case "overdue":
              matchesDateStatus = diffDays < 0;
              break;
            default:
              matchesDateStatus = true;
          }
        }
      }

      return (
        matchesStatus &&
        matchesSearch &&
        matchesYear &&
        matchesMonth &&
        matchesDateStatus
      );
    });
  }, [
    records,
    activeTab,
    searchQuery,
    filterYear,
    filterMonth,
    filterDateStatus,
    today,
  ]);

  const availableYears = useMemo(() => {
    const years = new Set(
      records
        .map((r) =>
          r.rental_date ? new Date(r.rental_date).getFullYear() : null
        )
        .filter(Boolean)
    );
    return ["All", ...Array.from(years).sort((a, b) => b - a)];
  }, [records]);

  const months = useMemo(
    () => [
      "All",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 p-5 sm:p-8 lg:p-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 lg:mb-8">
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border-t-4 border-[#1C3D5A]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm sm:text-base font-medium">
                Total Rentals
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-[#1C3D5A] mt-1">
                {totalRentals}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border-t-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm sm:text-base font-medium">
                Active Rentals
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-green-500 mt-1">
                {totalActive}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border-t-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm sm:text-base font-medium">
                Overdue Rentals
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-red-500 mt-1">
                {totalOverdue}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border-t-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm sm:text-base font-medium">
                Total Revenue
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-teal-600 mt-1">
                ₱{totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 lg:mb-8">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex overflow-x-auto scrollbar-hide -mx-4 sm:mx-0">
              <div className="flex border-b border-gray-200 min-w-max">
                {["Active", "Returned"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? "text-[#1C3D5A] border-b-2 border-[#1C3D5A]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab} Rentals
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition"
                />
                <svg
                  className="absolute right-3 top-3.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setFilterDiv(!filterDiv)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 whitespace-nowrap justify-center"
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
                      strokeWidth="2"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filter
                </button>

                <AddRecord
                  className="w-full justify-center px-4 py-3 bg-[#1C3D5A]/90 text-white font-medium rounded-lg hover:bg-[#1C3D5A] transition flex items-center gap-2 whitespace-nowrap"
                  onSuccess={() => {
                    setShowForm(false);
                    fetchRecords();
                  }}
                >
                  Add Record
                </AddRecord>
              </div>
            </div>
          </div>

          {filterDiv && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Year
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A]">
                    <select
                      value={filterYear}
                      className="w-full outline-0"
                      onChange={(e) =>
                        setFilterYear(
                          e.target.value === "All" ? "" : e.target.value
                        )
                      }
                    >
                      {availableYears.map((year) => (
                        <option key={year} value={year === "All" ? "" : year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Month
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A]">
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="w-full outline-0"
                    >
                      {months.map((month, index) => (
                        <option key={month} value={index === 0 ? "" : index}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeTab === "Active" && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Due Date
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A]">
                      <select
                        value={filterDateStatus}
                        onChange={(e) => setFilterDateStatus(e.target.value)}
                        className="w-full outline-0"
                      >
                        <option value="">All</option>
                        <option value="1-day-before">Upcoming Return</option>
                        <option value="due-today">Due Today</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1/4 px-6 py-4 text-left text-xs font-bold rounded-l-lg bg-[#1C3D5A] text-white uppercase tracking-wider">
                  Customer
                </th>
                <th className="w-1/4 px-6 py-4 text-left text-xs font-bold bg-[#1C3D5A] text-white uppercase tracking-wider">
                  Attire
                </th>
                <th className="w-auto px-4 py-4 text-left text-xs font-bold bg-[#1C3D5A] text-white uppercase tracking-wider hidden md:table-cell">
                  Rental Date
                </th>
                <th className="w-auto px-4 py-4 text-left text-xs font-bold bg-[#1C3D5A] text-white uppercase tracking-wider">
                  Return Date
                </th>
                <th className="w-auto px-4 py-4 text-left text-xs font-bold bg-[#1C3D5A] text-white uppercase tracking-wider hidden lg:table-cell">
                  Days
                </th>
                <th className="w-auto px-4 py-4 text-left text-xs font-bold bg-[#1C3D5A] text-white uppercase tracking-wider">
                  Amount
                </th>
                <th className="w-auto px-4 py-4 text-left text-xs font-bold bg-[#1C3D5A] text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="w-auto px-4 py-4 text-left text-xs font-bold rounded-r-lg bg-[#1C3D5A] text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C3D5A]"></div>
                    </div>
                    <p className="mt-2 text-gray-500">Loading records...</p>
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const isOverdue = getOverdueStatus(record);
                  const { totalDays, extraDays } = calculateExtraDays(record);

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {record.customer_name}
                          </p>
                          {record.customer_contact && (
                            <p className="text-xs text-gray-500">
                              {record.customer_contact}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {record.attire_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            #{record.attire_id}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-sm text-gray-700 hidden md:table-cell">
                        {record.rental_date
                          ? new Date(record.rental_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-5">
                        <div className="text-sm text-gray-700">
                          {record.expected_return_date
                            ? new Date(
                                record.expected_return_date
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-5 text-sm text-gray-700 hidden lg:table-cell">
                        <div className="flex flex-col">
                          <span className="font-medium">{totalDays} days</span>
                          {extraDays > 0 && (
                            <span className="text-xs text-red-600">
                              +{extraDays} extra
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-sm font-semibold text-green-600">
                          ₱{calculateTotalAmount(record).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            record.rental_status,
                            isOverdue
                          )}`}
                        >
                          {record.rental_status || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-col sm:flex-row gap-1">
                          <button
                            onClick={() => {
                              setSelectedRecord(record);
                            }}
                            className="px-3 py-1.5 text-sm text-[#1C3D5A] hover:bg-[#1C3D5A]/10 rounded-lg transition"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center">
                    <div className="text-gray-400 mb-3">
                      <svg
                        className="w-12 h-12 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500">
                      No {activeTab.toLowerCase()} records found
                      {searchQuery && ` for "${searchQuery}"`}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-200 animate-fadeIn">
            <div className="px-4 sm:px-6 py-4 bg-[#1C3D5A] text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-end gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold font-serif tracking-tight">
                    Rental Details
                  </h2>
                  <p className="text-sm text-white/80 font-medium">
                    ( {selectedRecord.id} )
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedRecord(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-transform hover:scale-105"
                  aria-label="Close"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 sm:p-6"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-3 bg-blue-50 text-[#1C3D5A] rounded-lg">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Attire Information
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Attire Name</p>
                        <p className="text-xl font-bold text-gray-900">
                          {selectedRecord.attire_name}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Attire ID</p>
                          <p className="text-lg font-bold text-[#1C3D5A]">
                            #{selectedRecord.attire_id}
                          </p>
                        </div>
                        <div className="space-y-1 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Base Price</p>
                          <p className="text-xl font-bold text-[#1C3D5A]">
                            ₱
                            {Number(selectedRecord.price || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-3 bg-blue-50 text-[#1C3D5A] rounded-lg">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Customer Information
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="text-xl font-bold text-gray-900">
                          {selectedRecord.customer_name}
                        </p>
                      </div>

                      <div className="sm:grid flex flex-col-reverse sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">
                            Contact Number
                          </p>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <p className="text-base font-medium text-gray-900">
                              {selectedRecord.customer_phone || "Not provided"}
                            </p>
                          </div>
                        </div>

                        {selectedRecord.id_type && (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">ID Type</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {selectedRecord.id_type}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Email Address</p>
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <p
                            className="text-base font-medium text-gray-900"
                            dangerouslySetInnerHTML={{
                              __html: (
                                selectedRecord.customer_email || "Not provided"
                              ).replace("@", "<wbr>@"),
                            }}
                          />
                        </div>
                      </div>

                      {selectedRecord.customer_address && (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">
                            Current Address
                          </p>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-400 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <p className="text-base font-medium text-gray-900">
                              {selectedRecord.customer_address}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedRecord.id_image && (
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Customer ID Verification
                      </h3>
                      <div className="relative overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
                        <img
                          src={`http://localhost:4000/recordsId/${selectedRecord.id_image}`}
                          alt="Customer ID"
                          className="w-full h-auto object-contain max-h-64"
                          loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                          <p className="text-white text-sm font-bold">
                            {selectedRecord.id_type || "ID Document"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-3 bg-blue-50 text-[#1C3D5A] rounded-lg">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Rental Timeline
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute left-0 top-0 w-8 h-8 flex items-center justify-center -translate-x-1/2"></div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Rental Date
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                {selectedRecord.rental_date
                                  ? new Date(
                                      selectedRecord.rental_date
                                    ).toLocaleDateString("en-US", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute left-0 top-0 w-8 h-8 flex items-center justify-center -translate-x-1/2"></div>
                        <div className="p-4 rounded-lg border shadow-sm bg-blue-50 border-blue-300">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-gray-500">
                              Expected Return
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedRecord.expected_return_date
                              ? new Date(
                                  selectedRecord.expected_return_date
                                ).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "-"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-2">
                              Current Status
                            </p>
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-4 py-2 rounded-lg font-bold text-sm ${getStatusColor(
                                  selectedRecord.rental_status,
                                  getOverdueStatus(selectedRecord)
                                )}`}
                              >
                                {selectedRecord.rental_status?.toUpperCase()}
                              </span>
                              {getOverdueStatus(selectedRecord) && (
                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                  Overdue
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="md:text-right">
                            <p className="text-sm text-gray-500 mb-1">
                              Rental Period
                            </p>
                            <p className="text-lg font-semibold text-[#1C3D5A]">
                              {calculateExtraDays(selectedRecord).totalDays}{" "}
                              days
                              {calculateExtraDays(selectedRecord).extraDays >
                                0 && (
                                <span className="text-sm text-red-600 ml-2">
                                  (+
                                  {
                                    calculateExtraDays(selectedRecord).extraDays
                                  }{" "}
                                  extra)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {getOverdueStatus(selectedRecord) && (
                          <div className="mt-3 md:hidden">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                                Overdue:{" "}
                                {
                                  calculateOverdueFees(selectedRecord)
                                    .overdueDays
                                }{" "}
                                days
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1C3D5A] p-5 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">Payment Summary</h3>
                      <div className="p-2 bg-white/10 rounded-lg">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-white/80">Base Price</p>
                        <p className="text-lg font-semibold">
                          ₱{Number(selectedRecord.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-white/80">
                          Extra Days (
                          {calculateExtraDays(selectedRecord).extraDays} days ×
                          ₱200)
                        </p>
                        <p className="text-lg font-semibold">
                          ₱
                          {calculateExtraDays(
                            selectedRecord
                          ).extraCharge.toLocaleString()}
                        </p>
                      </div>

                      {calculateOverdueFees(selectedRecord).overdueCharge >
                        0 && (
                        <div className="flex justify-between items-center pt-3 border-t border-white/20">
                          <div>
                            <p className="text-sm text-white/80 ">
                              Overdue Fees
                            </p>
                            <p className="text-xs text-white/60 mb-2">
                              {calculateOverdueFees(selectedRecord).overdueDays}{" "}
                              days × ₱250
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-red-200">
                              ₱
                              {calculateOverdueFees(
                                selectedRecord
                              ).overdueCharge.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-white/20 pt-3">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-white/80">
                            Total Amount Due
                          </p>
                          <p className="text-2xl font-bold tracking-tight">
                            ₱
                            {calculateDisplayAmount(
                              selectedRecord
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 bg-white p-4 sticky bottom-0 z-10">
              <div className="flex flex-col sm:flex-row gap-3">
                {selectedRecord.rental_status?.toLowerCase() === "active" && (
                  <MarkReturn
                    record={selectedRecord}
                    onReturnSuccess={() => {
                      setSelectedRecord(null);
                      fetchRecords();
                    }}
                    className="flex-1 py-3 bg-[#1C3D5A] text-white font-semibold rounded-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Mark as Returned
                  </MarkReturn>
                )}

                {selectedRecord.rental_status?.toLowerCase() === "returned" && (
                  <>
                    <button
                      onClick={() => generateAndPrintReceipt(selectedRecord)}
                      className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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
                          strokeWidth="2"
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Generate & Print Receipt
                    </button>
                    <button
                      onClick={() => handleDelete(selectedRecord.id)}
                      className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Record
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Delete Record Permanently
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete this rental record? This action
                cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDelete(deleteConfirm);
                  setSelectedRecord(null);
                }}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdRecord;
