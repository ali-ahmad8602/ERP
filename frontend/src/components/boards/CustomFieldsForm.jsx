/**
 * Renders dynamic form inputs for custom fields during card creation/editing.
 * Supports: text, number, date, dropdown, checkbox, url, user picker.
 */

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all'

function FieldInput({ field, value, onChange, disabled, users }) {
  const handleChange = (val) => onChange(field.id, val)

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Enter ${field.name.toLowerCase()}`}
          className={inputClass}
          disabled={disabled}
        />
      )

    case 'number':
      return (
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder="0"
          className={inputClass}
          disabled={disabled}
        />
      )

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={inputClass}
          disabled={disabled}
        />
      )

    case 'dropdown':
      return (
        <select
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={inputClass}
          disabled={disabled}
        >
          <option value="">Select...</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )

    case 'checkbox':
      return (
        <label className="flex items-center gap-2 py-1 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleChange(e.target.checked)}
            className="rounded border-glass-border w-4 h-4"
            disabled={disabled}
          />
          <span className="text-sm text-text-secondary">{value ? 'Yes' : 'No'}</span>
        </label>
      )

    case 'url':
      return (
        <input
          type="url"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="https://..."
          className={inputClass}
          disabled={disabled}
        />
      )

    case 'user':
      return (
        <select
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={inputClass}
          disabled={disabled}
        >
          <option value="">Select user...</option>
          {(users || []).map((u) => (
            <option key={u._id || u.id} value={u._id || u.id}>{u.name}</option>
          ))}
        </select>
      )

    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={inputClass}
          disabled={disabled}
        />
      )
  }
}

/**
 * Validate a field value against its type and required flag.
 * Returns an error string or null.
 */
export function validateCustomFields(fields, values) {
  const errors = {}
  for (const field of fields) {
    const val = values[field.id]
    if (field.required) {
      if (val === undefined || val === null || val === '' || val === false) {
        errors[field.id] = `${field.name} is required`
      }
    }
    if (field.type === 'url' && val) {
      try { new URL(val) } catch {
        errors[field.id] = 'Enter a valid URL'
      }
    }
    if (field.type === 'number' && val !== null && val !== undefined && val !== '' && isNaN(Number(val))) {
      errors[field.id] = 'Enter a valid number'
    }
  }
  return Object.keys(errors).length > 0 ? errors : null
}

export default function CustomFieldsForm({ fields, values, onChange, disabled, users }) {
  if (!fields || fields.length === 0) return null

  return (
    <div>
      <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
        Custom Fields
      </label>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.id}>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-text-secondary font-medium">{field.name}</span>
              {field.required && <span className="text-[10px] text-amber">*</span>}
            </div>
            <FieldInput
              field={field}
              value={values[field.id]}
              onChange={onChange}
              disabled={disabled}
              users={users}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
