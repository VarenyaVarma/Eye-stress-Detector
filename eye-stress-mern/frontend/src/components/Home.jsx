import React from 'react'

export default function Home() {
  return (
    <div className="grid md:grid-cols-2 gap-6 items-center">
      {/* LEFT SIDE */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Eye Stress Detector</h2>
        <p className="text-slate-300 mb-4">
          Upload a photo of your eyes and get instant results and personalized recommendations.
        </p>
        <ul className="space-y-2 text-slate-400">
          <li>✓ <strong>Smart Detection</strong> — AI-based analysis of eye stress in seconds.</li>
          <li>✓ <strong>Personalized Insights</strong> — Get recommendations to reduce strain and maintain eye health.</li>
          <li>✓ <strong>Secure & Private</strong> — Your uploads are encrypted and stored safely in your account.</li>
        </ul>
        <div className="mt-6">
          <a
            href="/signup"
            className="px-4 py-2 bg-gradient-to-r from-teal-400 to-cyan-400 text-black rounded-md"
          >
            Create Account
          </a>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="p-6 rounded-lg glass flex items-center justify-center">
        <img
          src="https://www.insightnews.com.au/wp-content/uploads/2020/07/eye-artificial-intelligence--scaled.jpg "   // 👈 put your eye image in public/hero-eye.jpg
          alt="eye"
          className="rounded-md shadow-md max-h-72 object-cover"
        />
      </div>
    </div>
  )
}
