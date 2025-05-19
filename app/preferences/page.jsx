import { Suspense } from 'react';
import PreferencesClient from './PreferencesClient';

export default function PreferencesPageWrapper() {
  return (
    <Suspense fallback={<div>Loading preferences...</div>}>
      <PreferencesClient />
    </Suspense>
  );
}