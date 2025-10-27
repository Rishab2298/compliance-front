import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Upload, 
  Check, 
  X, 
  AlertCircle, 
  Calendar,
  Mail,
  Phone,
  User,
  FileText,
  Camera,
  Link2,
  Clock,
  Shield,
  Sparkles,
  Eye,
  Edit,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  CreditCard,
  Bell,
  Download
} from 'lucide-react';

// Mock data for demonstration
const DOCUMENT_TYPES = [
  { id: 'license_front', name: "Driver's License (Front)", required: true, hasExpiry: true },
  { id: 'license_back', name: "Driver's License (Back)", required: true, hasExpiry: false },
  { id: 'abstract', name: "Driver's Abstract", required: true, hasExpiry: true },
  { id: 'background', name: 'Background Check', required: true, hasExpiry: true },
  { id: 'work_eligibility', name: 'Work Eligibility (SIN/SSN)', required: true, hasExpiry: false },
  { id: 'medical', name: 'Medical Certificate', required: false, hasExpiry: true },
  { id: 'certifications', name: 'Certifications (TDG/WHMIS)', required: false, hasExpiry: true }
];

const ComplianceManager = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [driverData, setDriverData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    location: '',
    uploadMethod: '',
    documents: {},
    processingMethod: '',
    reminders: {
      email: true,
      sms: false,
      days: [90, 30, 7]
    }
  });
  
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState({});
  const [aiCredits, setAiCredits] = useState(50);

  // Progress bar component
  const ProgressBar = () => {
    const steps = [
      'Basic Info',
      'Upload Method',
      'Documents',
      'Processing',
      'Verification',
      'Reminders',
      'Complete'
    ];
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="relative flex-1">
              <div className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    currentStep > index + 1 
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
                      : currentStep === index + 1 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-110' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > index + 1 ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <span className={`text-xs mt-2 ${currentStep === index + 1 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-5 left-1/2 w-full h-0.5 transition-all duration-500 ${
                    currentStep > index + 1 ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                  style={{ width: 'calc(100% - 2.5rem)', left: '1.25rem' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Step 1: Basic Information
  const BasicInfoForm = () => {
    return (
      <div className="p-8 bg-white shadow-lg rounded-xl animate-fadeIn">
        <div className="flex items-center mb-6">
          <User className="w-8 h-8 mr-3 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Driver Information</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John"
              value={driverData.firstName}
              onChange={(e) => setDriverData({...driverData, firstName: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Doe"
              value={driverData.lastName}
              onChange={(e) => setDriverData({...driverData, lastName: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                className="w-full py-3 pl-10 pr-4 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john.doe@example.com"
                value={driverData.email}
                onChange={(e) => setDriverData({...driverData, email: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                className="w-full py-3 pl-10 pr-4 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
                value={driverData.phone}
                onChange={(e) => setDriverData({...driverData, phone: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Employee ID</label>
            <input
              type="text"
              className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="EMP-12345"
              value={driverData.employeeId}
              onChange={(e) => setDriverData({...driverData, employeeId: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Location</label>
            <select
              className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={driverData.location}
              onChange={(e) => setDriverData({...driverData, location: e.target.value})}
            >
              <option value="">Select Location</option>
              <option value="toronto">Toronto Hub</option>
              <option value="vancouver">Vancouver Hub</option>
              <option value="montreal">Montreal Hub</option>
              <option value="calgary">Calgary Hub</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  // Step 2: Upload Method Selection
  const UploadMethodSelection = () => {
    const methods = [
      {
        id: 'upload_now',
        title: 'Upload Now',
        description: 'Upload all documents right away',
        icon: Upload,
        color: 'blue'
      },
      {
        id: 'send_link',
        title: 'Send Link to Driver',
        description: 'Email a secure upload link to the driver',
        icon: Send,
        color: 'green'
      },
      {
        id: 'skip',
        title: 'Skip for Now',
        description: 'Add documents later',
        icon: Clock,
        color: 'gray'
      }
    ];

    return (
      <div className="p-8 bg-white shadow-lg rounded-xl animate-fadeIn">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">How would you like to add documents?</h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          {methods.map((method) => {
            const Icon = method.icon;
            const isSelected = driverData.uploadMethod === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => setDriverData({...driverData, uploadMethod: method.id})}
                className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  isSelected 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isSelected 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                    : method.color === 'blue' ? 'bg-blue-100' 
                    : method.color === 'green' ? 'bg-green-100' 
                    : 'bg-gray-100'
                }`}>
                  <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : `text-${method.color}-600`}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{method.title}</h3>
                <p className="text-sm text-gray-600">{method.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Step 3: Sequential Document Upload
  const DocumentUpload = () => {
    const currentDoc = DOCUMENT_TYPES[currentDocIndex];
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    
    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    };
    
    const handleFile = (file) => {
      setUploadedFile(file);
      setDriverData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [currentDoc.id]: {
            file: file,
            name: file.name,
            size: file.size,
            type: file.type
          }
        }
      }));
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (currentDocIndex < DOCUMENT_TYPES.length - 1) {
              setCurrentDocIndex(currentDocIndex + 1);
              setUploadedFile(null);
              setUploadProgress(0);
            } else {
              setCurrentStep(4);
            }
          }, 500);
        }
      }, 100);
    };

    return (
      <div className="p-8 bg-white shadow-lg rounded-xl animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Upload Documents</h2>
            <p className="mt-1 text-gray-600">Document {currentDocIndex + 1} of {DOCUMENT_TYPES.length}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Progress:</span>
            <div className="flex space-x-1">
              {DOCUMENT_TYPES.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx < currentDocIndex ? 'bg-green-500' :
                    idx === currentDocIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center">
            <FileText className="w-6 h-6 mr-3 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">{currentDoc.name}</h3>
              <div className="flex items-center mt-1 space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  currentDoc.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentDoc.required ? 'Required' : 'Optional'}
                </span>
                {currentDoc.hasExpiry && (
                  <span className="inline-flex items-center text-xs text-gray-600">
                    <Calendar className="w-3 h-3 mr-1" />
                    Has Expiry Date
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!uploadedFile ? (
            <>
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-gray-600">Drag and drop your file here, or</p>
              <label className="cursor-pointer">
                <span className="font-medium text-blue-600 hover:text-blue-700">browse files</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
              
              <div className="flex justify-center mt-4 space-x-4">
                <button className="inline-flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <p className="font-medium text-gray-800">{uploadedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              
              {uploadProgress < 100 ? (
                <div className="w-full max-w-xs mx-auto">
                  <div className="flex justify-between mb-1 text-sm text-gray-600">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 transition-all duration-300 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="font-medium text-green-600">Upload Complete!</p>
              )}
            </div>
          )}
        </div>

        {!currentDoc.required && (
          <button
            onClick={() => {
              if (currentDocIndex < DOCUMENT_TYPES.length - 1) {
                setCurrentDocIndex(currentDocIndex + 1);
              } else {
                setCurrentStep(4);
              }
            }}
            className="mt-4 text-sm text-gray-600 hover:text-gray-800"
          >
            Skip this document →
          </button>
        )}
      </div>
    );
  };

  // Step 4: Processing Method Selection
  const ProcessingMethodSelection = () => {
    return (
      <div className="p-8 bg-white shadow-lg rounded-xl animate-fadeIn">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Choose Processing Method</h2>
        
        <div className="p-4 mb-6 border rounded-lg bg-amber-50 border-amber-200">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-amber-800">
                <strong>AI Credits Available:</strong> {aiCredits} scans remaining
              </p>
              <p className="mt-1 text-xs text-amber-600">
                Each AI scan uses 1 credit. Manual entry is always free.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <button
            onClick={() => {
              setDriverData({...driverData, processingMethod: 'ai'});
              setCurrentStep(5);
              simulateAIProcessing();
            }}
            className="p-6 transition-all duration-300 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg group"
          >
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-transform rounded-full bg-gradient-to-r from-purple-500 to-pink-500 group-hover:scale-110">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">AI-Powered Scan</h3>
            <p className="mb-4 text-sm text-gray-600">
              Automatically extract expiry dates and information using AI
            </p>
            <div className="space-y-2 text-left">
              <div className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-gray-700">95% accuracy</span>
              </div>
              <div className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-gray-700">5 second processing</span>
              </div>
              <div className="flex items-center text-sm">
                <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-gray-700">Uses 1 credit per document</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setDriverData({...driverData, processingMethod: 'manual'});
              setCurrentStep(5);
            }}
            className="p-6 transition-all duration-300 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg group"
          >
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-transform rounded-full bg-gradient-to-r from-green-500 to-teal-500 group-hover:scale-110">
              <Edit className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Manual Entry</h3>
            <p className="mb-4 text-sm text-gray-600">
              Enter expiry dates manually while viewing documents
            </p>
            <div className="space-y-2 text-left">
              <div className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-gray-700">100% free</span>
              </div>
              <div className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-gray-700">Full control</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-700">2-3 minutes per document</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  };

  // Simulate AI processing
  const simulateAIProcessing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setExtractedData({
        license_front: {
          expiry: '2026-05-15',
          license_number: 'D123-4567-8901',
          confidence: 97
        },
        abstract: {
          expiry: '2025-12-01',
          confidence: 94
        },
        background: {
          expiry: '2025-09-30',
          confidence: 92
        }
      });
      setIsProcessing(false);
      setAiCredits(aiCredits - Object.keys(driverData.documents).length);
    }, 3000);
  };

  // Step 5: Processing/Manual Entry
  const ProcessingStep = () => {
    if (driverData.processingMethod === 'ai' && isProcessing) {
      return (
        <div className="p-8 bg-white shadow-lg rounded-xl animate-fadeIn">
          <div className="py-12 text-center">
            <div className="relative inline-flex">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              <Sparkles className="absolute top-0 right-0 w-6 h-6 text-purple-500 animate-pulse" />
            </div>
            <h2 className="mt-6 mb-2 text-2xl font-bold text-gray-800">Processing Documents with AI</h2>
            <p className="text-gray-600">Extracting information and expiry dates...</p>
            
            <div className="max-w-md mx-auto mt-8 space-y-4">
              {Object.keys(driverData.documents).map((docId, index) => {
                const doc = DOCUMENT_TYPES.find(d => d.id === docId);
                return (
                  <div key={docId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span className="text-sm font-medium">{doc?.name}</span>
                    <div className="flex items-center">
                      {index === 0 ? (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 bg-gray-300 rounded-full" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (driverData.processingMethod === 'manual') {
      return <ManualEntryForm />;
    }

    return null;
  };

  // Manual Entry Form
  const ManualEntryForm = () => {
    const [currentDocForEntry, setCurrentDocForEntry] = useState(0);
    const docs = Object.keys(driverData.documents);
    const currentDocId = docs[currentDocForEntry];
    const currentDoc = DOCUMENT_TYPES.find(d => d.id === currentDocId);
    
    return (
      <div className="p-8 bg-white shadow-lg rounded-xl animate-fadeIn">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Manual Data Entry</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{currentDoc?.name}</h3>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                <Eye className="inline w-4 h-4 mr-1" />
                View Full Size
              </button>
            </div>
            <div className="flex items-center justify-center bg-gray-200 rounded-lg h-96">
              <FileText className="w-24 h-24 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enter Document Information</h3>
            
            {currentDoc?.hasExpiry && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Document Number (Optional)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., D123-4567-8901"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Any additional notes..."
              />
            </div>
            
            <div className="flex justify-between pt-4">
              {currentDocForEntry > 0 && (
                <button
                  onClick={() => setCurrentDocForEntry(currentDocForEntry - 1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ← Previous
                </button>
              )}
              <button
                onClick={() => {
                  if (currentDocForEntry < docs.length - 1) {
                    setCurrentDocForEntry(currentDocForEntry + 1);
                  } else {
                    setCurrentStep(6);
                  }
                }}
                className="px-6 py-2 ml-auto text-white transition-all rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg"
              >
                {currentDocForEntry < docs.length - 1 ? 'Next Document' : 'Continue to Verification'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Step 6: Verification
  const VerificationStep = () => {
    const [verifiedDocs, setVerifiedDocs] = useState({});
    
    return (
      <div className="p-8 bg-white shadow-lg rounded-xl animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Verify Extracted Information</h2>
          {driverData.processingMethod === 'ai' && (
            <div className="flex items-center px-3 py-1 bg-purple-100 rounded-full">
              <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">AI Processed</span>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {Object.keys(driverData.documents).map(docId => {
            const doc = DOCUMENT_TYPES.find(d => d.id === docId);
            const extracted = extractedData[docId];
            const isVerified = verifiedDocs[docId];
            
            return (
              <div key={docId} className="p-6 transition-shadow border rounded-lg hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <FileText className="w-5 h-5 mr-2 text-gray-600" />
                      <h3 className="text-lg font-semibold">{doc?.name}</h3>
                      {isVerified && (
                        <CheckCircle className="w-5 h-5 ml-3 text-green-500" />
                      )}
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-center h-32 mb-3 bg-gray-200 rounded">
                          <FileText className="w-12 h-12 text-gray-400" />
                        </div>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                          View Full Document
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {doc?.hasExpiry && extracted && (
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                              Expiry Date
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="date"
                                defaultValue={extracted.expiry}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                              />
                              <div className="px-2 py-1 text-sm text-green-700 bg-green-100 rounded">
                                {extracted.confidence}% confidence
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {extracted?.license_number && (
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                              License Number
                            </label>
                            <input
                              type="text"
                              defaultValue={extracted.license_number}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        )}
                        
                        <button
                          onClick={() => setVerifiedDocs({...verifiedDocs, [docId]: true})}
                          className={`w-full px-4 py-2 rounded-lg transition-all ${
                            isVerified 
                              ? 'bg-green-100 text-green-700 cursor-default' 
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {isVerified ? 'Verified' : 'Verify Information'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Step 7: Reminder Configuration
  const ReminderConfiguration = () => {
    return (
      <div className="p-8 bg-white shadow-lg rounded-xl animate-fadeIn">
        <div className="flex items-center mb-6">
          <Bell className="w-8 h-8 mr-3 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Configure Reminders</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Notification Channels</h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={driverData.reminders.email}
                  onChange={(e) => setDriverData({
                    ...driverData,
                    reminders: {...driverData.reminders, email: e.target.checked}
                  })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <Mail className="w-5 h-5 ml-3 mr-2 text-gray-600" />
                <div className="flex-1">
                  <span className="font-medium">Email Notifications</span>
                  <p className="text-sm text-gray-500">Send reminders to {driverData.email || 'driver email'}</p>
                </div>
              </label>
              
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={driverData.reminders.sms}
                  onChange={(e) => setDriverData({
                    ...driverData,
                    reminders: {...driverData.reminders, sms: e.target.checked}
                  })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <Phone className="w-5 h-5 ml-3 mr-2 text-gray-600" />
                <div className="flex-1">
                  <span className="font-medium">SMS Notifications</span>
                  <p className="text-sm text-gray-500">Send text messages to {driverData.phone || 'driver phone'}</p>
                </div>
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold">Reminder Schedule</h3>
            <p className="mb-4 text-sm text-gray-600">Send reminders before document expiry:</p>
            
            <div className="grid grid-cols-3 gap-3">
              {[90, 60, 30, 14, 7, 3].map(days => (
                <label key={days} className="relative">
                  <input
                    type="checkbox"
                    checked={driverData.reminders.days.includes(days)}
                    onChange={(e) => {
                      const newDays = e.target.checked 
                        ? [...driverData.reminders.days, days]
                        : driverData.reminders.days.filter(d => d !== days);
                      setDriverData({
                        ...driverData,
                        reminders: {...driverData.reminders, days: newDays}
                      });
                    }}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                    driverData.reminders.days.includes(days)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <span className="text-2xl font-bold">{days}</span>
                    <p className="mt-1 text-xs">days</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Step 8: Success
  const SuccessStep = () => {
    return (
      <div className="p-8 text-center bg-white shadow-lg rounded-xl animate-fadeIn">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-400 to-green-500">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="mb-4 text-3xl font-bold text-gray-800">Driver Added Successfully!</h2>
        
        <div className="max-w-md mx-auto">
          <p className="mb-6 text-gray-600">
            {driverData.firstName} {driverData.lastName} has been added to the system with all compliance documents.
          </p>
          
          <div className="p-4 mb-6 text-left rounded-lg bg-gray-50">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Summary:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Documents Uploaded:</span>
                <span className="font-medium">{Object.keys(driverData.documents).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Method:</span>
                <span className="font-medium">{driverData.processingMethod === 'ai' ? 'AI Scan' : 'Manual Entry'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reminders Configured:</span>
                <span className="font-medium">
                  {driverData.reminders.email && 'Email'} 
                  {driverData.reminders.email && driverData.reminders.sms && ' + '} 
                  {driverData.reminders.sms && 'SMS'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-6 py-3 text-white transition-all rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg"
            >
              Add Another Driver
            </button>
            <button className="flex-1 px-6 py-3 text-gray-700 transition-all border border-gray-300 rounded-lg hover:bg-gray-50">
              View All Drivers
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Navigation buttons
  const NavigationButtons = () => {
    const canProceed = () => {
      switch(currentStep) {
        case 1:
          return driverData.firstName && driverData.lastName && driverData.email;
        case 2:
          return driverData.uploadMethod;
        case 3:
          return Object.keys(driverData.documents).length > 0;
        default:
          return true;
      }
    };

    if (currentStep === 8 || (currentStep === 3 && driverData.uploadMethod === 'upload_now')) {
      return null;
    }

    return (
      <div className="flex justify-between mt-8">
        {currentStep > 1 && currentStep < 8 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="inline-flex items-center px-6 py-3 text-gray-600 transition-colors hover:text-gray-800"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        )}
        
        {currentStep < 7 && (
          <button
            onClick={() => {
              if (currentStep === 2 && driverData.uploadMethod === 'send_link') {
                // Simulate sending link
                alert('Upload link sent to driver!');
                setCurrentStep(8);
              } else if (currentStep === 2 && driverData.uploadMethod === 'skip') {
                setCurrentStep(8);
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            disabled={!canProceed()}
            className={`ml-auto inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
              canProceed()
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentStep === 2 && driverData.uploadMethod === 'upload_now' ? 'Start Upload' : 'Continue'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        )}
        
        {currentStep === 7 && (
          <button
            onClick={() => setCurrentStep(8)}
            className="inline-flex items-center px-6 py-3 ml-auto text-white transition-all rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:scale-105"
          >
            Complete Setup
            <CheckCircle className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 mr-3 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">DSP ComplianceManager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                AI Credits: <span className="font-semibold text-blue-600">{aiCredits}</span>
              </div>
              <button className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Add New Driver</h1>
          <p className="text-gray-600">Complete the driver onboarding process with compliance document verification</p>
        </div>

        <ProgressBar />

        {/* Step Content */}
        <div className="transition-all duration-500">
          {currentStep === 1 && <BasicInfoForm />}
          {currentStep === 2 && <UploadMethodSelection />}
          {currentStep === 3 && driverData.uploadMethod === 'upload_now' && <DocumentUpload />}
          {currentStep === 4 && <ProcessingMethodSelection />}
          {currentStep === 5 && <ProcessingStep />}
          {currentStep === 6 && !isProcessing && <VerificationStep />}
          {currentStep === 7 && <ReminderConfiguration />}
          {currentStep === 8 && <SuccessStep />}
        </div>

        <NavigationButtons />
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ComplianceManager;