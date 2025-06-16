"use client";
import { Link } from "react-router-dom";
import { ArrowLeft, Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Decorative Elements */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-zinc-100 animate-pulse" />
          </div>
          <div className="relative">
            <AlertCircle
              size={64}
              className="mx-auto text-zinc-400 animate-bounce"
              style={{ animationDuration: "3s" }}
            />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-9xl font-bold text-zinc-900 mb-4 tracking-tight">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-zinc-900 mb-3">
          Page Not Found
        </h2>
        <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back to your projects.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/projects"
            className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-colors duration-200"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go back to projects
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2.5 border border-zinc-200 text-sm font-medium rounded-lg text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-colors duration-200"
          >
            <Home size={16} className="mr-2" />
            Go to home
          </Link>
        </div>

        {/* Decorative Pattern */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-zinc-50 text-sm text-zinc-500">
              n8n-web3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
