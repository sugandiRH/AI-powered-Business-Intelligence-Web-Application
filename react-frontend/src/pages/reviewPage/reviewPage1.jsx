// here use Claude AI for style the interface and correct the errors

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
    Trash2,
} from "lucide-react";

function ReviewPage() {

    const [stats, setStats] = useState(null);

    const { datasetId } = useParams();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDatasetOpen, setIsDatasetOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [errorPopup, setErrorPopup] = useState(null);


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
        ai_suggestions: [],
        critical: [],
        warning: [],
        info: []
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aiSuggetionsRes, criticalRes, warningRes, infoRes] = await Promise.all([
                    api.get(`/spelling_suggestions/${datasetId}`),
                    api.get(`/temp_critical_business_data/${datasetId}`),
                    api.get(`/temp_warning_business_data/${datasetId}`),
                    api.get(`/temp_info_business_data/${datasetId}`)
                ]);

                setData({
                    ai_suggestions: aiSuggetionsRes.data|| [],
                    critical: criticalRes.data.critical_rows || [],
                    warning: warningRes.data.warning_rows || [],
                    info: infoRes.data.info_rows || []
                });

            } catch (err) {
                console.error("API Error:", err);
                setError(err.response?.data?.message || "Failed to load data");
            }
            finally {
                setLoading(false);
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
        // ai_suggestions
        {
            key: "ai_suggestions",
            label: "AI Suggestions",
            icon: <CircleAlert size={20} />,
            count : data.ai_suggestions.length,
            active: {
                wrapper: "border-purple-500/60 bg-purple-500/10",
                label: "text-purple-400",
                count: "text-purple-400",
                bar: "bg-purple-500",
                dot: "bg-purple-500",
            },
            inactive: {
                wrapper: "border-gray-700 bg-gray-800/60 hover:border-purple-500/40 hover:bg-purple-500/5",
                label: "text-gray-400",
                count: "text-white",
            },
        },

        // critical
        {
            key: "critical",
            label: "Critical",
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

        // warning
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

        // Info & valid
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

    // Table config per type 
    const tableConfig = {
        ai_suggestions: { title: "AI Spelling Suggestions", titleColor: "text-purple-400", dot: "bg-purple-500", rowHover: "hover:bg-purple-500/5" },
        critical: { title: "Critical Issues", titleColor: "text-red-400", dot: "bg-red-500", rowHover: "hover:bg-red-500/5" },
        warning:  { title: "Warning Issues",  titleColor: "text-yellow-400", dot: "bg-yellow-400", rowHover: "hover:bg-yellow-500/5" },
        info:     { title: "Valid Rows",       titleColor: "text-emerald-400", dot: "bg-emerald-500", rowHover: "hover:bg-emerald-500/5" },
    };
 
    const activeRows = data[activeCard] || [];
    const activeCfg  = tableConfig[activeCard];

    const [editingRowId, setEditingRowId] = useState(null);
    const [editValues, setEditValues] = useState({});

    const handleEditStart = (row) => {
        setEditingRowId(row.id);
        
        setEditValues({
            date:     row.date     || "",
            month:    row.month    || "",
            year:     row.year     || "",
            product:  row.product  || "",
            category: row.category || "",
            quantity: row.quantity || "",
            price:    row.price    || "",
            total:    row.total    || "",
        });
    };


    // for sucess message
    const [toast, setToast] = useState(null); 

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };


    // this is for save button in table after edit
    const handleEditSave = async (row) => {
        try {
            await api.post(`/update_temp_data`, {
                row_id: row.id,
                ...editValues
            });
            // Update local state so table reflects change immediately
            setData(prev => ({
                ...prev,
                [activeCard]: prev[activeCard].filter(r => Number(r.id) !== Number(row.id)),
                // Move updated row to info/valid section
                info: [...prev.info, { ...row, ...editValues, user_confirmed: true }]
            }));
            setEditingRowId(null);
            showToast('Row updated and moved to Valid ✓');

        } catch (err) {
            console.error("Save failed", err);
            showToast('Failed to save row', 'error');
        }
    };

    const handleEditCancel = () => {
        setEditingRowId(null);
        setEditValues({});
    };

    // this is for delete button in table
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            // await api.post('/delete_temp_data', { row_id: row.id });
            await api.post('/delete_temp_data', { row_id: deleteConfirm.id });
            // Update local state so table reflects change immediately
            setData(prev => ({
                ...prev,
                [activeCard]: prev[activeCard].filter(r => Number(r.id) !== Number(deleteConfirm.id))
            }));
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    // this is for delete all in critical table
    const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
    const handleDeleteAllCritical = async () => {
        
        try {
            await api.post('/delete_all_critical_rows', { dataset_id: datasetId});

            setData(prev => ({
                ...prev,
                critical: []
            }));
            setDeleteAllConfirm(false);
            showToast('All critical rows deleted');

        } catch (err) {
            console.error("Delete all critical rows failed", err);
            showToast('Failed to delete critical rows', 'error');
            setDeleteAllConfirm(false);
        }
    };


    // this is for confirm all in warning table
    const [confirmAllWarningConfirm, setConfirmAllWarningConfirm] = useState(false);
    const handleConfirmAllWarning = async () => {
        try {
            await api.post('/confirm_all_warning_rows', { dataset_id: datasetId});
            const confirmedRows = data.warning.map(r => ({ ...r, user_confirmed: true, error_level: 'info' }));

            setData(prev => ({
                ...prev,
                warning: [],
                info: [...prev.info, ...prev.warning.map(r => ({ ...r, user_confirmed: true }))]
            }));
            setConfirmAllWarningConfirm(false);
            showToast('All warning rows confirmed');
        } catch (err) {
            console.error("Confirm all warning rows failed", err);
            showToast('Failed to confirm warning rows', 'error');
            setConfirmAllWarningConfirm(false);

        }
    };

    // this is warning table confirm button - move to info table
    const handleConfirm = async (row) => {
        try {
            await api.post('/confirm_temp_data', { row_id: row.id });
            setData(prev => ({
                ...prev,
                [activeCard]: prev[activeCard].filter(r => Number(r.id) !== Number(row.id)),
                info: [...prev.info, { ...row, user_confirmed: true }]
            }));
            showToast('Row confirmed successfully');
        } catch (err) {
            console.error("Confirm failed", err);
            showToast('Failed to confirm row', 'error');
        }
    };

    const [errorMessages, setErrorMessages] = useState({});

    useEffect(() => {
        fetch("/error_messages")
            .then(res => res.json())
            .then(setErrorMessages)
            .catch(() => setErrorMessages({}));
    }, []);


    // this for show warning correction suggestion from ai table
    const [warningSuggestions, setWarningSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [autoCompleteLoading, setAutoCompleteLoading] = useState(false);

    const handleAutoComplete = async () => {
        setAutoCompleteLoading(true);
        try {
            // await api.post('/warning_suggestions', { dataset_id: datasetId });

            //const res = await api.get(`/warning_suggestions/${datasetId}`);
            const res = await api.post('/auto_complete_warnings', { 
                dataset_id: Number(datasetId)
            });

            // console.log("response:", res.data);
            // console.log("suggestions:", res.data.suggestions);
            // console.log("suggestions length:", res.data.suggestions?.length);

            setWarningSuggestions(res.data.warning_rows || []);
            setShowSuggestions(true);

        } catch (err) {
            console.error("Auto complete failed", err);
            showToast('Auto complete failed', 'error');
        } finally {
            setAutoCompleteLoading(false);
        }
    };

    // accept suggest value from row in ai suggestion table
    const handleAcceptSuggestion = async (row) => {
        try {
            await api.post('/confirm_ai_suggested_warning', {
                row_id:   row.id,
                month:    row.suggested_month    ?? row.month,
                year:     row.suggested_year     ?? row.year,
                category: row.suggested_category ?? row.category,
                quantity: row.suggested_quantity ?? row.quantity,
                price:    row.suggested_price    ?? row.price,
                total:    row.suggested_total    ?? row.total,
                date:     row.suggested_date     ?? row.date,
                product:  row.product,
            });

            // Remove from suggestions table
            setWarningSuggestions(prev => prev.filter(r => Number(r.id) !== Number(row.id)));

            // Remove from warning, move to info with suggested values applied
            setData(prev => ({
                ...prev,
                warning: prev.warning.filter(r => Number(r.id) !== Number(row.id)),
                info: [...prev.info, {
                    ...row,
                    month:           row.suggested_month    ?? row.month,
                    year:            row.suggested_year     ?? row.year,
                    category:        row.suggested_category ?? row.category,
                    quantity:        row.suggested_quantity ?? row.quantity,
                    price:           row.suggested_price    ?? row.price,
                    total:           row.suggested_total    ?? row.total,
                    suggested_month:    null,
                    suggested_year:     null,
                    suggested_category: null,
                    suggested_quantity: null,
                    suggested_price:    null,
                    suggested_total:    null,
                    user_confirmed: true,
                    error_level:    'info'
                }]
            }));

            showToast(`${row.product} accepted ✓`);
        } catch (err) {
            console.error("Accept suggestion failed", err);
            showToast('Failed to accept suggestion', 'error');
        }
    };

    const handleRejectSuggestion = async (row) => {
        try {
            await api.post('/delete_ai_suggested_warning', { row_id: row.id });

            // Remove from suggestions table
            setWarningSuggestions(prev => prev.filter(r => Number(r.id) !== Number(row.id)));

            // Clear suggested values in warning table row
            setData(prev => ({
                ...prev,
                warning: prev.warning.map(r =>
                    Number(r.id) === Number(row.id) ? {
                        ...r,
                        suggested_month:    null,
                        suggested_year:     null,
                        suggested_category: null,
                        suggested_quantity: null,
                        suggested_price:    null,
                        suggested_total:    null,
                    } : r
                )
            }));

            showToast(`Suggestion rejected for ${row.product}`);
        } catch (err) {
            console.error("Reject suggestion failed", err);
            showToast('Failed to reject suggestion', 'error');
        }
    };


    // this is for confirm all in info table 
    const [confirmAllInfoConfirm, setConfirmAllInfoConfirm] = useState(false);
    const handleConfirmAllInfo = async () => {
        try {
            await api.post('/confirm_all_info_rows', { dataset_id: datasetId});
            // fill business_data table
            await api.post('/finalize_dataset', { dataset_id: datasetId });
            
            setData(prev => ({
                ...prev,
                info: prev.info.map(r => ({ ...r, user_confirmed: true }))
            }));
            setConfirmAllInfoConfirm(false);
            showToast('All info rows confirmed');
        } catch (err) {
            console.error("Confirm all info rows failed", err);
            showToast('Failed to confirm info rows', 'error');
            setConfirmAllInfoConfirm(false);
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                            <div className={`absolute bottom-0 left-0 right-0 h-0.75 ${card.active.bar}`} />
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
                            ) : activeCard === "ai_suggestions" ? (
                                <div className="overflow-x-auto rounded-xl border border-gray-700/60 bg-gray-900">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-700/60 bg-gray-800/60">
                                                {["Column", "Original Value", "Suggested Value", "Confidence", "Actions"].map(h => (
                                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {activeRows.map((row, index) => (

                                                // this is ai suggestion table
                                                <tr key={index} className="transition-colors hover:bg-purple-500/5">
                                                    {/* Column name badge */}
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                            row.column_name === 'product'
                                                                ? 'bg-blue-500/20 text-blue-400'
                                                                : 'bg-orange-500/20 text-orange-400'
                                                        }`}>
                                                            {row.column_name}
                                                        </span>
                                                    </td>

                                                    {/* Original — strikethrough style */}
                                                    <td className="px-5 py-3.5 text-gray-400 text-xs font-mono whitespace-nowrap line-through decoration-red-400/60">
                                                        {row.original_value}
                                                    </td>

                                                    {/* Suggested — highlighted */}
                                                    <td className="px-5 py-3.5 text-green-400 text-xs font-mono font-medium whitespace-nowrap">
                                                        {row.suggested_value}
                                                    </td>

                                                    {/* Confidence bar */}
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full bg-purple-500"
                                                                    style={{ width: `${(row.confidence ?? 0) * 100}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-400 font-mono">
                                                                {row.confidence ? `${Math.round(row.confidence * 100)}%` : '—'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <div className="flex gap-3">
                                                            <button
                                                                // onClick={() => handleApprove(row)}
                                                                className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
                                                            >
                                                                ✓ Accept
                                                            </button>
                                                            <button
                                                                // onClick={() => handleReject(row)}
                                                                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                                                            >
                                                                ✕ Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-gray-700/60 bg-gray-900">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-700/60 bg-gray-800/60">
                                                {["Date", "Month", "Year", "Product Name", "Category", "Quantity", "Price", "Total", "Error", "Actions"].map(h => (
                                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        {/* other table - excel columns representation */}
                                        <tbody className="divide-y divide-gray-800">
                                            {/* {activeRows.length > 0 && console.log("first row:", activeRows[0])} */}
                                            {activeRows.map((row, index) => (
                                                <tr key={row.id} className={`transition-colors ${activeCfg.rowHover}`}>

                                                    {editingRowId === Number(row.id) ? (
                                                        // ── Edit mode ──
                                                        <>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full bg-gray-800 border border-indigo-500 rounded px-2 py-1 text-xs text-white font-mono"
                                                                    value={editValues.date}
                                                                    onChange={e => setEditValues(p => ({ ...p, date: e.target.value }))}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full bg-gray-800 border border-indigo-500 rounded px-2 py-1 text-xs text-white"
                                                                    value={editValues.month}
                                                                    onChange={e => setEditValues(p => ({ ...p, month: e.target.value }))}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full bg-gray-800 border border-indigo-500 rounded px-2 py-1 text-xs text-white font-mono"
                                                                    value={editValues.year}
                                                                    onChange={e => setEditValues(p => ({ ...p, year: e.target.value }))}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full bg-gray-800 border border-indigo-500 rounded px-2 py-1 text-xs text-white"
                                                                    value={editValues.product}
                                                                    onChange={e => setEditValues(p => ({ ...p, product: e.target.value }))}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full bg-gray-800 border border-indigo-500 rounded px-2 py-1 text-xs text-white"
                                                                    value={editValues.category}
                                                                    onChange={e => setEditValues(p => ({ ...p, category: e.target.value }))}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full bg-gray-800 border border-indigo-500 rounded px-2 py-1 text-xs text-white font-mono"
                                                                    value={editValues.quantity}
                                                                    onChange={e => setEditValues(p => ({ ...p, quantity: e.target.value }))}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full bg-gray-800 border border-indigo-500 rounded px-2 py-1 text-xs text-white font-mono"
                                                                    value={editValues.price}
                                                                    onChange={e => setEditValues(p => ({ ...p, price: e.target.value }))}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full bg-gray-800 border border-indigo-500 rounded px-2 py-1 text-xs text-white font-mono"
                                                                    value={editValues.total}
                                                                    onChange={e => setEditValues(p => ({ ...p, total: e.target.value }))}
                                                                />
                                                            </td>
                                                            <td className="px-5 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">{row.validation_errors || "—"}</td>
                                                            
                                                            <td className="px-3 py-2 whitespace-nowrap">
                                                                <div className="flex gap-3">
                                                                    <button
                                                                        onClick={() => handleEditSave(row)}
                                                                        className="text-xs text-green-400 hover:text-green-300 transition-colors"
                                                                    >
                                                                        ✓ Save
                                                                    </button>
                                                                    <button
                                                                        onClick={handleEditCancel}
                                                                        className="text-xs text-gray-400 hover:text-white transition-colors"
                                                                    >
                                                                        ✕ Cancel
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        // Display mode
                                                        <>
                                                            <td className="px-5 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">{row.date || "—"}</td>
                                                            <td className="px-5 py-3.5 text-gray-300 text-xs whitespace-nowrap">{row.month || "—"}</td>
                                                            <td className="px-5 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">{row.year || "—"}</td>
                                                            <td className="px-5 py-3.5 text-white font-medium text-xs whitespace-nowrap">{row.product_name || row.product || "—"}</td>
                                                            <td className="px-5 py-3.5 text-gray-300 text-xs whitespace-nowrap">{row.category || "—"}</td>
                                                            <td className="px-5 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">{row.quantity || "—"}</td>
                                                            <td className="px-5 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">{row.price || "—"}</td>
                                                            <td className="px-5 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">{row.total || "—"}</td>
                                                            {/* <td className="px-5 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">{row.validation_errors || "—"}</td> */}
                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                {row.validation_errors ? (
                                                                    <button
                                                                        onClick={() => setErrorPopup({ rowId: row.id, errors: row.validation_errors })}
                                                                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-2"
                                                                    >
                                                                        view error
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-gray-600 text-xs">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                <div className="flex gap-4">

                                                                    {/* for critical table */}
                                                                    {activeCard === "critical" && (
                                                                        <>
                                                                            <button 
                                                                                onClick={() => handleEditStart(row)}
                                                                                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                                                                <PencilLine size={13} />
                                                                                Edit
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => setDeleteConfirm(row)}
                                                                                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                                                                                <Trash2 size={13} />
                                                                                Delete
                                                                            </button>
                                                                        </>    
                                                                    )}

                                                                    {/* for warning table */}
                                                                    {activeCard === "warning" && (
                                                                        <>
                                                                            <button 
                                                                                onClick={() => handleEditStart(row)}
                                                                                className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
                                                                                <PencilLine size={13} />
                                                                                Edit
                                                                            </button>
                                                                            {/* <button className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                                                                ↗ Auto
                                                                            </button> */}
                                                                            <button 
                                                                                onClick={() => handleConfirm(row)}
                                                                                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                                                                                ✓ Confirm
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => setDeleteConfirm(row)}
                                                                                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                                                                                <Trash2 size={13} />
                                                                                Delete
                                                                            </button>

                                                                        </>    
                                                                    )}


                                                                    {/* for info table */}
                                                                    {activeCard === "info" && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleEditStart(row)}
                                                                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <PencilLine size={12} /> Edit
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => setDeleteConfirm(row)}
                                                                                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                                                                                <Trash2 size={13} />
                                                                                Delete
                                                                            </button>
                                                                        </>
                                                                    )}


                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>    
                            )}
                            
                        </div>

                        {/* ── Action Buttons ── */}

                        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-800">
                           

                            {/* only for critical data */}
                            {activeCard === "critical" && (
                                <>
                                    <button 
                                        onClick={() => setDeleteAllConfirm(true)}
                                        className="px-5 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center gap-2">
                                        <Trash2 size={14} /> Delete All Critical
                                    </button>
                                </>
                            )}

                            {/* only for warning data */}
                            {activeCard === "warning" && (
                                <>
                                    <button 
                                        onClick={handleAutoComplete}
                                        disabled={autoCompleteLoading}
                                        className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                                    >
                                        {/* ↗ Auto Complete All */}
                                        {autoCompleteLoading ? "Processing..." : "↗ Auto Complete All"}
                                    </button>
                                    <button 
                                        onClick={() => setConfirmAllWarningConfirm(true)}
                                        className="px-5 py-2 rounded-lg text-sm font-medium bg-yellow-600 hover:bg-yellow-500 text-white transition-colors">
                                        ✓ Confirm All Warnings
                                    </button>
                                </>
                            )}

                            {/* info — confirm all valid rows */}
                            {activeCard === "info" && (
                                <>
                                    <button 
                                        onClick={() => setConfirmAllInfoConfirm(true)}
                                        className="px-5 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
                                        ✓ Confirm All
                                    </button>
                                </>
                            )}

                            {/* ai_suggestions — accept or reject all */}
                            {activeCard === "ai_suggestions" && (
                                <>
                                    <button className="px-5 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors">
                                        ✓ Accept All
                                    </button>
                                    <button className="px-5 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors">
                                        ✕ Reject All
                                    </button>
                                </>
                            )}

                            {/* for all */}
                            <button
                                onClick={() => navigate(-1)}
                                className="ml-auto px-5 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 bg-transparent transition-colors"
                            >
                                ← Go back
                            </button>
                            
                        </div>




                        {/* this is ai suggetion table - only display when click auto complete */}
                        {/* Warning Suggestions Table*/}
                        {activeCard === "warning" && showSuggestions && warningSuggestions.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                    <h3 className="text-sm font-semibold text-indigo-400">
                                        AI Suggestions for Warning Rows
                                    </h3>
                                    <span className="text-xs text-gray-500">— {warningSuggestions.length} suggestions</span>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-indigo-700/40 bg-gray-900">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-700/60 bg-gray-800/60">
                                                {["Date", "Month", "Year", "Product Name", "Category", "Quantity", "Price", "Total", "Actions"].map(h => (
                                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {warningSuggestions.map((row, index) => (
                                                <tr key={index} className="hover:bg-indigo-500/5 transition-colors">
                                                    <td className="px-5 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">
                                                        {row.date}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                                                        {row.suggested_month ? (
                                                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-medium">
                                                                {row.suggested_month}
                                                            </span>
                                                        ) : row.month || "—"}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                                                        {row.suggested_year ? (
                                                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-medium">
                                                                {row.suggested_year}
                                                            </span>
                                                        ) : row.year || "—"}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-white font-medium text-xs whitespace-nowrap">
                                                        {row.product || "—"}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                                                        {row.suggested_category ? (
                                                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">
                                                                {row.suggested_category}
                                                            </span>
                                                        ) : row.category || "—"}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                                                        {row.suggested_quantity ? (
                                                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-medium">
                                                                {row.suggested_quantity}
                                                            </span>
                                                        ) : row.quantity || "—"}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                                                        {row.suggested_price ? (
                                                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-medium">
                                                                {row.suggested_price}
                                                            </span>
                                                        ) : row.price || "—"}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                                                        {row.suggested_total ? (
                                                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-medium">
                                                                {row.suggested_total}
                                                            </span>
                                                        ) : row.total || "—"}
                                                    </td>
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => handleAcceptSuggestion(row)}
                                                                className="text-xs text-green-400 hover:text-green-300 transition-colors"
                                                            >
                                                                ✓ Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectSuggestion(row)}
                                                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                                            >
                                                                ✕ Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-800">
                           

                            {/* only for critical data */}
                            {activeCard === "warning" && showSuggestions && warningSuggestions.length > 0 && (
                                <>
                                    <button className="px-5 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center gap-2">
                                        <Trash2 size={14} /> Reject All 
                                    </button>

                                    <button className="px-5 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors">
                                        ✓ Accept All
                                    </button>
                                </>
                            )}
                        </div>    
                    </div>

                    {/* ── Toast Notification ── */}
                    {toast && (
                        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border transition-all duration-300 ${
                            toast.type === 'success'
                                ? 'bg-gray-900 border-emerald-500/40 text-emerald-400'
                                : 'bg-gray-900 border-red-500/40 text-red-400'
                        }`}>
                            <span className="text-sm font-medium">{toast.message}</span>
                            <button
                                onClick={() => setToast(null)}
                                className="text-gray-500 hover:text-white transition-colors text-xs"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* ── Delete Confirmation Modal ── */}
                    {deleteConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                                
                                {/* Icon */}
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 mx-auto mb-4">
                                    <Trash2 size={20} className="text-red-400" />
                                </div>

                                {/* Text */}
                                <h3 className="text-white text-base font-semibold text-center mb-1">
                                    Delete this row?
                                </h3>
                                <p className="text-gray-400 text-xs text-center mb-1">
                                    This action cannot be undone.
                                </p>

                                {/* Row preview */}
                                <div className="bg-gray-800 rounded-lg px-4 py-2 mb-5 text-center">
                                    <p className="text-xs text-gray-400">
                                        <span className="text-white font-medium">
                                            {deleteConfirm.product || "—"}
                                        </span>
                                        {" · "}{deleteConfirm.date || "—"}
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors"
                                    >
                                        Yes, Delete
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}


                    {/* using Claude AI style the  popup box*/}

                    {/* ── Delete All Confirmation Modal (for critical rows) ── */}
                    {deleteAllConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 mx-auto mb-4">
                                    <Trash2 size={20} className="text-red-400" />
                                </div>
                                <h3 className="text-white text-base font-semibold text-center mb-1">
                                    Delete all critical rows?
                                </h3>
                                <p className="text-gray-400 text-xs text-center mb-5">
                                    This will permanently delete <span className="text-red-400 font-medium">{data.critical.length} rows</span>. This cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteAllConfirm(false)}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteAllCritical}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors"
                                    >
                                        Yes, Delete All
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/*  Confirm All Warnings Modal  */}
                    {confirmAllWarningConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 mx-auto mb-4">
                                    <CircleAlert size={20} className="text-green-400" />
                                </div>
                                <h3 className="text-white text-base font-semibold text-center mb-1">
                                    Confirm all warning rows?
                                </h3>
                                <p className="text-gray-400 text-xs text-center mb-5">
                                    This will confirm <span className="text-green-400 font-medium">{data.warning.length} rows</span>. You can still review them later in the "Info" tab. Are you sure?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setConfirmAllWarningConfirm(false)}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmAllWarning}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors"
                                    >
                                        Yes, Confirm All
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Confirm All Info Modal */}
                    {confirmAllInfoConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 mx-auto mb-4">
                                    <CircleAlert size={20} className="text-green-400" />
                                </div>
                                <h3 className="text-white text-base font-semibold text-center mb-1">
                                    Confirm all rows?
                                </h3>
                                <p className="text-gray-400 text-xs text-center mb-5">
                                    This will confirm <span className="text-green-400 font-medium">{data.info.length} rows</span>. for the visualization and analysis these rows will be treated as clean and valid. Are you sure?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setConfirmAllInfoConfirm(false)}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmAllInfo}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                                    >
                                        Yes, Confirm All
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}  

                    {errorPopup && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                                <h3 className="text-white text-base font-semibold mb-4">Validation Errors</h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {(typeof errorPopup.errors === "string"
                                        ? JSON.parse(errorPopup.errors)
                                        : errorPopup.errors
                                    ).map((code, i) => {
                                        const level = {
                                            critical: ["invalid_quantity","invalid_price","missing_product","unresolvable_row","invalid_date"],
                                            warning:  ["missing_date","month_date_mismatch","year_date_mismatch","date_period_outlier",
                                                    "price_outlier","quantity_outlier","missing_quantity","missing_price",
                                                    "duplicate_row","missing_category"],
                                        };
                                        const color = level.critical.includes(code)
                                            ? "border-red-500/40 bg-red-500/10 text-red-400"
                                            : level.warning.includes(code)
                                            ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                                            : "border-blue-500/40 bg-blue-500/10 text-blue-400";
                                        return (
                                            <div key={i} className={`flex items-start gap-3 px-3 py-2 rounded-lg border ${color}`}>
                                                <span className="font-mono text-xs font-medium mt-0.5">{code.trim()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setErrorPopup(null)}
                                    className="mt-5 w-full px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}      
                </div>
            </div>    
            
        </div>

    )

}    

export default ReviewPage;