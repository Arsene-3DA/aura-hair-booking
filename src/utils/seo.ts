
interface SEOMetaProps {
  title?: string;
  description?: string;
  hairdresserName?: string;
  siteName?: string;
  image?: string;
}

export const updateSEOMeta = ({
  title = "SalonBook - Réservation Coiffeur Premium",
  description = "Réservez votre coiffeur en ligne avec SalonBook",
  hairdresserName,
  siteName = "SalonBook",
  image = "/og-image.jpg"
}: SEOMetaProps) => {
  // Title dynamique
  const dynamicTitle = hairdresserName 
    ? `Réservation avec ${hairdresserName} – Salon ${siteName}`
    : title;

  // Mise à jour du title
  document.title = dynamicTitle;

  // Meta descriptions
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }

  // OpenGraph
  const ogTags = [
    { property: 'og:title', content: dynamicTitle },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName }
  ];

  ogTags.forEach(({ property, content }) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  });

  // Twitter Cards
  const twitterTags = [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: dynamicTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image }
  ];

  twitterTags.forEach(({ name, content }) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  });
};
