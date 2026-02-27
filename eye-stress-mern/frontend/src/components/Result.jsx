import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not authenticated. Please log in again.");
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/readings/${id}`, {
          headers: { Authorization: "Bearer " + token },
        });

        console.log("✅ Reading fetched:", response.data);
        setResult(response.data);
      } catch (err) {
        console.error("❌ Failed to load result:", err);
        setError("Could not load result.");
      }
    };

    if (id) fetchResult();
  }, [id]);

  if (error)
    return (
      <div className="text-center text-red-400 mt-10 font-medium bg-slate-800 p-6 rounded-xl border border-slate-700">
        {error}
      </div>
    );

  if (!result)
    return (
      <div className="text-center text-slate-400 mt-10 font-medium">
        Loading...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto text-slate-100 p-6">
      <h2 className="text-2xl font-semibold mb-8 text-center">
        {result.report?.includes("Video") ? "🎥 Video Result" : "📷 Image Result"}
      </h2>

      {/* Image */}
      {result.path && (
        <img
          src={
            result.path.startsWith("http")
              ? result.path
              : `http://127.0.0.1:8000/${result.path}`
          }
          alt="Analyzed"
          className="rounded-2xl shadow-lg border border-slate-700 max-w-md mx-auto mb-6"
        />
      )}

      {/* Chart */}
      {result.chartUrl && (
        <img
          src={
            result.chartUrl.startsWith("http")
              ? result.chartUrl
              : `http://127.0.0.1:8000/${result.chartUrl}`
          }
          alt="Stress Chart"
          className="rounded-2xl shadow-lg border border-slate-700 max-w-sm mx-auto mb-6"
        />
      )}

      {/* Report */}
      <pre className="bg-slate-900/70 p-4 rounded-xl text-left text-slate-200 whitespace-pre-wrap leading-relaxed max-w-2xl mx-auto">
        {result.report}
      </pre>

      <p className="mt-4 text-center text-slate-400 text-sm">
        <span className="text-rose-400 font-semibold">
          Stress: {result.stressScore.toFixed(2)}%
        </span>{" "}
        |{" "}
        <span className="text-green-400 font-semibold">
          Normal: {(100 - result.stressScore).toFixed(2)}%
        </span>
      </p>
    </div>
  );
}
