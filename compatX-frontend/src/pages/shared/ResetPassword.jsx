import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomerNavbar from "../../components/layout/CustomerNavbar";
import axiosClient from "../../lib/axiosClient";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await axiosClient.post("/password-reset/reset", {
                token,
                newPassword: password,
            });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <>
                <CustomerNavbar />
                <div className="min-h-screen pt-20 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h1>
                        <p className="text-gray-600 mt-2">This password reset link is invalid or has expired.</p>
                    </div>
                </div>
            </>
        );
    }

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
                                    <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                                    <p className="text-sm text-gray-600 mt-2">Enter your new password</p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg flex items-center gap-2 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700">New Password</label>
                                        <div className="relative mt-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center !ring-0"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                                        <div className="relative mt-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Confirm new password"
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
                                                Resetting...
                                            </span>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Password Reset Successful!</h2>
                                <p className="text-gray-600">Redirecting to login...</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    );
}
