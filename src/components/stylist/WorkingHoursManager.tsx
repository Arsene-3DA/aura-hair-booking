import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useWorkingHours } from '@/hooks/useWorkingHours';
import { Clock, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
] as const;

export const WorkingHoursManager = () => {
  const { workingHours, loading, updateWorkingHours } = useWorkingHours();
  const [localHours, setLocalHours] = useState(workingHours);
  const [saving, setSaving] = useState(false);
  
  // Mettre à jour les heures locales quand les heures sont récupérées
  useEffect(() => {
    if (workingHours && !localHours) {
      setLocalHours(workingHours);
    }
  }, [workingHours, localHours]);

  const handleDayToggle = (day: string, isOpen: boolean) => {
    if (!localHours) return;
    
    setLocalHours({
      ...localHours,
      [day]: {
        ...localHours[day as keyof typeof localHours],
        isOpen
      }
    });
  };

  const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
    if (!localHours) return;
    
    setLocalHours({
      ...localHours,
      [day]: {
        ...localHours[day as keyof typeof localHours],
        [field]: value
      }
    });
  };

  const handleSave = async () => {
    if (!localHours) return;
    
    setSaving(true);
    const success = await updateWorkingHours(localHours);
    if (success) {
      // Les créneaux de disponibilité seront automatiquement mis à jour
      // grâce à la nouvelle fonction RPC qui utilise ces horaires
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horaires de travail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <Skeleton className="h-6 w-20" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!localHours) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Impossible de charger les horaires</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horaires de travail
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Définissez vos horaires de travail. Ces horaires déterminent les créneaux disponibles pour vos clients.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS.map(({ key, label }) => {
          const dayHours = localHours[key as keyof typeof localHours];
          
          return (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Switch
                  checked={dayHours.isOpen}
                  onCheckedChange={(checked) => handleDayToggle(key, checked)}
                />
                <Label className="font-medium w-20">{label}</Label>
              </div>
              
              {dayHours.isOpen ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <Label className="text-xs text-muted-foreground mb-1">Ouverture</Label>
                    <Input
                      type="time"
                      value={dayHours.open}
                      onChange={(e) => handleTimeChange(key, 'open', e.target.value)}
                      className="w-20"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs text-muted-foreground mb-1">Fermeture</Label>
                    <Input
                      type="time"
                      value={dayHours.close}
                      onChange={(e) => handleTimeChange(key, 'close', e.target.value)}
                      className="w-20"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">Fermé</div>
              )}
            </div>
          );
        })}
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer les horaires'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};