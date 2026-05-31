"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { inventoryAPI, orderAPI, productAPI } from "@/lib/api-service";
import { useRouter } from "next/navigation";
import { PurchasesSection, ReportsSection } from "@/app/PurchasesAndReportsSection"
import { FaShoppingBag, FaChartPie } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import {
  FaChartLine,
  FaBox,
  FaReceipt,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaDollarSign,
  FaShoppingCart,
  FaChartBar,
  FaClock,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSpinner,
  FaMoon,
  FaSun,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

// --- Dashboard Section (Mobile Optimized) ---
function DashboardSection({ isDarkMode }: { isDarkMode: boolean }) {
  const [stats, setStats] = useState({
    todaySales: 0,
    monthSales: 0,
    orderCount: 0,
    avgOrderValue: 0,
    topProducts: [] as any[],
    allOrders: [] as any[],
    recentOrders: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const today = await orderAPI.getTodayTotal();
        const orders = await orderAPI.getAll();
        const monthly = await orderAPI.getMonthlyTotal();
        const topProd = await orderAPI.getTopSelling();
        const recentOrders = orders.slice(0, 5);

        const totalValue = orders.reduce(
          (sum: number, o: any) => sum + (o.totalAmount || 0),
          0,
        );

        setStats({
          todaySales: today || 0,
          monthSales: monthly || 0,
          orderCount: orders.length,
          avgOrderValue: orders.length > 0 ? totalValue / orders.length : 0,
          topProducts: topProd || [],
          allOrders: orders,
          recentOrders: recentOrders,
        });
      } catch (err) {
        console.error("Stats load failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const themeClasses = {
    background: isDarkMode ? "bg-gray-900" : "bg-gray-50",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500",
    },
    card: isDarkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-100",
    hover: isDarkMode ? "hover:bg-gray-750" : "hover:bg-gray-50",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            Loading Dashboard...
          </h3>
          <p className={themeClasses.text.muted}>
            Fetching your store statistics
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`text-2xl md:text-3xl font-bold ${themeClasses.text.primary}`}
          >
            Dashboard
          </h2>
          <div className={`text-sm ${themeClasses.text.muted} hidden md:block`}>
            {new Date().toLocaleDateString()}
          </div>
        </div>
        <p className={`${themeClasses.text.secondary} text-sm md:text-base`}>
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {/* Stats Grid - Mobile: 2 columns, Desktop: 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today"
            value={`Ksh ${stats.todaySales.toLocaleString()}`}
            icon={<FaDollarSign className="text-emerald-600" />}
            trend="up"
            color="emerald"
            isDarkMode={isDarkMode}
            compact={true}
          />
          <StatCard
            title="Monthly"
            value={`Ksh ${stats.monthSales.toLocaleString()}`}
            icon={<FaChartBar className="text-blue-600" />}
            trend="up"
            color="blue"
            isDarkMode={isDarkMode}
            compact={true}
          />
          <StatCard
            title="Transactions"
            value={stats.orderCount.toString()}
            icon={<FaShoppingCart className="text-purple-600" />}
            trend="up"
            color="purple"
            isDarkMode={isDarkMode}
            compact={true}
          />
          <StatCard
            title="Avg. Order"
            value={`Ksh ${stats.avgOrderValue.toFixed(0)}`}
            icon={<FaChartLine className="text-amber-600" />}
            trend="down"
            color="amber"
            isDarkMode={isDarkMode}
            compact={true}
          />
        </div>

        {/* Charts and Tables - Mobile: stack, Desktop: side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products - Mobile Optimized */}
          <div
            className={`${themeClasses.card} rounded-xl md:rounded-2xl shadow-lg overflow-hidden flex flex-col`}
          >
            <div
              className={`p-4 md:p-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"} flex-shrink-0`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-base md:text-lg font-semibold ${themeClasses.text.primary}`}
                >
                  Top Products
                </h3>
                <span className="text-xs md:text-sm text-emerald-600 font-medium">
                  This Month
                </span>
              </div>
            </div>
            <div
              className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"} flex-1 overflow-y-auto max-h-[300px] md:max-h-none`}
            >
              {stats.topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={index}
                  className={`p-3 md:p-4 ${themeClasses.hover} transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs md:text-sm">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          className={`font-medium ${themeClasses.text.primary} text-sm md:text-base truncate`}
                        >
                          {product.name}
                        </h4>
                        <p className={`text-xs ${themeClasses.text.muted}`}>
                          {product.quantitySold} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p
                        className={`font-semibold ${themeClasses.text.primary} text-sm md:text-base`}
                      >
                        Ksh {product.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-emerald-600 font-medium">
                        Revenue
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SalesTrendsCard
            orders={stats.allOrders}
            isDarkMode={isDarkMode}
            themeClasses={themeClasses}
          />
        </div>
      </div>
    </section>
  );
}

function SalesTrendsCard({
  orders,
  isDarkMode,
  themeClasses,
}: {
  orders: any[];
  isDarkMode: boolean;
  themeClasses: any;
}) {
  const [mode, setMode] = useState<"daily" | "weekly" | "monthly">("daily");
  const [weekIndex, setWeekIndex] = useState(0);
  const [monthIndex, setMonthIndex] = useState(0);

  const mondayOf = (input: Date) => {
    const date = new Date(input);
    const day = (date.getDay() + 6) % 7;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - day);
    return date;
  };

  const endOfDay = (input: Date) => {
    const date = new Date(input);
    date.setHours(23, 59, 59, 999);
    return date;
  };

  const monthKeyOf = (input: Date) =>
    `${input.getFullYear()}-${String(input.getMonth() + 1).padStart(2, "0")}`;

  const parsedOrders = useMemo(
    () =>
      orders
        .map((o) => ({
          ...o,
          _date: new Date(o.createdAt),
          _value: o.totalAmount || 0,
        }))
        .filter((o) => !Number.isNaN(o._date.getTime()))
        .sort((a, b) => a._date.getTime() - b._date.getTime()),
    [orders],
  );

  const monthKeys = useMemo(
    () =>
      Array.from(new Set(parsedOrders.map((o) => monthKeyOf(o._date)))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [parsedOrders],
  );

  const allWeeks = useMemo(() => {
    const weekMap = new Map<
      string,
      {
        key: string;
        start: Date;
        end: Date;
        totalsByDay: number[];
        total: number;
      }
    >();

    parsedOrders.forEach((order) => {
      const weekStart = mondayOf(order._date);
      const weekKey = weekStart.toISOString().slice(0, 10);
      if (!weekMap.has(weekKey)) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekMap.set(weekKey, {
          key: weekKey,
          start: weekStart,
          end: weekEnd,
          totalsByDay: [0, 0, 0, 0, 0, 0, 0],
          total: 0,
        });
      }

      const bucket = weekMap.get(weekKey)!;
      const dayIndex = (order._date.getDay() + 6) % 7;
      bucket.totalsByDay[dayIndex] += order._value;
      bucket.total += order._value;
    });

    return Array.from(weekMap.values()).sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    );
  }, [parsedOrders]);

  useEffect(() => {
    if (allWeeks.length > 0) {
      setWeekIndex(allWeeks.length - 1);
    }
  }, [allWeeks.length]);

  useEffect(() => {
    if (monthKeys.length > 0) {
      setMonthIndex(monthKeys.length - 1);
    }
  }, [monthKeys.length]);

  const getWeekNumberInMonth = (weekStart: Date) => {
    const firstDay = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
    const firstMonday = mondayOf(firstDay);
    const diffDays = Math.floor(
      (weekStart.getTime() - firstMonday.getTime()) / (24 * 60 * 60 * 1000),
    );
    return Math.floor(diffDays / 7) + 1;
  };

  const currentWeek = allWeeks[weekIndex];
  const activeMonthKey = monthKeys[monthIndex] || "";

  const weeklySeries = useMemo(() => {
    if (!activeMonthKey) return { labels: [] as string[], values: [] as number[] };

    const [yearStr, monthStr] = activeMonthKey.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr) - 1;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstMonday = mondayOf(firstDay);

    const labels: string[] = [];
    const values: number[] = [];
    const cursor = new Date(firstMonday);
    let wk = 1;

    while (cursor <= lastDay) {
      const weekStart = new Date(cursor);
      const weekEnd = new Date(cursor);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const total = parsedOrders
        .filter((o) => {
          const inMonth = monthKeyOf(o._date) === activeMonthKey;
          return inMonth && o._date >= weekStart && o._date <= endOfDay(weekEnd);
        })
        .reduce((sum, o) => sum + o._value, 0);

      labels.push(`Wk ${wk}`);
      values.push(total);

      wk += 1;
      cursor.setDate(cursor.getDate() + 7);
    }

    return { labels, values };
  }, [activeMonthKey, parsedOrders]);

  const monthlySeries = useMemo(() => {
    const labels = monthKeys.map((key) => {
      const [yearStr, monthStr] = key.split("-");
      const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
      return date.toLocaleDateString([], { month: "short" });
    });

    const values = monthKeys.map((key) =>
      parsedOrders
        .filter((o) => monthKeyOf(o._date) === key)
        .reduce((sum, o) => sum + o._value, 0),
    );

    return { labels, values };
  }, [monthKeys, parsedOrders]);

  const dailyLabels = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const chartLabels =
    mode === "daily"
      ? dailyLabels
      : mode === "weekly"
        ? weeklySeries.labels
        : monthlySeries.labels;

  const chartValues =
    mode === "daily"
      ? currentWeek?.totalsByDay || [0, 0, 0, 0, 0, 0, 0]
      : mode === "weekly"
        ? weeklySeries.values
        : monthlySeries.values;

  const peakValue = chartValues.length > 0 ? Math.max(...chartValues) : 0;
  const peakIndex = chartValues.findIndex((v) => v === peakValue);
  const peakLabel =
    peakIndex >= 0 && chartLabels[peakIndex] ? chartLabels[peakIndex] : "N/A";

  const formatMoney = (value: number) =>
    `Ksh ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const dailyPeriodLabel = currentWeek
    ? `Wk ${getWeekNumberInMonth(currentWeek.start)} · Mon ${currentWeek.start.getDate()} – Sun ${currentWeek.end.getDate()} ${currentWeek.end.toLocaleDateString([], {
        month: "short",
        year: "numeric",
      })}`
    : "No week data";

  const weeklyPeriodLabel = activeMonthKey
    ? (() => {
        const [yearStr, monthStr] = activeMonthKey.split("-");
        const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
        return `${date.toLocaleDateString([], { month: "long", year: "numeric" })} — weeks`;
      })()
    : "No month data";

  const canGoPrev =
    mode === "daily" ? weekIndex > 0 : mode === "weekly" ? monthIndex > 0 : false;
  const canGoNext =
    mode === "daily"
      ? weekIndex < allWeeks.length - 1
      : mode === "weekly"
        ? monthIndex < monthKeys.length - 1
        : false;

  const footerText =
    mode === "daily"
      ? "Daily totals for the selected week"
      : mode === "weekly"
        ? "Weekly totals for the selected month"
        : "Monthly totals across available data";

  return (
    <div
      className={`${themeClasses.card} rounded-xl md:rounded-2xl shadow-lg overflow-hidden flex flex-col min-h-[420px] max-[360px]:min-h-[390px]`}
    >
      <div
        className={`p-4 md:p-6 max-[360px]:p-3 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"} flex-shrink-0 space-y-3 max-[360px]:space-y-2`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className={`text-base md:text-lg max-[360px]:text-sm font-semibold ${themeClasses.text.primary}`}>
            Sales trends
          </h3>
          <div className="w-full sm:w-auto overflow-x-auto">
            <div className="inline-flex min-w-max rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {([
                ["daily", "Daily"],
                ["weekly", "Weekly"],
                ["monthly", "Monthly"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  className={`px-3 py-1.5 max-[360px]:px-2.5 max-[360px]:py-1 text-xs md:text-sm max-[360px]:text-[11px] font-medium transition-colors ${
                    mode === value
                      ? "bg-emerald-500 text-white"
                      : `${themeClasses.text.secondary} ${isDarkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"}`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {mode !== "monthly" && (
          <div className="flex items-center justify-between gap-1.5 max-[360px]:gap-1">
            <button
              onClick={() => {
                if (mode === "daily") {
                  setWeekIndex((prev) => Math.max(0, prev - 1));
                } else {
                  setMonthIndex((prev) => Math.max(0, prev - 1));
                }
              }}
              disabled={!canGoPrev}
              className={`p-2 rounded-lg transition-colors ${
                canGoPrev
                  ? `${themeClasses.text.secondary} ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`
                  : `${themeClasses.text.muted} opacity-40 cursor-not-allowed`
              }`}
            >
              <FaChevronLeft size={14} />
            </button>

            <p
              className={`flex-1 text-center px-2 max-[360px]:px-1 text-xs md:text-sm max-[360px]:text-[11px] font-medium ${themeClasses.text.primary} truncate`}
              title={mode === "daily" ? dailyPeriodLabel : weeklyPeriodLabel}
            >
              {mode === "daily" ? dailyPeriodLabel : weeklyPeriodLabel}
            </p>

            <button
              onClick={() => {
                if (mode === "daily") {
                  setWeekIndex((prev) => Math.min(allWeeks.length - 1, prev + 1));
                } else {
                  setMonthIndex((prev) => Math.min(monthKeys.length - 1, prev + 1));
                }
              }}
              disabled={!canGoNext}
              className={`p-2 rounded-lg transition-colors ${
                canGoNext
                  ? `${themeClasses.text.secondary} ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`
                  : `${themeClasses.text.muted} opacity-40 cursor-not-allowed`
              }`}
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-[240px] max-[360px]:min-h-[210px] p-3 sm:p-4 md:p-6 max-[360px]:p-2.5 pt-1 sm:pt-2">
        <div className="h-full overflow-x-auto">
          <div className="h-full min-w-[620px] max-[420px]:min-w-[560px] max-[360px]:min-w-[520px] sm:min-w-0">
          <Line
            data={{
              labels: chartLabels,
              datasets: [
                {
                  data: chartValues,
                  borderColor: "#22c55e",
                  borderWidth: 2,
                  tension: 0.35,
                  fill: true,
                  backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) {
                      return "rgba(34, 197, 94, 0.2)";
                    }
                    const gradient = ctx.createLinearGradient(
                      0,
                      chartArea.top,
                      0,
                      chartArea.bottom,
                    );
                    gradient.addColorStop(0, "rgba(34, 197, 94, 0.38)");
                    gradient.addColorStop(1, "rgba(34, 197, 94, 0)");
                    return gradient;
                  },
                  pointRadius: (context) =>
                    context.dataIndex === peakIndex ? 6 : 3,
                  pointHoverRadius: (context) =>
                    context.dataIndex === peakIndex ? 7 : 4,
                  pointBackgroundColor: "#22c55e",
                  pointBorderColor: (context) =>
                    context.dataIndex === peakIndex ? "#ffffff" : "#22c55e",
                  pointBorderWidth: (context) =>
                    context.dataIndex === peakIndex ? 2 : 1,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    title: (items) => items[0]?.label || "",
                    label: (item) => formatMoney(item.parsed.y || 0),
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: isDarkMode ? "#9ca3af" : "#6b7280",
                    maxRotation: mode === "daily" ? 0 : 20,
                    minRotation: 0,
                    autoSkip: mode === "monthly",
                    maxTicksLimit: mode === "monthly" ? 8 : undefined,
                    padding: 6,
                    font: {
                      size: 11,
                    },
                  },
                  grid: {
                    display: false,
                  },
                },
                y: {
                  ticks: {
                    color: isDarkMode ? "#9ca3af" : "#6b7280",
                    callback: (value) => `Ksh ${Number(value).toLocaleString()}`,
                    maxTicksLimit: 5,
                    font: {
                      size: 11,
                    },
                  },
                  grid: {
                    color: isDarkMode
                      ? "rgba(75, 85, 99, 0.35)"
                      : "rgba(229, 231, 235, 0.9)",
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
          </div>
        </div>
      </div>

      <div
        className={`px-4 md:px-6 max-[360px]:px-3 py-3 max-[360px]:py-2.5 border-t ${isDarkMode ? "border-gray-700" : "border-gray-100"} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1`}
      >
        <span className={`text-xs md:text-sm max-[360px]:text-[11px] ${themeClasses.text.secondary}`}>
          {footerText}
        </span>
        <span className="text-xs md:text-sm max-[360px]:text-[11px] font-semibold text-emerald-500 break-all sm:break-normal">
          Peak: {peakLabel} · {formatMoney(peakValue)}
        </span>
      </div>
    </div>
  );
}

// Reusable Stat Card Component - Mobile Optimized
function StatCard({
  title,
  value,
  icon,
  trend,
  color,
  isDarkMode,
  compact = false,
}: any) {
  const colorClasses = {
    emerald: "from-emerald-500 to-teal-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-violet-500",
    amber: "from-amber-500 to-orange-500",
  };

  const themeClasses = {
    background: isDarkMode ? "bg-gray-800" : "bg-white",
    border: isDarkMode ? "border-gray-700" : "border-gray-100",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500",
    },
    iconBg: isDarkMode ? "bg-gray-700" : "bg-white",
  };

  return (
    <div
      className={`${themeClasses.background} ${themeClasses.border} rounded-xl md:rounded-2xl shadow-lg p-3 md:p-4 lg:p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300`}
    >
      {/* Gradient Background Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
      ></div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2 md:mb-3 lg:mb-4">
          <div
            className={`p-2 md:p-3 rounded-lg md:rounded-xl ${themeClasses.iconBg} shadow-sm ${themeClasses.border}`}
          >
            <span className="text-sm md:text-base lg:text-lg">{icon}</span>
          </div>
          <div
            className={`flex items-center space-x-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-medium ${
              trend === "up"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {trend === "up" ? (
              <FaArrowUp className="w-2 h-2 md:w-3 md:h-3" />
            ) : (
              <FaArrowDown className="w-2 h-2 md:w-3 md:h-3" />
            )}
          </div>
        </div>

        <div>
          <p
            className={`${themeClasses.text.secondary} text-xs md:text-sm font-medium mb-1`}
          >
            {title}
          </p>
          <h3
            className={`text-lg md:text-xl lg:text-2xl font-bold ${themeClasses.text.primary} truncate`}
          >
            {compact ? value : value}
          </h3>
        </div>
      </div>
    </div>
  );
}

// --- Orders Section (Mobile Optimized) ---
function OrdersSection({ isDarkMode }: { isDarkMode: boolean }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderAPI.getAll();
        setOrders(data);
      } catch (err) {
        console.error("Order fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id?.toString().includes(searchTerm) ||
      order.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const getMonthKey = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  const monthOptions = Array.from(
    new Set(filteredOrders.map((order) => getMonthKey(order.createdAt))),
  ).sort((a, b) => b.localeCompare(a));

  useEffect(() => {
    if (monthOptions.length === 0) {
      if (selectedMonth !== "") {
        setSelectedMonth("");
      }
      return;
    }

    if (!selectedMonth || !monthOptions.includes(selectedMonth)) {
      setSelectedMonth(monthOptions[0]);
      setSelectedWeekIndex(0);
      setExpandedDays({});
    }
  }, [monthOptions, selectedMonth]);

  const getWeeksForMonth = (monthKey: string) => {
    if (!monthKey) return [] as {
      key: string;
      start: Date;
      end: Date;
      label: string;
    }[];

    const [yearStr, monthStr] = monthKey.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;

    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

    const firstMonday = new Date(firstDayOfMonth);
    const mondayOffset = (firstMonday.getDay() + 6) % 7;
    firstMonday.setDate(firstMonday.getDate() - mondayOffset);

    const weeks: { key: string; start: Date; end: Date; label: string }[] = [];
    const cursor = new Date(firstMonday);
    let weekNumber = 1;

    while (cursor <= lastDayOfMonth) {
      const start = new Date(cursor);
      const end = new Date(cursor);
      end.setDate(end.getDate() + 6);

      weeks.push({
        key: `${monthKey}-wk-${weekNumber}`,
        start,
        end,
        label: `Wk ${weekNumber} · Mon ${start.getDate()} – Sun ${end.getDate()}`,
      });

      cursor.setDate(cursor.getDate() + 7);
      weekNumber += 1;
    }

    return weeks;
  };

  const weeksInSelectedMonth = getWeeksForMonth(selectedMonth);

  useEffect(() => {
    if (selectedWeekIndex >= weeksInSelectedMonth.length) {
      setSelectedWeekIndex(0);
      setExpandedDays({});
    }
  }, [selectedWeekIndex, weeksInSelectedMonth.length]);

  const activeWeek = weeksInSelectedMonth[selectedWeekIndex];

  const endOfDay = (date: Date) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const toDayKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const weekOrders = activeWeek
    ? paginatedOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          getMonthKey(orderDate) === selectedMonth &&
          orderDate >= activeWeek.start &&
          orderDate <= endOfDay(activeWeek.end)
        );
      })
    : [];

  const weekTotal = weekOrders.reduce(
    (sum: number, order: any) => sum + (order.totalAmount || 0),
    0,
  );
  const weekTransactions = weekOrders.length;
  const weekAverage = weekTransactions > 0 ? weekTotal / weekTransactions : 0;

  const weekDays = activeWeek
    ? Array.from({ length: 7 }, (_, index) => {
        const dayDate = new Date(activeWeek.start);
        dayDate.setDate(dayDate.getDate() + index);

        const dayOrders = weekOrders.filter((order) =>
          isSameDay(new Date(order.createdAt), dayDate),
        );
        const dayTotal = dayOrders.reduce(
          (sum: number, order: any) => sum + (order.totalAmount || 0),
          0,
        );

        return {
          key: toDayKey(dayDate),
          date: dayDate,
          orders: dayOrders,
          total: dayTotal,
        };
      })
    : [];

  const themeClasses = {
    background: isDarkMode ? "bg-gray-800" : "bg-white",
    border: isDarkMode ? "border-gray-700" : "border-gray-100",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500",
    },
    input: isDarkMode
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-emerald-500 focus:border-emerald-500"
      : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500",
    headerBg: isDarkMode ? "bg-gray-750" : "bg-gray-50",
    hover: isDarkMode ? "hover:bg-gray-750" : "hover:bg-gray-50",
    subtleBg: isDarkMode ? "bg-gray-700/50" : "bg-gray-50",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            Loading Transactions...
          </h3>
          <p className={themeClasses.text.muted}>Fetching your order history</p>
        </div>
      </div>
    );
  }

  return (
    <section className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`text-2xl md:text-3xl font-bold ${themeClasses.text.primary}`}
          >
            Transactions
          </h2>
        </div>
        <p
          className={`${themeClasses.text.secondary} text-sm md:text-base mb-4`}
        >
          View and manage all customer transactions
        </p>

        {/* Controls Bar */}
        <div
          className={`${themeClasses.background} ${themeClasses.border} rounded-2xl shadow-sm p-3 md:p-4 max-[360px]:p-2.5 flex flex-col lg:flex-row lg:items-start xl:items-center gap-3 max-[360px]:gap-2`}
        >
          <div className="relative w-full lg:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className={themeClasses.text.muted} />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full pl-10 pr-4 max-[360px]:pl-9 max-[360px]:pr-3 py-2.5 max-[360px]:py-2 rounded-lg focus:ring-2 ${themeClasses.input} text-sm md:text-base max-[360px]:text-xs`}
            />
          </div>

          <div className="w-full sm:w-64 lg:w-56 xl:w-64">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedWeekIndex(0);
                setExpandedDays({});
              }}
              className={`w-full rounded-lg px-3 max-[360px]:px-2.5 py-2.5 max-[360px]:py-2 focus:ring-2 ${themeClasses.input} text-sm md:text-base max-[360px]:text-xs`}
            >
              {monthOptions.map((monthKey) => {
                const [yearStr, monthStr] = monthKey.split("-");
                const monthDate = new Date(Number(yearStr), Number(monthStr) - 1, 1);
                return (
                  <option key={monthKey} value={monthKey}>
                    {monthDate.toLocaleDateString([], {
                      month: "long",
                      year: "numeric",
                    })}
                  </option>
                );
              })}
              {monthOptions.length === 0 && <option value="">No months</option>}
            </select>
          </div>

          <div className="w-full lg:flex-1 overflow-x-auto pb-1 -mb-1">
            <div className="flex items-center gap-2 min-w-max">
              {weeksInSelectedMonth.map((week, index) => (
                <button
                  key={week.key}
                  onClick={() => {
                    setSelectedWeekIndex(index);
                    setExpandedDays({});
                  }}
                  className={`px-3 py-2 max-[360px]:px-2.5 max-[360px]:py-1.5 rounded-lg text-xs md:text-sm max-[360px]:text-[11px] font-medium whitespace-nowrap border transition-colors ${
                    selectedWeekIndex === index
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : `${themeClasses.text.secondary} ${themeClasses.border} ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`
                  }`}
                >
                  {week.label}
                </button>
              ))}
              {weeksInSelectedMonth.length === 0 && (
                <span className={`text-sm ${themeClasses.text.muted} px-2`}>
                  No weeks available
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Week Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-[360px]:gap-2 mb-4">
        <div
          className={`${themeClasses.background} ${themeClasses.border} rounded-xl p-4 max-[360px]:p-3 shadow-sm`}
        >
          <p className={`text-xs max-[360px]:text-[10px] uppercase tracking-wide ${themeClasses.text.muted}`}>
            Week Total
          </p>
          <p className={`text-xl max-[360px]:text-lg font-bold mt-1 ${themeClasses.text.primary}`}>
            Ksh {weekTotal.toFixed(2)}
          </p>
        </div>
        <div
          className={`${themeClasses.background} ${themeClasses.border} rounded-xl p-4 max-[360px]:p-3 shadow-sm`}
        >
          <p className={`text-xs max-[360px]:text-[10px] uppercase tracking-wide ${themeClasses.text.muted}`}>
            Transactions
          </p>
          <p className={`text-xl max-[360px]:text-lg font-bold mt-1 ${themeClasses.text.primary}`}>
            {weekTransactions}
          </p>
        </div>
        <div
          className={`${themeClasses.background} ${themeClasses.border} rounded-xl p-4 max-[360px]:p-3 shadow-sm`}
        >
          <p className={`text-xs max-[360px]:text-[10px] uppercase tracking-wide ${themeClasses.text.muted}`}>
            Avg per Order
          </p>
          <p className={`text-xl max-[360px]:text-lg font-bold mt-1 ${themeClasses.text.primary}`}>
            Ksh {weekAverage.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Day Accordions */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 max-[360px]:space-y-2 pr-1">
        {weekDays.map((day) => {
          const isExpanded = !!expandedDays[day.key];

          return (
            <div
              key={day.key}
              className={`${themeClasses.background} ${themeClasses.border} rounded-xl shadow-sm overflow-hidden`}
            >
              <button
                onClick={() =>
                  setExpandedDays((prev) => ({
                    ...prev,
                    [day.key]: !prev[day.key],
                  }))
                }
                className={`w-full px-4 py-3 md:px-5 md:py-4 max-[360px]:px-3 max-[360px]:py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-[360px]:gap-2 text-left ${themeClasses.hover}`}
              >
                <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm sm:text-base max-[360px]:text-xs ${themeClasses.text.primary}`}>
                      {day.date.toLocaleDateString([], { weekday: "long" })}
                    </p>
                    <p className={`text-xs max-[360px]:text-[10px] ${themeClasses.text.muted}`}>
                      {day.date.toLocaleDateString([], {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 w-full sm:w-auto">
                  <div className="text-right">
                    <p className={`text-xs max-[360px]:text-[10px] ${themeClasses.text.muted}`}>
                      Transactions
                    </p>
                    <p className={`font-semibold text-sm max-[360px]:text-xs ${themeClasses.text.primary}`}>
                      {day.orders.length}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs max-[360px]:text-[10px] ${themeClasses.text.muted}`}>Day Total</p>
                    <p className={`font-semibold text-sm max-[360px]:text-xs ${themeClasses.text.primary}`}>
                      Ksh {day.total.toFixed(2)}
                    </p>
                  </div>
                  <FaChevronRight
                    className={`transition-transform ${themeClasses.text.muted} ${isExpanded ? "rotate-90" : ""} flex-shrink-0`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div
                  className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                      <thead className={themeClasses.headerBg}>
                        <tr>
                          <th
                            className={`text-left py-3 px-4 text-xs md:text-sm font-semibold ${themeClasses.text.secondary}`}
                          >
                            Order ID
                          </th>
                          <th
                            className={`text-left py-3 px-4 text-xs md:text-sm font-semibold ${themeClasses.text.secondary}`}
                          >
                            Date & Time
                          </th>
                          <th
                            className={`text-left py-3 px-4 text-xs md:text-sm font-semibold ${themeClasses.text.secondary}`}
                          >
                            Payment Method
                          </th>
                          <th
                            className={`text-left py-3 px-4 text-xs md:text-sm font-semibold ${themeClasses.text.secondary}`}
                          >
                            Items
                          </th>
                          <th
                            className={`text-left py-3 px-4 text-xs md:text-sm font-semibold ${themeClasses.text.secondary}`}
                          >
                            Total Amount
                          </th>
                          <th
                            className={`text-left py-3 px-4 text-xs md:text-sm font-semibold ${themeClasses.text.secondary}`}
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}
                      >
                        {day.orders.map((order) => (
                          <tr key={order.id} className={themeClasses.hover}>
                            <td className="py-3 px-4">
                              <div
                                className={`font-semibold ${themeClasses.text.primary}`}
                              >
                                #{order.id}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className={themeClasses.text.primary}>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                              <div className={`text-sm ${themeClasses.text.muted}`}>
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                                  isDarkMode
                                    ? "bg-blue-900/30 text-blue-300"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {order.paymentMethod}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div
                                className={`font-medium ${themeClasses.text.primary}`}
                              >
                                {order.orderItems?.length || 0} items
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div
                                className={`font-bold ${themeClasses.text.primary}`}
                              >
                                Ksh {order.totalAmount?.toFixed(2)}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                                  order.status === "COMPLETED"
                                    ? isDarkMode
                                      ? "bg-emerald-900/30 text-emerald-300"
                                      : "bg-emerald-50 text-emerald-700"
                                    : isDarkMode
                                      ? "bg-amber-900/30 text-amber-300"
                                      : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {order.status}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {day.orders.length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <p className={themeClasses.text.secondary}>
                        No transactions for this day
                      </p>
                    </div>
                  )}

                  <div
                    className={`px-4 py-3 max-[360px]:px-3 max-[360px]:py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs sm:text-sm max-[360px]:text-[11px] ${themeClasses.subtleBg}`}
                  >
                    <span className={themeClasses.text.secondary}>
                      {day.date.toLocaleDateString([], {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className={`font-semibold ${themeClasses.text.primary}`}>
                      Day Total: Ksh {day.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {weekDays.length === 0 && (
          <div
            className={`${themeClasses.background} ${themeClasses.border} rounded-xl p-10 text-center`}
          >
            <h3 className={`text-lg font-medium ${themeClasses.text.primary}`}>
              No orders found
            </h3>
            <p className={`mt-2 ${themeClasses.text.secondary}`}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div
          className={`flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-[360px]:gap-2 px-4 py-3 max-[360px]:px-3 max-[360px]:py-2.5 mt-4 rounded-xl ${themeClasses.background} border ${themeClasses.border}`}
        >
          <p className={`text-sm max-[360px]:text-xs ${themeClasses.text.secondary}`}>
            Page{" "}
            <span className={`font-semibold ${themeClasses.text.primary}`}>
              {currentPage}
            </span>{" "}
            of{" "}
            <span className={`font-semibold ${themeClasses.text.primary}`}>
              {totalPages}
            </span>
            <span className="ml-2 text-xs">
              ({filteredOrders.length} total)
            </span>
          </p>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? `${themeClasses.text.muted} cursor-not-allowed opacity-40`
                  : `${themeClasses.text.secondary} ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`
              }`}
            >
              <FaChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
              )
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                  acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className={`text-sm ${themeClasses.text.muted} px-1`}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                      currentPage === p
                        ? "bg-emerald-500 text-white"
                        : `${themeClasses.text.secondary} ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? `${themeClasses.text.muted} cursor-not-allowed opacity-40`
                  : `${themeClasses.text.secondary} ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`
              }`}
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// --- Inventory Section (Mobile Optimized) ---
function InventorySection({ isDarkMode }: { isDarkMode: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    item: any;
  }>({
    isOpen: false,
    item: null,
  });

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inventoryAPI.getAll();
      setItems(data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.product?.code?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "low" && item.quantity < 10) ||
      (filter === "weighed" && item.product?.type === "WEIGHED") ||
      (filter === "fixed" && item.product?.type === "FIXED");

    return matchesSearch && matchesFilter;
  });

  async function handleAdd(formData: any) {
    let cleanCode = formData.code;
    if (
      formData.type === "WEIGHED" &&
      cleanCode.length === 13 &&
      cleanCode.startsWith("20")
    ) {
      cleanCode = cleanCode.substring(2, 7);
    }
    try {
      const productData = {
        name: formData.name,
        code: cleanCode,
        type: formData.type,
        sellingPrice: parseFloat(formData.price),
        pricePerKg:
          formData.type === "WEIGHED" ? parseFloat(formData.price) : null,
      };

      const product = await productAPI.create(productData);
      await inventoryAPI.create({
        productId: product.id,
        quantity: parseFloat(formData.stock),
      });
      loadInventory();
      setShowAdd(false);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  }

  async function handleEdit(updatedData: any) {
    try {
      await inventoryAPI.update(updatedData.inventoryId, {
        quantity: parseFloat(updatedData.stock),
      });
      await productAPI.update(updatedData.productId, {
        name: updatedData.name,
        code: updatedData.code,
        sellingPrice: parseFloat(updatedData.price),
        type: updatedData.type,
      });
      loadInventory();
      setShowEdit(null);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  }

  async function handleDelete(item: any) {
    try {
      setLoading(true);
      // First delete the inventory item
      await inventoryAPI.delete(item.id);
      // Then delete the associated product
      await productAPI.delete(item.product?.id);
      // Refresh the inventory list
      await loadInventory();
    } catch (err: any) {
      console.error(`Delete failed: ${err.message}`);
      await loadInventory();
    } finally {
      setLoading(false);
    }
  }

  const themeClasses = {
    background: isDarkMode ? "bg-gray-800" : "bg-white",
    border: isDarkMode ? "border-gray-700" : "border-gray-100",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500",
    },
    input: isDarkMode
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-emerald-500 focus:border-emerald-500"
      : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500",
    hover: isDarkMode ? "hover:bg-gray-750" : "hover:bg-gray-50",
    card: isDarkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            Loading Inventory...
          </h3>
          <p className={themeClasses.text.muted}>
            Fetching your product catalog
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`text-2xl md:text-3xl font-bold ${themeClasses.text.primary}`}
          >
            Inventory
          </h2>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 md:px-5 md:py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
          >
            <FaPlus className="mr-2" />
            <span className="hidden md:inline">Add New Product</span>
            <span className="md:hidden">Add</span>
          </button>
        </div>
        <p
          className={`${themeClasses.text.secondary} text-sm md:text-base mb-4`}
        >
          Track and manage your product stock levels
        </p>

        {/* Mobile Search and Filter */}
        <div className="space-y-3 md:space-y-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"></div>
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 md:py-3 rounded-xl focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`flex-1 rounded-xl px-3 py-2.5 md:py-3 focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
            >
              <option value="all">All Items</option>
              <option value="low">Low Stock (&lt; 10)</option>
              <option value="weighed">Weighed Items</option>
              <option value="fixed">Fixed Price Items</option>
            </select>
            <div
              className={`text-sm ${themeClasses.text.secondary} hidden md:flex items-center whitespace-nowrap`}
            >
              <span
                className={`font-semibold ${themeClasses.text.primary} ml-2`}
              >
                {filtered.length}
              </span>
              <span className="ml-1">products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Grid/Cards */}
      <div
        className={`${themeClasses.background} p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg ${themeClasses.border} flex-1 overflow-y-auto`}
      >
        {filtered.length === 0 ? (
          <div className="text-center py-12 h-full flex items-center justify-center">
            <div>
              <div
                className={`text-4xl mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
              >
                📦
              </div>
              <h3
                className={`text-lg font-medium ${themeClasses.text.primary} mb-2`}
              >
                No products found
              </h3>
              <p className={themeClasses.text.secondary}>
                Try adjusting your search or add a new product
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`${themeClasses.card} rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group`}
              >
                {/* Delete Button - Positioned absolutely in the top right */}
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: true, item })}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete product"
                >
                  <FaTrash
                    className="text-red-500 hover:text-red-600"
                    size={16}
                  />
                </button>

                <div className="flex justify-between items-start mb-4 pr-8">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          item.product?.type === "WEIGHED"
                            ? isDarkMode
                              ? "bg-blue-900/30 text-blue-300"
                              : "bg-blue-50 text-blue-700"
                            : isDarkMode
                              ? "bg-purple-900/30 text-purple-300"
                              : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {item.product?.type === "WEIGHED" ? "WEIGHED" : "FIXED"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          item.quantity < 10
                            ? isDarkMode
                              ? "bg-red-900/30 text-red-300"
                              : "bg-red-50 text-red-700"
                            : isDarkMode
                              ? "bg-emerald-900/30 text-emerald-300"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {item.quantity < 10 ? "LOW STOCK" : "IN STOCK"}
                      </span>
                    </div>
                    <h3
                      className={`font-bold ${themeClasses.text.primary} text-base md:text-lg truncate`}
                    >
                      {item.product?.name}
                    </h3>
                    <p
                      className={`${themeClasses.text.muted} text-xs md:text-sm`}
                    >
                      SKU: {item.product?.code}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setShowEdit({
                        inventoryId: item.id,
                        productId: item.product?.id,
                        name: item.product?.name,
                        code: item.product?.code,
                        type: item.product?.type,
                        price: item.product?.sellingPrice,
                        stock: item.quantity,
                      })
                    }
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-2"
                    title="Edit product"
                  >
                    <FaEdit
                      className={
                        isDarkMode
                          ? "text-gray-400 hover:text-emerald-400"
                          : "text-gray-400 hover:text-emerald-600"
                      }
                    />
                  </button>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`${themeClasses.text.secondary} text-sm`}>
                      Price
                    </span>
                    <span
                      className={`font-bold ${themeClasses.text.primary} text-base md:text-lg`}
                    >
                      Ksh {item.product?.sellingPrice?.toFixed(2)}
                      {item.product?.type === "WEIGHED" && (
                        <span
                          className={`text-xs ${themeClasses.text.muted} ml-1`}
                        >
                          /kg
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${themeClasses.text.secondary} text-sm`}>
                      Stock
                    </span>
                    <span
                      className={`font-bold ${themeClasses.text.primary} text-base md:text-lg`}
                    >
                      {item.product?.type === "WEIGHED"
                        ? `${item.quantity.toFixed(3)} kg`
                        : `${item.quantity.toFixed(2)} pcs`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <ConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation({ isOpen: false, item: null })}
          onConfirm={() => handleDelete(deleteConfirmation.item)}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteConfirmation.item?.product?.name}"? This action cannot be undone.`}
          isDarkMode={isDarkMode}
        />
      )}

      {showAdd && (
        <ProductModal
          onClose={() => setShowAdd(false)}
          onSave={handleAdd}
          title="Add Product"
          isDarkMode={isDarkMode}
        />
      )}
      {showEdit && (
        <ProductModal
          onClose={() => setShowEdit(null)}
          onSave={handleEdit}
          product={showEdit}
          title="Edit Product"
          isDarkMode={isDarkMode}
        />
      )}
    </section>
  );
}

// --- Main Layout (Mobile Optimized) ---
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleThemeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      setIsTransitioning(true);
      setActiveTab(tabId);
      setTimeout(() => setIsTransitioning(false), 100);
    }
  };

  const menuItems = [
    { id: "Dashboard", icon: <FaChartLine />, label: "Dashboard" },
    { id: "Inventory", icon: <FaBox />, label: "Inventory" },
    { id: "Orders", icon: <FaReceipt />, label: "Transactions" },
    { id: "Purchases", icon: <FaShoppingBag />, label: "Purchases" },
    { id: "Reports", icon: <FaChartPie />, label: "Reports" },
  ];

  const themeClasses = {
    background: isDarkMode ? "bg-gray-900" : "bg-gray-50",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500",
    },
    border: isDarkMode ? "border-gray-800" : "border-gray-200",
    sidebar: isDarkMode
      ? "bg-gray-900 border-gray-800"
      : "bg-white border-gray-200",
    header: isDarkMode
      ? "bg-gray-900 border-gray-800"
      : "bg-white border-gray-200",
  };

  return (
    <div
      className={`min-h-screen fixed inset-0 overflow-hidden ${themeClasses.background}`}
    >
      {/* Mobile Header */}
      <div
        className={`lg:hidden ${themeClasses.header} border-b px-4 py-3 flex items-center justify-between z-40`}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
          >
            {sidebarOpen ? (
              <FaTimes className={themeClasses.text.primary} />
            ) : (
              <FaBars className={themeClasses.text.primary} />
            )}
          </button>
          <div>
            <h1
              className={`text-lg font-bold ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}
            >
              RETAIL POS
            </h1>
            <p className={`text-xs ${themeClasses.text.muted}`}>{activeTab}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleThemeToggle}
            className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800 text-yellow-300" : "hover:bg-gray-100 text-gray-600"}`}
            title={isDarkMode ? "Light mode" : "Dark mode"}
          >
            {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
          <div className="relative">
            <FaUserCircle
              className={`text-xl ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            />
          </div>
        </div>
      </div>

      <div className="flex h-full pt-[57px] lg:pt-0">
        {/* Sidebar - Mobile Drawer */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 ${themeClasses.sidebar} border-r transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:flex lg:flex-col
          h-full pt-16 lg:pt-0
        `}
        >
          <div
            className={`p-6 border-b ${themeClasses.border} hidden lg:block`}
          >
            <h1
              className={`text-2xl font-bold ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}
            >
              RETAIL POS
            </h1>
            <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
              Administrator Panel
            </p>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${
                      activeTab === item.id
                        ? isDarkMode
                          ? "bg-emerald-900/30 text-emerald-300 font-semibold border border-emerald-800"
                          : "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-semibold border border-emerald-100"
                        : `${themeClasses.text.secondary} ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"}`
                    }
                  `}
                >
                  <span
                    className={`text-lg ${
                      activeTab === item.id
                        ? isDarkMode
                          ? "text-emerald-400"
                          : "text-emerald-600"
                        : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm md:text-base">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className={`p-4 border-t ${themeClasses.border}`}>
            <div className="mb-4 px-4 py-3 hidden lg:block">
              <button
                onClick={handleThemeToggle}
                className={`p-3 rounded-xl ${isDarkMode ? "hover:bg-gray-800 text-yellow-300" : "hover:bg-gray-100 text-gray-600"} transition-colors`}
                title={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              </button>
            </div>
            <div
              className={`flex items-center space-x-3 mb-4 px-4 py-3 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"} rounded-xl`}
            >
              <FaUserCircle
                className={`text-2xl md:text-3xl ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              />
              <div>
                <p
                  className={`font-medium ${themeClasses.text.primary} text-sm md:text-base`}
                >
                  Admin User
                </p>
                <p className={`text-xs ${themeClasses.text.muted}`}>
                  Administrator
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 ${
                isDarkMode
                  ? "text-red-400 bg-red-900/20 hover:bg-red-900/30"
                  : "text-red-600 bg-red-50 hover:bg-red-100"
              } rounded-xl font-medium transition-colors duration-200 text-sm md:text-base`}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-3 md:p-4 lg:p-6 overflow-hidden flex flex-col">
          <div
            className={`flex-1 overflow-hidden transition-opacity duration-200 ${
              isTransitioning ? "opacity-50" : "opacity-100"
            }`}
          >
            {activeTab === "Dashboard" && (
              <DashboardSection isDarkMode={isDarkMode} />
            )}
            {activeTab === "Inventory" && (
              <InventorySection isDarkMode={isDarkMode} />
            )}
            {activeTab === "Orders" && (
              <OrdersSection isDarkMode={isDarkMode} />
            )}
            {activeTab === "Purchases" && <PurchasesSection isDarkMode={isDarkMode} />}
            {activeTab === "Reports" && <ReportsSection isDarkMode={isDarkMode} />}
          </div>

          {/* Mobile Bottom Navigation - Enhanced Visibility */}
          <div className="lg:hidden mt-4">
            <div
              className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl border ${themeClasses.border}`}
            >
              <div className="flex items-center justify-around p-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`
                      relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 flex-1 mx-1
                      ${
                        activeTab === item.id
                          ? isDarkMode
                            ? "bg-emerald-900 text-emerald-300"
                            : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                          : `${themeClasses.text.secondary} ${isDarkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}`
                      }
                    `}
                  >
                    {/* Active Indicator Dot */}
                    {activeTab === item.id && (
                      <div
                        className={`absolute -top-1 w-2 h-2 rounded-full ${isDarkMode ? "bg-emerald-400" : "bg-white"}`}
                      ></div>
                    )}

                    <span
                      className={`text-xl mb-1 ${
                        activeTab === item.id
                          ? isDarkMode
                            ? "text-emerald-300"
                            : "text-white"
                          : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-600"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        activeTab === item.id
                          ? isDarkMode
                            ? "text-emerald-300"
                            : "text-white"
                          : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-600"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transition Overlay */}
          {isTransitioning && (
            <div
              className={`absolute inset-0 ${isDarkMode ? "bg-gray-900" : "bg-white"} bg-opacity-80 flex items-center justify-center z-10`}
            >
              <div className="text-center">
                <FaSpinner className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-2" />
                <p className={themeClasses.text.secondary}>Loading...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// --- Modal Component (Mobile Optimized) ---
function ProductModal({ onClose, onSave, product, title, isDarkMode }: any) {
  const [form, setForm] = useState(
    product || {
      name: "",
      price: "",
      stock: "",
      code: "",
      type: "FIXED",
    },
  );
  const [loading, setLoading] = useState(false);

  const isWeighed = form.type === "WEIGHED";

  const themeClasses = {
    background: isDarkMode ? "bg-gray-800" : "bg-white",
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500",
    },
    input: isDarkMode
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-emerald-500 focus:border-emerald-500"
      : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500",
    button: isDarkMode
      ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
      : "border-gray-300 text-gray-700 hover:bg-gray-50",
  };

  const handleSubmit = async () => {
    if (!form.code || !form.name || !form.price || !form.stock) {
      alert("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
      <div
        className={`${themeClasses.background} rounded-xl md:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${themeClasses.border}`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 md:p-6 border-b ${themeClasses.border} sticky top-0 ${themeClasses.background}`}
        >
          <div className="flex items-center justify-between">
            <h3
              className={`text-lg md:text-xl font-bold ${themeClasses.text.primary}`}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className={`${themeClasses.text.secondary} hover:${themeClasses.text.primary} transition-colors p-1`}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 space-y-4">
          {/* Product Type */}
          <div>
            <label
              className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}
            >
              Selling Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setForm((prev: any) => ({ ...prev, type: "FIXED" }))
                }
                className={`p-3 md:p-4 rounded-xl border text-center transition-all text-sm md:text-base ${
                  !isWeighed
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold"
                    : `${themeClasses.border} ${themeClasses.text.secondary} ${isDarkMode ? "hover:border-gray-500" : "hover:border-gray-400"}`
                }`}
              >
                Fixed Price
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((prev: any) => ({ ...prev, type: "WEIGHED" }))
                }
                className={`p-3 md:p-4 rounded-xl border text-center transition-all text-sm md:text-base ${
                  isWeighed
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold"
                    : `${themeClasses.border} ${themeClasses.text.secondary} ${isDarkMode ? "hover:border-gray-500" : "hover:border-gray-400"}`
                }`}
              >
                Weighed
              </button>
            </div>
          </div>

          {/* SKU */}
          <div>
            <label
              className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}
            >
              SKU / Product Code
            </label>
            <input
              type="text"
              placeholder="e.g., BEV-001"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className={`w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
            />
          </div>

          {/* Product Name */}
          <div>
            <label
              className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}
            >
              Product Name
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <label
                className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}
              >
                Price {isWeighed && "(per kg)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={`w-full pl-12 pr-3 py-2.5 md:pl-12 md:pr-4 md:py-3 rounded-xl focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
                />
              </div>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}
              >
                Stock {isWeighed && "(kg)"}
              </label>
              <input
                type="number"
                step={isWeighed ? "0.001" : "0.01"}
                placeholder={isWeighed ? "0.000" : "0"}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className={`w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 md:p-6 border-t ${themeClasses.border} sticky bottom-0 ${themeClasses.background}`}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading || !form.code || !form.name}
              className={`
                flex-1 px-4 py-3 md:px-6 md:py-3 rounded-xl font-semibold transition-all duration-200 text-sm md:text-base
                ${
                  loading || !form.code || !form.name
                    ? isDarkMode
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-700 hover:to-teal-600"
                }
              `}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <FaSpinner className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Product"
              )}
            </button>
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-3 md:px-6 md:py-3 rounded-xl font-semibold transition-colors duration-200 text-sm md:text-base ${themeClasses.button}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Confirmation Modal Component ---
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDarkMode,
}: any) {
  if (!isOpen) return null;

  const themeClasses = {
    background: isDarkMode ? "bg-gray-800" : "bg-white",
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
    button: {
      cancel: isDarkMode
        ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
        : "border-gray-300 text-gray-700 hover:bg-gray-50",
      delete:
        "bg-gradient-to-r from-red-600 to-rose-500 text-white hover:from-red-700 hover:to-rose-600",
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`${themeClasses.background} rounded-xl md:rounded-2xl w-full max-w-md ${themeClasses.border}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <FaTrash className="text-red-600" size={20} />
          </div>
          <h3
            className={`text-lg font-bold ${themeClasses.text.primary} text-center mb-2`}
          >
            {title}
          </h3>
          <p className={`${themeClasses.text.secondary} text-center mb-6`}>
            {message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors duration-200 ${themeClasses.button.cancel}`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${themeClasses.button.delete}`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
