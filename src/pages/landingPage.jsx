import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Shield,
  Clock,
  TrendingUp,
  Zap,
  Users,
  FileText,
  Bell,
  BarChart3,
  Lock,
  Upload,
  Mail,
  MessageSquare,
  Award,
  ArrowRight,
  Menu,
  X,
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
    <div className="w-screen min-h-screen text-white bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-900/95 backdrop-blur-lg shadow-lg"
            : "bg-transparent"
        }`}>
        <div className="px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg">
                <img src="/logo.png" alt="Logo" className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text">
                Complyo
              </span>
            </div>

            <div className="items-center hidden space-x-8 md:flex">
              <a
                href="#features"
                className="transition-colors hover:text-violet-400">
                Features
              </a>
              <a
                href="#how-it-works"
                className="transition-colors hover:text-violet-400">
                How It Works
              </a>
              <a
                href="#pricing"
                className="transition-colors hover:text-violet-400">
                Pricing
              </a>
              <SignedOut>
                <SignInButton>
                  <button className="px-6 py-2 transition-all rounded-lg bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50">
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
          <div className="border-t md:hidden bg-slate-900/95 backdrop-blur-lg border-slate-800">
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block hover:text-violet-400">
                Features
              </a>
              <a href="#how-it-works" className="block hover:text-violet-400">
                How It Works
              </a>
              <a href="#pricing" className="block hover:text-violet-400">
                Pricing
              </a>
              <button className="w-full px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600">
                Get Started
              </button>
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
                <span className="px-4 py-2 text-sm border rounded-full text-violet-400 bg-violet-500/10 border-violet-500/20">
                  Driver Document Compliance Made Simple
                </span>
              </div>
              <h1 className="text-5xl font-bold leading-tight md:text-7xl">
                Keep Every Driver
                <span className="text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-500 bg-clip-text">
                  {" "}
                  Compliant
                </span>{" "}
                Effortlessly
              </h1>
              <p className="text-xl text-slate-300">
                Track driver documents, get AI-powered data extraction, send automated reminders, and maintain real-time compliance scores - all in one platform.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button className="flex items-center justify-center px-8 py-4 text-lg font-semibold transition-all rounded-lg bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:shadow-2xl hover:shadow-purple-500/50 group">
                  Start Free Trial
                  <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                </button>
                <button className="px-8 py-4 text-lg font-semibold transition-all border rounded-lg border-slate-700 hover:bg-slate-800">
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-slate-400">
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
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-purple-500/20 blur-3xl"></div>
              <div className="relative p-8 border shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-slate-700">
                <div className="space-y-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`bg-slate-800/50 p-4 rounded-lg border border-slate-700 transition-all duration-500 ${
                        activeFeature === i
                          ? "border-violet-500 shadow-lg shadow-violet-500/20"
                          : ""
                      }`}>
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-3 rounded-lg ${
                            activeFeature === i
                              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-violet-400"
                              : "bg-slate-700 text-slate-400"
                          }`}>
                          {features[i].icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{features[i].title}</h4>
                          <p className="mt-1 text-sm text-slate-400">
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
      <section className="py-12 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-purple-600/10 border-y border-slate-800">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="text-center">
                <div className="inline-block p-3 mb-3 rounded-lg bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-purple-500/20">
                  {React.cloneElement(benefit.icon, {
                    className: "w-6 h-6 text-violet-400",
                  })}
                </div>
                <h4 className="mb-1 text-lg font-bold">{benefit.title}</h4>
                <p className="text-sm text-slate-400">{benefit.desc}</p>
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
              <span className="text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text">
                {" "}
                Compliance Excellence
              </span>
            </h2>
            <p className="text-xl text-slate-400">
              Powerful features designed for modern delivery service providers
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-8 transition-all border bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-slate-700 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 group">
                <div className="inline-block p-3 mb-4 transition-transform rounded-lg bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-purple-500/20 group-hover:scale-110">
                  {React.cloneElement(feature.icon, {
                    className: "text-violet-400",
                  })}
                </div>
                <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="px-6 py-20 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Get Compliant in
              <span className="text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text">
                {" "}
                Four Simple Steps
              </span>
            </h2>
            <p className="text-xl text-slate-400">
              From onboarding to compliance in minutes, not hours
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative">
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-violet-500 to-transparent -translate-x-8"></div>
                )}
                <div className="p-6 transition-all border bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-slate-700 hover:border-violet-500/50">
                  <div className="flex items-center justify-center w-12 h-12 mb-4 text-2xl font-bold rounded-full bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600">
                    {step.step}
                  </div>
                  <div className="inline-block p-3 mb-4 rounded-lg bg-violet-500/10">
                    {React.cloneElement(step.icon, {
                      className: "w-6 h-6 text-violet-400",
                    })}
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                  <p className="text-slate-400">{step.desc}</p>
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
              <span className="text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text">
                {" "}
                Perfect Plan
              </span>
            </h2>
            <p className="text-xl text-slate-400">
              Flexible pricing that grows with your fleet
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pricing.map((plan, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border ${
                  plan.popular
                    ? "border-violet-500 shadow-2xl shadow-violet-500/20"
                    : "border-slate-700"
                } relative`}>
                {plan.popular && (
                  <div className="absolute px-4 py-1 text-sm font-semibold -translate-x-1/2 rounded-full -top-4 left-1/2 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600">
                    Most Popular
                  </div>
                )}
                <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className="text-slate-400">/month</span>
                  )}
                </div>
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center space-x-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-400" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center text-slate-400">
            Start free with 5 drivers • Upgrade anytime • Cancel anytime • All paid plans include Stripe billing
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-12 overflow-hidden text-center bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-violet-400/20 to-transparent"></div>
            <div className="relative z-10">
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                Ready to Automate Driver Compliance?
              </h2>
              <p className="mb-8 text-xl text-blue-50">
                Start free with 5 drivers. No credit card required. Upgrade anytime.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button className="flex items-center justify-center px-8 py-4 text-lg font-semibold transition-all bg-white rounded-lg text-violet-700 hover:bg-violet-50 group">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                </button>
                <button className="px-8 py-4 text-lg font-semibold text-white transition-all border-2 border-white rounded-lg hover:bg-white/10">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 mb-8 md:grid-cols-4">
            <div>
              <div className="flex items-center mb-4 space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">Complyo</span>
              </div>
              <p className="text-sm text-slate-400">
                Streamline driver document compliance with AI-powered tracking, automated reminders, and real-time visibility.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-violet-400">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-violet-400">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-violet-400">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-violet-400">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-violet-400">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-violet-400">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-violet-400">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-violet-400">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="/policies/privacy-policy" className="hover:text-violet-400">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/policies/terms-of-service" className="hover:text-violet-400">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/policies/sms-consent" className="hover:text-violet-400">
                    SMS Terms
                  </a>
                </li>
                <li>
                  <a href="/policies/cookie-preferences" className="hover:text-violet-400">
                    Cookie Settings
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800">
            {/* Footer Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-4 text-sm text-slate-400">
              <a href="/policies/privacy-policy" className="hover:text-violet-400 transition-colors">
                Privacy Policy
              </a>
              <span className="text-slate-600">•</span>
              <a href="/policies/terms-of-service" className="hover:text-violet-400 transition-colors">
                Terms of Service
              </a>
              <span className="text-slate-600">•</span>
              <a href="/policies/sms-consent" className="hover:text-violet-400 transition-colors">
                SMS Terms
              </a>
              <span className="text-slate-600">•</span>
              <a href="/policies/cookie-preferences" className="hover:text-violet-400 transition-colors">
                Cookie Settings
              </a>
              <span className="text-slate-600">•</span>
              <a href="#contact" className="hover:text-violet-400 transition-colors">
                Contact
              </a>
            </div>
            {/* Copyright */}
            <p className="text-sm text-center text-slate-400">© 2025 Complyo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
