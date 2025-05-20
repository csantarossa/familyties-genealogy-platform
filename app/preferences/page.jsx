import PreferencesClient from './PreferencesClient';

export default async function PreferencesPage({ searchParams }) {
  const params = await searchParams;
  const treeId = params?.treeId ?? null;

  return <PreferencesClient treeId={treeId} />;
}
