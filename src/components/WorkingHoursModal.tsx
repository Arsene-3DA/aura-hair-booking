
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock } from 'lucide-react';

interface WorkingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHours: {
    start: string;
    end: string;
  };
  onSave: (hours: { start: string; end: string }) => void;
}

const WorkingHoursModal = ({ isOpen, onClose, currentHours, onSave }: WorkingHoursModalProps) => {
  const [startTime, setStartTime] = useState(currentHours.start);
  const [endTime, setEndTime] = useState(currentHours.end);
  const { toast } = useToast();

  const handleSave = () => {
    if (startTime >= endTime) {
      toast({
        title: "Erreur",
        description: "L'heure de début doit être antérieure à l'heure de fin",
        variant: "destructive"
      });
      return;
    }

    onSave({ start: startTime, end: endTime });
    toast({
      title: "Horaires modifiés",
      description: `Nouveaux horaires : ${startTime} - ${endTime}`
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gold-500" />
            Modifier mes horaires de travail
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="startTime">Heure de début</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="endTime">Heure de fin</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-gradient-gold text-white">
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkingHoursModal;
