import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { DocumentType } from '@/types';
import { STANDARD_DOCUMENT_TEMPLATES } from '@/data/documents';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  FileText,
  ShieldCheck,
  Plus,
  Trash2,
  Calendar,
  CheckSquare,
  Square,
} from 'lucide-react';

export const VaultPage: React.FC = () => {
  const { vaultDocuments, addVaultDocument, removeVaultDocument, toggleVaultDocument } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<DocumentType>('marksheet');
  const [docExpiry, setDocExpiry] = useState('2027-03-31');
  const [docNotes, setDocNotes] = useState('');

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    addVaultDocument({
      name: docName.trim(),
      type: docType,
      hasDocument: true,
      status: 'verified',
      expiryDate: docExpiry || 'Permanent Record',
      notes: docNotes.trim() || 'Verified by student',
      tags: ['Checklist', STANDARD_DOCUMENT_TEMPLATES[docType].title],
    });

    setDocName('');
    setDocNotes('');
    setShowAddModal(false);
  };

  const readyCount = vaultDocuments.filter((d) => d.hasDocument).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Vault Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-text">
              Document Readiness Vault
            </h1>
            <Badge variant="emerald" size="sm">
              {readyCount} of {vaultDocuments.length} Ready
            </Badge>
          </div>
          <p className="text-sm text-muted mt-1">
            Track certificate availability, validity expiration dates, and issuing authority notes without uploading files.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
        >
          Add Credential Checklist Item
        </Button>
      </div>

      {/* Add Document Checklist Item Form / Modal */}
      {showAddModal && (
        <Card className="p-6 bg-surface-elevated border-primary/40 animate-in fade-in space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-display font-bold text-base text-text">
              Track New Credential Checklist Item
            </h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-xs text-muted hover:text-text"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAddDocument} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <Input
                label="Certificate / Credential Name"
                placeholder="e.g., State Domicile Certificate"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Document Category
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {Object.entries(STANDARD_DOCUMENT_TEMPLATES).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Input
                label="Validity / Expiry"
                placeholder="YYYY-MM-DD or Permanent"
                value={docExpiry}
                onChange={(e) => setDocExpiry(e.target.value)}
              />
            </div>

            <div className="md:col-span-3">
              <Input
                label="Notes / Issuing Office"
                placeholder="e.g. Issued by SDM Office"
                value={docNotes}
                onChange={(e) => setDocNotes(e.target.value)}
              />
            </div>

            <div className="md:col-span-12 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save to Readiness Vault
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vaultDocuments.map((doc) => (
          <Card key={doc.id} glow className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleVaultDocument(doc.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-text hover:text-primary transition-colors"
                  title="Click to toggle document readiness"
                >
                  {doc.hasDocument ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-muted" />
                  )}
                  <span>{doc.hasDocument ? 'Ready & Available' : 'Missing / Required'}</span>
                </button>

                <Badge
                  variant={doc.hasDocument ? 'success' : 'neutral'}
                  size="sm"
                >
                  {doc.hasDocument ? 'READY' : 'PENDING'}
                </Badge>
              </div>

              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg border shrink-0 ${
                  doc.hasDocument
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-surface-muted text-muted border-border'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-text leading-snug">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-muted">
                    {STANDARD_DOCUMENT_TEMPLATES[doc.type]?.title || doc.type}
                  </p>
                </div>
              </div>

              {/* Expiry and Notes display */}
              <div className="p-2.5 rounded-lg bg-surface-muted/60 border border-border space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-muted">
                  <Calendar className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span className="font-mono text-[11px]">
                    Expires: <strong className="text-text">{doc.expiryDate || 'Permanent'}</strong>
                  </span>
                </div>

                {doc.notes && (
                  <p className="text-[11px] text-muted italic">
                    Note: "{doc.notes}"
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
              <span>Verified locally in browser</span>
              <button
                type="button"
                onClick={() => removeVaultDocument(doc.id)}
                className="text-danger hover:text-red-400 p-1 rounded hover:bg-surface-elevated transition-colors"
                title="Remove entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Verification Notice */}
      <Card className="p-6 bg-surface border-border flex flex-col sm:flex-row items-center gap-4">
        <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
        <div className="text-xs text-muted space-y-1">
          <p className="font-semibold text-text">Client-Side Readiness Tracking</p>
          <p className="leading-relaxed">
            GRANTLY stores your document readiness status, validity notes, and expiration dates locally in your browser. 
            No files are uploaded or transmitted to external servers.
          </p>
        </div>
      </Card>
    </div>
  );
};
