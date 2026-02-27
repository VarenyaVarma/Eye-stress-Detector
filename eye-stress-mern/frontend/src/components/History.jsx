import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react"; // 🗑️ icon

export default function HistoryPage() {
  const [readings, setReadings] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🧠 Fetch readings on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/readings", {
          headers: { Authorization: "Bearer " + token },
        });
        setReadings(res.data);
      } catch (err) {
        console.error("❌ Error fetching history:", err);
        setError("Failed to load history.");
      }
    };
    fetchHistory();
  }, []);

  // 🗑️ Delete single reading
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record permanently?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/readings/${id}`, {
        headers: { Authorization: "Bearer " + token },
      });
      setReadings(readings.filter((r) => r._id !== id)); // remove from UI
    } catch (err) {
      console.error("❌ Error deleting reading:", err);
      alert("Failed to delete record.");
    }
  };

  // 🗑️ Delete all readings
  const handleDeleteAll = async () => {
    if (!window.confirm("⚠️ This will permanently delete ALL your history. Continue?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/readings", {
        headers: { Authorization: "Bearer " + token },
      });
      setReadings([]); // instantly clear UI
      alert("All history deleted successfully.");
    } catch (err) {
      console.error("❌ Error deleting all:", err);
      alert("Failed to delete history.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto text-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">History</h2>

        {readings.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-500 font-medium"
          >
            🗑️ Delete All
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-center">{error}</p>}

      {readings.length === 0 ? (
        <p className="text-center text-slate-400">No uploads yet.</p>
      ) : (
        <div className="space-y-5">
          {readings.map((r) => (
            <div
              key={r._id}
              className="bg-slate-800 rounded-xl p-4 shadow-md border border-slate-700 flex items-center justify-between"
            >
              {/* Left Section - Image + Info */}
              <div className="flex items-center gap-4">
                <img
                  src={r.path}
                  alt="thumb"
                  className="w-16 h-16 rounded-md object-cover border border-slate-600"
                  onError={(e) => (e.target.src = "/placeholder.png")}
                />
                <div>
                  <p className="text-sm text-slate-300">
                    <strong>Score:</strong> {r.stressScore.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">{r.note}</p>
                </div>
              </div>

              {/* Right Section - Buttons */}
              <div className="flex items-center gap-3">
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(r._id)}
                  className="text-rose-500 hover:text-rose-400 transition"
                  title="Delete this record"
                >
                  <Trash2 size={22} />
                </button>

                {/* View Button */}
                <button
                  onClick={() => navigate(`/result/${r._id}`)}
                  className="px-3 py-1 bg-cyan-500 text-black rounded-md font-semibold hover:bg-cyan-400"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
