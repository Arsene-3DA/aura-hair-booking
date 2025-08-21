import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticData {
  hairdressers: any[];
  services: any[];
  availability: any[];
  reservations: any[];
}

const ProfessionalDataDiagnostic = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const runDiagnostic = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test 1: Fetch hairdressers (should work with updated RLS)
      const { data: hairdressers, error: hairdressersError } = await supabase
        .from('hairdressers')
        .select('*')
        .eq('is_active', true);

      if (hairdressersError) {
        throw new Error(`Hairdressers: ${hairdressersError.message}`);
      }

      // Test 2: Fetch services (should be publicly accessible)
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*');

      if (servicesError) {
        throw new Error(`Services: ${servicesError.message}`);
      }

      // Test 3: Fetch hairdresser_services (should be publicly accessible)
      const { data: hairdresserServices, error: hsError } = await supabase
        .from('hairdresser_services')
        .select('*');

      if (hsError) {
        throw new Error(`Hairdresser Services: ${hsError.message}`);
      }

      // Test 4: Fetch availability (should be publicly accessible)
      const { data: availability, error: availabilityError } = await supabase
        .from('availabilities')
        .select('*');

      if (availabilityError) {
        throw new Error(`Availability: ${availabilityError.message}`);
      }

      // Test 5: Fetch confirmed reservations (should be publicly accessible for scheduling)
      const { data: reservations, error: reservationsError } = await supabase
        .from('new_reservations')
        .select('*')
        .eq('status', 'confirmed');

      if (reservationsError) {
        throw new Error(`Reservations: ${reservationsError.message}`);
      }

      setData({
        hairdressers: hairdressers || [],
        services: services || [],
        availability: availability || [],
        reservations: reservations || []
      });

      toast({
        title: "Diagnostic réussi",
        description: "Toutes les données sont accessibles",
        variant: "default"
      });

    } catch (err: any) {
      setError(err.message);
      console.error('Diagnostic error:', err);
      toast({
        title: "Erreur de diagnostic",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Diagnostic des Données Professionnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={runDiagnostic} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Test en cours...
                </>
              ) : (
                'Relancer le diagnostic'
              )}
            </Button>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Erreur détectée</span>
                </div>
                <p className="mt-2 text-sm">{error}</p>
              </div>
            )}

            {data && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Professionnels</span>
                  </div>
                  <p className="mt-1 text-sm text-green-600">
                    {data.hairdressers.length} professionnel(s) trouvé(s)
                  </p>
                  {data.hairdressers.length > 0 && (
                    <div className="mt-2 text-xs text-green-600">
                      {data.hairdressers.slice(0, 3).map(h => h.name).join(', ')}
                      {data.hairdressers.length > 3 && '...'}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Services</span>
                  </div>
                  <p className="mt-1 text-sm text-blue-600">
                    {data.services.length} service(s) disponible(s)
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Créneaux</span>
                  </div>
                  <p className="mt-1 text-sm text-purple-600">
                    {data.availability.length} créneau(x) configuré(s)
                  </p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Réservations</span>
                  </div>
                  <p className="mt-1 text-sm text-orange-600">
                    {data.reservations.length} réservation(s) confirmée(s)
                  </p>
                </div>
              </div>
            )}

            {data && data.hairdressers.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Aucun professionnel trouvé</span>
                </div>
                <p className="mt-2 text-sm text-yellow-600">
                  Vérifiez qu'il y a au moins un professionnel actif dans la base de données.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalDataDiagnostic;