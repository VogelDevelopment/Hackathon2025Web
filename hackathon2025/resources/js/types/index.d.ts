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
    certificates: Array<{
        id: number;
        name: string;
        url: string;
        created_at: string;
        pivot: {
            status: 'requested' | 'approved' | 'rejected';
            url: string | null;
        };
    }>;
    data_sources: DataSource[];
    [key: string]: unknown; // This allows for additional properties...
}
interface Certificate {
    id: number;
    name: string;
    url: string;
    pivot: {
        status: string;
        url: string | null;
    };
    created_at: string;
    users?: Array<{
        id: number;
        name: string;
        email: string;
        pivot: {
            status: 'requested' | 'approved' | 'rejected';
        };
    }>;
    data_sources?: Array<{
        id: number;
        name: string;
        url: string | null;
    }>;
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
    granted_access_users?: User[];
    access_request_status?: 'pending' | 'success' | 'error';
    open_requests_count?: number;
    access_requests?: User[]; // users who requested access but not yet granted
}