import React, { useContext, useState } from 'react';
import { Bell, Mail, Phone } from 'lucide-react';

const Step7 = ({ formData, updateFormData }) => {
  return (
      <div className="once tebg-white rounded-xl animate-fadeIn">
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
                checked={formData.reminders.email}
                onChange={(e) => updateFormData({
                  reminders: { ...formData.reminders, email: e.target.checked }
                })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <Mail className="w-5 h-5 ml-3 mr-2 text-gray-600" />
              <div className="flex-1">
                <span className="font-medium">Email Notifications</span>
                <p className="text-sm text-gray-500">Send reminders to {formData.email || 'driver email'}</p>
              </div>
            </label>

            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.reminders.sms}
                onChange={(e) => updateFormData({
                  reminders: { ...formData.reminders, sms: e.target.checked }
                })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <Phone className="w-5 h-5 ml-3 mr-2 text-gray-600" />
              <div className="flex-1">
                <span className="font-medium">SMS Notifications</span>
                <p className="text-sm text-gray-500">Send text messages to {formData.phone || 'driver phone'}</p>
              </div>
            </label>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Step7;