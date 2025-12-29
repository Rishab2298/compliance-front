import PublicLayout from "@/components/PublicLayout";
import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Shield,
  FileText,
  Bell,
  Lock,
  Users,
  Award,
  ArrowRight,
  Zap,
  FileCheck,
  Calendar,
  Activity,
  Star,
  Target,
  Upload,
  ChevronDown,
  Quote,
  BadgeCheck,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const GovernmentManagementPage = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

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
      icon: <ShieldAlert className="w-5 h-5" />,
      title: "Security Clearances",
      desc: "Track Secret, Top Secret, TS/SCI clearances and periodic reinvestigation requirements for cleared personnel",
      category: "Security",
      stats: { active: 487, expiring: 34, expired: 0 },
      compliance: 97
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Background Checks & Fingerprinting",
      desc: "Monitor criminal background checks, FBI fingerprinting, and ongoing suitability determinations",
      category: "Security",
      stats: { active: 612, expiring: 28, expired: 0 },
      compliance: 98
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      title: "Ethics & Conduct Training",
      desc: "Track mandatory annual ethics training, code of conduct certifications, and conflict of interest disclosures",
      category: "Training",
      stats: { active: 624, expiring: 42, expired: 0 },
      compliance: 95
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: "Cybersecurity Awareness Training",
      desc: "Monitor annual cybersecurity training, phishing awareness, and information security certifications",
      category: "Training",
      stats: { active: 618, expiring: 38, expired: 0 },
      compliance: 96
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Professional Licenses & Certifications",
      desc: "Track role-specific professional licenses, industry certifications, and continuing education requirements",
      category: "Licensing",
      stats: { active: 342, expiring: 26, expired: 0 },
      compliance: 94
    },
    {
      icon: <BadgeCheck className="w-5 h-5" />,
      title: "ID Badges & Access Cards",
      desc: "Manage government-issued ID badges, PIV cards, CAC cards, and facility access credentials",
      category: "Access",
      stats: { active: 628, expiring: 31, expired: 0 },
      compliance: 97
    },
    {
      icon: <FileCheck className="w-5 h-5" />,
      title: "Mandatory Training Certifications",
      desc: "Track workplace safety, harassment prevention, diversity training, and other required annual certifications",
      category: "Training",
      stats: { active: 615, expiring: 44, expired: 0 },
      compliance: 93
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: "CPR & First Aid Certifications",
      desc: "Monitor emergency response certifications including CPR, AED, and first aid for designated personnel",
      category: "Safety",
      stats: { active: 187, expiring: 15, expired: 0 },
      compliance: 95
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Driving Licenses & Permits",
      desc: "Track driver's licenses and government vehicle operator permits for employees authorized to drive",
      category: "Personal",
      stats: { active: 298, expiring: 18, expired: 0 },
      compliance: 97
    }
  ];

  const categories = ['all', 'Security', 'Training', 'Licensing', 'Access', 'Safety', 'Personal'];
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
      desc: "Bank-grade encryption on Amazon AWS ensures your sensitive certification documents are protected",
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

  const howItWorksSteps = [
    {
      number: "01",
      title: "Upload Documents",
      desc: "Drag and drop your employee certifications and training records or import from existing systems",
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
      quote: "Complyo transformed our credential tracking. We went from spreadsheet chaos to 96% compliance. Agency audits are stress-free now.",
      author: "Patricia Williams",
      role: "HR Director",
      organization: "Department of Transportation",
      rating: 5
    },
    {
      quote: "Managing security clearances and training certifications for 500+ employees was overwhelming. Complyo automated everything and we've had zero compliance issues since implementation.",
      author: "James Rodriguez",
      role: "Security Compliance Officer",
      organization: "Federal Aviation Administration",
      rating: 5
    },
    {
      quote: "The automated reminders for clearance renewals and mandatory training have saved us countless hours. We never miss a deadline and our staff appreciate the proactive notifications.",
      author: "Dr. Sarah Chen",
      role: "Chief of Staff",
      organization: "National Institutes of Health",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "How accurate is the AI document extraction?",
      answer: "Our AI achieves 98% accuracy in extracting expiration dates and key information. You always have the ability to review and verify extracted data before it's saved to the system."
    },
    {
      question: "What types of employee certifications can I track?",
      answer: "You can track any certification with an expiration date including security clearances, background checks, training certifications, professional licenses, ethics training, cybersecurity certifications, and more. The system supports unlimited custom document types."
    },
    {
      question: "Is my data secure and audit-ready?",
      answer: "Yes. All data is encrypted with 256-bit encryption and stored on Amazon AWS with bank-grade security. We maintain comprehensive audit trails for all access and changes, ensuring you're always agency audit-ready."
    },
    {
      question: "How do the automated reminders work?",
      answer: "You can set up to 3 custom reminder intervals for each document type (e.g., 90, 60, and 30 days before expiration). Reminders are sent via email, SMS, and in-app notifications to ensure you never miss a deadline."
    },
    {
      question: "Can I track employees across multiple departments or agencies?",
      answer: "Absolutely! Complyo is designed for multi-department government operations. You can manage different clearance levels, training requirements, and compliance needs for each department while maintaining centralized agency-wide oversight."
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

        {/* Precision grid - like official documents */}
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
                <Shield className="w-4 h-4 text-blue-400" />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  Government Certification Platform
                </span>
              </div>

              <h1 className="text-5xl font-bold leading-tight animate-fade-in-up stagger-1 md:text-6xl lg:text-7xl">
                Government 
                <br />
                <span className="text-gradient-blue-cyan">
                  Certification Management
                </span>
              </h1>

              <p className={`text-xl leading-relaxed max-w-xl animate-fade-in-up stagger-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                Automated tracking for security clearances, mandatory training certifications, professional licenses, and compliance requirements.
                Keep your entire government workforce certified and agency-ready.
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
                  <span>Agency audit-ready</span>
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
                      <p className="text-2xl font-bold font-mono-custom text-gradient-blue-cyan">96.2%</p>
                    </div>
                    <div className={`px-3 py-1 text-xs font-semibold rounded-full ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                      Active
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-4">
                    {[
                      { label: 'Security Clearances', value: 97, color: 'blue' },
                      { label: 'Training Certifications', value: 95, color: 'cyan' },
                      { label: 'Access Credentials', value: 97, color: 'blue' },
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
                      <p className="text-lg font-bold font-mono-custom text-gradient-blue-cyan">4,411</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Expiring</p>
                      <p className="text-lg font-bold text-yellow-400 font-mono-custom">276</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Alerts</p>
                      <p className="text-lg font-bold text-red-400 font-mono-custom">18</p>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute w-24 h-24 rounded-full -top-3 -right-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl"></div>
              </div>

              {/* Floating mini card */}
              <div className={`absolute -bottom-20 left-0 p-4 border rounded-xl backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-white/90 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Next Audit</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>14 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <span className="text-gradient-blue-cyan">Employee Certification</span>
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
              <span className="text-gradient-blue-cyan">Certification Features</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Precision-engineered tools for complete employee certification compliance
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
              Trusted by Government
              <br />
              <span className="text-gradient-blue-cyan">Agencies</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              See what government leaders say about Complyo
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
            in Government
          </h3>
          <p className={`text-lg ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            Join forward-thinking government agencies building compliance-first operations
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
                  Everything you need to know about implementing Complyo in your government agency
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
                          Agency Audit-Ready
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
                            <button onClick={()=>(navigate("/contact"))} className={`ml-auto text-sm font-medium transition-colors ${
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
                      Our government compliance experts are here to help you get started
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button onClick={()=>(navigate("/sign-in"))} className="px-8 py-3 font-semibold text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-xl hover:shadow-blue-500/30 whitespace-nowrap">
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
                Start with a compliance-first framework built for government agencies.
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

export default GovernmentManagementPage;
