import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  type: 'reservations' | 'revenus' | 'no-shows';
}

export interface ReportData {
  report_date: string;
  status: string;
  service: string;
  total_bookings: number;
  confirmed_bookings: number;
  declined_bookings: number;
  pending_bookings: number;
  no_shows: number;
  total_revenue: number;
  avg_service_price: number;
  unique_stylists: number;
  unique_clients: number;
  year: number;
  month: number;
  week: number;
  day_of_week: number;
}

export interface ChartData {
  date: string;
  value: number;
  label: string;
}

export function useCustomReport(filters: ReportFilters) {
  const [data, setData] = useState<ReportData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDateStr = format(filters.startDate, 'yyyy-MM-dd');
      const endDateStr = format(filters.endDate, 'yyyy-MM-dd');

      let query = supabase
        .from('v_admin_reports')
        .select('*')
        .gte('report_date', startDateStr)
        .lte('report_date', endDateStr)
        .order('report_date', { ascending: true });

      const { data: reportData, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(reportData || []);
      
      // Préparer les données pour les graphiques selon le type de rapport
      const processedChartData = processDataForChart(reportData || [], filters.type);
      setChartData(processedChartData);

    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const processDataForChart = (data: ReportData[], type: string): ChartData[] => {
    const groupedData = new Map<string, number>();

    data.forEach(row => {
      const date = row.report_date;
      let value = 0;

      switch (type) {
        case 'reservations':
          value = row.total_bookings;
          break;
        case 'revenus':
          value = Number(row.total_revenue);
          break;
        case 'no-shows':
          value = row.no_shows;
          break;
      }

      const currentValue = groupedData.get(date) || 0;
      groupedData.set(date, currentValue + value);
    });

    return Array.from(groupedData.entries()).map(([date, value]) => ({
      date,
      value,
      label: format(new Date(date), 'dd/MM')
    }));
  };

  return {
    data,
    chartData,
    loading,
    error,
    refetch: fetchReportData
  };
}