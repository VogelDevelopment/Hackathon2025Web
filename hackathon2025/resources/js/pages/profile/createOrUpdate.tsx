import AppLayout from '@/layouts/app-layout';
import { Certificate, PageProps, User, type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { ExternalLinkIcon, XIcon } from 'lucide-react';
import { UserCertificateUploadForm } from './usercertificateUploadForm';


interface Props extends PageProps {
    certificates: Certificate[];
    user?: User; // Only present when editing
}

export default function UserCreateOrUpdate({ certificates, user: editUser }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const isAdmin = user?.group_name === 'admin';
    const isEditing = !!editUser;
    const isSelf = isEditing && user?.id === editUser?.id;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Benutzer', href: '/profiles' },
        ...(isEditing
            ? [
                { title: editUser.name, href: `/profile/${editUser.id}` },
                { title: 'Bearbeiten', href: `/profile/${editUser.id}/edit` },
            ]
            : [{ title: 'Neuer Benutzer', href: '/profile/create' }]),
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
        data.certificate_ids.includes(cert.id),
    );

    // Collect user-uploaded certs from editUser.certificates
    // Group by status for display
    const approvedUserCerts = editUser?.certificates.filter(cert => cert.pivot.status === 'approved') || [];
    const requestedUserCerts = editUser?.certificates.filter(cert => cert.pivot.status === 'requested') || [];
    const rejectedUserCerts = editUser?.certificates.filter(cert => cert.pivot.status === 'rejected') || [];

    // Non-admin users can only edit themselves and cannot change group or certificates here
    if (!isAdmin && !isSelf) {
        return (
            <AppLayout user={user} breadcrumbs={breadcrumbs}>
                <Head title="Zugriff verweigert" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Zugriff verweigert
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Nur Administratoren können andere Benutzer bearbeiten.
                        </p>
                        <Button to="/profiles">Zurück zu Benutzern</Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout user={user} breadcrumbs={breadcrumbs}>
            <Head
                title={isEditing ? `${editUser.name} bearbeiten` : 'Neuen Benutzer erstellen'}
            />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {isEditing ? 'Benutzer bearbeiten' : 'Neuen Benutzer erstellen'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {isEditing
                                ? 'Bearbeite die Benutzerdetails und Berechtigungen'
                                : 'Erstelle einen neuen Benutzer mit entsprechenden Berechtigungen'}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
                        {/* User Info Inputs */}
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
                            {errors.name && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
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
                            {errors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
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
                            {errors.password && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
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

                        {/* Group Selection - Admin only */}
                        {isAdmin && (
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
                                {errors.group_name && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.group_name}</p>}
                            </div>
                        )}

                        {isAdmin && editUser && (
                            <section className="bg-white dark:bg-gray-800 shadow rounded-lg space-y-4">
                                <h2 className="text-lg font-semibold mb-4">Benutzer-Zertifikate</h2>
                                {editUser.certificates.length === 0 && (
                                    <p className="text-gray-500 dark:text-gray-400">Keine Zertifikate vom Benutzer eingereicht.</p>
                                )}
                                {editUser.certificates.length > 0 && (
                                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                                        {editUser.certificates.map((cert) => (
                                            <li
                                                key={cert.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{cert.name}</div>
                                                    <a
                                                        href={cert.pivot.url ?? cert.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs block"
                                                        title={cert.pivot.url ?? cert.url}
                                                    >
                                                        {cert.pivot.url ? 'Benutzer Zertifikat ansehen' : 'Kein Zertifikat hinterlegt'}
                                                    </a>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <span
                                                        className={
                                                            cert.pivot.status === 'approved'
                                                                ? 'px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : cert.pivot.status === 'requested'
                                                                    ? 'px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                    : 'px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        }
                                                    >
                                                        {cert.pivot.status.charAt(0).toUpperCase() + cert.pivot.status.slice(1)}
                                                    </span>

                                                    {/* Buttons to approve/reject */}
                                                    {cert.pivot.status !== 'approved' && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                router.patch(`/profile/${editUser.id}/certificate/${cert.id}/approve`);
                                                            }}
                                                        >
                                                            Genehmigen
                                                        </Button>
                                                    )}
                                                    {cert.pivot.status !== 'rejected' && (
                                                        <Button
                                                            variant="destructive"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                router.patch(`/profile/${editUser.id}/certificate/${cert.id}/reject`);
                                                            }}
                                                        >
                                                            Ablehnen
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="destructive"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (confirm('Möchten Sie dieses Zertifikat wirklich löschen?')) {
                                                                router.delete(`/profile/${editUser.id}/certificate/${cert.id}`);
                                                            }
                                                        }}
                                                        title="Zertifikat löschen"
                                                    >
                                                        Löschen
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? isEditing
                                    ? 'Wird gespeichert...'
                                    : 'Wird erstellt...'
                                : isEditing
                                    ? 'Änderungen speichern'
                                    : 'Benutzer erstellen'}
                        </Button>
                    </div>
                </form>

                {/* User self-upload certificate section */}
                {isSelf && (
                    <section className="mt-10 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Deine Zertifikate einreichen</h2>
                        <UserCertificateUploadForm certificates={certificates} />
                        {/* Optionally show list of user's uploaded certificates and their status here */}
                        {editUser?.certificates.length ? (
                            <div className="mt-4 space-y-2">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Hochgeladene Zertifikate</h3>
                                <ul className="text-sm">
                                    {editUser.certificates.map(cert => (
                                        <li key={cert.id} className="flex justify-between items-center">
                                            <a
                                                href={cert.pivot.url ?? cert.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {cert.name}
                                            </a>
                                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                {cert.pivot.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
