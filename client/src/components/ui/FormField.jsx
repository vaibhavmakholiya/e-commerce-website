import React, { useId } from 'react';
import { cn } from '../../utils/helpers';

/**
 * FormField — Wraps label + input/textarea + error message.
 *
 * Props:
 *   label:       string — visible label text
 *   error:       string — validation error message
 *   hint:        string — helper text below input
 *   required:    boolean
 *   as:          'input' | 'textarea' | 'select'
 *   icon:        ReactNode — optional left-side icon
 */
const FormField = ({
  label,
  error,
  hint,
  required = false,
  as: InputTag = 'input',
  icon,
  className = '',
  id: externalId,
  ...inputProps
}) => {
  const generatedId = useId();
  const fieldId = externalId || `field-${generatedId}`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={cn('form-group', className)}>
      {label && (
        <label htmlFor={fieldId} className="form-label">
          {label}
          {required && <span className="required-dot" aria-hidden="true"> *</span>}
        </label>
      )}

      <div className="input-wrapper">
        {icon && (
          <span className="input-icon-left" aria-hidden="true">
            {icon}
          </span>
        )}
        <InputTag
          id={fieldId}
          className={cn(
            'form-control',
            InputTag === 'textarea' && 'form-textarea',
            icon && 'has-left-icon',
            error && 'is-invalid'
          )}
          aria-required={required}
          aria-describedby={error ? errorId : hint ? `${fieldId}-hint` : undefined}
          aria-invalid={!!error}
          {...inputProps}
        />
      </div>

      {error && (
        <p id={errorId} className="form-error-msg" role="alert">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}

      {hint && !error && (
        <p id={`${fieldId}-hint`} className="form-helper-text">
          {hint}
        </p>
      )}
    </div>
  );
};

export default FormField;
