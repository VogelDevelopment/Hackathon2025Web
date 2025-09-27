import AppLayout from '@/layouts/app-layout';
import { Certificate, DataSource, PageProps, type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { XIcon } from 'lucide-react';


interface Props extends PageProps {
    certificates: Certificate[];
    dataSource?: DataSource; // Only present when editing
}

export default function DataSourceCreateOrUpdate({ certificates, dataSource }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    
    const isEditing = !!dataSource;
    const [showCertificates, setShowCertificates] = useState(false);
    
    const { data, setData, post, put, processing, errors, reset } = useForm({
        requested_name: dataSource?.name || '',  // For create mode
        name: dataSource?.name || '',           // For update mode  
        description: dataSource?.description || '',
        justification: dataSource?.justification || '',
        expected_url: dataSource?.url || '',    // For create mode
        url: dataSource?.url || '',            // For update mode
        needs_clearance: dataSource?.needs_clearance || false,
        certificate_ids: dataSource?.certificates?.map(cert => cert.id) || [] as number[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            // Update existing datasource
            put(`/datasources/${dataSource.id}`, {
                onSuccess: () => reset(),
            });
        } else {
            // Create new datasource - changed from /new to just /datasources
            post('/datasources', {
                onSuccess: () => reset(),
            });
        }
    };

    const handleCertificateToggle = (certificateId: number) => {
        const newSelected = data.certificate_ids.includes(certificateId)
            ? data.certificate_ids.filter(id => id !== certificateId)
            : [...data.certificate_ids, certificateId];
        setData('certificate_ids', newSelected);
    };

    const selectedCertificates = certificates.filter(cert => 
        data.certificate_ids.includes(cert.id)
    );

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Datenquellen',
            href: '/datasources',
        },
        {
            title: isEditing ? 'Bearbeiten' : 'Neue Datenquelle',
            href: isEditing ? `/datasources/${dataSource.id}/edit` : '/datasources/create',
        },
    ];

    return (
        <AppLayout user={user} breadcrumbs={breadcrumbs}>
            <Head title={
                isEditing 
                    ? "Datenquelle bearbeiten" 
                    : (data.expected_url || data.url) ? "Neue Datenquelle anlegen" : "Neue Datenquelle anfragen"
            } />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {isEditing 
                                ? "Datenquelle bearbeiten"
                                : (data.expected_url || data.url) ? "Neue Datenquelle anlegen" : "Neue Datenquelle anfragen"
                            }
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {isEditing 
                                ? "Bearbeite die Datenquelle."
                                : (data.expected_url || data.url) ? "Erstelle eine neue Datenquelle." : "Stelle eine Anfrage für eine neue Datenquelle."
                            }
                        </p>
                    </div>
                </div>

                <div>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <div className="space-y-4">
                                {/* Name Field */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Name der Datenquelle *
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={isEditing ? data.name : data.requested_name}
                                        onChange={(e) => setData(isEditing ? 'name' : 'requested_name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        placeholder="Z.B., Verkehrsunfall-Statistiken LK Leer 2024"
                                    />
                                    {(errors.requested_name || errors.name) && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            {errors.requested_name || errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Beschreibung (optional)
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        placeholder="Beschreibe, welche Art von Daten du benötigst..."
                                    />
                                    {errors.description && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                {/* Justification */}
                                <div>
                                    <label htmlFor="justification" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Begründung (optional)
                                    </label>
                                    <textarea
                                        id="justification"
                                        name="justification"
                                        rows={3}
                                        value={data.justification}
                                        onChange={(e) => setData('justification', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        placeholder="Wozu benötigst du diese Datenquelle?"
                                    />
                                    {errors.justification && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            {errors.justification}
                                        </p>
                                    )}
                                </div>

                                {/* URL Field */}
                                <div>
                                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Link zur Datenquelle (optional)
                                    </label>
                                    <input
                                        id="url"
                                        name="url"
                                        type="url"
                                        value={isEditing ? data.url : data.expected_url}
                                        onChange={(e) => setData(isEditing ? 'url' : 'expected_url', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        placeholder="https://example.com/data.csv"
                                    />
                                    {(errors.expected_url || errors.url) && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            {errors.expected_url || errors.url}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Link zur Datenquelle. Wenn dieses Feld leer ist, wird dies als Suchanfrage zur Datenquelle behandelt.
                                    </p>
                                </div>

                                {/* Manual Clearance Checkbox */}
                                <div className="flex items-center">
                                    <input
                                        id="needs_clearance"
                                        name="needs_clearance"
                                        type="checkbox"
                                        checked={data.needs_clearance}
                                        onChange={(e) => setData('needs_clearance', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600"
                                    />
                                    <label htmlFor="needs_clearance" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                        Benötigt manuelle Freigabe für Zugriff
                                    </label>
                                </div>

                                {/* Certificate Selection */}
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Erforderliche Zertifikate ({data.certificate_ids.length})
                                        </label>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowCertificates(!showCertificates)}
                                        >
                                            {showCertificates ? 'Ausblenden' : 'Auswählen'}
                                        </Button>
                                    </div>

                                    {/* Selected Certificates Display */}
                                    {data.certificate_ids.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {selectedCertificates.map((certificate) => (
                                                <span
                                                    key={certificate.id}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded dark:bg-blue-900 dark:text-blue-200"
                                                >
                                                    {certificate.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCertificateToggle(certificate.id)}
                                                        className="hover:bg-blue-200 rounded-full p-0.5 dark:hover:bg-blue-800"
                                                    >
                                                        <XIcon className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Certificate Selection List */}
                                    {showCertificates && (
                                        <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded-md dark:border-gray-600">
                                            {certificates.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                                    Keine Zertifikate verfügbar.
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {certificates.map((certificate) => (
                                                        <label
                                                            key={certificate.id}
                                                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-700"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={data.certificate_ids.includes(certificate.id)}
                                                                onChange={() => handleCertificateToggle(certificate.id)}
                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600"
                                                            />
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {certificate.name}
                                                                </div>
                                                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                                                    <a 
                                                                        href={certificate.url} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        Zertifikat anzeigen
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Benutzer benötigen diese genehmigten Zertifikate für den Zugriff auf diese Datenquelle
                                    </p>

                                    {errors.certificate_ids && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            {errors.certificate_ids}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                {processing 
                                    ? 'Wird gespeichert...' 
                                    : isEditing 
                                        ? 'Änderungen speichern'
                                        : (data.expected_url || data.url) ? 'Datenquelle freigeben' : 'Anfrage stellen'
                                }
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
