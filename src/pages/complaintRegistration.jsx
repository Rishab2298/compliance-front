import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Send,
  User,
  Mail,
  MessageSquare,
  CheckCircle,
  FileText,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function ComplaintRegistration() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    category: '',
    description: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    setErrorMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/complaints/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          category: formData.category,
          priority: formData.priority,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit error
          setErrorMessage(data.message || 'You have already submitted a complaint in the last 24 hours. Please wait before submitting another.');
        } else {
          setErrorMessage(data.message || 'Failed to submit complaint. Please try again.');
        }
        setIsSubmitting(false);
        // Auto-hide error after 8 seconds
        setTimeout(() => setErrorMessage(''), 8000);
        return;
      }

      setIsSubmitting(false);
      setSubmitted(true);

      // Reset form after showing success message
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          subject: '',
          priority: 'medium',
          category: '',
          description: ''
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setIsSubmitting(false);
      setErrorMessage('Network error. Please check your connection and try again.');
      // Auto-hide error after 8 seconds
      setTimeout(() => setErrorMessage(''), 8000);
    }
  };

  const categories = [
    'Technical Issue',
    'Billing & Payments',
    'Account Access',
    'Compliance Related',
    'Feature Request',
    'Other'
  ];

  return (
    <PublicLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        }
      `}</style>

      {/* Hero Section */}
      <section className="px-6 pt-32 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 text-sm text-blue-400 border rounded-full bg-blue-500/10 border-blue-500/20">
                We're Here to Help
              </span>
            </div>
            <h1 className="mb-4 text-5xl font-bold leading-tight md:text-6xl">
              Register a
              <span className="text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text">
                {" "}
                Complaint
              </span>
            </h1>
            <p className={`text-xl ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              Have an issue? Let us know and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Success Message */}
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`max-w-md p-8 text-center border rounded-2xl shadow-2xl ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
              : 'bg-gradient-to-br from-white to-slate-50 border-slate-300'
          }`}>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
            </div>
            <h3 className="mb-2 text-2xl font-bold">Complaint Submitted!</h3>
            <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
              Thank you for reaching out. We've received your complaint and will respond within 24-48 hours.
            </p>
          </div>
        </div>
      )}

      {/* Form Section */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Error Message */}
          {errorMessage && (
            <div className={`mb-6 p-4 border rounded-lg ${
              theme === 'dark'
                ? 'bg-red-900/20 border-red-500/50 text-red-300'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}>
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Submission Failed</p>
                  <p className="mt-1 text-sm">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div className={`p-8 border shadow-2xl md:p-12 rounded-2xl ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
              : 'bg-gradient-to-br from-white to-slate-50 border-slate-300'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="flex items-center mb-2 text-sm font-semibold">
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
                  className={`w-full px-4 py-3 transition-all border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="John Doe"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="flex items-center mb-2 text-sm font-semibold">
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
                  className={`w-full px-4 py-3 transition-all border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="john.doe@example.com"
                />
              </div>

              {/* Category and Priority Row */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Category Field */}
                <div>
                  <label className="flex items-center mb-2 text-sm font-semibold">
                    <FileText className="w-4 h-4 mr-2 text-blue-400" />
                    Category
                    <span className="ml-1 text-red-400">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 transition-all border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Field */}
                <div>
                  <label className="flex items-center mb-2 text-sm font-semibold">
                    <AlertCircle className="w-4 h-4 mr-2 text-blue-400" />
                    Priority
                    <span className="ml-1 text-red-400">*</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 transition-all border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Subject Field */}
              <div>
                <label className="flex items-center mb-2 text-sm font-semibold">
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
                  className={`w-full px-4 py-3 transition-all border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="Brief description of your issue"
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="flex items-center mb-2 text-sm font-semibold">
                  <FileText className="w-4 h-4 mr-2 text-blue-400" />
                  Description
                  <span className="ml-1 text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className={`w-full px-4 py-3 transition-all border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="Please provide detailed information about your complaint..."
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center justify-center w-full px-8 py-4 text-lg font-semibold text-white transition-all rounded-lg group ${
                    isSubmitting
                      ? 'bg-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:shadow-2xl hover:shadow-blue-500/50'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Complaint
                      <Send className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Need immediate assistance? Contact us at{' '}
              <a href="mailto:support@complyo.com" className="text-blue-400 hover:underline">
                support@complyo.com
              </a>
              {' '}or call{' '}
              <a href="tel:+1234567890" className="text-blue-400 hover:underline">
                +1 (234) 567-890
              </a>
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
