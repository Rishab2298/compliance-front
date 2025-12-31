import React, { useState } from 'react';
import { Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';

const CreditPurchaseModal = ({ isOpen, onClose, onPurchase, isLoading }) => {
  const { isDarkMode } = useTheme();
  const [selectedPackage, setSelectedPackage] = useState(null);

  const creditPackages = [
    {
      id: 'starter',
      name: 'Starter',
      dollars: 5,
      credits: 40,
      popular: false,
    },
    {
      id: 'basic',
      name: 'Basic',
      dollars: 10,
      credits: 80,
      popular: false,
    },
    {
      id: 'popular',
      name: 'Popular',
      dollars: 25,
      credits: 200,
      popular: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      dollars: 50,
      credits: 400,
      popular: false,
    },
    {
      id: 'business',
      name: 'Business',
      dollars: 100,
      credits: 800,
      popular: false,
    },
  ];

  const handlePurchase = () => {
    if (selectedPackage) {
      onPurchase(selectedPackage.dollars);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[50vw] max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 text-xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
            <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
              <Zap className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-gray-700'}`} />
            </div>
            Purchase AI Credits
          </DialogTitle>
          <DialogDescription className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
            Select a credit package. Credits never expire and are shared across your company.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {creditPackages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`relative p-5 rounded-[10px] border-2 transition-all text-left ${
                selectedPackage?.id === pkg.id
                  ? isDarkMode
                    ? 'border-violet-500 bg-slate-800/50 shadow-lg shadow-violet-500/20'
                    : 'border-gray-800 bg-gray-50'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800/30 hover:border-violet-500/50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 text-white'
                      : 'bg-gray-800 text-white'
                  }`}>
                    Popular
                  </span>
                </div>
              )}

              {selectedPackage?.id === pkg.id && (
                <div className="absolute top-3 right-3">
                  <div className={`rounded-full p-1 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 text-white'
                      : 'bg-gray-800 text-white'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              <div className="mb-3">
                <h3 className={`font-semibold text-lg mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>{pkg.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>${pkg.dollars}</span>
                </div>
              </div>

              <div className={`rounded-[10px] p-3 mb-3 border ${
                isDarkMode
                  ? 'bg-slate-900/50 border-slate-700'
                  : 'bg-gray-100 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className={`w-4 h-4 ${isDarkMode ? 'text-violet-400' : 'text-gray-700'}`} />
                  <span className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>{pkg.credits}</span>
                </div>
                <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)}`}>AI Credits</p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className={`flex items-center gap-1.5 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  <Check className={`w-3.5 h-3.5 flex-shrink-0 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                  <span>${(pkg.dollars / pkg.credits).toFixed(3)} per credit</span>
                </div>
                <div className={`flex items-center gap-1.5 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  <Check className={`w-3.5 h-3.5 flex-shrink-0 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                  <span>Never expires</span>
                </div>
                <div className={`flex items-center gap-1.5 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  <Check className={`w-3.5 h-3.5 flex-shrink-0 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                  <span>Instant activation</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className={`flex items-start gap-3 mt-4 p-4 rounded-[10px] border ${
          isDarkMode
            ? 'bg-violet-500/10 border-violet-500/30'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <Zap className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-violet-400' : 'text-gray-700'}`} />
          <div className="flex-1 text-sm">
            <p className={`font-medium mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>How AI Credits Work</p>
            <p className={getThemeClasses.text.secondary(isDarkMode)}>
              Each document scan with AI costs 1 credit. Credits are shared across your entire company
              and never expire, so you can use them whenever you need.
            </p>
          </div>
        </div>

        <div className={`flex items-center justify-end gap-3 mt-6 pt-4 border-t ${
          isDarkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className={`rounded-[10px] ${
              isDarkMode
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                : ''
            }`}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={!selectedPackage || isLoading}
            className={`min-w-[140px] rounded-[10px] ${
              isDarkMode
                ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50'
                : 'bg-gray-800 hover:bg-gray-900'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : selectedPackage ? (
              `Purchase for $${selectedPackage.dollars}`
            ) : (
              'Select a Package'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditPurchaseModal;
