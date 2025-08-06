import React from 'react';
import PageLayout from '@/components/PageLayout';
import { SecurityDashboard } from '@/components/SecurityDashboard';

export default function SecurityAudit() {
  return (
    <PageLayout 
      title="Audit de Sécurité"
      description="Monitoring et analyse de la sécurité du système"
    >
      <SecurityDashboard />
    </PageLayout>
  );
}