import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "@/components/PublicLayout";
import {
  CheckCircle,
  Shield,
  FileText,
  Bell,
  Lock,
  Users,
  Clock,
  Award,
  ArrowRight,
  Zap,
  Database,
  Settings,
  FileCheck,
  Calendar,
  Activity,
  TrendingUp,
  Star,
  BarChart3,
  Target,
  Upload,
  ChevronDown,
  Quote,
} from "lucide-react";

const HealthcareCompliancePage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const handleStorageChange = () => {
      setTheme(localStorage.getItem('theme') || 'dark');
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const currentTheme = localStorage.getItem('theme') || 'dark';
      if (currentTheme !== theme) {
        setTheme(currentTheme);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  const employeeDocuments = [
    {
      icon: <Award className="w-5 h-5" />,
      title: "Professional Licenses",
      desc: "Manage medical professional licenses and credentials for all staff members",
      category: "Medical",
      stats: { active: 24, expiring: 2, expired: 0 },
      compliance: 92
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Insurance Documents",
      desc: "Monitor employee insurance policy expirations including malpractice and liability coverage",
      category: "Insurance",
      stats: { active: 18, expiring: 1, expired: 0 },
      compliance: 94
    },
    {
      icon: <FileCheck className="w-5 h-5" />,
      title: "Medical Certifications",
      desc: "Track all medical certifications including BLS, ACLS, and specialty certifications",
      category: "Medical",
      stats: { active: 32, expiring: 3, expired: 0 },
      compliance: 100
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: "Immunization Records",
      desc: "Track employee vaccination records including flu shots, Hepatitis B, MMR, and TB tests",
      category: "Medical",
      stats: { active: 45, expiring: 8, expired: 0 },
      compliance: 95
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Background Checks",
      desc: "Monitor background check and criminal record screening expiration dates for all staff",
      category: "Personal",
      stats: { active: 42, expiring: 4, expired: 0 },
      compliance: 98
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Driving Licenses",
      desc: "Monitor employee driving license renewals for medical transport and field staff",
      category: "Personal",
      stats: { active: 12, expiring: 1, expired: 0 },
      compliance: 100
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Passport & Visas",
      desc: "Track passport and work visa expirations for international medical staff",
      category: "Personal",
      stats: { active: 8, expiring: 0, expired: 0 },
      compliance: 100
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "DEA Licenses",
      desc: "Monitor DEA registration renewals for providers authorized to prescribe controlled substances",
      category: "Medical",
      stats: { active: 15, expiring: 1, expired: 0 },
      compliance: 100
    },
    {
      icon: <FileCheck className="w-5 h-5" />,
      title: "HIPAA Training",
      desc: "Track annual HIPAA training completion certificates for all healthcare staff",
      category: "Training",
      stats: { active: 48, expiring: 5, expired: 0 },
      compliance: 96
    },
  ];

  const categories = ['all', 'Medical', 'Insurance', 'Personal', 'Training'];
  const getCategoryCount = (category) => {
    if (category === 'all') return employeeDocuments.length;
    return employeeDocuments.filter(doc => doc.category === category).length;
  };

  const features = [
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Multi-Channel Reminders",
      desc: "Send automated reminders via email, SMS, and in-app notifications to stay ahead of deadlines",
      stat: "3x faster response"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Document Intelligence",
      desc: "AI-powered extraction automatically pulls expiration dates and key data from uploaded documents",
      stat: "98% accuracy"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Secure Cloud Storage",
      desc: "Bank-grade encryption on Amazon AWS ensures your sensitive healthcare documents are protected",
      stat: "256-bit encryption"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Access Control & Audit Logs",
      desc: "Role-based permissions and comprehensive audit trails for complete compliance transparency",
      stat: "Full audit trail"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Automated Reminder Chains",
      desc: "Set up to 3 custom reminder intervals per document type for proactive compliance management",
      stat: "Custom intervals"
    },
  ];

  const metrics = [
    { value: "35", unit: "%", label: "Contract Renewal Compliance", icon: <TrendingUp className="w-5 h-5" />, trend: "+12%" },
    { value: "50", unit: "%", label: "On-Time Task Completion", icon: <CheckCircle className="w-5 h-5" />, trend: "+8%" },
    { value: "4", unit: "x", label: "Automated Reminders", icon: <Zap className="w-5 h-5" />, trend: "vs manual" },
    { value: "70", unit: "%", label: "Fewer Missed Deadlines", icon: <Clock className="w-5 h-5" />, trend: "+15%" },
  ];

  const howItWorksSteps = [
    {
      number: "01",
      title: "Upload Documents",
      desc: "Drag and drop your healthcare documents or import from existing systems",
      icon: <Upload className="w-6 h-6" />
    },
    {
      number: "02",
      title: "AI Extracts Data",
      desc: "Our AI automatically extracts expiration dates and key information with 98% accuracy",
      icon: <Zap className="w-6 h-6" />
    },
    {
      number: "03",
      title: "Set Reminders",
      desc: "Configure custom reminder intervals for each document type",
      icon: <Bell className="w-6 h-6" />
    },
    {
      number: "04",
      title: "Stay Compliant",
      desc: "Receive automated alerts and maintain 100% compliance effortlessly",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  const testimonials = [
    {
      quote: "Complyo reduced our compliance overhead by 60%. The AI extraction is incredibly accurate and saves us hours every week.",
      author: "Dr. Sarah Mitchell",
      role: "Medical Director",
      organization: "CareHealth Medical Group",
      rating: 5
    },
    {
      quote: "We went from tracking everything in spreadsheets to having a complete compliance overview. The automated reminders are a game-changer.",
      author: "James Rodriguez",
      role: "Operations Manager",
      organization: "MetroHealth Clinics",
      rating: 5
    },
    {
      quote: "The dashboard gives us real-time visibility into our compliance status. We've never missed a renewal since implementing Complyo.",
      author: "Dr. Emily Chen",
      role: "Practice Administrator",
      organization: "Advanced Care Partners",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "How accurate is the AI document extraction?",
      answer: "Our AI achieves 98% accuracy in extracting expiration dates and key information. You always have the ability to review and verify extracted data before it's saved to the system."
    },
    {
      question: "What types of healthcare documents can I track?",
      answer: "You can track any document with an expiration date including medical licenses, insurance policies, staff credentials, and more. The system supports unlimited custom document types."
    },
    {
      question: "Is my healthcare data secure and HIPAA compliant?",
      answer: "Yes. All data is encrypted with 256-bit encryption and stored on Amazon AWS with bank-grade security. We maintain HIPAA compliance and provide comprehensive audit trails for all access and changes."
    },
    {
      question: "How do the automated reminders work?",
      answer: "You can set up to 3 custom reminder intervals for each document type (e.g., 90, 60, and 30 days before expiration). Reminders are sent via email, SMS, and in-app notifications to ensure you never miss a deadline."
    },
    
    {
      question: "What happens if I exceed my AI credits?",
      answer: "You can purchase additional AI credit packages or upgrade your plan. We'll notify you when you're approaching your limit so you can plan accordingly."
    }
  ];

  return (
    <PublicLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');

        .font-plex {
          font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        }

        .font-mono-custom {
          font-family: 'JetBrains Mono', monospace;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
        .stagger-5 { animation-delay: 0.5s; opacity: 0; }
        .stagger-6 { animation-delay: 0.6s; opacity: 0; }

        .text-gradient-blue-cyan {
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .border-gradient {
          position: relative;
          border: 1px solid transparent;
          background-clip: padding-box;
        }

        .border-gradient::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(6, 182, 212, 0.3));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}</style>

      {/* Sophisticated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5"></div>

        {/* Precision grid - like medical graph paper */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            linear-gradient(to right, ${theme === 'dark' ? 'rgba(59, 130, 246, 0.03)' : 'rgba(59, 130, 246, 0.05)'} 1px, transparent 1px),
            linear-gradient(to bottom, ${theme === 'dark' ? 'rgba(59, 130, 246, 0.03)' : 'rgba(59, 130, 246, 0.05)'} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>

        {/* Accent grid overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(to right, ${theme === 'dark' ? 'rgba(6, 182, 212, 0.04)' : 'rgba(6, 182, 212, 0.06)'} 1px, transparent 1px),
            linear-gradient(to bottom, ${theme === 'dark' ? 'rgba(6, 182, 212, 0.04)' : 'rgba(6, 182, 212, 0.06)'} 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px'
        }}></div>

        {/* Radial gradients for depth */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400/10 to-transparent rounded-full blur-3xl"></div>

        {/* Decorative measurement lines */}
        <div className={`absolute top-1/4 right-0 w-32 h-px ${theme === 'dark' ? 'bg-gradient-to-l from-blue-400/20 to-transparent' : 'bg-gradient-to-l from-blue-500/30 to-transparent'}`}></div>
        <div className={`absolute top-1/2 left-0 w-24 h-px ${theme === 'dark' ? 'bg-gradient-to-r from-cyan-400/20 to-transparent' : 'bg-gradient-to-r from-cyan-500/30 to-transparent'}`}></div>
      </div>

      {/* Hero Section - Asymmetric Layout */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Content */}
            <div className="space-y-8 font-plex">
              {/* Small badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full animate-fade-in-up border-blue-500/30 bg-blue-500/5">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  Healthcare Compliance Platform
                </span>
              </div>

              <h1 className="text-5xl font-bold leading-tight animate-fade-in-up stagger-1 md:text-6xl lg:text-7xl">
                Clinical-Grade
                <br />
                <span className="text-gradient-blue-cyan">
                  Compliance Management
                </span>
              </h1>

              <p className={`text-xl leading-relaxed max-w-xl animate-fade-in-up stagger-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                Systematic tracking for medical licenses, insurance policies, and training certifications.
                Never miss a critical expiration date.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 pt-4 animate-fade-in-up stagger-3 sm:flex-row">
                <button onClick={()=>(navigate("/sign-in"))} className="px-8 py-4 text-lg font-semibold text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105">
                  Start Forever Free
                </button>
                <button onClick={()=>(navigate("/contact"))} className={`group px-8 py-4 text-lg font-semibold rounded-lg border-2 transition-all duration-300 flex items-center gap-3 ${
                  theme === 'dark'
                    ? 'border-slate-700 hover:border-blue-500 text-white hover:bg-blue-500/5'
                    : 'border-slate-300 hover:border-blue-500 text-slate-900 hover:bg-blue-50'
                }`}>
                  <div className="flex items-center justify-center w-8 h-8 transition-colors rounded-full bg-blue-500/10 group-hover:bg-blue-500/20">
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  Book a Demo
                </button>
              </div>

              {/* Trust indicators */}
              <div className={`flex flex-wrap items-center gap-6 pt-4 text-sm animate-fade-in-up stagger-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>HIPAA compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span>Free forever plan</span>
                </div>
              </div>
            </div>

            {/* Right: Visual Element - Data Dashboard Preview */}
            <div className="relative animate-slide-in-right">
              {/* Main stats card */}
              <div className={`relative p-8 border rounded-2xl backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-slate-900/80 border-slate-800'
                  : 'bg-white/80 border-slate-200'
              }`}>
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Compliance Overview</h3>
                      <p className="text-2xl font-bold font-mono-custom text-gradient-blue-cyan">94.2%</p>
                    </div>
                    <div className={`px-3 py-1 text-xs font-semibold rounded-full ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                      Active
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-4">
                    {[
                      { label: 'Medical Licenses', value: 96, color: 'blue' },
                      { label: 'Insurance Docs', value: 88, color: 'cyan' },
                      { label: 'Background Checks', value: 100, color: 'blue' },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{item.label}</span>
                          <span className={`font-mono-custom font-semibold ${item.color === 'blue' ? 'text-blue-400' : 'text-cyan-400'}`}>
                            {item.value}%
                          </span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              item.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-gradient-to-r from-cyan-500 to-cyan-400'
                            }`}
                            style={{ width: `${item.value}%`, animationDelay: `${i * 0.2}s` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                    <div>
                      <p className="text-xs text-slate-400">Active</p>
                      <p className="text-lg font-bold font-mono-custom text-gradient-blue-cyan">247</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Expiring</p>
                      <p className="text-lg font-bold text-yellow-400 font-mono-custom">12</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Alerts</p>
                      <p className="text-lg font-bold text-red-400 font-mono-custom">3</p>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute w-24 h-24 rounded-full -top-3 -right-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl"></div>
              </div>

              {/* Floating mini card */}
              <div className={`absolute -bottom-6 -left-6 p-4 border rounded-xl backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-white/90 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Next Review</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>7 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar - Data-Driven Design */}
      {/*}
      <section className={`px-6 py-12 border-y ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, i) => (
              <div
                key={i}
                className={`relative p-6 border rounded-xl transition-all duration-300 hover:border-blue-500/50 ${
                  theme === 'dark'
                    ? 'bg-slate-900/50 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >

                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    {React.cloneElement(metric.icon, { className: "text-blue-400" })}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                    {metric.trend}
                  </span>
                </div>


                <div className="mb-2">
                  <span className="text-4xl font-bold font-mono-custom text-gradient-blue-cyan">
                    {metric.value}
                  </span>
                  <span className="text-2xl font-bold text-blue-400/60 font-mono-custom">
                    {metric.unit}
                  </span>
                </div>


                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {metric.label}
                </p>


                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/50 via-cyan-500/50 to-transparent"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}
      {/* Document Types - Split Screen Magazine Layout */}
      <section className="relative px-6 py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col items-center justify-center mb-20">
            <div className="inline-block px-4 py-2 mb-6 text-sm font-bold tracking-widest uppercase border rounded-full w-fit font-mono-custom border-cyan-500/30 bg-cyan-500/5 text-cyan-400">
              Document Library
            </div>
            <h2 className="mb-4 text-4xl font-bold text-center md:text-5xl w-fit">
              Track Every
              <br />
              <span className="text-gradient-blue-cyan">Compliance Document</span>
            </h2>
           
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center w-full gap-3 mb-16">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : theme === 'dark'
                    ? 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-blue-500/50 hover:bg-slate-800'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-500/50 hover:bg-blue-50'
                }`}
              >
                {category === 'all' ? 'All Documents' : category}
                {category !== 'all' && (
                  <span className={`ml-2 text-xs ${activeCategory === category ? 'text-blue-100' : 'text-slate-400'}`}>
                    ({getCategoryCount(category)})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Document Grid - Clean Professional Layout */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {employeeDocuments
              .filter(doc => activeCategory === 'all' || doc.category === activeCategory)
              .map((doc, index) => (
                <div
                  key={index}
                  className={`group relative p-8 rounded-2xl transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10'
                      : 'bg-white border border-slate-200 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-400/10'
                  }`}
                >
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-2xl"></div>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <span className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-lg ${
                      theme === 'dark'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                      {doc.category}
                    </span>
                    {/* <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                      doc.compliance >= 98
                        ? theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                        : doc.compliance >= 95
                        ? theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                        : theme === 'dark' ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {doc.compliance}%
                    </span> */}
                  </div>

                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
                        : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                    }`}>
                      {React.cloneElement(doc.icon, {
                        className: `w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl font-bold mb-3 font-plex ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {doc.title}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm leading-relaxed mb-6 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {doc.desc}
                  </p>

                  {/* Stats */}
                  {/* <div className={`grid grid-cols-3 gap-4 pt-6 mt-auto border-t ${
                    theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <div>
                      <p className={`text-xs uppercase tracking-wide mb-1 ${
                        theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
                      }`}>
                        Active
                      </p>
                      <p className={`text-2xl font-bold font-mono-custom ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {doc.stats.active}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs uppercase tracking-wide mb-1 ${
                        theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
                      }`}>
                        Expiring
                      </p>
                      <p className={`text-2xl font-bold font-mono-custom ${
                        theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                      }`}>
                        {doc.stats.expiring}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs uppercase tracking-wide mb-1 ${
                        theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
                      }`}>
                        Expired
                      </p>
                      <p className={`text-2xl font-bold font-mono-custom ${
                        doc.stats.expired > 0
                          ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
                          : theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        {doc.stats.expired}
                      </p>
                    </div>
                  </div> */}
                </div>
              ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <p className={`text-xl mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              Need a custom document type?
            </p>
            <button onClick={()=>(navigate("/sign-in"))} className="px-10 py-4 font-bold text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105">
              Configure Custom Categories →
            </button>
          </div>
        </div>
      </section>

      {/* Features Section - Card Grid */}
      <section className={`px-6 py-24 ${theme === 'dark' ? 'bg-slate-900/30' : 'bg-slate-50'}`}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center font-plex">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Enterprise-Grade
              <br />
              <span className="text-gradient-blue-cyan">Compliance Features</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Precision-engineered tools for complete regulatory compliance
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`relative p-8 border rounded-2xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl ${
                  theme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-900'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                {/* Stat badge */}
                <div className={`absolute top-6 right-6 text-xs px-3 py-1 rounded-full font-mono-custom font-semibold ${
                  theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                }`}>
                  {feature.stat}
                </div>

                {/* Icon */}
                <div className="inline-block p-4 mb-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  {React.cloneElement(feature.icon, { className: "text-blue-400" })}
                </div>

                {/* Content */}
                <h3 className={`mb-3 text-xl font-bold font-plex ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {feature.desc}
                </p>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-16 h-16 transition-opacity duration-300 border-t-2 border-r-2 opacity-0 rounded-tr-2xl border-blue-500/30 group-hover:opacity-100"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center font-plex">
            <div className="inline-block px-4 py-2 mb-6 text-sm font-medium text-blue-400 border rounded-full border-blue-500/30 bg-blue-500/5">
              Simple 4-Step Process
            </div>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              How It{" "}
              <span className="text-gradient-blue-cyan">Works</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Get started in minutes. No complex setup required.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {howItWorksSteps.map((step, i) => (
              <div
                key={i}
                className={`relative p-6 border rounded-2xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-slate-900/50 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Step number */}
                <div className="absolute -top-4 -left-4">
                  <div className="flex items-center justify-center w-12 h-12 font-bold text-white rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 font-mono-custom">
                    {step.number}
                  </div>
                </div>

                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 mb-6 ml-auto rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                  {React.cloneElement(step.icon, { className: "text-blue-400" })}
                </div>

                {/* Content */}
                <h3 className={`mb-3 text-xl font-bold font-plex ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {step.desc}
                </p>

                {/* Connector line (not on last item) */}
                {i < howItWorksSteps.length - 1 && (
                  <div className="absolute hidden w-8 h-px lg:block top-1/2 -right-4 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`px-6 py-24 ${theme === 'dark' ? 'bg-slate-900/30' : 'bg-slate-50'}`}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center font-plex">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Trusted by Healthcare
              <br />
              <span className="text-gradient-blue-cyan">Professionals</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              See what medical professionals say about Complyo
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className={`relative p-8 border rounded-2xl transition-all duration-300 hover:border-blue-500/50 ${
                  theme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Quote icon */}
                <div className="absolute top-6 right-6 opacity-10">
                  <Quote className="w-16 h-16 text-blue-400" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className={`mb-6 text-base leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="pt-6 border-t border-slate-700/50">
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-slate-400">
                    {testimonial.role}
                  </p>
                  <p className="text-sm text-blue-400">
                    {testimonial.organization}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className={`px-6 py-20 border-y ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
        <div className="max-w-4xl mx-auto text-center font-plex">
          <div className="flex items-center justify-center gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <h3 className="mb-4 text-4xl font-bold">
            Built for{" "}
            <span className="text-gradient-blue-cyan font-mono-custom">Growing Teams</span>
            <br />
            in Healthcare
          </h3>
          <p className={`text-lg ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            Join forward-thinking healthcare organizations building compliance-first operations
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`px-6 py-24 ${theme === 'dark' ? 'bg-slate-900/20' : 'bg-slate-50/50'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left: Sticky Header */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <div className="inline-block px-4 py-2 mb-6 text-sm font-medium border rounded-full border-cyan-500/30 bg-cyan-500/5 text-cyan-400">
                  Common Questions
                </div>
                <h2 className="mb-6 text-4xl font-bold md:text-5xl font-plex">
                  Frequently Asked
                  <br />
                  <span className="text-gradient-blue-cyan">Questions</span>
                </h2>
                <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Everything you need to know about implementing Complyo in your healthcare organization
                </p>

                {/* Quick stats */}
                <div className={`p-6 border rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Setup in 5 minutes
                        </p>
                        <p className="text-xs text-slate-400">No IT required</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          24/7 Support
                        </p>
                        <p className="text-xs text-slate-400">Always here to help</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10">
                        <Shield className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          HIPAA Compliant
                        </p>
                        <p className="text-xs text-slate-400">Bank-grade security</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: FAQ List */}
            <div className="lg:col-span-8">
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className={`group border rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/50 ${
                      openFaqIndex === i
                        ? theme === 'dark'
                          ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-blue-500/30 shadow-xl shadow-blue-500/5'
                          : 'bg-gradient-to-br from-white to-blue-50/30 border-blue-500/30 shadow-xl'
                        : theme === 'dark'
                        ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-900/80'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                      className="relative flex items-start w-full gap-4 px-8 py-6 text-left transition-all"
                    >
                      {/* Number badge */}
                      <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg font-mono-custom text-sm font-semibold transition-all ${
                        openFaqIndex === i
                          ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white'
                          : theme === 'dark'
                          ? 'bg-slate-800 text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-400'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}>
                        {String(i + 1).padStart(2, '0')}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-bold font-plex mb-1 pr-8 transition-colors ${
                          openFaqIndex === i
                            ? 'text-gradient-blue-cyan'
                            : theme === 'dark'
                            ? 'text-white group-hover:text-blue-300'
                            : 'text-slate-900 group-hover:text-blue-700'
                        }`}>
                          {faq.question}
                        </h3>
                      </div>

                      {/* Expand icon */}
                      <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                        openFaqIndex === i
                          ? 'bg-blue-500/20'
                          : theme === 'dark'
                          ? 'bg-slate-800/50 group-hover:bg-blue-500/10'
                          : 'bg-slate-100 group-hover:bg-blue-50'
                      }`}>
                        <ChevronDown
                          className={`w-5 h-5 transition-all duration-300 ${
                            openFaqIndex === i ? 'rotate-180 text-blue-400' : 'text-slate-400'
                          }`}
                        />
                      </div>

                      {/* Decorative line */}
                      {openFaqIndex === i && (
                        <div className="absolute bottom-0 h-px left-8 right-8 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                      )}
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-500 ${
                        openFaqIndex === i ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-8 pb-8">
                        <div className="pl-12">
                          <p className={`text-base leading-relaxed ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {faq.answer}
                          </p>

                          {/* Decorative element */}
                          <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-700/30">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                              <span>Helpful answer?</span>
                            </div>
                            <button className={`ml-auto text-sm font-medium transition-colors ${
                              theme === 'dark'
                                ? 'text-blue-400 hover:text-blue-300'
                                : 'text-blue-600 hover:text-blue-700'
                            }`}>
                              Contact us for more details →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional help CTA */}
              <div className={`mt-8 p-8 border-2 rounded-2xl relative overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-blue-500/20'
                  : 'bg-gradient-to-br from-blue-50 to-white border-blue-200'
              }`}>
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent blur-3xl"></div>

                <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                  <div className="flex-shrink-0 p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`mb-2 text-2xl font-bold font-plex ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      Still have questions?
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      Our healthcare compliance experts are here to help you get started
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button onClick={()=>(navigate("/contact"))} className="px-8 py-3 font-semibold text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-xl hover:shadow-blue-500/30 whitespace-nowrap">
                      Get In Touch
                    </button>
                    <button onClick={()=>(navigate("/contact"))} className={`px-8 py-3 font-semibold rounded-lg border-2 transition-all duration-300 whitespace-nowrap ${
                      theme === 'dark'
                        ? 'border-slate-700 text-white hover:border-blue-500 hover:bg-blue-500/5'
                        : 'border-slate-300 text-slate-900 hover:border-blue-500 hover:bg-blue-50'
                    }`}>
                      Book A Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-12 overflow-hidden text-center border rounded-3xl md:p-16 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 border-blue-500/30">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-cyan-400/20 to-transparent blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-400/20 to-transparent blur-3xl"></div>

            <div className="relative z-10 font-plex">
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                Ready to Achieve
                <br />
                <span className="font-mono-custom">100% Compliance?</span>
              </h2>
              <p className="mb-4 text-xl text-blue-50">
                Start with a compliance-first HR framework built for growing teams.
              </p>
              <p className="mb-10 text-lg text-blue-100">
                No credit card required.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button onClick={()=>(navigate("/sign-in"))} className="flex items-center justify-center px-10 py-5 text-lg font-semibold text-blue-700 transition-all duration-300 bg-white rounded-lg hover:bg-blue-50 hover:scale-105 group">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                </button>
                <button onClick={()=>(navigate("/contact"))} className="px-10 py-5 text-lg font-semibold text-white transition-all duration-300 border-2 border-white rounded-lg hover:bg-white/10">
                  Book a Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HealthcareCompliancePage;
