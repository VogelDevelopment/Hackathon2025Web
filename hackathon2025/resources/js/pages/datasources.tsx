import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { DataSource as DataSourceType, Certificate, User, PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { DataSourceTable } from '@/components/ui/datasourcetable';
import AppLayout from '@/layouts/app-layout';

export default function DataSources({ dataSources, certificates }: { dataSources: DataSourceType[], certificates: Certificate[] }) {
  const { auth } = usePage<PageProps>().props;
  const user = auth.user;
  const isAdmin = user?.group_name === 'admin'

  // State for filters and search
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'request'>('all')
  const [filterCertificate, setFilterCertificate] = useState<number | 'all'>('all')

  // Debounced or immediate client-side filter
  const filteredDataSources = useMemo(() => {
    const lowerSearch = search.toLowerCase()

    return dataSources.filter(ds => {
      // Filter status: available (has URL), request (no URL), all
      if (filterStatus === 'available' && !ds.url) return false
      if (filterStatus === 'request' && ds.url) return false

      // Filter by certificate
      if (filterCertificate !== 'all' && !ds.certificates.some(cert => cert.id === filterCertificate)) return false

      // Search in datasource name, description, and username
      const haystack = [
        ds.name,
        ds.description || '',
        ds.user?.name || '',
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(lowerSearch)
    })
  }, [dataSources, search, filterStatus, filterCertificate])

  // Split results
  const requests = filteredDataSources.filter(ds => !ds.url)
  const activeSources = filteredDataSources.filter(ds => ds.url)

  return (
    <AppLayout user={user} breadcrumbs={[
      { title: 'Datenquellen', href: '/datasources' }
    ]}>
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
            setSearch('')
            setFilterStatus('all')
            setFilterCertificate('all')
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
            <DataSourceTable dataSources={activeSources} />
          </>
        )}

        {requests.length > 0 && (
          <>
            <h2 className="text-lg font-semibold my-2">Offene Anfragen ({requests.length})</h2>
            <DataSourceTable dataSources={requests} />
          </>
        )}

        {filteredDataSources.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">Keine Datenquellen gefunden.</p>
        )}
      </main>
    </AppLayout>
  )
}
