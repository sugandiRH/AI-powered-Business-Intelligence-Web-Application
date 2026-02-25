import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Dashboard() {

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
                setUser(res.data);   // ✅ store user
            })
            .catch(err => {
                console.log(err.response?.data);
                localStorage.removeItem("token");
                navigate("/login");
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

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            <div className="flex min-h-full flex-col justify-center px-6 py-5 lg:px-8 mb-10">
                <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
                {user && (
                    <h2 className="mt-4 text-xl">
                        Hello, <span className="text-blue-400 font-semibold">{user.name}</span>
                    </h2>
                )}
                <button onClick={handleLogout} className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Dashboard;