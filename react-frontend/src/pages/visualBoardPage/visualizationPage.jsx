import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../../services/api";
import KpiCards from "./KpiCards";
import RevenueLineChart from "./RevenueLineChart";
import CategoryBarChart from "./CategoryBarChart";
import CategoryPieChart from "./CategoryPieChart";
import TopProductsChart from "./TopProductsChart";
import ChatPanel from "./ChatPanel";

import {
    LayoutDashboard,
    BarChart3,
    FileText,
    ChevronDown, 
    Settings, 
    LogOut, 
    TrendingUp, 
    Package, 
    AlertTriangle, 
    Lightbulb ,
    MessageSquare 
} from "lucide-react";


// this for summary card
function SummaryCard({label, icon, text, colorClasses}){
    return (
        <div className={`rounded-xl border p-4 transition-all duration-200 ${colorClasses.wrapper}`}>
            <div className="flex items-center gap-2 mb-2">
                <span className={colorClasses.icon}>{icon}</span>
                 <span className={`text-xs font-semibold tracking-widest uppercase ${colorClasses.label}`}>
                    {label}
                </span>
            </div>
            <p className={`text-sm leading-relaxed ${colorClasses.text}`}>{text}</p>
        </div>
    )
}

const COLORS = {
    purple: {
        wrapper: "border-purple-500/40 bg-purple-500/10",
        icon:    "text-purple-400",
        label:   "text-purple-400",
        text:    "text-gray-300",
    },
    blue: {
        wrapper: "border-blue-500/40 bg-blue-500/10",
        icon:    "text-blue-400",
        label:   "text-blue-400",
        text:    "text-gray-300",
    },
    green: {
        wrapper: "border-green-500/40 bg-green-500/10",
        icon:    "text-green-400",
        label:   "text-green-400",
        text:    "text-gray-300",
    },
    amber: {
        wrapper: "border-amber-500/40 bg-amber-500/10",
        icon:    "text-amber-400",
        label:   "text-amber-400",
        text:    "text-amber-200",
    },
    teal: {
        wrapper: "border-teal-500/40 bg-teal-500/10",
        icon:    "text-teal-400",
        label:   "text-teal-400",
        text:    "text-gray-300",
    },
};

