import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { DocumentType } from '@/types';
import { MOCK_SCHOLARSHIPS } from '@/data/scholarships';
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
  AlertTriangle,
  Bookmark,
} from 'lucide-react';

export const VaultPage: React.FC = () => {
  const {
    vaultDocuments,
    savedScholarshipIds,
    addVaultDocument,
    removeVaultDocument,
    toggleVaultDocument,
    updateVaultDocument,
  } = useAppStore();

  const [filterTab, setFilterTab] = useState<'all' | 'ready' | 'missing' | 'expiring'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editExpiry, setEditExpiry] = useState('');

  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<DocumentType>('marksheet');
  const [docExpiry, setDocExpiry] = useState('2027-03-31');
  const [docNotes, setDocNotes] = useState('');

  const savedScholarships = useMemo(() => {
    return MOCK_SCHOLARSHIPS.filter((s) => savedScholarshipIds.includes(s.id));
  }, [savedScholarshipIds]);

  // Helper to check if a document is expiring soon (within 60 days) or expired
  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate || expiryDate === 'Permanent Record' || expiryDate === 'Active Account') {
      return { isExpiringSoon: false, isExpired: false, daysRemaining: null };
    }
    const expiryTime = Date.parse(expiryDate);
    if (isNaN(expiryTime)) {
      return { isExpiringSoon: false, isExpired: false, daysRemaining: null };
    }
    const diffDays = Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return { isExpiringSoon: true, isExpired: true, daysRemaining: diffDays };
    }
    if (diffDays <= 60) {
      return { isExpiringSoon: true, isExpired: false, daysRemaining: diffDays };
    }
    return { isExpiringSoon: false, isExpired: false, daysRemaining: diffDays };
  };

  const readyCount = vaultDocuments.filter((d) => d.hasDocument).length;
  const missingCount = vaultDocuments.filter((d) => !d.hasDocument).length;
  const expiringCount = vaultDocuments.filter((d) => getExpiryStatus(d.expiryDate).isExpiringSoon).length;

  const filteredDocs = useMemo(() => {
    if (filterTab === 'ready') return vaultDocuments.filter((d) => d.hasDocument);
    if (filterTab === 'missing') return vaultDocuments.filter((d) => !d.hasDocument);
    if (filterTab === 'expiring') return vaultDocuments.filter((d) => getExpiryStatus(d.expiryDate).isExpiringSoon);
    return vaultDocuments;
  }, [vaultDocuments, filterTab]);

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
      tags: ['Checklist', STANDARD_DOCUMENT_TEMPLATES[docType]?.title || docType],
    });

    setDocName('');
    setDocNotes('');
    setShowAddModal(false);
  };

  const startEdit = (docId: string, currentNotes?: string, currentExpiry?: string) => {
    setEditingDocId(docId);
    setEditNotes(currentNotes || '');
    setEditExpiry(currentExpiry || '');
  };

  const saveEdit = (docId: string) => {
    updateVaultDocument(docId, {
      notes: editNotes.trim(),
      expiryDate: editExpiry.trim() || undefined,
    });
    setEditingDocId(null);
  };

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

      {/* Filter Tabs & Quick Readiness Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterTab === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-surface border border-border text-muted hover:text-text'
            }`}
          >
            <span>All Credentials</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20">{vaultDocuments.length}</span>
          </button>

          <button
            onClick={() => setFilterTab('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterTab === 'ready'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-surface border border-border text-muted hover:text-emerald-400'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready ({readyCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('missing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterTab === 'missing'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-surface border border-border text-muted hover:text-amber-400'
            }`}
          >
            <Square className="w-3.5 h-3.5 text-amber-400" />
            <span>Missing ({missingCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('expiring')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterTab === 'expiring'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-surface border border-border text-muted hover:text-red-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Expiring Soon ({expiringCount})</span>
          </button>
        </div>

        <div className="text-xs text-muted">
          Showing <strong className="text-text">{filteredDocs.length}</strong> checklist items
        </div>
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
      {filteredDocs.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-muted mx-auto" />
          <h2 className="text-base font-bold text-text">No Credential Items in this View</h2>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {filterTab === 'missing'
              ? 'Great job! All your tracked credentials are currently marked as available.'
              : filterTab === 'expiring'
              ? 'No documents currently approaching their validity expiration date.'
              : 'Add your first credential checklist item above to begin tracking readiness.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => setFilterTab('all')}>
            View All Documents
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => {
            const expiryStatus = getExpiryStatus(doc.expiryDate);
            const requiringScholarships = savedScholarships.filter((s) =>
              s.requiredDocuments.some((rd) => rd.type === doc.type)
            );
            const isEditing = editingDocId === doc.id;

            return (
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

                    <div className="flex items-center gap-1.5">
                      {expiryStatus.isExpired ? (
                        <Badge variant="danger" size="sm">EXPIRED</Badge>
                      ) : expiryStatus.isExpiringSoon ? (
                        <Badge variant="danger" size="sm">{expiryStatus.daysRemaining}D LEFT</Badge>
                      ) : null}

                      <Badge
                        variant={doc.hasDocument ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {doc.hasDocument ? 'READY' : 'PENDING'}
                      </Badge>
                    </div>
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
                  {isEditing ? (
                    <div className="p-3 rounded-lg bg-surface-elevated border border-primary/40 space-y-2 text-xs">
                      <Input
                        label="Validity / Expiry"
                        value={editExpiry}
                        onChange={(e) => setEditExpiry(e.target.value)}
                        placeholder="YYYY-MM-DD or Permanent"
                      />
                      <Input
                        label="Notes / Issuing Office"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="e.g. Issued by SDM"
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditingDocId(null)}>
                          Cancel
                        </Button>
                        <Button type="button" variant="primary" size="sm" onClick={() => saveEdit(doc.id)}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-surface-muted/60 border border-border space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-muted">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                          <span className="font-mono text-[11px]">
                            Expires: <strong className="text-text">{doc.expiryDate || 'Permanent'}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => startEdit(doc.id, doc.notes, doc.expiryDate)}
                          className="text-[10px] text-primary hover:underline"
                        >
                          Edit
                        </button>
                      </div>

                      {doc.notes && (
                        <p className="text-[11px] text-muted italic">
                          Note: "{doc.notes}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Which Saved Scholarships Require this Document */}
                  {requiringScholarships.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-surface-elevated/70 border border-border/70 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-text text-[11px]">
                        <Bookmark className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                        <span>Required by {requiringScholarships.length} Saved Scheme{requiringScholarships.length > 1 ? 's' : ''}:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {requiringScholarships.map((s) => (
                          <Link
                            key={s.id}
                            to={`/scholarship/${s.id}`}
                            className="text-[10px] text-primary hover:underline bg-surface px-1.5 py-0.5 rounded border border-border inline-block truncate max-w-[200px]"
                            title={s.title}
                          >
                            {s.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
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
            );
          })}
        </div>
      )}

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
