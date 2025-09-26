import { Button } from '@/components/ui/button'
import { DataSource, PageProps } from '@/types'
import { usePage } from '@inertiajs/react'
import { ClipboardCheckIcon, EyeIcon, PencilIcon, ShieldCheckIcon, ExternalLinkIcon } from 'lucide-react'


interface DataSourceTableProps {
    dataSources: DataSource[]
}

export function DataSourceTable({ dataSources }: DataSourceTableProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const isAdmin = user?.group_name === 'admin'

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
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300">Aktionen</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {dataSources.map(ds => (
                        <tr key={ds.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 max-w-xs truncate">{ds.name}</td>
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
                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    to={`/datasources/${ds.id}`}
                                >
                                    <EyeIcon className="mr-1" />
                                    Anzeigen
                                </Button>
                                {(isAdmin || ds.user.id === user.id) && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        to={`/datasources/${ds.id}/edit`}
                                    >
                                        <PencilIcon className="mr-1" />
                                        Bearbeiten
                                    </Button>
                                )}
                                {ds.url && (
                                    <a
                                        href={ds.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm font-medium shadow-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                                    >
                                        <ExternalLinkIcon className="mr-1" />
                                        Öffnen
                                    </a>
                                )}
                                {ds.needs_clearance && (
                                    <span title="Benötigt manuelle Freigabe" className="inline-flex items-center text-amber-500" >
                                        <ShieldCheckIcon className="w-4 h-4 mr-1" />
                                        Sicherheit
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
