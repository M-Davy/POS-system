"use client";

import { useState } from "react";
import { FaUser, FaLock, FaSignInAlt, FaGoogle, FaFacebookF, FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Prepare the data to match your Spring Boot UserDto
    const data = { 
      email: username, 
      password 
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Store the token if returned in the response
        const tokenToStore = result.jwt || result.token;
        if (tokenToStore) {
          localStorage.setItem("token", tokenToStore);
        } else {
          console.error("No token found in response:", result);
        }
        
        // Store user info if available
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user));
        }

        setMessage(result.message || "Login successful! Redirecting...");
        setMessageType("success");

        // Redirect based on user role
        setTimeout(() => {
          if (result.user && result.user.role === "ROLE_ADMIN") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/cashier";
          }
        }, 1500);
      } else {
        setMessage(result.message || result.error || "Login failed. Please check your credentials.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("A network error occurred. Please check your connection.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="animate-fade-in w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">
          {/* Left side - Brand & Image */}
          <div className="relative bg-gradient-to-br from-emerald-600 to-teal-500 p-8 lg:p-12 flex flex-col justify-between">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-400 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-10"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 rounded-full translate-x-1/3 translate-y-1/3 opacity-10"></div>
            
            {/* Logo and brand */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
                  <Image 
                    src="/images/logo.jpeg" 
                    alt="ESIT Groceries Logo" 
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">ESIT GROCERIES</h1>
                  <p className="text-emerald-100 text-sm mt-1">Fresh Products, Better Living</p>
                </div>
              </div>
              
              <div className="mt-12">
                <h2 className="text-2xl font-semibold text-white mb-4">Welcome Back!</h2>
                <p className="text-emerald-100 max-w-md">
                  Sign in to access your dashboard and manage your grocery operations efficiently.
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="relative z-10 mt-8 lg:mt-0">
              <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <Image 
                  src="/images/groceries.jpeg" 
                  alt="Fresh Groceries" 
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                <p className="text-gray-600">Enter your credentials to continue</p>
              </div>

              {message && (
                <div className={`animate-slide-down mb-6 p-4 rounded-xl border ${
                  messageType === "success" 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                    : "bg-red-50 border-red-200 text-red-700"
                }`}>
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      messageType === "success" ? "bg-emerald-100" : "bg-red-100"
                    }`}>
                      {messageType === "success" ? (
                        <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{message}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    
                    </div>
                    <input
                      type="text"
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 hover:border-gray-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 hover:border-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                      ) : (
                        <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                    loading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Sign In
                      <FaSignInAlt className="ml-2 h-5 w-5" />
                    </div>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                 
                </div>
              </div>

             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}