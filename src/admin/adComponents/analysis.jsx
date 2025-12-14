import React, { useEffect, useState } from "react";
import GenerateReport from "../adComponents/generateReport.jsx";

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
        <div className="flex items-center flex-row md:flex-col justify-between gap-3 max-md:gap-2">
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
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-[#1C3D5A]">
            Monthly Revenue {year !== "all" ? `in ${year}` : ""}
          </h2>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-[#1C3D5A] flex items-center gap-3 border-b pb-3">
          <span role="img" aria-label="Clock" className="text-indigo-500 text-3xl">
            🕒
          </span>
          Latest Rentals
        </h2>
      </section>
    </div>
  );
}

export default Analysis;
