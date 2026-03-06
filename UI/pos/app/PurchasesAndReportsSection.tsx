"use client";

// ============================================================
// 1. ADD THESE IMPORTS to your existing admin page imports:
// ============================================================
// import { purchaseAPI, reportAPI, type PurchaseResponse, type MonthlyReportDto, type ProductProfitDto } from "@/lib/api-service";
// import { FaShoppingBag, FaChartPie, FaTrendingUp, FaArrowUp, FaArrowDown } from "react-icons/fa";

// ============================================================
// 2. ADD "Purchases" and "Reports" to your menuItems array:
// ============================================================
// const menuItems = [
//   { id: "Dashboard", icon: <FaChartLine />, label: "Dashboard" },
//   { id: "Inventory", icon: <FaBox />, label: "Inventory" },
//   { id: "Orders", icon: <FaReceipt />, label: "Transactions" },
//   { id: "Purchases", icon: <FaShoppingBag />, label: "Purchases" },   // ADD
//   { id: "Reports", icon: <FaChartPie />, label: "Reports" },          // ADD
// ];

// ============================================================
// 3. ADD THESE TO your main content area (where activeTab checks are):
// ============================================================
// {activeTab === "Purchases" && <PurchasesSection isDarkMode={isDarkMode} />}
// {activeTab === "Reports" && <ReportsSection isDarkMode={isDarkMode} />}

// ============================================================
// PURCHASES SECTION
// ============================================================
import {
  FaShoppingBag, FaChartPie, FaPlus, FaSpinner, FaTimes,
  FaArrowUp, FaArrowDown, FaBoxOpen, FaChevronLeft, FaChevronRight,
  FaFilter
} from "react-icons/fa";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { purchaseAPI, reportAPI, productAPI } from "@/lib/api-service";
import type { PurchaseResponse, MonthlyReportDto, ProductProfitDto } from "@/lib/api-service";

const PURCHASES_PER_PAGE = 10;

