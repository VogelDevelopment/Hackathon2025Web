import AppLayout from '@/layouts/app-layout';
import { Certificate, PageProps, type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Head, usePage } from '@inertiajs/react';
import { ExternalLinkIcon, PencilIcon, UsersIcon, DatabaseIcon } from 'lucide-react';


interface Props extends PageProps {
    certificate: Certificate;
}

export default function CertificateShow({ certificate }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const isAdmin = user?.group_name === 'admin';

    // Safe access with default empty arrays
    const users = certificate.users || [];
    const dataSources = certificate.data_sources || []; // Changed this line
    
    const approvedUsers = users.filter(u => u.pivot?.status === 'approved');
    const pendingUsers = users.filter(u => u.pivot?.status === 'requested');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Zertifikate',
            href: '/certificates',
        },
        {
            title: certificate.name,
            href: `/certificates/${certificate.id}`,
        },
    ];

    return (
        <AppLayout user={user} breadcrumbs={breadcrumbs}>
            <Head title={certificate.name} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {certificate.name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Zertifikat Details und Verwendung
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <Button to={`/certificates/${certificate.id}/edit`}>
                                <PencilIcon />
                                Bearbeiten
                            </Button>
                        )}
                        <Button href={certificate.url} variant="outline">
                            <ExternalLinkIcon />
                            Zertifikat öffnen
                        </Button>
                        <Button to="/certificates" variant="outline">
                            Zurück
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <UsersIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                                            Benutzer insgesamt
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                            {users.length}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DatabaseIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                                            Datenquellen
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                            {dataSources.length}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{approvedUsers.length}</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                                            Genehmigte Benutzer
                                        </dt>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Information */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Basis Informationen
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Name
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {certificate.name}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    URL
                                </label>
                                <p className="mt-1 text-sm">
                                    <a 
                                        href={certificate.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                                    >
                                        {certificate.url}
                                    </a>
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Erstellt am
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {new Date(certificate.created_at).toLocaleDateString('de-DE', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Data Sources */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Verwendung in Datenquellen ({dataSources.length})
                        </h2>
                        {dataSources.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Dieses Zertifikat wird von keinen Datenquellen benötigt.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {dataSources.map((dataSource) => (
                                    <div
                                        key={dataSource.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                                    >
                                        <div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {dataSource.name}
                                            </span>
                                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                {dataSource.url ? '(Verfügbar)' : '(Anfrage)'}
                                            </span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            to={`/datasources/${dataSource.id}`}
                                        >
                                            Anzeigen
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Users Section */}
                {users.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Benutzer ({users.length})
                        </h2>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Approved Users */}
                            {approvedUsers.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                                        ✓ Genehmigt ({approvedUsers.length})
                                    </h3>
                                    <div className="space-y-1">
                                        {approvedUsers.map((user) => (
                                            <div key={user.id} className="text-sm text-gray-900 dark:text-gray-100 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded">
                                                {user.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pending Users */}
                            {pendingUsers.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                                        ⏳ Ausstehend ({pendingUsers.length})
                                    </h3>
                                    <div className="space-y-1">
                                        {pendingUsers.map((user) => (
                                            <div key={user.id} className="text-sm text-gray-900 dark:text-gray-100 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                                {user.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
