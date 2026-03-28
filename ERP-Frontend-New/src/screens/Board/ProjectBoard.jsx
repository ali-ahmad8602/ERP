import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { CardDetailModal } from './CardDetailModal';

// Mocked structural component mapped to Board.columns
export const ProjectBoard = () => {
  const { id } = useParams();
  const { activeBoard, fetchBoard } = useAppStore();
  const [selectedCardId, setSelectedCardId] = React.useState(null);

  React.useEffect(() => {
    fetchBoard(id);
  }, [id, fetchBoard]);

  if (!activeBoard) return <div className="p-8">Loading board...</div>;

  return (
    <div className="h-full flex flex-col -mx-8 -my-8 p-8 overflow-hidden animate-fade-in">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-1 tracking-tight">{activeBoard.name}</h1>
          <p className="text-sm text-[#888888]">{activeBoard.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2"><Plus size={16} /> New Card</Button>
          <Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto flex gap-6 pb-4 cursor-grab active:cursor-grabbing">
        {activeBoard.columns.map(col => (
          <div key={col._id} className="w-[320px] shrink-0 flex flex-col h-full max-h-full">
            <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }}></span>
                <span className="text-[9.5px] uppercase tracking-[0.1em] font-bold text-[#888]">{col.name}</span>
                <span className="text-[10px] text-[#555] bg-[#1A1A1A] px-1.5 rounded">{activeBoard.cards[col._id]?.length || 0}</span>
              </div>
              <button className="text-[#555] hover:text-[#F3F3F3] transition-colors">
                <Plus size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pb-2 pr-1">
              {(activeBoard.cards[col._id] || []).map(card => (
                <Card 
                  key={card.id} 
                  hoverable 
                  className="p-4 cursor-pointer"
                  onClick={() => setSelectedCardId(card.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <Badge priority={card.priority}>{card.priority}</Badge>
                    <Avatar fallback={card.assignee} size="sm" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#F3F3F3] leading-snug">{card.title}</h4>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CardDetailModal 
        isOpen={!!selectedCardId} 
        onClose={() => setSelectedCardId(null)} 
        cardId={selectedCardId} 
        board={activeBoard}
      />
    </div>
  );
};
