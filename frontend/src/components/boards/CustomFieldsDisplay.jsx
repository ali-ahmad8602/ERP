import {
  Type,
  Hash,
  Calendar,
  ChevronDown,
  CheckSquare,
  Link,
  User,
} from 'lucide-react'

const typeIcons = {
  text: Type,
  number: Hash,
  date: Calendar,
  dropdown: ChevronDown,
  checkbox: CheckSquare,
  url: Link,
  user: User,
}

function formatValue(field, value) {
  if (value === undefined || value === null || value === '') return '—'

  switch (field.type) {
    case 'checkbox':
      return value ? 'Yes' : 'No'
    case 'date':
      return new Date(value).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    case 'url':
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-light hover:underline break-all"
        >
          {value.replace(/^https?:\/\//, '').slice(0, 40)}
          {value.replace(/^https?:\/\//, '').length > 40 ? '...' : ''}
        </a>
      )
    case 'number':
      return Number(value).toLocaleString()
    default:
      return String(value)
  }
}

/**
 * Renders custom field values in the card detail drawer.
 * Maps card.customFields[{field, value}] against board-level field definitions.
 */
export default function CustomFieldsDisplay({ fieldDefinitions, cardFieldValues }) {
  if (!fieldDefinitions || fieldDefinitions.length === 0) return null

  // Build a lookup from field id → value
  const valueMap = {}
  for (const cf of cardFieldValues || []) {
    valueMap[cf.field] = cf.value
  }

  // Only show fields that have a value or are required
  const visibleFields = fieldDefinitions.filter(
    (f) => valueMap[f.id] !== undefined && valueMap[f.id] !== null && valueMap[f.id] !== ''
  )

  if (visibleFields.length === 0) return null

  return (
    <div>
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
        Custom Fields
      </h3>
      <div className="space-y-2">
        {visibleFields.map((field) => {
          const Icon = typeIcons[field.type] || Type
          const value = valueMap[field.id]

          return (
            <div
              key={field.id}
              className="flex items-start gap-3 px-3 py-2 rounded-xl bg-glass border border-glass-border"
            >
              <div className="p-1.5 rounded-lg bg-glass border border-glass-border mt-0.5 shrink-0">
                <Icon className="w-3 h-3 text-text-muted" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-text-muted mb-0.5">{field.name}</p>
                <p className="text-sm text-text-primary break-words">
                  {formatValue(field, value)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
