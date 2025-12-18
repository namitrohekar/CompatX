import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomerNavbar from "../../components/layout/CustomerNavbar";
import axiosClient from "../../lib/axiosClient";
import useAuthStore from "../../stores/useAuthStore";
import {
  User,
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState("signup");
  const [role, setRole] = useState("USER");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setAuth = useAuthStore((s) => s.setAuth);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  // const validate = () => {
  //   const e = {};

  //   if (!formData.username.trim()) e.username = "Username required";
  //   if (!formData.password.trim()) e.password = "Password required";

  //   if (mode === "signup" && !formData.email.trim()) {
  //     e.email = "Email required";
  //   }

  //   setErrors(e);
  //   return Object.keys(e).length === 0;
  // };

const validate = () => {
  const e = {};

  if (!formData.username.trim()) e.username = "Username required";

  // LOGIN: only check empty
  if (mode === "login") {
    if (!formData.password.trim()) e.password = "Password required";
  }

  // SIGNUP: stronger checks (UX-level)
  if (mode === "signup") {
    if (!formData.email.trim()) {
      e.email = "Email required";
    }

    const pwd = formData.password;
    if (!pwd) {
      e.password = "Password required";
    } else if (pwd.length < 6) {
      e.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(pwd)) {
      e.password = "Password must contain at least one capital letter";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      e.password = "Password must contain at least one special character";
    }
  }

  setErrors(e);
  return Object.keys(e).length === 0;
};




  const submit = async (e) => {
    // Guard against missing event
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");
    setErrors({}); // clear all old errors

    try {
      if (mode === "login") {
        const res = await axiosClient.post("/auth/login", {
          username: formData.username,
          password: formData.password,
          rememberMe: rememberMe,
        });

        const d = res.data || {};

        // Basic success check: require token + role
        if (!d.accessToken || !d.role) {
          setErrors({
            general: "Invalid username or password. Please try again.",
          });
          setIsLoading(false);
          return;
        }

        setAuth({
          username: d.username,
          role: d.role,
          accessToken: d.accessToken,
          refreshToken: d.refreshToken,
        });

        const redirectUrl = d.role === "ADMIN" ? "/admin" : "/";
        window.location.href = redirectUrl;
        return;
      }

      if (mode === "signup") {
        await axiosClient.post("/register", {
          userName: formData.username,
          email: formData.email,
          password: formData.password,
          role,
        });

        // SUCCESS - switch to login mode
        setMode("login");
        setFormData({
          username: formData.username,
          email: "",
          password: "",
        });
        setErrors({});
        setSuccessMessage("Account created successfully! Please login.");
        setIsLoading(false);
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data || {};

      const rawMsg =
        typeof data.message === "string"
          ? data.message
          : typeof data.error === "string"
            ? data.error
            : "";
      const lower = rawMsg.toLowerCase();

      let displayError = "Something went wrong. Please try again.";

      if (mode === "signup") {
        if (
          status === 409 ||
          lower.includes("already exists") ||
          lower.includes("already taken") ||
          lower.includes("duplicate")
        ) {
          displayError =
            "Username or email already exists. Please try a different one.";
        } else if (status === 400) {
          displayError = rawMsg || "Invalid registration data. Please check your input.";
        } else if (rawMsg) {
          displayError = rawMsg;
        } else {
          displayError = "Could not create account. Please try again.";
        }
      }

      if (mode === "login") {
        if (
          status === 401 ||
          lower.includes("invalid credentials") ||
          lower.includes("incorrect") ||
          lower.includes("wrong") ||
          lower.includes("authentication failed") ||
          lower.includes("bad credentials")
        ) {
          displayError = "Invalid username or password. Please try again.";
        } else if (status === 404 || lower.includes("not found")) {
          displayError = "User not found. Please check your username.";
        } else if (rawMsg) {
          displayError = rawMsg;
        } else {
          displayError = "Login failed. Please try again.";
        }
      }

      setErrors({ general: displayError });
      setIsLoading(false);
    }
  };



  const primaryColor = role === "ADMIN" ? "#8b5cf6" : "#4f46e5";

  const bgGradient =
    role === "ADMIN"
      ? "from-violet-50 to-violet-200"
      : "from-indigo-50 to-indigo-100";

  return (
    <>
      <CustomerNavbar />

      <div
        className={`min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br ${bgGradient} p-4 transition-colors duration-500`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
            {/* Header */}
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-1"
            >
              <motion.div
                className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Lock className="w-5 h-5 text-white" />
              </motion.div>

              <h1 className="text-xl font-bold text-gray-900">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h1>

              <p className="text-xs text-gray-600">
                {mode === "login"
                  ? "Enter your credentials to continue"
                  : "Sign up to get started with us"}
              </p>
            </motion.div>

            {/* Signup Role Toggle */}
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative bg-gray-100 rounded-xl p-1">
                    <motion.div
                      className="absolute top-1 bottom-1 rounded-lg shadow-sm"
                      style={{
                        backgroundColor: primaryColor,
                        width: "calc(50% - 4px)",
                      }}
                      animate={{
                        left: role === "USER" ? "4px" : "calc(50%)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />

                    <div className="relative flex">
                      <button
                        type="button"
                        onClick={() => setRole("USER")}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors z-10 flex items-center justify-center gap-1.5 ${role === "USER"
                          ? "text-white"
                          : "text-gray-700"
                          }`}
                      >
                        <User className="w-4 h-4" />
                        User
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole("ADMIN")}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors z-10 flex items-center justify-center gap-1.5 ${role === "ADMIN"
                          ? "text-white"
                          : "text-gray-700"
                          }`}
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 rounded-lg flex items-center gap-2 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {/* Error */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg flex items-center gap-2 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.general}</span>
              </motion.div>
            )}

            {/* FORM */}
            <form className="space-y-3" onSubmit={submit}>
              {/* Username */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>

                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleInput}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-opacity-50 ${errors.username
                      ? "border-red-500"
                      : "border-gray-300"
                      }`}
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Email */}
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label className="text-sm font-semibold text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>

                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleInput}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-opacity-50 ${errors.email
                          ? "border-red-500"
                          : "border-gray-300"
                          }`}
                        placeholder="Enter your email"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInput}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-gray-50 transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-opacity-50 ${errors.password
                      ? "border-red-500"
                      : "border-gray-300"
                      }`}
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600   !ring-0"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-500 ml-1"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <a
                    href="/forgot-password"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="button"
                onClick={submit}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                style={{ backgroundColor: primaryColor }}
                className="w-full py-2.5 rounded-lg font-semibold text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </motion.button>
            </form>

            {/* Mode Switch */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    const next = mode === "login" ? "signup" : "login";
                    setMode(next);
                    setErrors({});
                    setSuccessMessage("");
                    setFormData({ username: "", email: "", password: "" });

                    if (next === "signup") {
                      setRole("USER");
                    }
                  }}
                  style={{ color: primaryColor }}
                  className="font-semibold hover:underline"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-gray-600 text-xs mt-4"
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
