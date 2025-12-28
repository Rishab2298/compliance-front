import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTicket } from '@/hooks/useTickets';
import { useTheme } from '@/contexts/ThemeContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const CreateTicketModal = ({ open, onOpenChange }) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const createTicket = useCreateTicket();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'BUG',
    priority: 'MEDIUM',
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'BUG', label: t('createTicket.categories.bug') },
    { value: 'FEATURE_REQUEST', label: t('createTicket.categories.featureRequest') },
    { value: 'SUPPORT', label: t('createTicket.categories.support') },
    { value: 'DOCUMENTATION', label: t('createTicket.categories.documentation') },
    { value: 'PERFORMANCE', label: t('createTicket.categories.performance') },
    { value: 'OTHER', label: t('createTicket.categories.other') },
  ];

  const priorities = [
    { value: 'LOW', label: t('createTicket.priorities.low') },
    { value: 'MEDIUM', label: t('createTicket.priorities.medium') },
    { value: 'HIGH', label: t('createTicket.priorities.high') },
    { value: 'CRITICAL', label: t('createTicket.priorities.critical') },
  ];

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('createTicket.errors.titleRequired');
    } else if (formData.title.length > 100) {
      newErrors.title = t('createTicket.errors.titleTooLong');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('createTicket.errors.descriptionRequired');
    } else if (formData.description.length < 10) {
      newErrors.description = t('createTicket.errors.descriptionTooShort');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // Capture metadata
      const metadata = {
        browser: navigator.userAgent,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
      };

      await createTicket.mutateAsync({
        ...formData,
        metadata,
      });

      toast.success(t('createTicket.toasts.success'));

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'BUG',
        priority: 'MEDIUM',
      });
      setErrors({});

      onOpenChange(false);
    } catch (error) {
      toast.error(error.message || t('createTicket.toasts.error'));
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'BUG',
      priority: 'MEDIUM',
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`max-w-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            {t('createTicket.title')}
          </DialogTitle>
          <DialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {t('createTicket.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {t('createTicket.form.title')} <span className="text-red-500">{t('createTicket.form.required')}</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('createTicket.form.titlePlaceholder')}
              className={`mt-1 rounded-[10px] ${
                errors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
              maxLength={100}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formData.title.length}/100 {t('createTicket.form.charactersCount')}
            </p>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                {t('createTicket.form.category')} <span className="text-red-500">{t('createTicket.form.required')}</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger
                  className={`mt-1 rounded-[10px] ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.value}
                      value={cat.value}
                      className={isDarkMode ? 'text-white hover:bg-gray-600' : ''}
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                {t('createTicket.form.priority')} <span className="text-red-500">{t('createTicket.form.required')}</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger
                  className={`mt-1 rounded-[10px] ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}>
                  {priorities.map((pri) => (
                    <SelectItem
                      key={pri.value}
                      value={pri.value}
                      className={isDarkMode ? 'text-white hover:bg-gray-600' : ''}
                    >
                      {pri.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {t('createTicket.form.description')} <span className="text-red-500">{t('createTicket.form.required')}</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('createTicket.form.descriptionPlaceholder')}
              rows={6}
              className={`mt-1 rounded-[10px] ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('createTicket.form.minimumCharacters')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createTicket.isPending}
              className="rounded-[10px]"
            >
              {t('createTicket.buttons.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={createTicket.isPending}
              className="rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createTicket.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('createTicket.buttons.creating')}
                </>
              ) : (
                t('createTicket.buttons.createTicket')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
