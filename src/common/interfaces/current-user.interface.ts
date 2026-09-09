export interface CurrentUserPayload {
    id: string;
    email: string;
    role: string;
    permissions: string[];
}