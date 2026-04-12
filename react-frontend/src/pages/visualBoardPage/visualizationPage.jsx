import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, Settings, LogOut } from "lucide-react";

import api from "../../services/api";
import KpiCards from "./KpiCards";
import RevenueLineChart from "./RevenueLineChart";
import CategoryBarChart from "./CategoryBarChart";
import CategoryPieChart from "./CategoryPieChart";
import TopProductsChart from "./TopProductsChart";


function VisualizationPage() {

    const { datasetId } = useParams();
    const navigate = useNavigate();

    // ── all state at the top ──────────────────────────────────────
    const [data, setData]               = useState(null);
    const [user, setUser]               = useState(null);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // ── fetch user + chart data ───────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        // fetch logged-in user
        api.get("/user")
            .then(res => setUser(res.data))
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/login");
            });

        // fetch chart + KPI data
        api.post("/get_chart_details", { dataset_id: datasetId })
            .then(res => {
                setData(res.data.data);   
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });

    }, [datasetId]);

    // ── logout ────────────────────────────────────────────────────
    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            localStorage.removeItem("token");
            navigate("/login");
        } catch (err) {
            console.log(err);
        }
    };

    // ── early returns AFTER all hooks ─────────────────────────────
    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            Error: {error}
        </div>
    );

    // ── safe to destructure now — data is loaded ──────────────────
    const { kpis, revenue_by_month, revenue_by_category, category_share, top_products } = data;

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            <div className="flex h-screen">

                {/* main content */}
                <div className="flex-1 flex flex-col">

                    {/* top bar */}
                    <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold">Visualization</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Dataset #{datasetId}</p>
                        </div>

                        <div className="relative">
                            <div
                                className="flex items-center space-x-2 cursor-pointer"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                {user && <span className="font-medium">{user.name}</span>}
                                <ChevronDown size={18} />
                            </div>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-gray-800 shadow rounded-lg py-2 z-10">
                                    <div className="px-4 py-2 hover:bg-gray-900 cursor-pointer flex items-center space-x-2">
                                        <Settings size={16} />
                                        <span>Settings</span>
                                    </div>
                                    <div
                                        className="px-4 py-2 hover:bg-gray-900 cursor-pointer flex items-center space-x-2 text-red-500"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* scrollable content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* KPI Cards */}
                        <div className="grid grid-cols-4 gap-3">
                            <KpiCards
                                label="Total revenue"
                                value={`Rs ${kpis.total_revenue.toLocaleString()}`}
                                sub="SUM of all sales"
                                iconBg="bg-blue-50"
                                icon={<span className="text-blue-600 text-sm font-bold">Rs</span>}
                            />
                            <KpiCards
                                label="Total orders"
                                value={kpis.total_orders}
                                sub="COUNT of records"
                                iconBg="bg-green-50"
                                icon={<span className="text-green-600 text-sm font-bold">#</span>}
                            />
                            <KpiCards
                                label="Units sold"
                                value={kpis.total_units_sold}
                                sub="SUM(quantity)"
                                iconBg="bg-orange-50"
                                icon={<span className="text-orange-600 text-sm font-bold">Qty</span>}
                            />
                            <KpiCards
                                label="Avg order value"
                                value={`Rs ${kpis.avg_order_value.toLocaleString()}`}
                                sub="SUM / COUNT"
                                iconBg="bg-purple-50"
                                icon={<span className="text-purple-600 text-sm font-bold">Avg</span>}
                            />
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-2 gap-4">
                            <RevenueLineChart data={revenue_by_month} />
                            <CategoryBarChart data={revenue_by_category} />
                            <CategoryPieChart data={category_share} />
                            <TopProductsChart data={top_products} />
                        </div>

                        {/* Highlight KPIs */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center text-green-600 text-lg">★</div>
                            <div>
                                <p className="text-xs text-gray-400">Top category</p>
                                <p className="text-sm font-semibold text-gray-900">{kpis.top_category.name}</p>
                                <p className="text-xs text-gray-500">Rs {kpis.top_category.revenue.toLocaleString()}</p>
                            </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 text-lg">▲</div>
                            <div>
                                <p className="text-xs text-gray-400">Top product</p>
                                <p className="text-sm font-semibold text-gray-900">{kpis.top_product.name}</p>
                                <p className="text-xs text-gray-500">Rs {kpis.top_product.revenue.toLocaleString()}</p>
                            </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 text-lg">◉</div>
                            <div>
                                <p className="text-xs text-gray-400">Best month</p>
                                <p className="text-sm font-semibold text-gray-900">Month {kpis.best_month.month}</p>
                                <p className="text-xs text-gray-500">Rs {kpis.best_month.revenue.toLocaleString()}</p>
                            </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default VisualizationPage;