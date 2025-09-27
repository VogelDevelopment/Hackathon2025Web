import { Fragment } from 'react'
import { Link, router } from '@inertiajs/react'
import { Users as UsersIcon, Pencil as PencilIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePage } from '@inertiajs/react'
import { PageProps, type User } from '@/types'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'

interface Props {
  users: User[]
}

const breadcrumbs = [{ title: 'Benutzer', href: '/profiles' }]

export default function Profiles({ users }: Props) {
  const { auth } = usePage<PageProps>().props;
  const currentUser = auth?.user
  const isAdmin = currentUser?.group_name === 'admin'

  return (
    <AppLayout user={currentUser} breadcrumbs={breadcrumbs}>
      <Head title="Benutzer Übersicht" />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Benutzer Übersicht
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Übersicht über alle Benutzer und deren Berechtigungen
        </p>

        {isAdmin && (
          <Button className="mb-6" size="sm" variant="default" to="/profile/create">
            <UsersIcon className="mr-2" />
            Neuen Benutzer erstellen
          </Button>
        )}

        {users.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
            Keine Benutzer gefunden.
          </p>
        ) : (
          <div className="space-y-0 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Header Row */}
            <div className="grid grid-cols-[2fr_3fr_2fr_1fr_1fr_1fr] bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-4 py-3 font-semibold text-xs uppercase tracking-wider select-none">
              <div>Name</div>
              <div>E-Mail</div>
              <div>Gruppe</div>
              <div className="text-center">Zertifikate</div>
              <div className="text-center">Datenquellen</div>
              <div></div>
            </div>

            {/* Data Rows */}
            {users.map((user) => (
              <Link
                key={user.id}
                href={isAdmin || currentUser?.id === user.id ? `/profile/${user.id}` : '#'}
                className="block"
                aria-disabled={!(isAdmin || currentUser?.id === user.id)}
              >
                <div className="grid grid-cols-[2fr_3fr_2fr_1fr_1fr_1fr] items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-3 select-none text-gray-900 dark:text-gray-100">
                  <div className="truncate">{user.name}</div>
                  <div className="truncate">{user.email}</div>
                  <div className="capitalize truncate">{user.group_name}</div>
                  <div className="text-center">{user.certificates?.length ?? 0}</div>
                  <div className="text-center">{user.data_sources?.length ?? 0}</div>
                  <div className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        router.visit(`/profile/${user.id}/edit`);
                      }}
                      disabled={!isAdmin && currentUser.id !== user.id}
                      title="Benutzer bearbeiten"
                    >
                      <PencilIcon className="mr-1" />
                      Bearbeiten
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
