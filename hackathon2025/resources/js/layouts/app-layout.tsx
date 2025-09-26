import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { User, type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    user: User;
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ user, children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate user={user} breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>
);
