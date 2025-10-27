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

const CreditPurchaseModal = ({ isOpen, onClose, onPurchase, isLoading }) => {
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
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="p-2 bg-gray-200 rounded-[10px]">
              <Zap className="w-5 h-5 text-gray-700" />
            </div>
            Purchase AI Credits
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
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
                  ? 'border-gray-800 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}

              {selectedPackage?.id === pkg.id && (
                <div className="absolute top-3 right-3">
                  <div className="bg-gray-800 text-white rounded-full p-1">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">{pkg.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">${pkg.dollars}</span>
                </div>
              </div>

              <div className="bg-gray-100 rounded-[10px] p-3 mb-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-gray-700" />
                  <span className="text-2xl font-bold text-gray-900">{pkg.credits}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium">AI Credits</p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Check className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                  <span>${(pkg.dollars / pkg.credits).toFixed(3)} per credit</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Check className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                  <span>Never expires</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Check className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                  <span>Instant activation</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-start gap-3 mt-4 p-4 bg-gray-50 rounded-[10px] border border-gray-200">
          <Zap className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-gray-900 mb-1">How AI Credits Work</p>
            <p className="text-gray-600">
              Each document scan with AI costs 1 credit. Credits are shared across your entire company
              and never expire, so you can use them whenever you need.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-[10px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={!selectedPackage || isLoading}
            className="bg-gray-800 hover:bg-gray-900 min-w-[140px] rounded-[10px]"
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
