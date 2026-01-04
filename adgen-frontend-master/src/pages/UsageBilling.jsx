import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Image, Download, Sparkles, Crown, Check } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function UsageBilling() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Load usage stats
    const [stats, setStats] = useState(() => {
        const projects = JSON.parse(localStorage.getItem('adgen_projects') || '[]');
        return {
            projects: projects.length,
            exports: user?.exports || 0,
            aiRequests: parseInt(localStorage.getItem('adgen_ai_requests') || '0'),
            storageUsed: projects.length * 0.5 // Mock: 0.5MB per project
        };
    });

    const plans = [
        {
            name: 'Free',
            price: '$0',
            period: 'forever',
            current: true,
            features: [
                '5 projects',
                '10 exports/month',
                '50 AI requests/month',
                '500MB storage',
                'Basic templates'
            ]
        },
        {
            name: 'Pro',
            price: '$19',
            period: 'per month',
            current: false,
            popular: true,
            features: [
                'Unlimited projects',
                'Unlimited exports',
                '500 AI requests/month',
                '10GB storage',
                'All templates',
                'Priority support',
                'Custom brand kits'
            ]
        },
        {
            name: 'Team',
            price: '$49',
            period: 'per month',
            current: false,
            features: [
                'Everything in Pro',
                'Up to 5 team members',
                'Unlimited AI requests',
                'API access',
                'White-label exports',
                'Dedicated support'
            ]
        }
    ];

    return (
        <div className="flex min-h-screen bg-blue-700">
            <Sidebar />

            <main className="flex-1 bg-gray-50 rounded-l-3xl p-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Usage & Billing</h1>
                </div>

                {/* Usage Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Image className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-gray-600">Projects</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{stats.projects}</p>
                        <p className="text-sm text-gray-500 mt-1">of 5 free</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Download className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-gray-600">Exports</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{stats.exports}</p>
                        <p className="text-sm text-gray-500 mt-1">of 10 this month</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-gray-600">AI Requests</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{stats.aiRequests}</p>
                        <p className="text-sm text-gray-500 mt-1">of 50 this month</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <Zap className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-gray-600">Storage</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{stats.storageUsed.toFixed(1)}MB</p>
                        <p className="text-sm text-gray-500 mt-1">of 500MB free</p>
                    </div>
                </div>

                {/* Plans */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`bg-white rounded-2xl p-6 shadow-sm relative ${plan.popular ? 'ring-2 ring-blue-500' : ''
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                                    Most Popular
                                </div>
                            )}

                            {plan.current && (
                                <div className="absolute top-4 right-4 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Current
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-3xl font-bold text-gray-800">{plan.price}</span>
                                <span className="text-gray-500">/{plan.period}</span>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-3 rounded-xl font-semibold transition ${plan.current
                                        ? 'bg-gray-100 text-gray-500 cursor-default'
                                        : plan.popular
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-800 text-white hover:bg-gray-900'
                                    }`}
                                disabled={plan.current}
                            >
                                {plan.current ? 'Current Plan' : 'Upgrade'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Billing History */}
                <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Billing History</h2>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="text-center py-8 text-gray-500">
                        <Crown className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No billing history yet</p>
                        <p className="text-sm">Upgrade to Pro to unlock more features</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
