import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Certificate {
    id: number;
    name: string;
    url: string;
}

interface Props extends PageProps {
    certificate?: Certificate; // Only present when editing
}

export default function CertificateCreateOrUpdate({ certificate }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const isAdmin = user?.group_name === 'admin';
    const isEditing = !!certificate;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Zertifikate',
            href: '/certificates',
        },
        ...(isEditing ? [
            {
                title: certificate.name,
                href: `/certificates/${certificate.id}`,
            },
            {
                title: 'Bearbeiten',
                href: `/certificates/${certificate.id}/edit`,
            }
        ] : [
            {
                title: 'Neues Zertifikat',
                href: '/certificates/create',
            }
        ])
    ];

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: certificate?.name || '',
        url: certificate?.url || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            // Update existing certificate
            put(`/certificates/${certificate.id}`, {
                onSuccess: () => reset(),
            });
        } else {
            // Create new certificate
            post('/certificates', {
                onSuccess: () => reset(),
            });
        }
    };

    // Only admins can create/edit certificates
    if (!isAdmin) {
        return (
            <AppLayout user={user} breadcrumbs={breadcrumbs}>
                <Head title="Zugriff verweigert" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Zugriff verweigert
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Nur Administratoren können Zertifikate erstellen oder bearbeiten.
                        </p>
                        <Button to="/certificates">
                            Zurück zu Zertifikaten
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout user={user} breadcrumbs={breadcrumbs}>
            <Head title={
                isEditing 
                    ? `${certificate.name} bearbeiten`
                    : 'Neues Zertifikat erstellen'
            } />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {isEditing 
                                ? 'Zertifikat bearbeiten'
                                : 'Neues Zertifikat erstellen'
                            }
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {isEditing 
                                ? 'Bearbeite die Details des Zertifikats'
                                : 'Füge ein neues Zertifikat hinzu, das für den Zugang zu Datenquellen erforderlich sein kann'
                            }
                        </p>
                    </div>
                </div>

                <div>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <div className="space-y-4">
                                {/* Certificate Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Zertifikat Name *
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        placeholder="z.B., Sicherheitsfreigabe Stufe 1"
                                    />
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Certificate URL */}
                                <div>
                                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Zertifikat URL *
                                    </label>
                                    <input
                                        id="url"
                                        name="url"
                                        type="url"
                                        required
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        placeholder="https://example.com/certificate.pdf"
                                    />
                                    {errors.url && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            {errors.url}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        URL zum Zertifikatsdokument (normalerweise ein PDF)
                                    </p>
                                </div>

                                {/* Preview of certificate if editing */}
                                {isEditing && (
                                    <div className="border-t pt-4">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Aktuelles Zertifikat:
                                        </p>
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <a
                                                href={certificate.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm"
                                            >
                                                Aktuelles Zertifikat anzeigen
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                to={isEditing ? `/certificates/${certificate.id}` : '/certificates'}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                {processing 
                                    ? (isEditing ? 'Wird gespeichert...' : 'Wird erstellt...') 
                                    : (isEditing ? 'Änderungen speichern' : 'Zertifikat erstellen')
                                }
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
