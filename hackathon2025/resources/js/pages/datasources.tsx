import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DataSource as DataSourceType, Certificate, PageProps } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { DataSourceTable } from '@/components/ui/datasourcetable';
import AppLayout from '@/layouts/app-layout';
import { Toast } from '@/components/ui/toast';

export default function DataSources({ dataSources, certificates }: { dataSources: DataSourceType[], certificates: Certificate[] }) {
  const { auth } = usePage<PageProps>().props;
  const user = auth.user;
  const isAdmin = user?.group_name === 'admin';

  // State for modals/popup
  const [missingCerts, setMissingCerts] = useState<Certificate[] | null>(null);
  const [requestingAccessFor, setRequestingAccessFor] = useState<DataSourceType | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const getMissingCertificates = (dataSource: DataSourceType): Certificate[] => {
    const userCertIds = new Set(user.certificates.filter(c => c.pivot.status === 'approved').map(c => c.id));
    return dataSource.certificates.filter(cert => !userCertIds.has(cert.id));
  };

  // Handle clicking on a datasource row (or button) to check access & show modals
  const handleAccessCheck = (dataSource: DataSourceType) => {
    if (isAdmin) return router.visit(`/datasources/${dataSource.id}`); // Admin has access, no popup

    const userCertIds = new Set(user.certificates.filter(c => c.pivot.status === 'approved').map(c => c.id));
    const requiredCertIds = dataSource.certificates.map(c => c.id);
    const missingCertList = requiredCertIds.filter(id => !userCertIds.has(id));
    if (missingCertList.length > 0) {
      // Show missing certs popup
      setMissingCerts(getMissingCertificates(dataSource));
      return;
    }

    // No missing certs, but needs clearance?
    if (dataSource.needs_clearance && !dataSource.granted_access_users?.some(u => u.id === user.id)) {
      setRequestingAccessFor(dataSource);
      return;
    }

    // Has access - maybe redirect or open detail page...
    router.visit(`/datasources/${dataSource.id}`);
  };

  // Modified sendAccessRequest to set status and datasource id
  const sendAccessRequest = () => {
    if (!requestingAccessFor) return;
    setLoadingRequest(true);

    router.post(
      `/datasources/${requestingAccessFor.id}/request-access`,
      {},
      {
        onSuccess: () => {
          setLoadingRequest(false);
          setRequestingAccessFor(null);
          setToast({ message: 'Anfrage erfolgreich gesendet.', type: 'success' });
        },
        onError: () => {
          setLoadingRequest(false);
          setToast({ message: 'Fehler beim Senden der Anfrage.', type: 'error' });
        },
      }
    );
  };

  // State for filters and search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'request'>('all');
  const [filterCertificate, setFilterCertificate] = useState<number | 'all'>('all');

  // Filtered datasources
  const filteredDataSources = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return dataSources.filter(ds => {
      if (filterStatus === 'available' && !ds.url) return false;
      if (filterStatus === 'request' && ds.url) return false;
      if (filterCertificate !== 'all' && !ds.certificates.some(cert => cert.id === filterCertificate)) return false;
      const haystack = [ds.name, ds.description || '', ds.user?.name || ''].join(' ').toLowerCase();
      return haystack.includes(lowerSearch);
    });
  }, [dataSources, search, filterStatus, filterCertificate]);

  const requests = filteredDataSources.filter(ds => !ds.url);
  const activeSources = filteredDataSources.filter(ds => ds.url);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <AppLayout user={user} breadcrumbs={[{ title: 'Datenquellen', href: '/datasources' }]}>
        <header className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Datenquellen verwalten</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Liste aller Datenquellen und Anfragen mit Filter- und Suchfunktion</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="search"
              placeholder="Suchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm w-60 dark:bg-gray-800 dark:text-white"
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
              className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Alle</option>
              <option value="available">Verfügbar</option>
              <option value="request">Anfragen</option>
            </select>
            <select
              value={filterCertificate}
              onChange={e => setFilterCertificate(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Alle Zertifikate</option>
              {certificates.map(cert => (
                <option key={cert.id} value={cert.id}>{cert.name}</option>
              ))}
            </select>
            <Button size="sm" variant="secondary" onClick={() => {
              setSearch('');
              setFilterStatus('all');
              setFilterCertificate('all');
            }}>
              Zurücksetzen
            </Button>
            <Button size="sm" variant="default" href="/datasources/create">
              Neue Datenquelle
            </Button>
          </div>
        </header>

        <main className="p-4">
          {activeSources.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mb-2">Verfügbare Datenquellen ({activeSources.length})</h2>
              <DataSourceTable dataSources={activeSources} onRowClick={handleAccessCheck} requestStatuses={Object.fromEntries(activeSources.map(ds => [ds.id, ds.access_request_status]))} />
            </>
          )}

          {requests.length > 0 && (
            <>
              <h2 className="text-lg font-semibold my-2">Offene Anfragen ({requests.length})</h2>
              <DataSourceTable dataSources={requests} onRowClick={handleAccessCheck} requestStatuses={Object.fromEntries(requests.map(ds => [ds.id, ds.access_request_status]))} />
            </>
          )}

          {filteredDataSources.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-10">Keine Datenquellen gefunden.</p>
          )}
        </main>

        {/* Missing Certificates Modal */}
        {missingCerts && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Zugriff verweigert</h3>
              <p className="mb-4">Es fehlen folgende erforderliche Zertifikate:</p>
              <ul className="list-disc pl-5 mb-4">
                {missingCerts.map(cert => (
                  <li key={cert.id}>{cert.name}</li>
                ))}
              </ul>
              <Button onClick={() => setMissingCerts(null)}>Schließen</Button>
            </div>
          </div>
        )}

        {/* Request Access Modal */}
        {requestingAccessFor && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Zugriffsanfrage</h3>
              <p className="mb-4">
                Zugriff auf die Datenquelle <strong>{requestingAccessFor.name}</strong> erfordert eine Genehmigung. Möchten Sie den Zugang anfragen?
              </p>

              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={() => setRequestingAccessFor(null)} disabled={loadingRequest}>Abbrechen</Button>
                <Button variant="default" onClick={sendAccessRequest} disabled={loadingRequest}>
                  {loadingRequest ? 'Senden...' : 'Anfrage senden'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </>
  );
}
