import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head, usePage } from '@inertiajs/react';
import { ExternalLinkIcon, Pencil, Lock, ShieldCheckIcon } from 'lucide-react';
import { Certificate, type BreadcrumbItem, type PageProps } from '@/types';
import { User } from '@/types';

interface Props extends PageProps {
  user: User;
}

export default function UserShow({ user }: Props) {
  const currentUser = usePage<PageProps>().props.auth.user;
  const isAdmin = currentUser?.group_name === 'admin';
  const isOwner = currentUser?.id === user.id;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Benutzer', href: '/profiles' },
    { title: user.name, href: `/profile/${user.id}` },
  ];

  const approvedCertificates = user.certificates.filter(cert => cert.pivot.status === 'approved');
  const requestedCertificates = user.certificates.filter(cert => cert.pivot.status === 'requested');
  const rejectedCertificates = user.certificates.filter(cert => cert.pivot.status === 'rejected');

  function renderCertificateList(
    title: string,
    certificates: Certificate[],
    colorClasses: string
  ) {
    if (certificates.length === 0) return null;
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded p-6 mb-6">
        <h3 className={`flex items-center gap-2 text-lg font-semibold mb-4 ${colorClasses}`}>
          <ShieldCheckIcon /> {title} ({certificates.length})
        </h3>
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {certificates.map(cert => (
            <li key={cert.id} className="flex justify-between items-center rounded p-2 bg-gray-50 dark:bg-gray-700">
              <div>
                <a
                  href={cert.pivot.url ?? cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline break-all"
                  title={(cert.pivot.url ?? cert.url) || ''}
                >
                  {cert.name}
                  {cert.pivot.url && <span className="ml-2 text-xs italic">(Deine Version)</span>}
                </a>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Status: <strong>{cert.pivot.status.charAt(0).toUpperCase() + cert.pivot.status.slice(1)}</strong>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <AppLayout user={currentUser} breadcrumbs={breadcrumbs}>
      <Head title={`Benutzer: ${user.name}`} />

      <div className="flex flex-col gap-6 p-4">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <div className="flex gap-2">
            {(isAdmin || isOwner) && (
              <Button size="sm" variant="outline" to={`/profile/${user.id}/edit`}>
                <Pencil className="mr-1" /> Bearbeiten
              </Button>
            )}
            <Button size="sm" variant="outline" to="/profiles">
              Zurück zur Übersicht
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="bg-white dark:bg-gray-800 shadow rounded p-6">
            <h2 className="text-lg font-semibold mb-4">Profil Informationen</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium">Name</dt>
                <dd>{user.name}</dd>
              </div>
              <div>
                <dt className="font-medium">E-Mail</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt className="font-medium">Gruppe</dt>
                <dd className="capitalize">{user.group_name}</dd>
              </div>
            </dl>
          </div>

          {/* Certificates Sections */}
          <div className="md:col-span-2 space-y-6">
            {renderCertificateList('Genehmigte Zertifikate', approvedCertificates,
              'text-green-700 dark:text-green-300')}
            {renderCertificateList('Ausstehende Zertifikate', requestedCertificates,
              'text-yellow-700 dark:text-yellow-300')}
            {renderCertificateList('Abgelehnte Zertifikate', rejectedCertificates,
              'text-red-700 dark:text-red-300')}
          </div>

          {/* Data Sources */}
          <div className="bg-white dark:bg-gray-800 shadow rounded p-6 md:col-span-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Lock /> Zugriff auf Datenquellen ({user.data_sources.length})
            </h2>
            {user.data_sources.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dieser Benutzer hat keinen Zugriff auf Datenquellen.
              </p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {user.data_sources.map(ds => (
                  <li key={ds.id} className="flex justify-between items-center rounded p-2 bg-gray-50 dark:bg-gray-700">
                    <div>
                      <a
                        href={`/datasources/${ds.id}` || '#'}
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                        className={"font-medium hover:underline"}
                        title={ds.name || 'Keine URL verfügbar'}
                      >
                        {ds.name}
                      </a>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {ds.url ? 'Verfügbar' : 'Anfrage'}
                        {ds.needs_clearance && (
                          <span className="ml-1 text-amber-500"> (Manuelle Freigabe erforderlich)</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}