import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CustomerNavbar from "../../components/layout/CustomerNavbar";
import axiosClient from "../../lib/axiosClient";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await axiosClient.post("/password-reset/request", { email });
            console.log("Password reset response:", response.data);
            setSuccess(true);
        } catch (err) {
            console.error("Password reset error:", err.response?.data || err.message);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to send reset email. Please try again.";
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <CustomerNavbar />
            <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                        {!success ? (
                            <>
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Enter your email and we'll send you a reset link
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg flex items-center gap-2 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700">Email</label>
                                        <div className="relative mt-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 hover:text-white disabled:opacity-50 transition-all"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Sending...
                                            </span>
                                        ) : (
                                            "Send Reset Link"
                                        )}
                                    </button>
                                </form>

                                <Link
                                    to="/login"
                                    className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </Link>
                            </>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Check Your Email</h2>
                                <p className="text-gray-600">
                                    We've sent a password reset link to <strong>{email}</strong>
                                </p>
                                <p className="text-sm text-gray-500">
                                    The link will expire in 15 minutes
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-block mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Return to Login
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    );
}
