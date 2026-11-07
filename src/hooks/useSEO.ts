import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
}

/**
 * useSEO
 * Sets page-specific document title and Open Graph metadata
 */
export const useSEO = ({ title, description }: SEOProps) => {
  useEffect(() => {
    const defaultTitle = 'GRANTLY — Rethinking the Scholarship Experience';
    const finalTitle = title ? `${title} | GRANTLY` : defaultTitle;
    document.title = finalTitle;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', description);
    }

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', finalTitle);
  }, [title, description]);
};

export default useSEO;
