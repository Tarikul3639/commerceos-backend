export interface AuditContext {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    method: string;
    url: string;
}