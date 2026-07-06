import type { ROLES } from "./roles";

export interface User {
    id: number;
    name: string;
    role_with_domain: string;
    displayName: string;
    email: string;
    role: (typeof ROLES)[keyof typeof ROLES];
    admin: boolean;
    token: string;
    roleName: string;
    picture: string;
}
