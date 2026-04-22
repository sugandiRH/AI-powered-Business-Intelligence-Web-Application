import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import {
  ChevronDown,
  LayoutDashboard,
  Upload,
  BarChart3,
  Settings,
  LogOut,
  FileText,
  Trash2,
  Eye,
} from "lucide-react";

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [datasets, setDatasets] = useState([]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDatasetOpen, setIsDatasetOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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

        // get dataset list
        api.get("/datasets")
            .then(res => {
                setDatasets(res.data);
            })
            .catch(err => {
                console.log("Dataset error:", err.response?.data);
            });

    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            localStorage.removeItem("token");
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
    };

    const viewDataSet = (id, stats) => {
        if (stats=== "Start Review" | stats === "completed") {
            navigate(`/review1/${id}`);
        }
    }

    // navigate to visual board 
    const viewVisualization = (id) => {
        navigate(`/visualization/${id}`);
    }

    const deleteDataSet = (id) =>{
        
    }

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
                    <div className="flex items-center space-x-3 hover:bg-gray-800 p-2 rounded cursor-pointer"
                        onClick={() => navigate("/dashboard")}
                    >
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
                        <h1 className="text-xl font-bold">Dashboard</h1>

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
                    <div className="p-6 overflow-y-auto">

                        {/* summary card */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-gray-800 text-white p-6 rounded-xl shadow ">
                                <h3 className="text-lg font-bold">Total Datasets</h3>
                                <p className="text-2xl font-bold">
                                    {stats ? stats.total_uploads : 0}
                                </p>
                            </div>
                            <div className="bg-gray-800 text-white p-6 rounded-xl shadow">
                                <h3 className="text-lg font-bold">Total Visualizations</h3>
                                <p className="text-2xl font-bold">5</p>
                            </div>
                            <div className="bg-gray-800 text-white p-6 rounded-xl shadow">
                                <h3 className="text-lg font-bold">Last Upload</h3>
                                <p className="text-m font-bold">
                                    {stats?.last_upload_name || "No Upload"}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {stats?.last_upload_date 
                                        ? new Date(stats.last_upload_date).toLocaleDateString()
                                        : ""
                                    }
                                </p>
                            </div>
                        </div>

                        {/* dataset table */}
                        <div className="bg-gray-800 text-white p-6 rounded-xl shadow overflow-hidden">
                            <div className="p-4 border-b">
                                <h2 className="font-semibold text-lg">Uploaded Datasets</h2>
                            </div>

                            <table className="min-w-full divide-y divide-gray-600">
                                <thead className="uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">File Name</th>
                                        <th className="px-6 py-3">Uploaded Date</th>
                                        <th className="px-6 py-3">Total Rows</th>
                                        <th className="px-6 py-3">Mapped Columns</th>
                                        <th className="px-6 py-3">Review Status</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-600">
                                    {datasets.length > 0 ? (
                                        datasets.map((dataset) => (
                                            <tr key={dataset.id}>
                                                <td className="px-4 py-2">{dataset.file_name}</td>
                                                <td className="px-4 py-2">
                                                    {new Date(dataset.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {dataset.total_rows || 0}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {dataset.columns_count || 0}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${
                                                            dataset.status === "completed"
                                                                ? "bg-green-600"
                                                                : dataset.status === "processing"
                                                                ? "bg-yellow-600"
                                                                : dataset.status === "Start Review"
                                                                ? "bg-blue-600"
                                                                : "bg-red-600"
                                                        }`}
                                                    >
                                                        {dataset.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 flex space-x-2">
                                                    {/* {dataset.status === "Start Review" && (
                                                        <Eye size={16} className="cursor-pointer text-blue-400" onClick={() => viewDataSet(dataset.id, dataset.status)} />
                                                    )} */}
                                                    {dataset.status === "completed" && (
                                                        <BarChart3 size={16} className="cursor-pointer text-green-400" onClick={() => viewVisualization(dataset.id)} />
                                                    )}
                                                    <Eye size={16} className="cursor-pointer text-blue-400" onClick={() => viewDataSet(dataset.id, dataset.status)} />
                                                    <Trash2 size={16} className="cursor-pointer text-red-500" onClick={() => deleteDataSet(dataset.id)} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-gray-400">
                                                No datasets found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>

                    

                </div>
            </div>


        </div>
    );
}

export default Dashboard;