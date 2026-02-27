import React, { useState, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [chart, setChart] = useState(null);
  const [stressScore, setStressScore] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [latestId, setLatestId] = useState(null); // 🆕 Track latest record ID

  const webcamRef = useRef(null);

  const handleCapture = () => {
    const image = webcamRef.current.getScreenshot();
    setImageSrc(image);
  };

  const handleRetake = () => {
    setImageSrc(null);
  };

  // 🧠 Analyze and Save to History
  const handleAnalyze = async (capturedImage = null) => {
    setError("");
    setReport(null);
    setChart(null);
    setStressScore(null);
    setProgress(0);
    setLatestId(null);

    let imageFile = file;
    if (capturedImage) {
      const byteString = atob(capturedImage.split(",")[1]);
      const mimeString = capturedImage.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      imageFile = new File([ab], "captured_photo.jpg", { type: mimeString });
    }

    if (!imageFile) {
      setError("Please capture or upload a file.");
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const email = user?.email;
      const token = localStorage.getItem("token");

      if (!email || !token) {
        setError("User not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("email", email);

      const endpoint = imageFile.type.startsWith("video/")
        ? "http://127.0.0.1:8000/analyze_video"
        : "http://127.0.0.1:8000/analyze_image";

      setIsVideo(imageFile.type.startsWith("video/"));

      // 🧠 Send to FastAPI backend
      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      setReport(response.data.report);
      setChart(response.data.chart);
      setStressScore(response.data.stressScore);

      // ✅ Save Record to Express Backend (/api/readings)
      const saveRes = await axios.post(
        "http://localhost:5000/api/readings",
        {
          path: response.data.image_url,
          chartUrl: response.data.chart,
          stressScore: response.data.stressScore || 0,
          report: response.data.report,
          note: "Auto-saved after analysis",
        },
        {
          headers: { Authorization: "Bearer " + token },
        }
      );

      setLatestId(saveRes.data._id);
      console.log("✅ Analysis saved to history successfully!");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setError("Error uploading or analyzing file.");
    }

    setLoading(false);
  };

  // 🗑️ Delete the latest uploaded record
  const handleDeleteLatest = async () => {
    if (!latestId) return;
    if (!window.confirm("Are you sure you want to delete this analysis?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/readings/${latestId}`, {
        headers: { Authorization: "Bearer " + token },
      });
      setReport(null);
      setChart(null);
      setStressScore(null);
      setLatestId(null);
      alert("Deleted successfully.");
    } catch (err) {
      console.error("❌ Error deleting record:", err);
      alert("Failed to delete record.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleAnalyze();
  };

  return (
    <div className="max-w-5xl mx-auto text-slate-100 p-6">
      <h2 className="text-2xl font-semibold mb-8 text-center tracking-wide">
        AI Stress Detection — Capture or Upload
      </h2>

      <div className="grid md:grid-cols-2 gap-10">
        {/* 📸 Camera Section */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col items-center">
          <h3 className="text-teal-300 font-semibold mb-3 text-lg">Live Camera</h3>

          {!imageSrc ? (
            <>
              <div className="relative rounded-full overflow-hidden w-64 h-64 border-4 border-teal-400 shadow-md">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{ facingMode: "user" }}
                />
              </div>
              <button
                onClick={handleCapture}
                className="mt-5 px-5 py-2 bg-gradient-to-r from-teal-400 to-cyan-400 text-black font-semibold rounded-full hover:scale-[1.05] transition"
              >
                📸 Capture
              </button>
            </>
          ) : (
            <>
              <img
                src={imageSrc}
                alt="Captured"
                className="rounded-full w-64 h-64 border-4 border-cyan-400 shadow-md object-cover"
              />
              <div className="flex gap-4 mt-5">
                <button
                  onClick={handleRetake}
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full hover:scale-[1.05] transition"
                >
                  🔁 Retake
                </button>
                <button
                  onClick={() => handleAnalyze(imageSrc)}
                  className="px-4 py-2 bg-gradient-to-r from-teal-400 to-cyan-400 text-black font-semibold rounded-full hover:scale-[1.05] transition"
                >
                  🧠 Analyze
                </button>
              </div>
            </>
          )}
        </div>

        {/* 🗂️ Upload Section */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-teal-300 font-semibold mb-3 text-lg">Upload Image / Video</h3>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-slate-200 bg-slate-700/40 p-3 rounded-md border border-slate-600 hover:border-teal-400 transition"
            />
            {file && (
              <p className="mt-3 text-sm text-slate-400 italic">
                Selected file: <span className="text-teal-400 font-medium">{file.name}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`mt-6 px-5 py-2 rounded-full font-semibold transition-all duration-200 ${
              loading
                ? "bg-slate-500 text-slate-300 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-400 to-cyan-400 text-black hover:shadow-lg hover:scale-[1.05]"
            }`}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>
        </form>
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="mt-8">
          <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 h-2.5 rounded-full animate-pulse transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-center mt-1 text-slate-400">
            Uploading & analyzing... {progress}%
          </p>
        </div>
      )}

      {/* 🧾 Results Section */}
      {report && (
        <div className="mt-10 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 text-center">
          <h3 className="text-lg font-semibold text-teal-300 mb-3">
            {isVideo ? "🎥 Video Analysis Report" : "📷 Image Analysis Report"}
          </h3>

          {/* Full Text Report */}
          <div className="bg-slate-900/60 p-4 rounded-xl mb-6 text-left text-slate-200 whitespace-pre-wrap leading-relaxed">
            {report}
          </div>

          {/* Pie Chart */}
          {chart && (
            <div className="flex flex-col items-center">
              <img
                src={chart}
                alt="Stress Level Distribution"
                className="rounded-xl border border-slate-700 shadow-md max-w-sm hover:scale-[1.03] transition-transform duration-200"
              />
              {stressScore !== null && (
                <p className="mt-4 text-slate-300 font-semibold">
                  <span className="text-rose-400">🧠 Stress: {stressScore.toFixed(2)}%</span>
                  {"  |  "}
                  <span className="text-green-400">
                    🙂 Normal: {(100 - stressScore).toFixed(2)}%
                  </span>
                </p>
              )}
            </div>
          )}

          {/* 🗑️ Delete Button */}
          {latestId && (
            <button
              onClick={handleDeleteLatest}
              className="mt-5 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-500"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      )}

      {error && <div className="text-red-400 text-center mt-3 font-medium">{error}</div>}
    </div>
  );
}
