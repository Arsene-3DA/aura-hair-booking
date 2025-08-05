import { ReactNode } from 'react';
import PageHeader from './PageHeader';

interface PageLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  showBackButton?: boolean;
  backPath?: string;
  breadcrumbs?: Array<{
    label: string;
    path?: string;
  }>;
  children: ReactNode;
  className?: string;
}

/**
 * Composant de mise en page standardisé avec bouton retour automatique
 * Utilise le composant PageHeader et applique une structure cohérente
 */
const PageLayout = ({
  title,
  description,
  icon,
  actions,
  showBackButton = true, // Par défaut, afficher le bouton retour
  backPath,
  breadcrumbs,
  children,
  className = "container mx-auto px-4 py-8"
}: PageLayoutProps) => {
  return (
    <div className={className}>
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        actions={actions}
        showBackButton={showBackButton}
        backPath={backPath}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="mt-8">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;