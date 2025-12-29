import React, { useState, useEffect } from "react";
import {
  Building2,
  Send,
  User,
  Mail,
  MessageSquare,
  CheckCircle,
  Phone,
  MapPin,
  Clock,
  Briefcase,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function ContactPage() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: 'sales',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            inquiryType: 'sales',
            subject: '',
            message: ''
          });
          setSubmitted(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inquiryTypes = [
    { value: 'sales', label: 'Sales Inquiry', icon: <Briefcase className="w-4 h-4" /> },
    { value: 'enterprise', label: 'Enterprise Registration', icon: <Building2 className="w-4 h-4" /> },
    { value: 'support', label: 'General Support', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'partnership', label: 'Partnership Opportunity', icon: <Users className="w-4 h-4" /> },
    { value: 'other', label: 'Other', icon: <Sparkles className="w-4 h-4" /> }
  ];

  const contactInfo = [
    
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      content: ["sales@complyo.co"],
      type: "email"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Business Hours",
      content: ["Monday - Friday", "9:00 AM - 6:00 PM EST"],
      type: "hours"
    }
  ];

  return (
    <PublicLayout className={`w-screen min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'text-white bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
        : 'text-slate-900 bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        }
      `}</style>

      {/* Success Message Modal */}
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`max-w-md p-8 text-center border rounded-2xl shadow-2xl transform transition-all ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
              : 'bg-gradient-to-br from-white to-slate-50 border-slate-300'
          }`}>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-emerald-400/20 blur-xl"></div>
                <div className="relative p-4 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                  <CheckCircle className="w-16 h-16 text-green-400" />
                </div>
              </div>
            </div>
            <h3 className="mb-3 text-3xl font-bold">Message Sent!</h3>
            <p className={`text-lg ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              Thank you for reaching out. Our team will get back to you within 24 hours.
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="px-6 pt-32 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 text-sm font-medium text-blue-400 border rounded-full bg-blue-500/10 border-blue-500/20">
                Let's Connect
              </span>
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
              Get in
              <span className="text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text">
                {" "}
                Touch
              </span>
            </h1>
            <p className={`max-w-3xl mx-auto text-xl md:text-2xl ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              Whether you're interested in our enterprise solutions or just want to learn more, we're here to help.
            </p>
          </div>
        </div>
      </section>

     

      {/* Main Form Section */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Decorative gradient blur */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-900/20 via-blue-600/20 to-teal-500/20 blur-3xl"></div>

            <div className={`relative p-8 md:p-12 border shadow-2xl rounded-2xl transition-all ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
                : 'bg-gradient-to-br from-white to-slate-50 border-slate-300'
            }`}>
              <div className="mb-8 text-center">
                <h2 className="mb-3 text-3xl font-bold md:text-4xl">
                  Send us a
                  <span className="text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text">
                    {" "}
                    Message
                  </span>
                </h2>
                <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Fill out the form below and our team will get back to you shortly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold">
                      <User className="w-4 h-4 mr-2 text-blue-400" />
                      Full Name
                      <span className="ml-1 text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 transition-all border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 hover:border-slate-600'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400'
                      }`}
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold">
                      <Mail className="w-4 h-4 mr-2 text-blue-400" />
                      Email Address
                      <span className="ml-1 text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 transition-all border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 hover:border-slate-600'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400'
                      }`}
                      placeholder="john.doe@company.com"
                    />
                  </div>
                </div>

                {/* Phone and Company Row */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold">
                      <Phone className="w-4 h-4 mr-2 text-blue-400" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 transition-all border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 hover:border-slate-600'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Company Field */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold">
                      <Building2 className="w-4 h-4 mr-2 text-blue-400" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 transition-all border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 hover:border-slate-600'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400'
                      }`}
                      placeholder="Your Company Inc."
                    />
                  </div>
                </div>

                {/* Inquiry Type */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold">
                    <Users className="w-4 h-4 mr-2 text-blue-400" />
                    Inquiry Type
                    <span className="ml-1 text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {inquiryTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, inquiryType: type.value }))}
                        className={`p-3 transition-all border rounded-xl flex flex-col items-center justify-center space-y-2 ${
                          formData.inquiryType === type.value
                            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                            : theme === 'dark'
                            ? 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                            : 'border-slate-300 hover:border-slate-400 bg-white'
                        }`}
                      >
                        <div className={formData.inquiryType === type.value ? 'text-blue-400' : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                          {type.icon}
                        </div>
                        <span className={`text-xs font-medium text-center ${
                          formData.inquiryType === type.value
                            ? 'text-blue-400'
                            : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold">
                    <MessageSquare className="w-4 h-4 mr-2 text-blue-400" />
                    Subject
                    <span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 transition-all border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 hover:border-slate-600'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400'
                    }`}
                    placeholder="How can we help you?"
                  />
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold">
                    <MessageSquare className="w-4 h-4 mr-2 text-blue-400" />
                    Message
                    <span className="ml-1 text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className={`w-full px-4 py-3 transition-all border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 hover:border-slate-600'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400'
                    }`}
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center justify-center w-full px-8 py-4 text-lg font-semibold text-white transition-all rounded-xl group ${
                      isSubmitting
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:shadow-2xl hover:shadow-blue-500/50'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>

                {/* Privacy Notice */}
                <p className={`text-xs text-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                  By submitting this form, you agree to our{' '}
                  <a href="/policies/privacy-policy" className="text-blue-400 transition-colors hover:text-blue-300 hover:underline">
                    Privacy Policy
                  </a>
                  {' '}and{' '}
                  <a href="/policies/terms-of-service" className="text-blue-400 transition-colors hover:text-blue-300 hover:underline">
                    Terms of Service
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
 {/* Contact Info Cards */}
      <section className="px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className={`p-6 transition-all border rounded-xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 group ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
                    : 'bg-gradient-to-br from-white to-slate-50 border-slate-300'
                }`}
              >
                <div className="inline-block p-3 mb-4 transition-transform rounded-lg bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-cyan-500/20 group-hover:scale-110">
                  {React.cloneElement(info.icon, { className: "text-blue-400" })}
                </div>
                <h3 className="mb-3 text-lg font-bold">{info.title}</h3>
                <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {info.content.map((line, idx) => (
                    info.type === 'email' ? (
                      <a
                        key={idx}
                        href={`mailto:${line}`}
                        className="block transition-colors hover:text-blue-400"
                      >
                        {line}
                      </a>
                    ) : info.type === 'phone' && info.link ? (
                      <a
                        key={idx}
                        href={info.link}
                        className="block transition-colors hover:text-blue-400"
                      >
                        {line}
                      </a>
                    ) : (
                      <p key={idx}>{line}</p>
                    )
                  ))}
                  {info.subContent && (
                    <p className={`text-xs pt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                      {info.subContent}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Quick Links Section */}
      <section className={`px-6 pb-12 bg-gradient-to-b from-transparent ${
        theme === 'dark' ? 'to-slate-900/50' : 'to-slate-100/50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2">
            <a
              href="/#pricing"
              className={`p-8 transition-all border rounded-xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 group ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
                  : 'bg-gradient-to-br from-white to-slate-50 border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-block p-3 mb-4 transition-transform rounded-lg bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-cyan-500/20 group-hover:scale-110">
                    <Briefcase className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">View Pricing</h3>
                  <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                    Explore our flexible plans and find the perfect fit for your business
                  </p>
                </div>
                <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`} />
              </div>
            </a>

            <a
              href="/complaints"
              className={`p-8 transition-all border rounded-xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 group ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
                  : 'bg-gradient-to-br from-white to-slate-50 border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-block p-3 mb-4 transition-transform rounded-lg bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-cyan-500/20 group-hover:scale-110">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Register a Complaint</h3>
                  <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                    Have an issue? Let us know and we'll address it promptly
                  </p>
                </div>
                <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`} />
              </div>
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
