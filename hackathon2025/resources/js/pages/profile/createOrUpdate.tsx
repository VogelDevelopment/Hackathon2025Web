import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { ExternalLinkIcon, XIcon } from 'lucide-react';

interface Certificate {
    id: number;
    name: string;
    url: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    group_name: 'admin' | 'operator' | 'user';
    certificates: Array<{
        id: number;
        name: string;
        url: string;
        pivot: {
            status: 'requested' | 'approved';
        };
    }>;
}

interface Props extends PageProps {
    certificates: Certificate[];
    user?: User; // Only present when editing
}

export default function UserCreateOrUpdate({ certificates, user: editUser }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const isAdmin = user?.group_name === 'admin';
    const isEditing = !!editUser;
    const [showCertificates, setShowCertificates] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Benutzer',
            href: '/users',
        },
        ...(isEditing ? [
            {
                title: editUser.name,
                href: `/users/${editUser.id}`,
            },
            {
                title: 'Bearbeiten',
                href: `/users/${editUser.id}/edit`,
            }
        ] : [
            {
                title: 'Neuer Benutzer',
                href: '/users/create',
            }
        ])
    ];

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: editUser?.name || '',
        email: editUser?.email || '',
        password: '',
        password_confirmation: '',
        group_name: editUser?.group_name || 'user',
        certificate_ids: editUser?.certificates?.map(cert => cert.id) || [] as number[],
        certificate_status: 'requested' as 'requested' | 'approved',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            put(`/profile/${editUser.id}`, {
                onSuccess: () => reset('password', 'password_confirmation'),
            });
        } else {
            post('/profile', {
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

    // Only admins can create/edit users
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
                            Nur Administratoren können Benutzer erstellen oder bearbeiten.
                        </p>
                        {isAdmin && (
                            <Button to="/profiles">
                                Zurück zu Benutzern
                            </Button>
                        )}
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout user={user} breadcrumbs={breadcrumbs}>
            <Head title={
                isEditing 
                    ? `${editUser.name} bearbeiten`
                    : 'Neuen Benutzer erstellen'
            } />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {isEditing ? 'Benutzer bearbeiten' : 'Neuen Benutzer erstellen'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {isEditing 
                                ? 'Bearbeite die Benutzerdetails und Berechtigungen'
                                : 'Erstelle einen neuen Benutzer mit entsprechenden Berechtigungen'
                            }
                        </p>
                    </div>
                </div>

                <div>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Name *
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        placeholder="Max Mustermann"
                                    />
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        E-Mail *
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        placeholder="max@example.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Passwort {isEditing ? '(leer lassen um nicht zu ändern)' : '*'}
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required={!isEditing}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                    />
                                    {errors.password && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Password Confirmation */}
                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Passwort bestätigen {isEditing ? '' : '*'}
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        required={!isEditing}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                    />
                                </div>

                                {/* Group Selection */}
                                <div>
                                    <label htmlFor="group_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Benutzergruppe *
                                    </label>
                                    <select
                                        id="group_name"
                                        name="group_name"
                                        value={data.group_name}
                                        onChange={(e) => setData('group_name', e.target.value as any)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    >
                                        <option value="user">Benutzer</option>
                                        <option value="operator">Operator</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                    {errors.group_name && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            {errors.group_name}
                                        </p>
                                    )}
                                </div>

                                {/* Certificate Selection */}
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Zertifikate ({data.certificate_ids.length})
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={data.certificate_status}
                                                onChange={(e) => setData('certificate_status', e.target.value as any)}
                                                className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                            >
                                                <option value="requested">Angefragt</option>
                                                <option value="approved">Genehmigt</option>
                                            </select>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setShowCertificates(!showCertificates)}
                                            >
                                                {showCertificates ? 'Ausblenden' : 'Auswählen'}
                                            </Button>
                                        </div>
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
                                                            <div className="ml-3 flex-1">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {certificate.name}
                                                                </div>
                                                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                                                    <a 
                                                                        href={certificate.url} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        <ExternalLinkIcon className="w-3 h-3" />
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
                                to={isEditing ? `/profile/${editUser.id}` : '/dashboard'}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                {processing 
                                    ? (isEditing ? 'Wird gespeichert...' : 'Wird erstellt...') 
                                    : (isEditing ? 'Änderungen speichern' : 'Benutzer erstellen')
                                }
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
