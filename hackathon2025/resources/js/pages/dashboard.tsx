import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import { home, login, register } from '@/routes';
import { ExternalLinkIcon, SearchIcon, ClipboardListIcon, ShieldCheckIcon, UserCheckIcon, LockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Startseite',
        href: home().url,
    },
];

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-xs text-center flex flex-col items-center gap-4">
            <div className="text-blue-600 dark:text-blue-400 text-4xl">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{description}</p>
        </div>
    );
}

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <AppLayout user={user} breadcrumbs={breadcrumbs}>
            <Head title="Startseite" />
            <main className="bg-blue-50 dark:bg-gray-900 min-h-screen flex flex-col px-6">
                <div className='p-6 flex-row self-end'>
                    {!auth.user && (
                        <>
                            <Button
                                to={login().url}
                                className='mr-4'
                            >
                                Anmelden
                            </Button>
                            <Button
                                to={register().url}
                            >
                                Registrieren
                            </Button>
                        </>
                    )}
                </div>
                <div className='pt-16 md:pt-24 flex flex-col items-center'>
                <header className="max-w-4xl text-center mb-20">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-gray-100">
                        Datenraum der Zukunft - Zugänge schaffen, Potenziale entfalten
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                        Die zentrale Plattform für transparente, sichere und kontrollierte Nutzung von Datenquellen in Ostfriesland.
                        Entdecken Sie verfügbare Datenquellen, melden Sie Ihren Datenbedarf an oder verwalten Sie Zugänge sicher und komfortabel.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button
                            type="button"
                            variant={"outline"}
                            size={"xl"}
                            className='transition'
                            to='/datasources'
                        >
                            Datenquellen durchsuchen
                        </Button>
                        <Button
                            type="button"
                            variant={"outline"}
                            size={"xl"}
                            className='transition'
                            to='/datasources/create'
                        >
                            Datenbedarf melden
                        </Button>
                        <Button
                            type="button"
                            variant={"outline"}
                            size={"xl"}
                            className='transition'
                            to='/certificates'
                        >
                            Zertifikate & Zugang
                        </Button>
                    </div>
                </header>

                <section className="max-w-6xl w-full mb-24 px-4 md:px-0">
                    <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
                        Was ist der Datenraum?
                    </h2>
                    <p className="text-center max-w-4xl mx-auto text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                        Ein digitaler Marktplatz für Daten aus Verwaltung, Wirtschaft, Wissenschaft und Zivilgesellschaft, der Transparenz schafft,
                        Bedarfe sichtbar macht und sicheren, kontrollierten Zugang ermöglicht.
                    </p>
                </section>

                <section className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 px-4 md:px-0">
                    <FeatureCard
                        title="Datenkatalog & Suche"
                        description="Finden Sie Datenquellen schnell und einfach."
                        icon={<SearchIcon />}
                    />
                    <FeatureCard
                        title="Bedarfsmeldungen & Marktplatz"
                        description="Veröffentlichen Sie Ihren Bedarf oder unterstützen Sie andere mit passenden Daten."
                        icon={<ClipboardListIcon />}
                    />
                    <FeatureCard
                        title="Zertifikats- & Zugangsmanagement"
                        description="Verwalten Sie Ihre Zugänge sicher mit Zertifikaten und Freigaben."
                        icon={<ShieldCheckIcon />}
                    />
                    <FeatureCard
                        title="Sicherheits- & Rollenmanagement"
                        description="Präzise Zugriffssteuerung für sensible Daten."
                        icon={<LockIcon />}
                    />
                </section>

                <section className="max-w-5xl w-full mt-32 px-4 md:px-0 text-center">
                    <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                        Warum Ostfriesland profitiert
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed mb-10">
                        Transparentere Datenverwaltung fördert Innovation, Kooperation und wirtschaftliches Wachstum in den Landkreisen Leer, Aurich, Wittmund und der Stadt Emden.
                        Dabei setzen wir auf Datensicherheit und Datenschutz, um das Vertrauen aller Beteiligten zu gewährleisten.
                    </p>
                    <div className="inline-flex items-center gap-4 text-gray-600 dark:text-gray-400">
                        <UserCheckIcon className="w-6 h-6" />
                        <span>Zusammenarbeit zwischen Verwaltung, Wirtschaft und Wissenschaft</span>
                    </div>
                </section>

                <section className="max-w-5xl w-full mt-24 px-4 md:px-0">
                    <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-gray-100">
                        So starten Sie
                    </h2>
                    <ol className="list-decimal max-w-3xl mx-auto leading-relaxed space-y-4 text-gray-700 dark:text-gray-300 text-lg">
                        <li>Registrieren & Profil anlegen</li>
                        <li>Datenquellen durchsuchen oder neue hinzufügen</li>
                        <li>Bedarf melden und passende Angebote finden</li>
                        <li>Zertifikate hochladen und Zugänge beantragen</li>
                        <li>Daten sicher und effizient nutzen</li>
                    </ol>
                </section>

                <footer className="mt-24 w-full border-t border-gray-300 dark:border-gray-700 py-8 px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
                    &copy; 2025 Datenraum Ostfriesland. Alle Rechte vorbehalten.
                </footer>
                </div>
            </main>
        </AppLayout>
    );
}
