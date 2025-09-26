import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Head, usePage } from '@inertiajs/react';
import { ExternalLinkIcon, PencilIcon, ShieldCheckIcon, MessageCircleIcon, Award } from 'lucide-react';

interface Certificate {
    id: number;
    name: string;
    url: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Comment {
    id: number;
    content: string;
    created_at: string;
    user: User;
}

interface DataSource {
    id: number;
    name: string;
    description: string | null;
    justification: string | null;
    url: string | null;
    needs_clearance: boolean;
    created_at: string;
    user: User;
    certificates: Certificate[];
    comments: Comment[];
}

interface Props extends PageProps {
    dataSource: DataSource;
}

export default function DataSourceShow({ dataSource }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const isAdmin = user?.group_name === 'admin';
    const isOwner = dataSource.user.id === user?.id;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Datenquellen',
            href: '/datasources',
        },
        {
            title: dataSource.name,
            href: `/datasources/${dataSource.id}`,
        },
    ];

    const getStatusInfo = () => {
        if (dataSource.url) {
            return {
                label: 'Verfügbar',
                color: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
            };
        } else {
            return {
                label: 'Anfrage',
                color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
            };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <AppLayout user={user} breadcrumbs={breadcrumbs}>
            <Head title={dataSource.name} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {dataSource.name}
                        </h1>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                        </span>
                        {dataSource.needs_clearance && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs dark:bg-amber-900 dark:text-amber-200">
                                <ShieldCheckIcon className="w-3 h-3" />
                                Manuelle Freigabe
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {(isAdmin || isOwner) && (
                            <Button to={`/datasources/${dataSource.id}/edit`}>
                                <PencilIcon />
                                Bearbeiten
                            </Button>
                        )}
                        <Button to="/datasources" variant="outline">
                            Zurück zu Datenquellen
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Datasource Details */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                {dataSource.url ? 'Datenquelle Details' : 'Anfrage Details'}
                            </h2>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{dataSource.name}</dd>
                                </div>
                                
                                {dataSource.description && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Beschreibung</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{dataSource.description}</dd>
                                    </div>
                                )}
                                
                                {dataSource.justification && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Begründung</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{dataSource.justification}</dd>
                                    </div>
                                )}
                                
                                {dataSource.url && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Datenquelle URL</dt>
                                        <dd className="mt-1 text-sm">
                                            <a 
                                                href={dataSource.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1"
                                            >
                                                <ExternalLinkIcon className="w-4 h-4" />
                                                {dataSource.url}
                                            </a>
                                        </dd>
                                    </div>
                                )}
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Manuelle Freigabe</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                        {dataSource.needs_clearance ? 'Erforderlich' : 'Nicht erforderlich'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Required Certificates */}
                        {dataSource.certificates.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    Erforderliche Zertifikate ({dataSource.certificates.length})
                                </h2>
                                <div className="space-y-3">
                                    {dataSource.certificates.map((certificate) => (
                                        <div key={certificate.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {certificate.name}
                                                </div>
                                            </div>
                                            <div>
                                                <a
                                                    href={certificate.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center gap-1"
                                                >
                                                    <ExternalLinkIcon className="w-3 h-3" />
                                                    Zertifikat anzeigen
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments */}
                        {dataSource.comments.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <MessageCircleIcon className="w-5 h-5" />
                                    Kommentare ({dataSource.comments.length})
                                </h2>
                                <div className="space-y-4">
                                    {dataSource.comments.map((comment) => (
                                        <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">
                                                {comment.content}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Von {comment.user.name} am {new Date(comment.created_at).toLocaleDateString('de-DE')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Information */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Informationen
                            </h2>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Erstellt von</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                        {dataSource.user.name}
                                    </dd>
                                    <dd className="text-xs text-gray-500 dark:text-gray-400">
                                        {dataSource.user.email}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Erstellt am</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(dataSource.created_at).toLocaleDateString('de-DE', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                                    <dd className="mt-1">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                                            {statusInfo.label}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Access Requirements */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Zugangsvoraussetzungen
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${dataSource.certificates.length > 0 ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                                    <span className="text-gray-900 dark:text-gray-100">
                                        {dataSource.certificates.length > 0 
                                            ? `${dataSource.certificates.length} Zertifikat(e) erforderlich`
                                            : 'Keine Zertifikate erforderlich'
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${dataSource.needs_clearance ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                                    <span className="text-gray-900 dark:text-gray-100">
                                        {dataSource.needs_clearance 
                                            ? 'Manuelle Freigabe erforderlich'
                                            : 'Direkter Zugriff möglich'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        {dataSource.url && (
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    Schnelle Aktionen
                                </h2>
                                <div className="space-y-2">
                                    <Button 
                                        href={dataSource.url}
                                        variant="outline" 
                                        className="w-full justify-start"
                                    >
                                        <ExternalLinkIcon />
                                        Datenquelle öffnen
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
