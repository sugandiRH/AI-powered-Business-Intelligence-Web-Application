import { useState } from "react";
import api from "../../services/api";
import { UploadCloud } from "lucide-react";

function UploadPage() {

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

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">

            <h1 className="text-2xl font-bold mb-6">Upload Dataset</h1>

            {/* Drop Area */}
            <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition 
                ${dragActive ? "border-blue-500 bg-slate-800" : "border-gray-600"}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
            >
                <UploadCloud size={40} className="mx-auto mb-4 text-gray-400" />

                <p className="mb-4">
                    Drag & Drop your Excel file here
                </p>

                <p className="text-sm text-gray-400 mb-4">
                    Supported formats: .xlsx, .xls
                </p>

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
                    <p className="mt-4 text-green-400">
                        Selected: {file.name}
                    </p>
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
                <div className="mt-6 bg-green-900 p-4 rounded">
                    <h3 className="font-bold mb-2">Success</h3>
                    <pre className="text-sm">
                        {JSON.stringify(response, null, 2)}
                    </pre>
                </div>
            )}

            {error && (
                <div className="mt-6 bg-red-900 p-4 rounded">
                    <h3 className="font-bold mb-2">Error</h3>
                    <p>{error}</p>
                </div>
            )}

        </div>
    );
}

export default UploadPage;