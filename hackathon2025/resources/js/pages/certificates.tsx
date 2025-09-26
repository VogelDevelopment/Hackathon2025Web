import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Head, usePage } from '@inertiajs/react';
import { PlusIcon, EyeIcon, PencilIcon, ExternalLinkIcon, TrashIcon } from 'lucide-react';

interface Certificate {
    id: number;
    name: string;
    url: string;
    users_count?: number;
    data_sources_count?: number;
    created_at: string;
}

interface Props extends PageProps {
    certificates: Certificate[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Zertifikate',
        href: '/certificates',
    },
];

export default function Certificates({ certificates }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const isAdmin = user?.group_name === 'admin';

    return (
        <AppLayout user={user} breadcrumbs={breadcrumbs}>
            <Head title="Zertifikate" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Zertifikate
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Verwalte Zertifikate, die für den Zugang zu Datenquellen erforderlich sind
                        </p>
                    </div>
                    {isAdmin && (
                        <Button to="/certificates/create">
                            <PlusIcon />
                            Neues Zertifikat
                        </Button>
                    )}
                </div>

                {certificates.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Keine Zertifikate vorhanden
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {isAdmin 
                                ? 'Erstelle dein erstes Zertifikat.'
                                : 'Es sind noch keine Zertifikate verfügbar.'
                            }
                        </p>
                        {isAdmin && (
                            <Button to="/certificates/create">
                                Erstes Zertifikat erstellen
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Zertifikat
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Verwendung
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Erstellt
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Aktionen
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {certificates.map((certificate) => (
                                    <tr key={certificate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {certificate.name}
                                                </div>
                                                <div className="text-sm text-blue-600 dark:text-blue-400">
                                                    <a 
                                                        href={certificate.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1"
                                                    >
                                                        <ExternalLinkIcon className="w-3 h-3" />
                                                        Zertifikat anzeigen
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="space-y-1">
                                                <div>{certificate.users_count || 0} Benutzer</div>
                                                <div>{certificate.data_sources_count || 0} Datenquellen</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(certificate.created_at).toLocaleDateString('de-DE')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Button
                                                size="sm"
                                                variant="ghost" 
                                                to={`/certificates/${certificate.id}`}
                                            >
                                                <EyeIcon />
                                                Anzeigen
                                            </Button>
                                            {isAdmin && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        to={`/certificates/${certificate.id}/edit`}
                                                    >
                                                        <PencilIcon />
                                                        Bearbeiten
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
