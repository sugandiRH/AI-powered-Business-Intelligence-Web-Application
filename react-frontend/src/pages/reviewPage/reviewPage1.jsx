import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../../services/api";

import {
    ChevronDown,
    LayoutDashboard,
    Upload,
    BarChart3,
    Settings,
    LogOut,
    FileText,
    CircleAlert,
    CircleCheck,
    Info,
    PencilLine,
} from "lucide-react";

function ReviewPage() {

    const [stats, setStats] = useState(null);

    const { datasetId } = useParams();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDatasetOpen, setIsDatasetOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const [activeCard, setActiveCard] = useState("critical");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        api.get("/user")
            .then(res => {
                setUser(res.data);   // store user
            })
            .catch(err => {
                console.log(err.response?.data);
                localStorage.removeItem("token");
                navigate("/login");
            });

        // Get dashboard stats
        api.get("/dashboard/stats")
            .then(res => {
                setStats(res.data);
            })
            .catch(err => {
                console.log("Stats error:", err.response?.data);
            });      

    }, []);

    const [data, setData] = useState({
        critical: [],
        warning: [],
        info: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [criticalRes, warningRes, infoRes] = await Promise.all([
                    api.get(`/temp_critical_business_data/${datasetId}`),
                    api.get(`/temp_warning_business_data/${datasetId}`),
                    api.get(`/temp_info_business_data/${datasetId}`)
                ]);

                setData({
                    critical: criticalRes.data.critical_rows || [],
                    warning: warningRes.data.warning_rows || [],
                    info: infoRes.data.info_rows || []
                });

            } catch (err) {
                console.error("API Error:", err);
            }
        };

        fetchData();
    }, [datasetId]);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            localStorage.removeItem("token");
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
    };


    // cards 
    const cards = [
        {
            key: "critical",
            lable: "Critical",
            icon: <CircleAlert size={20} />,
            count : data.critical.length,
            active: {
                wrapper: "border-red-500/60 bg-red-500/10",
                label: "text-red-400",
                count: "text-red-400",
                bar: "bg-red-500",
                dot: "bg-red-500",
            },
            inactive: {
                wrapper: "border-gray-700 bg-gray-800/60 hover:border-red-500/40 hover:bg-red-500/5",
                label: "text-gray-400",
                count: "text-white",
            },
        },
        {
            key: "warning",
            label: "Warning",
            icon: <CircleAlert size={20} />,
            count: data.warning.length,
            active: {
                wrapper: "border-yellow-500/60 bg-yellow-500/10",
                label: "text-yellow-400",
                count: "text-yellow-400",
                bar: "bg-yellow-400",
                dot: "bg-yellow-400",
            },
            inactive: {
                wrapper: "border-gray-700 bg-gray-800/60 hover:border-yellow-500/40 hover:bg-yellow-500/5",
                label: "text-gray-400",
                count: "text-white",
            },
        },
        {
            key: "info",
            label: "Valid",
            icon: <CircleCheck size={20} />,
            count: data.info.length,
            active: {
                wrapper: "border-emerald-500/60 bg-emerald-500/10",
                label: "text-emerald-400",
                count: "text-emerald-400",
                bar: "bg-emerald-500",
                dot: "bg-emerald-500",
            },
            inactive: {
                wrapper: "border-gray-700 bg-gray-800/60 hover:border-emerald-500/40 hover:bg-emerald-500/5",
                label: "text-gray-400",
                count: "text-white",
            },
        },    
    ];

    // ── Table config per type ────────────────────────────────────────────────
    const tableConfig = {
        critical: { title: "Critical Issues", titleColor: "text-red-400", dot: "bg-red-500", rowHover: "hover:bg-red-500/5" },
        warning:  { title: "Warning Issues",  titleColor: "text-yellow-400", dot: "bg-yellow-400", rowHover: "hover:bg-yellow-500/5" },
        info:     { title: "Valid Rows",       titleColor: "text-emerald-400", dot: "bg-emerald-500", rowHover: "hover:bg-emerald-500/5" },
    };
 
    const activeRows = data[activeCard] || [];
    const activeCfg  = tableConfig[activeCard];


    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            <div className="flex h-screen">
                {/* side bar */}
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
                        <div className="flex items-center space-x-3 hover:bg-gray-800 p-2 rounded cursor-pointer">
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
                <div className="flex-1 flex flex-col">
                    {/* top bar */}
                    <div className="bg-gray-900 text-white p-4 shadow px-6 py-4 flex justify-between items-center">
                        <h1 className="text-xl font-bold">Review the dataset</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Dataset #{datasetId}</p>

                        <div className="relative">
                            <div
                                className="flex items-center space-x-2 cursor-pointer"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                {/* <span className="font-medium">Ruwani</span> */}
                                {user && (
                                    <span className="font-medium">{user.name}</span>   
                                )}
                                <ChevronDown size={18} />
                            </div>
                
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-gray-800 shadow rounded-lg py-2">
                                <div className="px-4 py-2 hover:bg-gray-900 cursor-pointer flex items-center space-x-2">
                                    <Settings size={16} />
                                    <span>Settings</span>
                                </div>
                                <div className="px-4 py-2 hover:bg-gray-900 cursor-pointer flex items-center space-x-2 text-red-500">
                                    <LogOut size={16} />
                                    <button onClick={handleLogout}>Logout</button>  
                                </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* ── Cards ── */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {cards.map((card) => {
                                const isActive = activeCard === card.key;
                                const style = isActive ? card.active : card.inactive;
                                return (
                                    <button
                                        key={card.key}
                                        onClick={() => setActiveCard(card.key)}
                                        className={`relative text-left p-5 rounded-xl border transition-all duration-200 outline-none overflow-hidden ${style.wrapper}`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <span className={`text-xs font-semibold tracking-widest uppercase ${style.label}`}>
                                                {card.label}
                                            </span>
                                            <span className={`${style.label} opacity-80`}>
                                                {card.icon}
                                            </span>
                                        </div>
                                        <p className={`text-3xl font-bold font-mono ${style.count}`}>
                                            {card.count}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">records</p>
                                        {/* Active indicator bar */}
                                        {isActive && (
                                            <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${card.active.bar}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* ── Active Table ── */}
                        <div>
                            {/* Table header */}
                            <div className="flex items-center gap-2.5 mb-3">
                                <span className={`w-2 h-2 rounded-full ${activeCfg.dot}`} />
                                <h3 className={`text-sm font-semibold ${activeCfg.titleColor}`}>
                                    {activeCfg.title}
                                </h3>
                                <span className="text-xs text-gray-500">— {activeRows.length} entries</span>
                            </div>
 
                            {activeRows.length === 0 ? (
                                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-10 text-center text-sm text-gray-500">
                                    No {activeCard} records found for this dataset.
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-gray-700/60 bg-gray-900">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-700/60 bg-gray-800/60">
                                                {["Date", "Month", "Year", "Product Name", "Quantity", "Price", "Total", "Actions"].map(h => (
                                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {activeRows.map((row, index) => (
                                                <tr key={index} className={`transition-colors ${activeCfg.rowHover}`}>
                                                    <td className="px-5 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">{row.date || "—"}</td>
                                                    <td className="px-5 py-3.5 text-gray-300 text-xs whitespace-nowrap">{row.month || "—"}</td>
                                                    <td className="px-5 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">{row.year || "—"}</td>
                                                    <td className="px-5 py-3.5 text-white font-medium text-xs whitespace-nowrap">{row.product_name || row.product || "—"}</td>
                                                    <td className="px-5 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">{row.quantity || "—"}</td>
                                                    <td className="px-5 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">{row.price || "—"}</td>
                                                    <td className="px-5 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">{row.total || "—"}</td>
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <button className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                                            <PencilLine size={13} />
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* ── Action Buttons ── */}
                        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-800">
                            <button className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                                Confirm
                            </button>
                            <button className="px-5 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors">
                                Ask AI ↗
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                className="ml-auto px-5 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 bg-transparent transition-colors"
                            >
                                ← Go back
                            </button>
                        </div>
                    </div>
                </div>
            </div>    
            
        </div>

    )

}    

export default ReviewPage;