import { Button } from '@/components/ui/button'
import { DataSource, PageProps } from '@/types'
import { usePage } from '@inertiajs/react'
import { ClipboardCheckIcon, EyeIcon, ShieldCheckIcon, ExternalLinkIcon, ShieldQuestionIcon } from 'lucide-react'
import { HTMLAttributes } from 'react'

interface DataSourceTableProps extends HTMLAttributes<HTMLElement> {
    dataSources: DataSource[];
    onRowClick?: (dataSource: DataSource) => void;
    // Map from datasource id to request status for UI updates
    requestStatuses?: Record<number, 'pending' | 'success' | 'error' | undefined>;
}

export function DataSourceTable({ dataSources, onRowClick, requestStatuses = {} }: DataSourceTableProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const isAdmin = user?.group_name === 'admin';

    const userHasRequiredCerts = (ds: DataSource) => {
        if (isAdmin) return true;
        const userCertIds = new Set(user.certificates.filter(c => c.pivot.status === 'approved').map(c => c.id));
        const requiredCertIds = ds.certificates.map(c => c.id);
        return requiredCertIds.every(id => userCertIds.has(id));
    };

    const userHasClearance = (ds: DataSource) => {
        if (!ds.needs_clearance) return true;
        if (isAdmin) return true;
        if (ds.user.id === user.id) return true;
        return ds.granted_access_users?.some(u => u.id === user.id);
    };

    const getStatusBadge = (ds: DataSource) => {
        if (ds.url) {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Verfügbar
                    <ClipboardCheckIcon className="ml-1 w-3 h-3" />
                </span>
            )
        }
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Anfrage
            </span>
        )
    }

    return (
        <div className="overflow-auto rounded-md border border-gray-200 dark:border-gray-700">
            <table className="w-full border-collapse divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300">Ersteller</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300">Zertifikate</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300">Erstellt am</th>
                        {isAdmin && (
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300">
                                Offene Anfragen
                            </th>
                        )}
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300">Aktionen</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {dataSources.map(ds => {
                        const hasCerts = userHasRequiredCerts(ds);
                        const hasClearance = userHasClearance(ds);
                        const reqStatus = requestStatuses[ds.id];

                        return (
                            <tr
                                key={ds.id}
                                className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${reqStatus === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900 pointer-events-none' : ''
                                    } ${reqStatus === 'success' ? 'bg-green-50 dark:bg-green-900' : ''} ${reqStatus === 'error' ? 'bg-red-50 dark:bg-red-900' : ''
                                    }`}
                            >
                                <td
                                    className="px-6 py-4 max-w-xs truncate"
                                    onClick={e => {
                                        e.preventDefault();
                                        if (reqStatus === 'pending') return; // Prevent click if request is pending or successful
                                        if (onRowClick) onRowClick(ds);
                                    }}
                                    title={ds.name}
                                >
                                    {ds.name}
                                    {reqStatus === 'pending' && (
                                        <span className="ml-2 inline-block text-xs text-yellow-600 dark:text-yellow-400 font-semibold">Anfrage ausstehend</span>
                                    )}
                                    {reqStatus === 'success' && (
                                        <span className="ml-2 inline-block text-xs text-green-600 dark:text-green-400 font-semibold">Anfrage genehmigt</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">{getStatusBadge(ds)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{ds.user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {ds.certificates.length > 0 ? (
                                        <span>{ds.certificates.length}</span>
                                    ) : (
                                        <span className="text-gray-400">Keine</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(ds.created_at).toLocaleDateString('de-DE')}</td>
                                {isAdmin && (
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {ds.open_requests_count && ds.open_requests_count > 0
                                            ? <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-700 dark:text-red-100">{ds.open_requests_count}</span>
                                            : <span className="text-gray-400">0</span>
                                        }
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2 flex justify-end items-center">
                                    {(!ds.needs_clearance || hasClearance) && (
                                        <Button size="sm" variant="ghost" onClick={() => onRowClick && onRowClick(ds)}>
                                            Anzeigen
                                        </Button>
                                    )}
                                    {(ds.url && (!ds.needs_clearance || hasClearance || reqStatus === 'success') && hasCerts) && (
                                        <a
                                            href={ds.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm font-medium shadow-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                                        >
                                            Öffnen
                                        </a>
                                    )}
                                    {ds.needs_clearance && !hasClearance && hasCerts && !(reqStatus === 'pending' || reqStatus === 'success') && (
                                        <Button size="sm" variant="outline" onClick={() => onRowClick && onRowClick(ds)}>
                                            Anfrage stellen
                                        </Button>
                                    )}
                                    {ds.needs_clearance && (
                                        <span title="Benötigt manuelle Freigabe" className="inline-flex items-center text-amber-500">
                                            <ShieldCheckIcon className="w-4 h-4 mr-1" />
                                        </span>
                                    )}
                                    {!hasCerts && (
                                        <span title="Benötigte Zertifikate fehlen" className="inline-flex items-center text-red-500">
                                            <ShieldQuestionIcon className="w-4 h-4 mr-1" />
                                        </span>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
}
