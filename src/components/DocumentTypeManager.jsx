import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit2, Save, X, Settings, Sparkles, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  useDocumentTypeConfigs,
  useFieldTypes,
  useCreateDocumentType,
  useUpdateDocumentType,
  useDeleteDocumentType,
  useToggleDocumentTypeActive,
} from '@/hooks/useDocumentTypeSettings';
import { useCurrentPlan } from '@/hooks/useBilling';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';

const DocumentTypeManager = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const { data: documentTypeConfigs = [], isLoading, error } = useDocumentTypeConfigs();
  const { data: fieldTypes = [] } = useFieldTypes();
  const { data: currentPlanData } = useCurrentPlan();
  const createMutation = useCreateDocumentType();
  const updateMutation = useUpdateDocumentType();
  const deleteMutation = useDeleteDocumentType();
  const toggleActiveMutation = useToggleDocumentTypeActive();

  // Debug logging
  console.log('DocumentTypeManager - Loading:', isLoading);
  console.log('DocumentTypeManager - Error:', error);
  console.log('DocumentTypeManager - Document Types:', documentTypeConfigs);
  console.log('DocumentTypeManager - Document Types Count:', documentTypeConfigs.length);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    aiEnabled: true,
    extractionMode: 'fields',
    fields: [],
  });

  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    aiExtractable: true,
    description: '',
    options: [],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      aiEnabled: true,
      extractionMode: 'fields',
      fields: [],
    });
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      aiExtractable: true,
      description: '',
      options: [],
    });
  };

  const handleCreate = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const handleEdit = (docType) => {
    setSelectedDocType(docType);
    setFormData({
      name: docType.name,
      aiEnabled: docType.aiEnabled,
      extractionMode: docType.extractionMode,
      fields: docType.fields || [],
    });
    setShowEditDialog(true);
  };

  const handleDelete = (docType) => {
    setSelectedDocType(docType);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(selectedDocType.name);
      toast.success(`${t('documentTypeManager.toasts.deleted')}: "${selectedDocType.name}"`);
      setShowDeleteDialog(false);
      setSelectedDocType(null);
    } catch (error) {
      toast.error(error.message || t('documentTypeManager.toasts.deleteFailed'));
    }
  };

  const addFieldToForm = () => {
    // Validation
    if (!newField.name.trim()) {
      toast.error(t('documentTypeManager.toasts.enterFieldName'));
      return;
    }
    if (!newField.label.trim()) {
      toast.error(t('documentTypeManager.toasts.enterFieldLabel'));
      return;
    }

    // Check for duplicate field names
    if (formData.fields.some(f => f.name === newField.name)) {
      toast.error(t('documentTypeManager.toasts.duplicateField'));
      return;
    }

    // Validate field name format
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(newField.name)) {
      toast.error(t('documentTypeManager.toasts.invalidFieldName'));
      return;
    }

    // Add field to form
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, { ...newField }],
    }));

    // Reset new field form
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      aiExtractable: true,
      description: '',
      options: [],
    });
  };

  const removeFieldFromForm = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.name !== fieldName),
    }));
  };

  const saveDocumentType = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error(t('documentTypeManager.toasts.enterDocTypeName'));
      return;
    }

    if (formData.extractionMode === 'fields' && formData.fields.length === 0) {
      toast.error(t('documentTypeManager.toasts.atLeastOneField'));
      return;
    }

    try {
      if (showCreateDialog) {
        // Create new document type
        await createMutation.mutateAsync({
          name: formData.name,
          aiEnabled: formData.aiEnabled,
          extractionMode: formData.extractionMode,
          fields: formData.fields,
        });
        toast.success(`"${formData.name}" ${t('documentTypeManager.toasts.created')}`);
        setShowCreateDialog(false);
      } else {
        // Update existing document type
        await updateMutation.mutateAsync({
          name: formData.name,
          config: {
            aiEnabled: formData.aiEnabled,
            extractionMode: formData.extractionMode,
            fields: formData.fields,
          },
        });
        toast.success(`"${formData.name}" ${t('documentTypeManager.toasts.updated')}`);
        setShowEditDialog(false);
      }
      resetForm();
    } catch (error) {
      toast.error(error.message || t('documentTypeManager.toasts.saveFailed'));
    }
  };

  const handleToggleActive = async (docType) => {
    // Ensure isActive has a boolean value
    const currentActiveStatus = docType.isActive === true;
    const newActiveStatus = !currentActiveStatus;

    console.log('Toggling document type:', {
      name: docType.name,
      currentActiveStatus,
      newActiveStatus,
      docType
    });

    // Check if activating and if plan limit will be exceeded
    if (newActiveStatus) {
      const planType = currentPlanData?.currentPlan?.name || currentPlanData?.planType || 'Free';
      const activeCount = documentTypeConfigs.filter(dt => dt.isActive === true).length;

      // Plan limits for active document types (same as maxDocumentsPerDriver)
      const planLimits = {
        'Free': 1,
        'Starter': 5,
        'Professional': 10,
        'Enterprise': -1 // Unlimited
      };
      const maxActiveTypes = planLimits[planType] || 1;

      console.log('Plan check:', { planType, activeCount, currentActiveStatus, maxActiveTypes });

      if (maxActiveTypes !== -1 && activeCount >= maxActiveTypes && !currentActiveStatus) {
        const typeText = maxActiveTypes === 1
          ? t('documentTypeManager.toasts.activeDocumentType')
          : t('documentTypeManager.toasts.activeDocumentTypes');
        toast.error(`${planType} ${t('documentTypeManager.toasts.planLimitReached')} ${maxActiveTypes} ${typeText}`, {
          description: t('documentTypeManager.toasts.upgradeToActivate'),
          action: {
            label: t('documentTypeManager.toasts.upgrade'),
            onClick: () => window.location.href = '/client/billing'
          }
        });
        return;
      }
    }

    try {
      console.log('Calling toggle mutation...');
      const result = await toggleActiveMutation.mutateAsync({
        name: docType.name,
        isActive: newActiveStatus,
      });
      console.log('Toggle mutation result:', result);
      const statusText = newActiveStatus
        ? t('documentTypeManager.toasts.activated')
        : t('documentTypeManager.toasts.deactivated');
      toast.success(`${docType.name} ${statusText}`);
    } catch (error) {
      console.error('Toggle mutation error:', error);
      if (error.message?.includes('plan allows only')) {
        toast.error(error.message, {
          description: t('documentTypeManager.toasts.upgradeToActivate'),
        });
      } else {
        toast.error(error.message || t('documentTypeManager.toasts.toggleFailed'));
      }
    }
  };

  return (
    <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
              {t('documentTypeManager.title')}
            </h2>
            <p className={`text-sm mt-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
              {t('documentTypeManager.subtitle')}
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className={`rounded-[10px] ${getThemeClasses.button.primary(isDarkMode)}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('documentTypeManager.addCustomType')}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`p-4 mb-6 rounded-[10px] border ${
          isDarkMode
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          <p className="text-sm font-medium">
            {t('documentTypeManager.errorLoading')} {error.message}
          </p>
        </div>
      )}

      {/* Document Type Cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          // Show skeleton loading cards
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`p-5 rounded-[12px] border transition-all ${
                  isDarkMode
                    ? 'bg-slate-800/50 border-slate-700/60'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-3 rounded-[10px]" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                  </div>
                </div>
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-700/60' : 'border-gray-200'}`}>
                  <Skeleton className="h-3 w-16 mb-2 rounded" />
                  <div className="flex flex-wrap gap-1.5">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-6 w-24 rounded-md" />
                    <Skeleton className="h-6 w-16 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : documentTypeConfigs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Settings className={`w-12 h-12 mx-auto mb-3 ${getThemeClasses.text.secondary(isDarkMode)} opacity-30`} />
            <p className={`text-sm font-medium ${getThemeClasses.text.secondary(isDarkMode)}`}>
              {t('documentTypeManager.noDocTypesConfigured')}
            </p>
          </div>
        ) : (
          documentTypeConfigs.map((docType) => (
            <div
              key={docType.name}
              className={`group p-5 rounded-[12px] border transition-all hover:shadow-lg ${
                isDarkMode
                  ? 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/70'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className={`font-semibold text-base truncate ${getThemeClasses.text.primary(isDarkMode)}`}>
                      {docType.name}
                    </h4>
                    {docType.isDefault && (
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${
                        isDarkMode
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        <Lock className="w-3 h-3" />
                        {t('documentTypeManager.system')}
                      </span>
                    )}
                  </div>
                  {/* Active/Inactive Toggle */}
                  <div className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${
                    isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                  }`}>
                    <Switch
                      checked={docType.isActive === true}
                      onCheckedChange={() => handleToggleActive(docType)}
                      disabled={toggleActiveMutation.isPending}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <span className={`text-xs font-medium ${
                      docType.isActive === true
                        ? 'text-green-600 dark:text-green-400'
                        : isDarkMode ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      {docType.isActive === true ? t('documentTypeManager.active') : t('documentTypeManager.inactive')}
                    </span>
                    {docType.isActive !== true && (currentPlanData?.currentPlan?.name || currentPlanData?.planType) && (
                      <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                        ({currentPlanData?.currentPlan?.name || currentPlanData?.planType}: {
                          (currentPlanData?.currentPlan?.name || currentPlanData?.planType) === 'Free' ? '1' :
                          (currentPlanData?.currentPlan?.name || currentPlanData?.planType) === 'Starter' ? '5' :
                          (currentPlanData?.currentPlan?.name || currentPlanData?.planType) === 'Professional' ? '10' : '∞'
                        } {t('documentTypeManager.max')})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                        docType.aiEnabled
                          ? isDarkMode
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-green-50 text-green-700 border border-green-200'
                          : isDarkMode
                          ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {docType.aiEnabled ? (
                        <>
                          <Sparkles className="w-3 h-3" />
                          {t('documentTypeManager.aiEnabled')}
                        </>
                      ) : (
                        t('documentTypeManager.manualEntry')
                      )}
                    </span>
                    <span className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      {docType.fields?.length || 0} {t('documentTypeManager.fields')}
                    </span>
                  </div>
                  <p className={`text-xs mt-2 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    {docType.extractionMode === 'fields'
                      ? t('documentTypeManager.extractsStructuredData')
                      : t('documentTypeManager.classificationOnly')}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(docType)}
                    className={`h-9 w-9 p-0 rounded-lg ${
                      isDarkMode
                        ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {!docType.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(docType)}
                      className="h-9 w-9 p-0 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Field List */}
              {docType.fields && docType.fields.length > 0 && (
                <div className={`mt-4 pt-4 border-t ${
                  isDarkMode ? 'border-slate-700/60' : 'border-gray-200'
                }`}>
                  <p className={`text-xs font-semibold mb-2.5 uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    {t('documentTypeManager.fieldsLabel')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {docType.fields
                      .filter(f => f.name !== 'documentType')
                      .slice(0, 5)
                      .map((field) => (
                        <span
                          key={field.name}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                            isDarkMode
                              ? 'bg-slate-700/70 text-slate-300 border border-slate-600/50'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {field.label}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </span>
                      ))}
                    {docType.fields.filter(f => f.name !== 'documentType').length > 5 && (
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                          isDarkMode
                            ? 'bg-slate-700/40 text-slate-400'
                            : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        +{docType.fields.filter(f => f.name !== 'documentType').length - 5} {t('documentTypeManager.more')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || showEditDialog}
        onOpenChange={() => {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          resetForm();
        }}
      >
        <DialogContent className={`max-w-3xl max-h-[85vh] overflow-y-auto ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`}>
          <DialogHeader className="pb-3">
            <DialogTitle className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
              {showCreateDialog ? t('documentTypeManager.dialog.createTitle') : `${t('documentTypeManager.dialog.editTitle')} "${formData.name}"`}
            </DialogTitle>
            <DialogDescription className={`text-xs mt-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
              {t('documentTypeManager.dialog.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Settings */}
            <div className={`space-y-3 p-4 rounded-[10px] border ${
              isDarkMode
                ? 'bg-slate-800/30 border-slate-700/60'
                : 'bg-gray-50/50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5" />
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {t('documentTypeManager.dialog.basicSettings')}
                </h3>
              </div>

              <div className="space-y-1.5">
                <Label className={`text-xs font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {t('documentTypeManager.dialog.documentTypeName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('documentTypeManager.dialog.namePlaceholder')}
                  disabled={showEditDialog && selectedDocType?.isDefault}
                  className={`rounded-[10px] h-9 text-sm ${getThemeClasses.input.default(isDarkMode)}`}
                />
                {showEditDialog && selectedDocType?.isDefault ? (
                  <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    {t('documentTypeManager.dialog.systemTypesCannotRename')}
                  </p>
                ) : (
                  <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    {t('documentTypeManager.dialog.documentTypeNameHelp')}
                  </p>
                )}
              </div>

              <div className={`flex items-center justify-between p-3 rounded-[10px] border ${
                isDarkMode
                  ? 'bg-slate-800/50 border-slate-700/60'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex-1">
                  <Label className={`text-xs font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {t('documentTypeManager.dialog.aiExtraction')}
                  </Label>
                  <p className={`text-xs mt-0.5 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    {t('documentTypeManager.dialog.autoExtractData')}
                  </p>
                </div>
                <Switch
                  checked={formData.aiEnabled}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, aiEnabled: checked }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className={`text-xs font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {t('documentTypeManager.dialog.extractionMode')}
                </Label>
                <Select
                  value={formData.extractionMode}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, extractionMode: value }))
                  }
                >
                  <SelectTrigger className={`rounded-[10px] h-9 text-sm ${getThemeClasses.input.default(isDarkMode)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
                    <SelectItem value="fields">{t('documentTypeManager.dialog.fieldExtraction')}</SelectItem>
                    <SelectItem value="classification-only">{t('documentTypeManager.dialog.classificationOnly')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  {t('documentTypeManager.dialog.extractionModeHelp')}
                </p>
              </div>
            </div>

            {/* Field Configuration */}
            {formData.extractionMode === 'fields' && (
              <div className={`space-y-3 p-4 rounded-[10px] border ${
                isDarkMode
                  ? 'bg-slate-800/30 border-slate-700/60'
                  : 'bg-gray-50/50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {t('documentTypeManager.dialog.fieldConfiguration')}
                  </h3>
                </div>

                {/* Existing Fields */}
                {formData.fields.length > 0 && (
                  <div className="space-y-2">
                    <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      {t('documentTypeManager.dialog.configuredFields')} ({formData.fields.length})
                    </p>
                    {formData.fields.map((field) => (
                      <div
                        key={field.name}
                        className={`group flex items-center justify-between p-2.5 rounded-[8px] border transition-all ${
                          isDarkMode
                            ? 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-700/50'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-medium text-xs ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {field.label}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              isDarkMode
                                ? 'bg-slate-700 text-slate-300'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {field.type}
                            </span>
                            {field.required && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                isDarkMode
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-red-50 text-red-600'
                              }`}>
                                {t('documentTypeManager.dialog.required')}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFieldFromForm(field.name)}
                          className="h-7 w-7 p-0 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Field */}
                <div className={`space-y-2.5 p-3 rounded-[8px] border-2 border-dashed ${
                  isDarkMode
                    ? 'border-slate-700/60 bg-slate-800/20'
                    : 'border-gray-300 bg-gray-50/50'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <p className={`text-xs font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                      {t('documentTypeManager.dialog.addNewField')}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        {t('documentTypeManager.dialog.nameAPI')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={newField.name}
                        onChange={(e) =>
                          setNewField(prev => ({ ...prev, name: e.target.value }))
                        }
                        placeholder={t('documentTypeManager.dialog.namePlaceholderField')}
                        className={`rounded-[8px] h-8 text-xs ${getThemeClasses.input.default(isDarkMode)}`}
                      />
                      <p className={`text-xs mt-1 ${getThemeClasses.text.secondary(isDarkMode)} opacity-80`}>
                        {t('documentTypeManager.dialog.nameAPIHelp')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        {t('documentTypeManager.dialog.label')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={newField.label}
                        onChange={(e) =>
                          setNewField(prev => ({ ...prev, label: e.target.value }))
                        }
                        placeholder={t('documentTypeManager.dialog.labelPlaceholder')}
                        className={`rounded-[8px] h-8 text-xs ${getThemeClasses.input.default(isDarkMode)}`}
                      />
                      <p className={`text-xs mt-1 ${getThemeClasses.text.secondary(isDarkMode)} opacity-80`}>
                        {t('documentTypeManager.dialog.labelHelp')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        {t('documentTypeManager.dialog.type')}
                      </Label>
                      <Select
                        value={newField.type}
                        onValueChange={(value) =>
                          setNewField(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger className={`rounded-[8px] h-8 text-xs ${getThemeClasses.input.default(isDarkMode)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
                          {fieldTypes.map((ft) => (
                            <SelectItem key={ft.value} value={ft.value}>
                              {ft.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className={`flex-1 p-2 rounded-[6px] border ${
                          isDarkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <Switch
                              checked={newField.required}
                              onCheckedChange={(checked) =>
                                setNewField(prev => ({ ...prev, required: checked }))
                              }
                              className="scale-75"
                            />
                            <Label className={`text-xs cursor-pointer font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {t('documentTypeManager.dialog.req')}
                            </Label>
                          </div>
                          <p className={`text-xs mt-1 ml-6 ${getThemeClasses.text.secondary(isDarkMode)} opacity-80`}>
                            {t('documentTypeManager.dialog.reqHelp')}
                          </p>
                        </div>
                        <div className={`flex-1 p-2 rounded-[6px] border ${
                          isDarkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <Switch
                              checked={newField.aiExtractable}
                              onCheckedChange={(checked) =>
                                setNewField(prev => ({ ...prev, aiExtractable: checked }))
                              }
                              className="scale-75"
                            />
                            <Label className={`text-xs cursor-pointer font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {t('documentTypeManager.dialog.ai')}
                            </Label>
                          </div>
                          <p className={`text-xs mt-1 ml-6 ${getThemeClasses.text.secondary(isDarkMode)} opacity-80`}>
                            {t('documentTypeManager.dialog.aiHelp')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className={`text-xs font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                        {t('documentTypeManager.dialog.description')}
                      </Label>
                      <Textarea
                        value={newField.description}
                        onChange={(e) =>
                          setNewField(prev => ({ ...prev, description: e.target.value }))
                        }
                        placeholder={t('documentTypeManager.dialog.descriptionPlaceholder')}
                        className={`rounded-[8px] text-xs ${getThemeClasses.input.default(isDarkMode)}`}
                        rows={2}
                      />
                      <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)} opacity-80`}>
                        {t('documentTypeManager.dialog.descriptionHelp')}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={addFieldToForm}
                    className={`w-full rounded-[8px] h-8 text-xs ${getThemeClasses.button.secondary(isDarkMode)}`}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    {t('documentTypeManager.dialog.addField')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                resetForm();
              }}
              className={`rounded-[8px] h-9 px-4 text-sm ${
                isDarkMode
                  ? 'border-slate-700 hover:bg-slate-800'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t('documentTypeManager.dialog.cancel')}
            </Button>
            <Button
              onClick={saveDocumentType}
              disabled={createMutation.isPending || updateMutation.isPending}
              className={`rounded-[8px] h-9 px-4 text-sm ${getThemeClasses.button.primary(isDarkMode)}`}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  {t('documentTypeManager.dialog.saving')}
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {showCreateDialog ? t('documentTypeManager.dialog.create') : t('documentTypeManager.dialog.save')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`}>
          <AlertDialogHeader>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
              isDarkMode
                ? 'bg-red-500/20 text-red-400'
                : 'bg-red-50 text-red-600'
            }`}>
              <Trash2 className="w-5 h-5" />
            </div>
            <AlertDialogTitle className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
              {t('documentTypeManager.deleteDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
              {t('documentTypeManager.deleteDialog.description')} <span className="font-semibold text-red-600">"{selectedDocType?.name}"</span>? {t('documentTypeManager.deleteDialog.cannotUndo')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className={`rounded-[8px] h-9 px-4 text-sm ${
              isDarkMode
                ? 'border-slate-700 hover:bg-slate-800'
                : 'border-gray-300 hover:bg-gray-50'
            }`}>
              {t('documentTypeManager.deleteDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white rounded-[8px] h-9 px-4 text-sm"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  {t('documentTypeManager.deleteDialog.deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  {t('documentTypeManager.deleteDialog.delete')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default DocumentTypeManager;
