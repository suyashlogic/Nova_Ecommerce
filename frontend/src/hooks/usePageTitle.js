import { useEffect } from 'react';

// usePageTitle('Shop') sets the browser tab to "Shop | NOVA"
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | NOVA` : 'NOVA - Find something worth keeping';
  }, [title]);
}
