import React from 'react';
import { useForm } from 'react-hook-form';
import { clsx } from 'clsx';
import { FormProps } from './FormTypes';
import { Button } from '../ui/Button';
import { Loader2 } from 'lucide-react';

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  className = '',
  loading = false,
  title,
  description,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  form: externalForm
}) => {
  const internalForm = useForm();
  const form = externalForm || internalForm;
  
  const {
    handleSubmit,
    formState: { isSubmitting, isValid }
  } = form;

  const isLoading = loading || isSubmitting;

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)}
      className={clsx(
        'space-y-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6',
        className
      )}
    >
      {/* Form Header */}
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { form } as any);
          }
          return child;
        })}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
        )}
        
        <Button
          type="submit"
          disabled={isLoading || !isValid}
          loading={isLoading}
          leftIcon={isLoading ? Loader2 : undefined}
        >
          {isLoading ? 'Submitting...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default Form;
