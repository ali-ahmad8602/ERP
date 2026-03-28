import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input, Label } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { X, Paperclip, MessageSquare, Check, AlertCircle, Save } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const CardDetailModal = ({ isOpen, onClose, cardId, board }) => {
  const { user } = useAppStore();
  
  // Find card deeply across all columns
  let card = null;
  if (board && cardId) {
    for (const colId in board.cards) {
      const found = board.cards[colId].find(c => c.id === cardId);
      if (found) card = found;
    }
  }

  const [formData, setFormData] = React.useState({});

  // Sync state when card opens
  React.useEffect(() => {
    if (card) {
      setFormData(card.customFieldsValues || {});
    }
  }, [cardId, card]);

  const handleSave = () => {
    // mapped to POST /api/boards/:boardId/cards/:cardId
    console.log('Saving card...', formData);
    onClose();
  };

  const handleApprove = () => {
    console.log('Approving card...', cardId);
    onClose();
  };

  if (!isOpen || !card || !board) return null;

  const requiresApproval = board.settings?.requiresApproval && board.settings?.approvers?.includes(user?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#050505]/40 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Content */}
      <Card className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-ambient bg-[#151515]/95">
        <div className="sticky top-0 z-20 flex justify-between items-center p-6 border-b border-[#2A2A2A] bg-[#151515]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#888]">#{card.id}</span>
            <Badge priority={card.priority}>{card.priority}</Badge>
          </div>
          <button onClick={onClose} className="p-2 text-[#888] hover:text-white rounded-md hover:bg-[#2A2A2A] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-heading font-bold mb-2">{card.title}</h2>
            <p className="text-sm text-[#888] leading-relaxed">Assigned to: {card.assignee}</p>
          </div>

          {/* Dynamic Field Renderer Area */}
          <div className="grid grid-cols-2 gap-6 bg-[#0F0F0F] p-6 rounded-[12px] border border-[#1E1E1E]">
            <div className="col-span-2 mb-2">
              <h3 className="text-[9.5px] uppercase tracking-[0.1em] text-[#888] font-bold flex items-center gap-2">
                Dynamic Schema Properties
              </h3>
            </div>
            {board.customFields?.map(field => (
              <div key={field._id}>
                <Label>{field.name}</Label>
                <Input 
                  type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'} 
                  value={formData[field._id] || ''}
                  onChange={e => setFormData({...formData, [field._id]: e.target.value})}
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-end pt-2">
            <Button className="gap-2" onClick={handleSave}><Save size={14}/> Save Changes</Button>
          </div>

          {/* Approval Panel (Conditional) */}
          {requiresApproval && (
            <div className="bg-[#0454FC]/10 border border-[#0454FC]/20 p-5 rounded-[12px] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-[#0454FC]" />
                <div>
                  <h4 className="font-semibold text-sm text-[#F3F3F3]">Approval Required</h4>
                  <p className="text-xs text-[#888]">This card requires your authorization to progress.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="danger" size="sm">Reject</Button>
                <Button onClick={handleApprove} className="bg-[#0454FC] gap-1.5" size="sm"><Check size={14}/> Approve</Button>
              </div>
            </div>
          )}

          {/* Discussion */}
          <div>
             <h3 className="text-[9.5px] uppercase tracking-[0.1em] text-[#888] font-bold mb-4 flex items-center gap-2">
                Activity & Comments
              </h3>
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-[#2A2A2A]" />
               <div className="flex-1">
                 <Input className="w-full bg-[#1A1A1A] border-none" placeholder="Write a comment..." />
                 <div className="mt-2 flex justify-between items-center">
                   <Button variant="ghost" size="sm" className="text-[#888]"><Paperclip size={14} className="mr-1.5" /> Attach</Button>
                   <Button size="sm">Post Comment</Button>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
