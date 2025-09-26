import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { User, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, ShieldCheckIcon, Database, UserIcon } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
];

export function AppSidebar({user}: {user: User}) {
    const mainNavItems: NavItem[] = [
        {
            title: 'Startseite',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Datenquellen',
            href: "/datasources",
            icon: Database,
        },
        {
            title: 'Zertifikate',
            href: "/certificates",
            icon: ShieldCheckIcon,
        },
        {
            title: user.group_name === 'admin' ? 'Alle Nutzer' : 'Mein Profil',
            href: user.group_name === 'admin' ? "/profiles" : "/profile/" + user.id,
            icon: UserIcon,
        }
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
