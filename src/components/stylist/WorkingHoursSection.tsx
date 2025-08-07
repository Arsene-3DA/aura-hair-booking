import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Save, Loader2 } from 'lucide-react';
import { useStylistProfile } from '@/hooks/useStylistProfile';
import { useRoleAuth } from '@/hooks/useRoleAuth';

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
];

const WorkingHoursSection = () => {
  const { userProfile } = useRoleAuth();
  const { profile, loading, updateWorkingHours } = useStylistProfile(userProfile?.user_id);
  const [workingHours, setWorkingHours] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.working_hours) {
      setWorkingHours(profile.working_hours);
    }
  }, [profile]);

  const handleDayToggle = (day: string, isOpen: boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev?.[day],
        isOpen,
        open: prev?.[day]?.open || '09:00',
        close: prev?.[day]?.close || '18:00',
      }
    }));
  };

  const handleTimeChange = (day: string, field: 'open' | 'close', time: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev?.[day],
        [field]: time,
        isOpen: prev?.[day]?.isOpen || true,
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateWorkingHours(workingHours);
      
      console.log('✅ Working hours updated successfully, booking slots synchronized');
    } catch (error) {
      console.error('❌ Working hours update failed:', error);
      // Error is handled in the hook
    } finally {
      setSaving(false);
    }
  };

  const formatDayLabel = (dayKey: string, dayInfo: any) => {
    if (!dayInfo?.isOpen) return 'Fermé';
    return `${dayInfo.open} - ${dayInfo.close}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horaires d'ouverture
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Définissez vos horaires pour chaque jour de la semaine. Ces horaires synchronisent automatiquement vos créneaux de réservation.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {DAYS.map(({ key, label }) => {
            const dayData = workingHours?.[key] || { open: '09:00', close: '18:00', isOpen: false };
            
            return (
              <div key={key} className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                <div className="w-24 text-sm font-medium">
                  {label}
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={dayData.isOpen}
                    onCheckedChange={(checked) => handleDayToggle(key, checked)}
                  />
                  <Label className="text-sm">
                    {dayData.isOpen ? 'Ouvert' : 'Fermé'}
                  </Label>
                </div>

                {dayData.isOpen && (
                  <div className="flex items-center gap-2 flex-1">
                    <div>
                      <Label className="text-xs text-muted-foreground">Ouverture</Label>
                      <Input
                        type="time"
                        value={dayData.open}
                        onChange={(e) => handleTimeChange(key, 'open', e.target.value)}
                        className="w-24"
                      />
                    </div>
                    <span className="text-muted-foreground">à</span>
                    <div>
                      <Label className="text-xs text-muted-foreground">Fermeture</Label>
                      <Input
                        type="time"
                        value={dayData.close}
                        onChange={(e) => handleTimeChange(key, 'close', e.target.value)}
                        className="w-24"
                      />
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground w-32 text-right">
                  {formatDayLabel(key, dayData)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full md:w-auto"
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les horaires
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            <strong>Synchronisation automatique :</strong> 
            <br />
            Ces horaires déterminent automatiquement les créneaux disponibles pour vos clients. 
            Si vous modifiez vos heures d'ouverture, les nouveaux créneaux seront immédiatement disponibles à la réservation.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkingHoursSection;