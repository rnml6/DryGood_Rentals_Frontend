import React, { useEffect, useState } from "react";
import GenerateReport from "../adComponents/generateReport.jsx";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const formatCurrency = (value) =>
  `₱${Number(value)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const formatRevenueTick = (tick) => {
  if (tick >= 1000000) {
    return `₱${(tick / 1000000).toFixed(1)}M`;
  }
  if (tick >= 1000) {
    return `₱${(tick / 1000).toFixed(0)}k`;
  }
  return `₱${tick}`;
};

const CustomizedAxisTick = ({ x, y, payload }) => {
  const isMobile = window.innerWidth < 768;
  const rotation = isMobile ? -45 : 0;
  const fontSize = isMobile ? 10 : 12;
  const textAnchor = isMobile ? "end" : "middle";

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor={textAnchor}
        fill="#666"
        transform={`rotate(${rotation})`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {payload.value}
      </text>
    </g>
  );
};

function Analysis() {
  const [records, setRecords] = useState([]);
  const [year, setYear] = useState("all");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [years, setYears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:4000/record/all")
      .then((res) => res.json())
      .then((data) => {
        setRecords(data.message);

        const uniqueYears = [
          ...new Set(
            data.message
              .map((record) => {
                const datePart = record.rental_date
                  ? record.rental_date.replace(" ", "T")
                  : null;
                return datePart ? new Date(datePart).getFullYear() : null;
              })
              .filter((y) => y !== null)
          ),
        ];

        setYears(uniqueYears.sort((a, b) => b - a));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = records.filter((record) => {
      if (!record.rental_date) return false;

      const rentalYear = new Date(
        record.rental_date.replace(" ", "T")
      ).getFullYear();

      return year === "all" || rentalYear === parseInt(year);
    });

    setFilteredRecords(filtered);
  }, [records, year]);

  const totalRevenue = filteredRecords.reduce(
    (sum, record) => sum + record.total_amount,
    0
  );

  const recentActivity = [...filteredRecords]
    .sort(
      (a, b) =>
        new Date(b.rental_date.replace(" ", "T")) -
        new Date(a.rental_date.replace(" ", "T"))
    )
    .slice(0, 5);

  const monthlyRentals = Array(12).fill(0);
  filteredRecords.forEach((record) => {
    const dateString = record.rental_date?.replace(" ", "T");
    if (dateString) {
      const month = new Date(dateString).getMonth();
      monthlyRentals[month] += 1;
    }
  });

  const monthlyData = monthlyRentals.map((count, index) => ({
    month: new Date(0, index).toLocaleString("default", { month: "short" }),
    rentals: count,
  }));

  const monthlyRevenue = Array(12).fill(0);
  filteredRecords.forEach((record) => {
    const dateString = record.rental_date?.replace(" ", "T");
    if (dateString) {
      const month = new Date(dateString).getMonth();
      monthlyRevenue[month] += record.total_amount;
    }
  });

  const revenueData = monthlyRevenue.map((total, index) => ({
    month: new Date(0, index).toLocaleString("default", { month: "short" }),
    revenue: total,
  }));

  if (isLoading) {
    return (
      <div className="text-center p-8 text-xl font-medium">
        Loading Analysis Data...
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-5 md:p-8 lg:p-12 font-sans">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 max-md:gap-2">
        <div className="md:col-span-2 bg-[#1C3D5A] pl-7 p-6 rounded-xl shadow-2xl flex flex-col justify-center items-start text-white transition-transform duration-300 hover:scale-[1.01]">
          <h2 className="text-xl font-light opacity-80">
            Total Revenue ( ₱ ) {year !== "all" ? `for ${year}` : ""}
          </h2>
          <span className="text-4xl font-extrabold tracking-wide">
            {formatCurrency(totalRevenue)}
          </span>
        </div>

        <div className="flex items-center flex-row md:flex-col justify-between gap-3 max-md:gap-2">
          <div className="flex items-center gap-3 w-1/2 md:w-full">
            <div className="flex-grow px-4 py-4 w-full font-semibold rounded-xl text-gray-100 border bg-[#1C3D5A] border-[#1C3D5A]">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full focus:outline-none bg-[#1C3D5A] cursor-pointer"
              >
                <option value="all" className="bg-white text-gray-800">
                  All Years
                </option>
                {years.map((y) => (
                  <option key={y} value={y} className="bg-white text-gray-800">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-1/2 md:w-full">
            <GenerateReport />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-[#1C3D5A]">
            Monthly Rentals {year !== "all" ? `in ${year}` : ""}
          </h2>

          <div className="w-full h-64 md:h-80 min-w-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={<CustomizedAxisTick />} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v) => [`${v} Rentals`, "Count"]} />
                <Bar dataKey="rentals" fill="#1C3D5A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-[#1C3D5A]">
            Monthly Revenue {year !== "all" ? `in ${year}` : ""}
          </h2>

          <div className="w-full h-64 md:h-80 min-w-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={<CustomizedAxisTick />} />
                <YAxis tickFormatter={formatRevenueTick} />
                <Tooltip
                  formatter={(v) => [formatCurrency(v), "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#1C3D5A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-[#1C3D5A] border-b pb-3">
          🕒 Latest Rentals
        </h2>

        <ul className="space-y-4 max-h-96 overflow-y-auto">
          {recentActivity.length ? (
            recentActivity.map((record, index) => (
              <li
                key={record.id || index}
                className="flex justify-between p-3 rounded-xl bg-gray-100 hover:bg-indigo-50"
              >
                <div>
                  <p className="font-semibold">{record.customer_name}</p>
                  <p className="text-sm text-gray-500">
                    Rented:{" "}
                    <span className="text-[#1C3D5A]">
                      {record.attire_name}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {formatCurrency(record.total_amount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(
                      record.rental_date.replace(" ", "T")
                    ).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-500">
              No recent rental activity found{" "}
              {year !== "all" ? `for ${year}` : ""}.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

export default Analysis;
