import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, Bell, Mail, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getThemeClasses } from '@/utils/themeClasses';

const CreateReminderDialog = ({ isOpen, onClose, isDarkMode, settings, onCreateReminder, isCreating }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    triggerDate: '',
    triggerTime: '09:00',
    frequency: 'once', // once, daily, weekly, monthly
    notificationType: 'both', // email, sms, both
    priority: 'normal', // low, normal, high
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.triggerDate) {
      newErrors.triggerDate = 'Date is required';
    } else {
      // Check if date is not in the past
      const selectedDate = new Date(formData.triggerDate + 'T' + formData.triggerTime);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.triggerDate = 'Date and time must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onCreateReminder(formData);

      // Reset form
      setFormData({
        title: '',
        description: '',
        triggerDate: '',
        triggerTime: '09:00',
        frequency: 'once',
        notificationType: 'both',
        priority: 'normal',
      });

      onClose();
    } catch (error) {
      toast.error('Failed to create reminder');
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
            Create Custom Reminder
          </DialogTitle>
          <DialogDescription className={getThemeClasses.text.secondary(isDarkMode)}>
            Set up a custom reminder with your preferred notification settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
              Reminder Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., License Renewal Reminder"
              className={`rounded-[10px] ${errors.title ? 'border-red-500' : getThemeClasses.input.default(isDarkMode)}`}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add additional details about this reminder..."
              className={`rounded-[10px] min-h-[80px] ${getThemeClasses.input.default(isDarkMode)}`}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="triggerDate" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                <Input
                  id="triggerDate"
                  type="date"
                  min={getMinDate()}
                  value={formData.triggerDate}
                  onChange={(e) => handleChange('triggerDate', e.target.value)}
                  className={`rounded-[10px] pl-10 ${errors.triggerDate ? 'border-red-500' : getThemeClasses.input.default(isDarkMode)}`}
                />
              </div>
              {errors.triggerDate && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.triggerDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="triggerTime" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                Time
              </Label>
              <Input
                id="triggerTime"
                type="time"
                value={formData.triggerTime}
                onChange={(e) => handleChange('triggerTime', e.target.value)}
                className={`rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}
              />
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
              Frequency
            </Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => handleChange('frequency', value)}
            >
              <SelectTrigger className={`rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
              Priority
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange('priority', value)}
            >
              <SelectTrigger className={`rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification Settings */}
          <div className={`space-y-4 p-4 rounded-[10px] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Bell className={`w-4 h-4 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
              <h3 className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                Notification Settings
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notificationType" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                Send Via
              </Label>
              <Select
                value={formData.notificationType}
                onValueChange={(value) => handleChange('notificationType', value)}
              >
                <SelectTrigger className={`rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Only
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      SMS Only
                    </div>
                  </SelectItem>
                  <SelectItem value="both">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Both Email & SMS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings && (
              <div className={`text-xs p-3 rounded-[10px] ${isDarkMode ? 'bg-slate-900/50 text-slate-400' : 'bg-white text-gray-600'}`}>
                <p className="font-medium mb-1">Your notification settings:</p>
                <p>• Method: {settings.notificationMethod === 'both' ? 'Email & SMS' : settings.notificationMethod === 'email' ? 'Email' : 'SMS'}</p>
                {settings.adminEmail && <p>• Email: {settings.adminEmail}</p>}
                {settings.adminPhone && <p>• Phone: {settings.adminPhone}</p>}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
              className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className={`rounded-[10px] ${getThemeClasses.button.primary(isDarkMode)}`}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Create Reminder
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReminderDialog;
