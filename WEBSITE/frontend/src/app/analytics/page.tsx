"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BarChart3, Download, FileText, Fuel, Percent, TrendingUp, AlertTriangle } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { fetchAnalytics } from "@/utils/api";
import type { AnalyticsData } from "@/types";

export default function AnalyticsPage() {
  const { user, currencySymbol } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetchAnalytics()
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ViAxis System Report\n\n";

    // KPIs
    csvContent += "KEY PERFORMANCE INDICATORS\n";
    csvContent += `Fuel Efficiency,${data.fuel_efficiency} km/L\n`;
    csvContent += `Fleet Utilization,${data.fleet_utilization}%\n`;
    csvContent += `Operational Cost,${currencySymbol}${data.operational_cost}\n`;
    csvContent += `Vehicle ROI,${data.vehicle_roi}%\n\n`;

    // Monthly Revenue
    csvContent += "MONTHLY REVENUE\n";
    csvContent += "Month,Revenue\n";
    data.monthly_revenue.forEach((item) => {
      csvContent += `${item.month},${item.revenue}\n`;
    });
    csvContent += "\n";

    // Top Costliest Vehicles
    csvContent += "TOP COSTLIEST VEHICLES\n";
    csvContent += "Registration Number,Accumulated Cost\n";
    data.top_costliest_vehicles.forEach((item) => {
      csvContent += `${item.registration_no},${item.cost}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `viaxis_analytics_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton rounded" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 skeleton rounded" />
          ))}
        </div>
        <div className="h-64 skeleton rounded" />
      </div>
    );
  }

  if (!data) {
    return <EmptyState title="No analytics data available" />;
  }

  return (
    <div className="space-y-8 print:p-0">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Insightful performance indicators, ROI analysis, and operational cost ranks.
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Download size={16} /> Export CSV
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            <FileText size={16} /> Export PDF (Print)
          </motion.button>
        </div>
      </div>

      {/* PDF Print-Only Header */}
      <div className="hidden print:block border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold">ViAxis — System Report</h1>
        <p className="text-xs text-neutral-500 mt-1">Generated on {new Date().toLocaleString()}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          label="Fuel Efficiency"
          value={data.fuel_efficiency}
          suffix=" km/L"
          icon={Fuel}
        />
        <KpiCard
          label="Fleet Utilization"
          value={data.fleet_utilization}
          suffix="%"
          icon={Percent}
        />
        <KpiCard
          label="Operational Cost"
          value={`${currencySymbol}${data.operational_cost.toLocaleString()}`}
          icon={TrendingUp}
        />
        <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Vehicle ROI
              </p>
              <h3 className="text-2xl font-semibold mt-1">
                {data.vehicle_roi.toFixed(2)}%
              </h3>
              <p className="text-[10px] mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Formula: <code className="px-1 py-0.5 rounded font-mono text-[9px] bg-neutral-200 dark:bg-neutral-800">ROI = (Revenue − (Maint + Fuel)) / Acquisition</code>
              </p>
            </div>
            <div className="p-2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <BarChart3 size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 rounded-lg border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <h2 className="text-sm font-medium mb-6">Monthly Revenue Growth</h2>
          <div className="h-64 w-full">
            {data.monthly_revenue.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
                No completed trip revenue to display.
              </div>
            ) : (
               <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthly_revenue} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${currencySymbol}${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg)",
                      borderColor: "var(--border)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "var(--text)",
                    }}
                    formatter={(value) => [`${currencySymbol}${Number(value).toLocaleString()}`, "Revenue"]}
                  />
                  <Line
                    type="linear"
                    dataKey="revenue"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{ r: 4.5, stroke: "var(--accent)", strokeWidth: 2, fill: "var(--bg)" }}
                    activeDot={{ r: 6.5 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Costliest Vehicles Ranked List */}
        <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <h2 className="text-sm font-medium mb-6">Top Costliest Vehicles</h2>
          <div className="space-y-4">
            {data.top_costliest_vehicles.length === 0 ? (
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                No logs recorded yet.
              </div>
            ) : (
              data.top_costliest_vehicles.map((v, index) => {
                const maxCost = Number(data.top_costliest_vehicles[0]?.cost || 1);
                const percent = Math.max(5, (Number(v.cost) / maxCost) * 100);

                return (
                  <div key={v.registration_no} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{v.registration_no}</span>
                      <span className="font-semibold">{currencySymbol}{Number(v.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{
                          background: index === 0 ? "var(--warning)" : "var(--accent)"
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {data.top_costliest_vehicles.length > 0 && (
            <div className="mt-6 flex items-start gap-2 text-[10px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              <AlertTriangle size={12} className="mt-0.5 shrink-0" style={{ color: "var(--warning)" }} />
              <span>Vehicles high on costs might benefit from standard replacement or in-depth component lifecycle checks.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