export function PurchasesSection({ isDarkMode }: { isDarkMode: boolean }) {
  const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [viewAll, setViewAll] = useState(false);

  const theme = useTheme(isDarkMode);

  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const data = viewAll
        ? await purchaseAPI.getAll()
        : await purchaseAPI.getByMonth(
            parseInt(monthFilter.split("-")[0]),
            parseInt(monthFilter.split("-")[1])
          );
      setPurchases(data);
    } catch (err) {
      console.error("Failed to load purchases", err);
    } finally {
      setLoading(false);
    }
  }, [monthFilter, viewAll]);

  useEffect(() => { loadPurchases(); }, [loadPurchases]);

  const totalCost = purchases.reduce((s, p) => s + p.totalCost, 0);
  const totalPages = Math.ceil(purchases.length / PURCHASES_PER_PAGE);
  const paginated = purchases.slice(
    (currentPage - 1) * PURCHASES_PER_PAGE,
    currentPage * PURCHASES_PER_PAGE
  );

  if (loading) return <LoadingSpinner label="Loading Purchases..." isDarkMode={isDarkMode} />;

  return (
    <section className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-2xl md:text-3xl font-bold ${theme.text.primary}`}>Purchases</h2>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-600 transition-all shadow-lg text-sm md:text-base"
          >
            <FaPlus className="mr-2" />
            <span className="hidden md:inline">Record Purchase</span>
            <span className="md:hidden">Add</span>
          </button>
        </div>
        <p className={`${theme.text.secondary} text-sm mb-4`}>
          Log restocks — inventory updates automatically
        </p>

        {/* Summary card */}
        <div className={`${theme.card} rounded-xl p-4 flex items-center justify-between mb-4`}>
          <div>
            <p className={`text-sm ${theme.text.secondary}`}>
              {viewAll ? "All Time Spend" : `Spend in ${monthFilter}`}
            </p>
            <p className={`text-2xl font-bold ${theme.text.primary}`}>
              Ksh {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className={`p-3 rounded-xl bg-emerald-500/10`}>
            <FaShoppingBag className="text-emerald-500 text-2xl" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setViewAll(false); setCurrentPage(1); }}
            disabled={viewAll}
            className={`rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 ${theme.input} ${viewAll ? "opacity-40" : ""}`}
          />
          <button
            onClick={() => { setViewAll(!viewAll); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              viewAll
                ? "bg-emerald-500 text-white"
                : `${theme.card} ${theme.text.secondary} hover:border-emerald-500`
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={`flex-1 min-h-0 flex flex-col ${theme.card} rounded-2xl shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
          <table className="w-full">
            <thead className={`${theme.headerBg} sticky top-0 z-10`}>
              <tr>
                {["Date", "Product", "Qty Bought", "Unit", "Total Cost", "Cost/Unit", "Notes"].map(h => (
                  <th key={h} className={`text-left py-4 px-4 text-sm font-semibold ${theme.text.secondary}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}>
              {paginated.map(p => (
                <tr key={p.id} className={theme.hover}>
                  <td className="py-3 px-4">
                    <div className={`text-sm ${theme.text.primary}`}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                    <div className={`text-xs ${theme.text.muted}`}>
                      {new Date(p.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`font-semibold ${theme.text.primary} text-sm`}>{p.productName}</div>
                    <div className={`text-xs ${theme.text.muted}`}>{p.productCode}</div>
                  </td>
                  <td className={`py-3 px-4 font-medium ${theme.text.primary} text-sm`}>
                    {p.quantityBought}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-50 text-blue-700"}`}>
                      {p.unit}
                    </span>
                  </td>
                  <td className={`py-3 px-4 font-bold ${theme.text.primary} text-sm`}>
                    Ksh {p.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`py-3 px-4 text-sm ${theme.text.secondary}`}>
                    Ksh {p.costPerUnit.toFixed(2)}/{p.unit}
                  </td>
                  <td className={`py-3 px-4 text-sm ${theme.text.muted} max-w-[150px] truncate`}>
                    {p.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginated.length === 0 && (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <FaBoxOpen className={`text-4xl mx-auto mb-3 ${theme.text.muted}`} />
                <p className={`font-medium ${theme.text.primary}`}>No purchases found</p>
                <p className={`text-sm ${theme.text.secondary}`}>Record a restock to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex-shrink-0 flex items-center justify-between px-4 py-3 border-t ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
            <p className={`text-sm ${theme.text.secondary}`}>
              Page <span className={`font-semibold ${theme.text.primary}`}>{currentPage}</span> of{" "}
              <span className={`font-semibold ${theme.text.primary}`}>{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : `${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}`}
              >
                <FaChevronLeft size={13} className={theme.text.secondary} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : `${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}`}
              >
                <FaChevronRight size={13} className={theme.text.secondary} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Purchase Modal */}
      {showAdd && (
        <AddPurchaseModal
          onClose={() => setShowAdd(false)}
          onSave={async () => { await loadPurchases(); setShowAdd(false); }}
          isDarkMode={isDarkMode}
        />
      )}
    </section>
  );
}

// ============================================================
// ADD PURCHASE MODAL
// ============================================================
function AddPurchaseModal({ onClose, onSave, isDarkMode }: {
  onClose: () => void;
  onSave: () => void;
  isDarkMode: boolean;
}) {
  const [form, setForm] = useState({
    productId: "",
    quantityBought: "",
    unit: "kg",
    totalCost: "",
    notes: "",
  });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const theme = useTheme(isDarkMode);

  useEffect(() => {
    const load = async () => {
      try {
        const inv = await (await import("@/lib/api-service")).inventoryAPI.getAll();
        setProducts(inv.map((i: any) => i.product));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, []);

  const costPerUnit = form.quantityBought && form.totalCost
    ? (parseFloat(form.totalCost) / parseFloat(form.quantityBought)).toFixed(2)
    : null;

  const handleSave = async () => {
    if (!form.productId || !form.quantityBought || !form.totalCost) {
      alert("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await purchaseAPI.create({
        productId: parseInt(form.productId),
        quantityBought: parseFloat(form.quantityBought),
        unit: form.unit,
        totalCost: parseFloat(form.totalCost),
        notes: form.notes || undefined,
      });
      onSave();
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className={`${theme.background} rounded-2xl w-full max-w-md shadow-2xl`}>
        {/* Header */}
        <div className={`p-5 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"} flex items-center justify-between`}>
          <h3 className={`text-lg font-bold ${theme.text.primary}`}>Record Purchase</h3>
          <button onClick={onClose} className={theme.text.secondary}><FaTimes /></button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Product */}
          <div>
            <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Product *</label>
            {loadingProducts ? (
              <div className={`${theme.input} rounded-xl px-3 py-3 text-sm`}>Loading products...</div>
            ) : (
              <select
                value={form.productId}
                onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                className={`w-full px-3 py-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 ${theme.input}`}
              >
                <option value="">Select a product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            )}
          </div>

          {/* Qty + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Quantity *</label>
              <input
                type="number"
                step="0.001"
                min="0"
                placeholder="e.g. 10"
                value={form.quantityBought}
                onChange={e => setForm(f => ({ ...f, quantityBought: e.target.value }))}
                className={`w-full px-3 py-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 ${theme.input}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Unit *</label>
              <select
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className={`w-full px-3 py-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 ${theme.input}`}
              >
                <option value="kg">kg</option>
                <option value="pieces">pieces</option>
                <option value="crates">crates</option>
                <option value="bags">bags</option>
                <option value="bunches">bunches</option>
                <option value="boxes">boxes</option>
                <option value="litres">litres</option>
                <option value="other">other</option>
              </select>
            </div>
          </div>

          {/* Total Cost */}
          <div>
            <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Total Cost Paid (Ksh) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 1000"
              value={form.totalCost}
              onChange={e => setForm(f => ({ ...f, totalCost: e.target.value }))}
              className={`w-full px-3 py-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 ${theme.input}`}
            />
            {costPerUnit && (
              <p className="text-xs text-emerald-500 mt-1">
                = Ksh {costPerUnit} per {form.unit}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Notes (optional)</label>
            <input
              type="text"
              placeholder="e.g. Bought from Wakulima market"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className={`w-full px-3 py-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 ${theme.input}`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`p-5 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} flex gap-3`}>
          <button
            onClick={handleSave}
            disabled={loading || !form.productId || !form.quantityBought || !form.totalCost}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              loading || !form.productId || !form.quantityBought || !form.totalCost
                ? `${isDarkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"} cursor-not-allowed`
                : "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-700 hover:to-teal-600"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" /> Saving...
              </span>
            ) : "Save Purchase"}
          </button>
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm ${isDarkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// REPORTS SECTION
// ============================================================
export function ReportsSection({ isDarkMode }: { isDarkMode: boolean }) {
  const [report, setReport] = useState<MonthlyReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"breakdown" | "top" | "loss">("breakdown");
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const theme = useTheme(isDarkMode);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      const [year, month] = monthFilter.split("-").map(Number);
      const data = await reportAPI.getMonthlyReport(year, month);
      setReport(data);
    } catch (err) {
      console.error("Failed to load report", err);
    } finally {
      setLoading(false);
    }
  }, [monthFilter]);

  useEffect(() => { loadReport(); }, [loadReport]);

  if (loading) return <LoadingSpinner label="Generating Report..." isDarkMode={isDarkMode} />;

  const currentList =
    activeTab === "breakdown" ? report?.productBreakdown :
    activeTab === "top" ? report?.topPerformers :
    report?.lossMakers;

  return (
    <section className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-2xl md:text-3xl font-bold ${theme.text.primary}`}>Reports</h2>
          <input
            type="month"
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            className={`rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 ${theme.input}`}
          />
        </div>
        <p className={`${theme.text.secondary} text-sm`}>
          {report?.month} — Profit & loss overview
        </p>
      </div>

      {/* Summary Cards */}
      <div className="flex-shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="Total Revenue"
          value={`Ksh ${(report?.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<FaArrowUp className="text-emerald-500" />}
          color="emerald"
          isDarkMode={isDarkMode}
        />
        <SummaryCard
          label="Total Cost"
          value={`Ksh ${(report?.totalCost ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<FaArrowDown className="text-red-400" />}
          color="red"
          isDarkMode={isDarkMode}
        />
        <SummaryCard
          label="Net Profit"
          value={`Ksh ${(report?.netProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={(report?.netProfit ?? 0) >= 0
            ? <FiTrendingUp className="text-emerald-500" />
            : <FiTrendingDown className="text-red-400" />
          }
          color={(report?.netProfit ?? 0) >= 0 ? "emerald" : "red"}
          isDarkMode={isDarkMode}
        />
        <SummaryCard
          label="Margin"
          value={`${(report?.overallMargin ?? 0).toFixed(1)}%`}
          icon={<FaChartPie className="text-blue-400" />}
          color="blue"
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex-shrink-0 flex gap-2 mb-4">
        {(["breakdown", "top", "loss"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-emerald-500 text-white shadow"
                : `${theme.card} ${theme.text.secondary} hover:border-emerald-500`
            }`}
          >
            {tab === "breakdown" && "All Products"}
            {tab === "top" && `Top Performers (${report?.topPerformers.length ?? 0})`}
            {tab === "loss" && `Loss Making (${report?.lossMakers.length ?? 0})`}
          </button>
        ))}
      </div>

      {/* Profit Table */}
      <div className={`flex-1 min-h-0 flex flex-col ${theme.card} rounded-2xl shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
          <table className="w-full">
            <thead className={`${theme.headerBg} sticky top-0 z-10`}>
              <tr>
                {["Product", "Bought", "Sold", "Total Cost", "Revenue", "Profit", "Margin"].map(h => (
                  <th key={h} className={`text-left py-4 px-4 text-sm font-semibold ${theme.text.secondary}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}>
              {(currentList ?? []).map(p => (
                <tr key={p.productId} className={theme.hover}>
                  <td className="py-3 px-4">
                    <div className={`font-semibold ${theme.text.primary} text-sm`}>{p.productName}</div>
                    <div className={`text-xs ${theme.text.muted}`}>{p.productCode}</div>
                  </td>
                  <td className={`py-3 px-4 text-sm ${theme.text.secondary}`}>
                    {p.totalBought > 0 ? `${p.totalBought} ${p.buyingUnit}` : "—"}
                  </td>
                  <td className={`py-3 px-4 text-sm ${theme.text.secondary}`}>
                    {p.totalSold > 0 ? `${parseFloat(p.totalSold.toFixed(3))} ${p.sellingUnit}` : "—"}
                  </td>
                  <td className={`py-3 px-4 text-sm font-medium ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                    {p.totalCost > 0 ? `Ksh ${p.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                  </td>
                  <td className={`py-3 px-4 text-sm font-medium ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                    Ksh {p.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold text-sm ${p.isLossMaking
                      ? isDarkMode ? "text-red-400" : "text-red-600"
                      : isDarkMode ? "text-emerald-400" : "text-emerald-600"
                    }`}>
                      {p.isLossMaking ? "-" : "+"}Ksh {Math.abs(p.profit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 h-1.5 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"} max-w-[60px]`}>
                        <div
                          className={`h-1.5 rounded-full ${p.isLossMaking ? "bg-red-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(100, Math.abs(p.marginPercent))}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${p.isLossMaking
                        ? isDarkMode ? "text-red-400" : "text-red-600"
                        : isDarkMode ? "text-emerald-400" : "text-emerald-600"
                      }`}>
                        {p.marginPercent.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(currentList ?? []).length === 0 && (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <FaChartPie className={`text-4xl mx-auto mb-3 ${theme.text.muted}`} />
                <p className={`font-medium ${theme.text.primary}`}>No data for this period</p>
                <p className={`text-sm ${theme.text.secondary}`}>
                  {activeTab === "loss" ? "No loss-making products 🎉" : "Try a different month"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SHARED HELPERS
// ============================================================
function useTheme(isDarkMode: boolean) {
  return {
    background: isDarkMode ? "bg-gray-800" : "bg-white",
    card: isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500",
    },
    input: isDarkMode
      ? "bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400"
      : "border border-gray-300 text-gray-900 placeholder-gray-500",
    hover: isDarkMode ? "hover:bg-gray-750" : "hover:bg-gray-50",
    headerBg: isDarkMode ? "bg-gray-900" : "bg-gray-50",
  };
}

function LoadingSpinner({ label, isDarkMode }: { label: string; isDarkMode: boolean }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <FaSpinner className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
        <p className={`text-lg font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>{label}</p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, color, isDarkMode }: {
  label: string; value: string; icon: React.ReactNode; color: string; isDarkMode: boolean;
}) {
  const colorMap: Record<string, string> = {
    emerald: "from-emerald-500/10 to-teal-500/10",
    red: "from-red-500/10 to-rose-500/10",
    blue: "from-blue-500/10 to-cyan-500/10",
  };
  return (
    <div className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} border rounded-xl p-4 relative overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color]} pointer-events-none`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{label}</p>
          <span className="text-lg">{icon}</span>
        </div>
        <p className={`text-lg font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"} truncate`}>{value}</p>
      </div>
    </div>
  );
}