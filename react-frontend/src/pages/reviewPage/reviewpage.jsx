import { useState } from "react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import api from "../../services/api";

function ReviewPage() {
    const { datasetId } = useParams();
    const [response, setResponse] = useState(null);

    useEffect(() => {
        api.get(`/temp_business_data/${datasetId}`)
            .then(res => setResponse(res.data.temp_business_data))
            .catch(err => console.error(err));
    }, [datasetId]);

    // Helper to get color class for error level
    const errorlevelColors = (error_level) => {
        if (error_level === "critical") {
            return "text-red-500 font-semibold";
        } else if (error_level === "warning") {
            return "text-yellow-500 font-semibold";
        } else if (error_level === "info") {
            return "text-green-500 font-semibold";
        }
        return "";
    };

    // Handle confirm review button click
    const handleConfirmReview = async () => {
        try {
            const res = await api.post("/confirm_review", { dataset_id: datasetId });

        } catch (err) {
            console.error("Error confirming review:", err);
        }
    };

    // Render table if response exists
    const renderTable = () => {
        if (!response) return null;

        // If response is an array of rows (from backend), handle as array
        // If response is a single object, wrap in array
        const rows = Array.isArray(response) ? response : [response];

        return (
            <div className="mt-4">
                <h2 className="text-xl font-bold mb-4">
                    Data Review{rows[0]?.dataset_id ? ` for Dataset ID: ${rows[0].dataset_id}` : ""}
                </h2>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error Level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validation Errors</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rows.map((row, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date || "N/A"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.month || "N/A"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.year || "N/A"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.product_name || row.product || "N/A"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.quantity || "N/A"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.price || "N/A"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.total || "N/A"}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${errorlevelColors(row.error_level)}`}>{row.error_level || "N/A"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.validation_errors || "None"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6">
            <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleConfirmReview}
            >
                Confirm Review
            </button>
            {renderTable()}
        </div>
    );
}

export default ReviewPage;