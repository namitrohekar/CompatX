import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";

export default function Unauthorized() {

const navigate = useNavigate();

  const{ accessToken , role } = useAuthStore();

  useEffect(() =>{
    if(accessToken && role === "USER"){
      navigate("/");
    }
  },[accessToken , role , navigate]);

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-md w-full text-center">
        
        {/* Icon */}
        <div className="mb-6 flex justify-center animate-bounce">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          403 - Access Denied
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-2">
          You don't have permission to access this page.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          This area is restricted to <span className="font-semibold text-red-600">administrators</span> only.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <Home size={18} />
            Go to Home
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Need admin access?</strong> Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}