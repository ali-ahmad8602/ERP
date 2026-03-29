import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Paperclip,
  Upload,
  Trash2,
  Download,
  FileText,
  Image,
  File,
  Loader2,
  AlertCircle,
  X,
  Eye,
} from 'lucide-react'
import { uploadAttachment, deleteAttachment, getAttachmentUrl } from '../../api/boards'

// ─── Constants matching backend config/upload.js ──────────────────────────────
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXTENSIONS = new Set([
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv',
  'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp',
])
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp'])

function getExt(name) {
  return (name || '').split('.').pop().toLowerCase()
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon({ name }) {
  const ext = getExt(name)
  if (IMAGE_EXTENSIONS.has(ext)) return <Image className="w-4 h-4 text-primary-light" />
  if (ext === 'pdf') return <FileText className="w-4 h-4 text-danger" />
  if (['doc', 'docx'].includes(ext)) return <FileText className="w-4 h-4 text-primary-light" />
  if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileText className="w-4 h-4 text-accent-emerald" />
  return <File className="w-4 h-4 text-text-muted" />
}

function ImagePreviewModal({ src, name, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-3xl max-h-[80vh]"
        >
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 p-1.5 rounded-full bg-surface border border-glass-border text-text-muted hover:text-text-primary z-10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <img
            src={src}
            alt={name}
            className="max-w-full max-h-[80vh] rounded-xl border border-glass-border object-contain"
          />
          <p className="text-center text-xs text-text-muted mt-2">{name}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function AttachmentSection({ cardId, attachments = [], readOnly, onAttachmentsChanged }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewName, setPreviewName] = useState('')

  const validateFile = (file) => {
    const ext = getExt(file.name)
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return `File type ".${ext}" is not allowed. Supported: PDF, Word, Excel, images, CSV, TXT.`
    }
    if (file.size > MAX_SIZE) {
      return `File is too large (${formatSize(file.size)}). Maximum size is ${formatSize(MAX_SIZE)}.`
    }
    return null
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so the same file can be re-selected
    e.target.value = ''

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const data = await uploadAttachment(cardId, file, setProgress)
      // Notify parent to refresh card data
      onAttachmentsChanged?.(data.card?.attachments)
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.'
      setError(msg)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDelete = async (attachmentId, name) => {
    if (deletingId) return
    setDeletingId(attachmentId)
    setError(null)
    try {
      const data = await deleteAttachment(cardId, attachmentId)
      onAttachmentsChanged?.(data.card?.attachments)
    } catch {
      setError(`Failed to delete "${name}"`)
    } finally {
      setDeletingId(null)
    }
  }

  const handlePreview = (attachment) => {
    const ext = getExt(attachment.name)
    if (IMAGE_EXTENSIONS.has(ext)) {
      setPreviewUrl(getAttachmentUrl(attachment.url))
      setPreviewName(attachment.name)
    }
  }

  const handleDownload = (attachment) => {
    const url = getAttachmentUrl(attachment.url)
    const a = document.createElement('a')
    a.href = url
    a.download = attachment.name
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5" />
          Attachments
          {attachments.length > 0 && (
            <span className="text-text-muted/60">({attachments.length})</span>
          )}
        </h3>
        {!readOnly && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-primary-light hover:bg-primary-light/10 transition-colors cursor-pointer disabled:opacity-40"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.svg,.webp"
      />

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger mb-3"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-3 p-3 rounded-xl bg-glass border border-glass-border">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-3.5 h-3.5 text-primary-light animate-spin" />
            <span className="text-xs text-text-secondary">Uploading... {progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary-light"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      )}

      {/* File List */}
      {attachments.length === 0 && !uploading ? (
        <div className="text-xs text-text-muted/50 py-2">
          No files attached
        </div>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {attachments.map((att) => {
              const isImage = IMAGE_EXTENSIONS.has(getExt(att.name))
              const isDeleting = deletingId === att.id

              return (
                <motion.div
                  key={att.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-glass border border-glass-border group hover:bg-glass-hover transition-colors"
                >
                  {/* Thumbnail or icon */}
                  {isImage ? (
                    <div
                      className="w-9 h-9 rounded-lg bg-surface border border-glass-border overflow-hidden shrink-0 cursor-pointer"
                      onClick={() => handlePreview(att)}
                    >
                      <img
                        src={getAttachmentUrl(att.url)}
                        alt={att.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-glass border border-glass-border flex items-center justify-center shrink-0">
                      <FileIcon name={att.name} />
                    </div>
                  )}

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{att.name}</p>
                    {att.uploadedBy && (
                      <p className="text-[11px] text-text-muted">by {att.uploadedBy}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {isImage && (
                      <button
                        onClick={() => handlePreview(att)}
                        title="Preview"
                        className="p-1.5 rounded-lg hover:bg-glass-hover text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(att)}
                      title="Download"
                      className="p-1.5 rounded-lg hover:bg-glass-hover text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {!readOnly && (
                      <button
                        onClick={() => handleDelete(att.id, att.name)}
                        disabled={isDeleting}
                        title="Delete"
                        className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors cursor-pointer disabled:opacity-40"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewUrl && (
        <ImagePreviewModal
          src={previewUrl}
          name={previewName}
          onClose={() => { setPreviewUrl(null); setPreviewName('') }}
        />
      )}
    </div>
  )
}
