import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Shield,
  Clock,
  TrendingUp,
  Zap,
  Users,
  Bell,
  BarChart3,
  Lock,
  Upload,
  Award,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage or default to 'dark'
    return localStorage.getItem('theme') || 'dark';
  });
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn && isLoaded && user) {
      const role = user?.publicMetadata?.role;

      // Redirect SUPER_ADMIN to super admin dashboard
      if (role === 'SUPER_ADMIN') {
        navigate('/super-admin/dashboard');
      } else {
        navigate('/onboarding-dark');
      }
    }
  }, [isSignedIn, isLoaded, user, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };


  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered Document Extraction",
      description:
        "Upload driver documents and let AI extract expiry dates automatically. Review, verify, and edit extracted data before saving - giving you full control.",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Automated Reminders",
      description:
        "Set up to 3 custom reminder intervals per document type. Send email and SMS alerts to keep drivers compliant before documents expire.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Compliance Tracking",
      description:
        "Real-time compliance scores for each driver. Instantly see verified, expired, and expiring documents with color-coded status indicators.",
    },
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Secure Driver Portal",
      description:
        "Send drivers a secure upload link via email or SMS. No login required - they simply upload their documents directly to your system.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Flexible Plans",
      description:
        "Start free with 5 drivers, upgrade to Starter (25 drivers), Professional (100 drivers), or Enterprise (unlimited). Scale as you grow.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Comprehensive Dashboard",
      description:
        "Track all drivers, document statuses, expiry dates, and compliance scores in one place. Filter and search with ease.",
    },
  ];

  const benefits = [
    {
      icon: <Clock />,
      title: "Save Hours Every Week",
      desc: "Automate document tracking & reminders",
    },
    {
      icon: <TrendingUp />,
      title: "Real-Time Compliance",
      desc: "Instant visibility into driver status",
    },
    {
      icon: <Lock />,
      title: "Secure S3 Storage",
      desc: "Bank-grade encryption for all documents",
    },
    {
      icon: <Award />,
      title: "AI-Powered Accuracy",
      desc: "Extract data from documents instantly",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Add Drivers & Configure",
      desc: "Set up your company, add drivers, and configure document types you want to track",
      icon: <Users />,
    },
    {
      step: "2",
      title: "Upload or Send Links",
      desc: "Upload documents directly, use AI extraction, or send secure upload links to drivers via email/SMS",
      icon: <Upload />,
    },
    {
      step: "3",
      title: "Review & Verify",
      desc: "AI extracts document data. Review, edit if needed, and mark documents as verified, expired, or expiring",
      icon: <CheckCircle />,
    },
    {
      step: "4",
      title: "Automated Reminders",
      desc: "Set custom reminder intervals. System automatically sends email/SMS alerts before expiry dates",
      icon: <Bell />,
    },
  ];

  const pricing = [
    {
      name: "Free",
      price: "0",
      features: [
        "Up to 5 drivers",
        "1 document type per driver",
        "5 AI credits (one-time)",
        "Email notifications",
        "Document reminders",
        "Basic dashboard",
      ],
      cta: "Get Started Free",
    },
    {
      name: "Starter",
      price: "49",
      features: [
        "Up to 25 drivers",
        "5 document types per driver",
        "100 AI credits/month",
        "Email notifications",
        "Document reminders",
        "Priority support",
      ],
      cta: "Start Free Trial",
    },
    {
      name: "Professional",
      price: "149",
      features: [
        "Up to 100 drivers",
        "10 document types per driver",
        "500 AI credits/month",
        "Email + SMS notifications",
        "Advanced analytics",
        "Priority support",
        "Billing & invoicing",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Unlimited drivers",
        "Unlimited document types",
        "Unlimited AI credits",
        "Email + SMS + WhatsApp",
        "Multi-location support",
        "Dedicated support",
        "Custom integrations",
      ],
      cta: "Contact Sales",
    },
  ];

  return (
    <div className={`w-screen min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'text-white bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
        : 'text-slate-900 bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? theme === 'dark'
              ? "bg-slate-900/95 backdrop-blur-lg shadow-lg"
              : "bg-white/95 backdrop-blur-lg shadow-lg"
            : "bg-transparent"
        }`}>
        <div className="px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="object-contain w-14 h-14" />
              </div>
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Complyo
              </span>
            </div>

            <div className="items-center hidden space-x-8 md:flex">
              <a
                href="#features"
                className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                Features
              </a>
              <a
                href="#how-it-works"
                className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                How It Works
              </a>
              <a
                href="#pricing"
                className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                Pricing
              </a>
              <button
                onClick={toggleTheme}
                className={`p-2 transition-all rounded-lg ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}
                aria-label="Toggle theme">
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700" />
                )}
              </button>
              <SignedOut>
                <SignInButton>
                  <button className="px-6 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/50">
                    Get Started
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={`border-t md:hidden backdrop-blur-lg ${
            theme === 'dark'
              ? 'bg-slate-900/95 border-slate-800'
              : 'bg-white/95 border-slate-200'
          }`}>
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className={`block ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                Features
              </a>
              <a href="#how-it-works" className={`block ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                How It Works
              </a>
              <a href="#pricing" className={`block ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                Pricing
              </a>
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-between w-full p-3 transition-all rounded-lg ${
                  theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-200'
                }`}
                aria-label="Toggle theme">
                <span>Theme</span>
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700" />
                )}
              </button>
              <SignInButton>
                <button className="w-full px-6 py-2 text-white rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600">
                  Get Started
                </button>
              </SignInButton>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-32 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 text-sm text-blue-400 border rounded-full bg-blue-500/10 border-blue-500/20">
                  Driver Document Compliance Made Simple
                </span>
              </div>
              <h1 className="text-5xl font-bold leading-tight md:text-7xl">
                Keep Every Driver
                <span className="text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text">
                  {" "}
                  Compliant
                </span>{" "}
                Effortlessly
              </h1>
              <p className={`text-xl ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                Track driver documents, get AI-powered data extraction, send automated reminders, and maintain real-time compliance scores - all in one platform.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <SignInButton>
                  <button className="flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:shadow-2xl hover:shadow-blue-500/50 group">
                    Start Free Trial
                    <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                  </button>
                </SignInButton>
                <SignInButton>
                  <button className={`px-8 py-4 text-lg font-semibold transition-all border rounded-lg ${
                    theme === 'dark'
                      ? 'border-slate-700 hover:bg-slate-800 text-white'
                      : 'border-slate-300 hover:bg-slate-100 text-slate-900'
                  }`}>
                    Get Started
                  </button>
                </SignInButton>
              </div>
              <div className={`flex items-center space-x-8 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Free forever plan available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-900/20 via-blue-600/20 to-teal-500/20 blur-3xl"></div>
              <div className={`relative p-8 border shadow-2xl rounded-2xl ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
                  : 'bg-gradient-to-br from-white to-slate-50 border-slate-300'
              }`}>
                <div className="space-y-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border transition-all duration-500 ${
                        theme === 'dark'
                          ? 'bg-slate-800/50 border-slate-700'
                          : 'bg-white/50 border-slate-300'
                      } ${
                        activeFeature === i
                          ? "border-blue-500 shadow-lg shadow-blue-500/20"
                          : ""
                      }`}>
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-3 rounded-lg ${
                            activeFeature === i
                              ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400"
                              : theme === 'dark'
                              ? "bg-slate-700 text-slate-400"
                              : "bg-slate-200 text-slate-600"
                          }`}>
                          {features[i].icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{features[i].title}</h4>
                          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                            {features[i].description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className={`py-12 bg-gradient-to-r from-blue-900/10 via-blue-600/10 to-teal-500/10 border-y ${
        theme === 'dark' ? 'border-slate-800' : 'border-slate-300'
      }`}>
        <div className="px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="text-center">
                <div className="inline-block p-3 mb-3 rounded-lg bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-cyan-500/20">
                  {React.cloneElement(benefit.icon, {
                    className: "w-6 h-6 text-blue-400",
                  })}
                </div>
                <h4 className="mb-1 text-lg font-bold">{benefit.title}</h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Everything You Need for
              <span className="text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text">
                {" "}
                Compliance Excellence
              </span>
            </h2>
            <p className={`text-xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Powerful features designed for modern delivery service providers
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`p-8 transition-all border rounded-xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 group ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
                    : 'bg-gradient-to-br from-white to-slate-50 border-slate-300'
                }`}>
                <div className="inline-block p-3 mb-4 transition-transform rounded-lg bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-cyan-500/20 group-hover:scale-110">
                  {React.cloneElement(feature.icon, {
                    className: "text-blue-400",
                  })}
                </div>
                <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className={`px-6 py-20 bg-gradient-to-b from-transparent ${
          theme === 'dark' ? 'to-slate-900/50' : 'to-slate-100/50'
        }`}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Get Compliant in
              <span className="text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text">
                {" "}
                Four Simple Steps
              </span>
            </h2>
            <p className={`text-xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              From onboarding to compliance in minutes, not hours
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative">
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-transparent -translate-x-8"></div>
                )}
                <div className={`p-6 transition-all border rounded-xl hover:border-blue-500/50 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
                    : 'bg-gradient-to-br from-white to-slate-50 border-slate-300'
                }`}>
                  <div className="flex items-center justify-center w-12 h-12 mb-4 text-2xl font-bold text-white rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600">
                    {step.step}
                  </div>
                  <div className="inline-block p-3 mb-4 rounded-lg bg-blue-500/10">
                    {React.cloneElement(step.icon, {
                      className: "w-6 h-6 text-blue-400",
                    })}
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                  <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Choose Your
              <span className="text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text">
                {" "}
                Perfect Plan
              </span>
            </h2>
            <p className={`text-xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Flexible pricing that grows with your fleet
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pricing.map((plan, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900'
                    : 'bg-gradient-to-br from-white to-slate-50'
                } ${
                  plan.popular
                    ? "border-blue-500 shadow-2xl shadow-blue-500/20"
                    : theme === 'dark'
                    ? "border-slate-700"
                    : "border-slate-300"
                } relative`}>
                {plan.popular && (
                  <div className="absolute px-4 py-1 text-sm font-semibold text-white -translate-x-1/2 rounded-full -top-4 left-1/2 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600">
                    Most Popular
                  </div>
                )}
                <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>/month</span>
                  )}
                </div>
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center space-x-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-400" />
                      <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/50 text-white"
                      : theme === 'dark'
                      ? "bg-slate-700 hover:bg-slate-600 text-white"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-900"
                  }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p className={`mt-12 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Start free with 5 drivers • Upgrade anytime • Cancel anytime • All paid plans include Stripe billing
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-12 overflow-hidden text-center bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-cyan-400/20 to-transparent"></div>
            <div className="relative z-10">
              <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
                Ready to Automate Driver Compliance?
              </h2>
              <p className="mb-8 text-xl text-blue-50">
                Start free with 5 drivers. No credit card required. Upgrade anytime.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <SignInButton>
                  <button className="flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-700 transition-all bg-white rounded-lg hover:bg-blue-50 group">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                  </button>
                </SignInButton>
                <SignInButton>
                  <button className="px-8 py-4 text-lg font-semibold text-white transition-all border-2 border-white rounded-lg hover:bg-white/10">
                    Get Started
                  </button>
                </SignInButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`px-6 py-12 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 mb-8 md:grid-cols-4">
            <div>
              <div className="flex items-center mb-4 space-x-3">
                <img src="/logo.png" alt="Complyo Logo" className="w-10 h-10 object-contain" />
                <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Complyo</span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Streamline driver document compliance with AI-powered tracking, automated reminders, and real-time visibility.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                <li>
                  <a href="#" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                <li>
                  <a href="#" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                <li>
                  <a href="/policies/privacy-policy" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/policies/terms-of-service" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/policies/sms-consent" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                    SMS Terms
                  </a>
                </li>
                <li>
                  <a href="/policies/cookie-preferences" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                    Cookie Settings
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className={`pt-8 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}>
            {/* Footer Links */}
            <div className={`flex flex-wrap items-center justify-center gap-4 mb-4 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <a href="/policies/privacy-policy" className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                Privacy Policy
              </a>
              <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}>•</span>
              <a href="/policies/terms-of-service" className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                Terms of Service
              </a>
              <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}>•</span>
              <a href="/policies/sms-consent" className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                SMS Terms
              </a>
              <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}>•</span>
              <a href="/policies/cookie-preferences" className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                Cookie Settings
              </a>
              <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}>•</span>
              <a href="#contact" className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                Contact
              </a>
            </div>
            {/* Copyright */}
            <p className={`text-sm text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>© 2025 Complyo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
