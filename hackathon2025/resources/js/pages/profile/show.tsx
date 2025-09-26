import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head, usePage } from '@inertiajs/react';
import { ExternalLinkIcon, Pencil, Lock, ShieldCheckIcon } from 'lucide-react';
import { type BreadcrumbItem, type PageProps } from '@/types';

interface Certificate {
  id: number;
  name: string;
  url: string;
  pivot: {
    status: string;
  };
}

interface DataSource {
  id: number;
  name: string;
  url: string | null;
  needs_clearance: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  group_name: 'admin' | 'operator' | 'user';
  certificates: Certificate[];
  data_sources: DataSource[];
}

interface Props extends PageProps {
  user: User;
}

export default function UserShow({ user }: Props) {
  const currentUser = usePage<PageProps>().props.auth.user;
  const isAdmin = currentUser?.group_name === 'admin';
  const isOwner = currentUser?.id === user.id;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Benutzer', href: '/profiles' },
    { title: user.name, href: `/profile/${user.id}` }
  ];

  const approvedCertificates = user.certificates.filter(cert => cert.pivot.status === 'approved');
  const requestedCertificates = user.certificates.filter(cert => cert.pivot.status === 'requested');

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

          <div className="bg-white dark:bg-gray-800 shadow rounded p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <ShieldCheckIcon /> Zertifikate ({user.certificates.length})
            </h2>
            {user.certificates.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Dieser Benutzer besitzt keine Zertifikate.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {user.certificates.map(cert => (
                  <li key={cert.id} className="flex justify-between items-center rounded p-2 bg-gray-50 dark:bg-gray-700">
                    <div>
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {cert.name}
                      </a>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{cert.pivot.status}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Lock /> Zugriff auf Datenquellen ({user.data_sources.length})
            </h2>
            {user.data_sources.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Dieser Benutzer hat keinen Zugriff auf Datenquellen.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {user.data_sources.map(ds => (
                  <li key={ds.id} className="flex justify-between items-center rounded p-2 bg-gray-50 dark:bg-gray-700">
                    <div>
                      <a
                        href={ds.url || '#'}
                        target={ds.url ? "_blank" : undefined}
                        rel={ds.url ? "noopener noreferrer" : undefined}
                        className={`font-medium ${ds.url ? 'hover:underline' : 'text-gray-400'}`}
                      >
                        {ds.name}
                      </a>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {ds.url ? 'Verfügbar' : 'Anfrage'}
                        {ds.needs_clearance && <span className="ml-1 text-amber-500"> (Manuelle Freigabe erforderlich)</span>}
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