function VisualizationPage() {

    const { datasetId } = useParams();
    const navigate = useNavigate();

    
    const [data, setData]               = useState(null);
    const [user, setUser]               = useState(null);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDatasetOpen, setIsDatasetOpen] = useState(false);
    // this for display summary
    const [aiSummary, setAiSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    // this for chatbot
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        // get user
        api.get("/user")
            .then(res => setUser(res.data))
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/login");
            });

        // fetch chart and KPI data
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

    // logout
    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            localStorage.removeItem("token");
            navigate("/login");
        } catch (err) {
            console.log(err);
        }
    };

    
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

   
    const { kpis, revenue_by_month, revenue_by_category, category_share, top_products } = data;

    

    const callAISummary = async() => {
        if (showSummary) { setShowSummary(false); return }
        setSummaryLoading (true)
        try{
            const res = await api.post('/get_ai_summary', { dataset_id: datasetId });
            setAiSummary(res.data.data.summary);
            setShowSummary(true);
        } catch (err){
            console.error("Summary call request failed", err);
        } finally {
            setSummaryLoading(false);
        }
    }

    
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            <div className="flex h-screen">

                <div
                    className={`bg-gray-900 text-white transition-all duration-300 ${
                    isSidebarOpen ? "w-64" : "w-20"
                    }`}
                >
                    <div className="p-4 text-xl font-bold border-b border-gray-700">
                    Data Talk
                    </div>

                    <div className="p-4 space-y-3">
                        {/* Dashboard */}
                        <div className="flex items-center space-x-3 hover:bg-gray-800 p-2 rounded cursor-pointer" onClick={() => navigate("/dashboard")}>
                            <LayoutDashboard size={20} />
                            {isSidebarOpen && <span>Dashboard</span>}
                        </div>

                        {/* Dataset Dropdown */}
                        <div>
                            
                            <div
                            className="flex items-center justify-between hover:bg-gray-800 p-2 rounded cursor-pointer"
                            onClick={() => setIsDatasetOpen(!isDatasetOpen)}
                            >
                            <div className="flex items-center space-x-3">
                                <FileText size={20} />
                                {isSidebarOpen && <span>Datasets</span>}
                            </div>
                            {isSidebarOpen && <ChevronDown size={16} />}
                            </div>

                            {isDatasetOpen && isSidebarOpen && (
                            <div className="ml-8 mt-2 space-y-2 text-sm text-gray-300">
                                <div 
                                    className="hover:text-white cursor-pointer"
                                    onClick={() => navigate("/upload")}
                                >
                                    Upload Dataset
                                </div>
                                <div className="hover:text-white cursor-pointer">
                                Manage Datasets
                                </div>
                            </div>
                            )}
                        </div>

                        {/* Visualization */}
                        <div className="flex items-center space-x-3 hover:bg-gray-800 p-2 rounded cursor-pointer">
                            <BarChart3 size={20} />
                            {isSidebarOpen && <span>Visualization</span>}
                        </div>
                    </div>
                </div>


                {/* main content */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* top bar */}
                    <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold">Visualization</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Dataset #{datasetId}</p>
                        </div>

                        <div className="flex items-center gap-3">   {/* ← group button + user together */}
                            
                            <button
                                onClick={() => setIsChatOpen(!isChatOpen)}
                                className={`p-2 rounded-lg transition-colors ${
                                    isChatOpen ? "bg-indigo-600" : "bg-gray-700 hover:bg-gray-600"
                                }`}
                            >
                                <MessageSquare size={18} className="text-white" />
                            </button>

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
                    </div>

                    <div className="flex-1 flex overflow-hidden">
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

                            {/* ai dashboard overview */}
                            {showSummary && aiSummary && (
                                <div className="grid grid-cols-2 gap-3">
                                    <SummaryCard
                                        label="AI Summary"
                                        icon={<Lightbulb size={14} />}
                                        text={aiSummary.summary}
                                        colorClasses={COLORS.purple}
                                    />
                                    <SummaryCard
                                        label="Dashboard Overview"
                                        icon={<BarChart3 size={14} />}
                                        text={aiSummary.dashboard_overview}
                                        colorClasses={COLORS.blue}
                                    />
                                </div>
                            )}

                            {/* Charts */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <RevenueLineChart data={revenue_by_month} />
                                    {showSummary && aiSummary && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <SummaryCard
                                                label="Trend Insight"
                                                icon={<TrendingUp size={14} />}
                                                text={aiSummary.trend_insight}
                                                colorClasses={COLORS.teal}
                                            />
                                            <SummaryCard
                                                label="Anomaly Detected"
                                                icon={<AlertTriangle size={14} />}
                                                text={aiSummary.anomaly}
                                                colorClasses={COLORS.amber}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <CategoryBarChart data={revenue_by_category} />
                                    {showSummary && aiSummary && (
                                        <SummaryCard
                                            label="Category Insight"
                                            icon={<BarChart3 size={14} />}
                                            text={aiSummary.category_insight}
                                            colorClasses={COLORS.blue}
                                        />                                
                                    )}
                                </div>
                                
                                <CategoryPieChart data={category_share} />

                                <div className="space-y-3">
                                    <TopProductsChart data={top_products} />
                                    {showSummary && aiSummary && (
                                        <SummaryCard
                                            label="Product  Insight"
                                            icon={<Package size={14} />}
                                            text={aiSummary.product_insight}
                                            colorClasses={COLORS.green}
                                        />                                
                                    )}
                                </div>
                                
                            </div>

                            {/* Highlight KPIs */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="border-gray-700 bg-gray-800/60 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center text-green-600 text-lg">★</div>
                                <div>
                                    <p className="text-xs text-gray-400">Top category</p>
                                    <p className="text-sm font-semibold text-gray-200">{kpis.top_category.name}</p>
                                    <p className="text-xs text-gray-500">Rs {kpis.top_category.revenue.toLocaleString()}</p>
                                </div>
                                </div>
                                <div className="border-gray-700 bg-gray-800/60 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 text-lg">▲</div>
                                <div>
                                    <p className="text-xs text-gray-400">Top product</p>
                                    <p className="text-sm font-semibold text-gray-200">{kpis.top_product.name}</p>
                                    <p className="text-xs text-gray-500">Rs {kpis.top_product.revenue.toLocaleString()}</p>
                                </div>
                                </div>
                                <div className="border-gray-700 bg-gray-800/60 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 text-lg">◉</div>
                                <div>
                                    <p className="text-xs text-gray-400">Best month</p>
                                    <p className="text-sm font-semibold text-gray-200">Month {kpis.best_month.month}</p>
                                    <p className="text-xs text-gray-500">Rs {kpis.best_month.revenue.toLocaleString()}</p>
                                </div>
                                </div>
                            </div>

                            {showSummary && aiSummary && aiSummary.recommendation && (
                                <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 p-4 flex items-start gap-3">
                                    <Lightbulb size={16} className="text-teal-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold tracking-widest uppercase text-teal-400 mb-1">Recommendation</p>
                                        <p className="text-sm text-gray-300 leading-relaxed">{aiSummary.recommendation}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-800">
                                <button 
                                    onClick={() =>callAISummary()}
                                    disabled={summaryLoading}
                                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                        showSummary
                                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                                            : "bg-blue-600 hover:bg-blue-500 text-white"
                                    }`}
                                >
                                    {summaryLoading ? "Loading…" : showSummary ? "Hide AI Summary" : "✦ Summarize with AI"}
                                </button>

                                <div>
                                    
                                </div>
                            </div>

                        </div>

                        {/* Chat panel — sits to the RIGHT of dashboard content */}
                        {isChatOpen && (
                            <ChatPanel
                                datasetId={datasetId}
                                onClose={() => setIsChatOpen(false)}
                            />
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}

export default VisualizationPage;