import AppLayout from '@/layouts/app-layout'
import { type PageProps, type BreadcrumbItem } from '@/types'
import { Button } from '@/components/ui/button'
import { usePage } from '@inertiajs/react'
import { UsersIcon, Eye } from 'lucide-react'

interface UserSummary {
  id: number
  name: string
  email: string
  group_name: string
  certificates_count: number
  datasources_count: number
}

interface Props extends PageProps {
  users: UserSummary[]
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Benutzer',
    href: '/profiles'
  }
]

export default function Profiles({ users }: Props) {
  const { auth } = usePage<PageProps>().props;
  const currentUser = auth.user
  const isAdmin = currentUser?.group_name === 'admin'

  return (
    <AppLayout user={currentUser} breadcrumbs={breadcrumbs}>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Benutzerübersicht</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Übersicht über alle Benutzer und deren Berechtigungen
        </p>

        {isAdmin && (
          <Button className="mb-6" size="sm" variant="default" to="/profile/create">
            <UsersIcon className="mr-2" />Neuen Benutzer erstellen
          </Button>
        )}

        {users.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Keine Benutzer gefunden.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">E-Mail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Gruppe</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Zertifikate</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Datenquellen</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Aktion</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{user.group_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{user.certificates_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{user.datasources_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button size="sm" variant="ghost" to={`/profile/${user.id}`}>
                        <Eye className="mr-1" />Ansehen
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
