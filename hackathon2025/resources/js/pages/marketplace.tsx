import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { marketplace } from '@/routes';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import DataSourceCreateOrUpdate from './datasource/createOrUpdate';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Marktplatz',
        href: marketplace().url,
    },
];

export default function Marketplace() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const [showModal, setShowModal] = useState(false);

    return (
        <AppLayout user={user} breadcrumbs={breadcrumbs}>
            <Head title="Marktplatz" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {user.group_name === 'admin' && <div>Admin Panel</div>}
                {user.group_name === 'operator' && <div>Operator Panel</div>}
                {user.group_name === 'user' && <div>User Panel</div>}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Button
                        className="relative rounded-xl border py-4 px-6"
                        onClick={() => setShowModal(true)}
                    >
                        Datenquelle anfragen
                    </Button>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                </div>
            </div>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl min-w-[400px]">
                        <DataSourceCreateOrUpdate auth={auth} certificates={[]} />
                        <Button
                            className="mt-4"
                            variant="secondary"
                            onClick={() => setShowModal(false)}
                        >
                            Schließen
                        </Button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
