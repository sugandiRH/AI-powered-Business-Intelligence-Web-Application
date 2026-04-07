
import { useEffect, useState } from "react";
import api from "../../services/api";
import { UploadCloud, ChevronDown, LayoutDashboard, BarChart3, Settings, LogOut, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";


function UploadPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDatasetOpen, setIsDatasetOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Auth check and user fetch (copy from dashboard)
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        api.get("/user")
            .then(res => setUser(res.data))
            .catch(err => {
                localStorage.removeItem("token");
                navigate("/login");
            });
    }, [navigate]);

    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResponse(null);
        setError(null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setResponse(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            setError(null);

            const res = await api.post("/upload", formData);

            setResponse(res.data);
            setFile(null);

        } catch (err) {
            // setError(err.response?.data?.error || "Upload failed");
            console.log("FULL ERROR:", err.response);
            console.log("DATA:", err.response?.data);
            setError(JSON.stringify(err.response?.data, null, 2));
        } finally {
            setLoading(false);
        }
    };

    const mappingResponse = async () => {
        try {
            const res = await api.post("/confirm_upload", { dataset_id: response.dataset_id });
            setResponse(res.data);

            const datasetId = res.data.dataset_id;

            if (!datasetId) {
                console.error("dataset_id missing!");
                return;
            }

            // 👉 go to review page
            navigate(`/review1/${datasetId}`);

        } catch (err) {
            console.log("Error confirming upload:", err.response);
        }
    };

    const ColumnMappingTable = ({ response }) => {
    const { columns_detected, column_mapping, confidence_scores } = response;

    // Expected system columns
    const expectedColumns = ["date", "month", "year", "product", "category", "quantity", "price", "total"];

    // Build rows: for each expected column, find if it was mapped
    const rows = expectedColumns.map((expected) => {
        // Find which user column maps to this expected column
        const userColumn = Object.entries(column_mapping).find(
        ([, mapped]) => mapped === expected
        )?.[0] ?? null;

        const confidence = userColumn ? confidence_scores[userColumn] : null;

        return { expected, userColumn, confidence };
    });

    const getConfidenceColor = (score) => {
        if (!score) return "";
        if (score >= 0.9) return "text-green-600 font-semibold";
        if (score >= 0.7) return "text-yellow-600 font-semibold";
        return "text-red-500 font-semibold";
    };

    const getConfidenceBadge = (score) => {
        if (!score) return null;
        if (score >= 0.9) return "bg-green-100 text-green-700";
        if (score >= 0.7) return "bg-yellow-100 text-yellow-700";
        return "bg-red-100 text-red-700";
    };

    return (
        <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Column Mapping Result</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Expected Column</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Your Column</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Confidence</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Status</th>
                </tr>
            </thead>
            <tbody>
                {rows.map(({ expected, userColumn, confidence }) => (
                <tr key={expected} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-blue-700">{expected}</td>
                    <td className="px-4 py-2 font-mono text-gray-700">
                    {userColumn ?? <span className="text-gray-400 italic">not found</span>}
                    </td>
                    <td className={`px-4 py-2 ${getConfidenceColor(confidence)}`}>
                    {confidence ? `${Math.round(confidence * 100)}%` : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-2">
                    {userColumn ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getConfidenceBadge(confidence)}`}>
                        Mapped
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Missing</span>
                    )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
            {response.rows_inserted} rows inserted · {columns_detected.length} columns detected
        </p>
        {/* go back button */}
        <button
            onClick={() => window.history.back()}
            // onClick={() => navigate("/review")}
            className="mt-6 bg-gray-600 px-6 py-2 rounded hover:bg-gray-700"
        >
            Go Back
        </button>

        {/* confirm to insert tempory table */}
        <button
            type="button"
            onClick={mappingResponse}
            className="bg-green-600 px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
            Confirm
        </button>
        </div>
    );
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            <div className="flex h-screen">
                {/* Sidebar */}
                <div
                    className={`bg-gray-900 text-white transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"}`}
                >
                    <div className="p-4 text-xl font-bold border-b border-gray-700">Data Talk</div>
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
                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Top Bar */}
                    <div className="bg-gray-900 text-white p-4 shadow px-6 py-4 flex justify-between items-center">
                        <h1 className="text-xl font-bold">Upload Dataset</h1>
                        <div className="relative">
                            <div
                                className="flex items-center space-x-2 cursor-pointer"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
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
                                        <button onClick={() => {
                                            localStorage.removeItem("token");
                                            navigate("/login");
                                        }}>Logout</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Upload Form Content */}
                    <div className="p-6 overflow-y-auto flex-1">
                        {/* Drop Area */}
                        <div
                            className={`border-2 border-dashed rounded-xl p-10 text-center transition ${dragActive ? "border-blue-500 bg-slate-800" : "border-gray-600"}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragActive(true);
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                        >
                            <UploadCloud size={40} className="mx-auto mb-4 text-gray-400" />
                            <p className="mb-4">Drag & Drop your Excel file here</p>
                            <p className="text-sm text-gray-400 mb-4">Supported formats: .xlsx, .xls</p>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                className="hidden"
                                id="fileInput"
                            />
                            <label
                                htmlFor="fileInput"
                                className="bg-blue-600 px-4 py-2 rounded cursor-pointer hover:bg-blue-700"
                            >
                                Choose File
                            </label>
                            {file && (
                                <p className="mt-4 text-green-400">Selected: {file.name}</p>
                            )}
                        </div>
                        {/* Upload Button */}
                        <div className="mt-6">
                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className="bg-green-600 px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? "Uploading..." : "Upload"}
                            </button>
                        </div>
                        {/* Response Display */}
                        {response && (
                            <div className="mt-6 bg-slate-900 px-10 py-5 rounded ">
                                <h3 className="font-bold mb-2">Success</h3>
                                <div className="text-sm">
                                    <ColumnMappingTable response={response} />
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="mt-6 bg-red-900 p-4 rounded">
                                <h3 className="font-bold mb-2">Error</h3>
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UploadPage;