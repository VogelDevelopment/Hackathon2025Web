import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface PageProps {
    auth: Auth;
    [key: string]: any;
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    group_name: 'admin' | 'operator' | 'user';
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
interface Certificate {
    id: number;
    name: string;
    url: string;
}

interface Comment {
    id: number;
    content: string;
    created_at: string;
    user: User;
}

interface DataSource {
    id: number;
    name: string;
    description: string | null;
    justification: string | null;
    url: string | null;
    needs_clearance: boolean;
    created_at: string;
    user: User;
    certificates: Certificate[];
    comments: Comment[];
}