import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Truck, Mail } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto bg-violet-200">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            CompatX
                        </h3>
                        <p className="text-sm text-gray-600">
                            Your trusted marketplace for quality products with secure shopping experience.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/products" className="text-gray-600 hover:text-indigo-600 transition-colors">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/cart" className="text-gray-600 hover:text-indigo-600 transition-colors">
                                    Cart
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="text-gray-600 hover:text-indigo-600 transition-colors">
                                    My Orders
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="text-gray-600 hover:text-indigo-600 transition-colors">
                                    Profile
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Features */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Why Choose Us</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2 text-gray-600">
                                <Shield className="w-4 h-4 text-indigo-500" />
                                <span>Secure Payments</span>
                            </li>
                            <li className="flex items-center gap-2 text-gray-600">
                                <Truck className="w-4 h-4 text-indigo-500" />
                                <span>Fast Delivery</span>
                            </li>
                            <li className="flex items-center gap-2 text-gray-600">
                                <Heart className="w-4 h-4 text-indigo-500" />
                                <span>Quality Products</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Get in Touch</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-indigo-500" />
                                <a href="mailto:compatxbuisness@gmail.com" className="hover:text-indigo-600 transition-colors">
                                  CompatXBuisness@gmail.com
                                </a>
                            </li>
                            <li className="text-gray-500 text-xs mt-4">
                                Available Mon-Sat, 9 AM - 6 PM
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-indigo-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                        <p>© {currentYear} CompatX. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link to="/" className="hover:text-indigo-600 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/" className="hover:text-indigo-600 transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
