export type Role = "user" | "moderator" | "admin";

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  admin?: {
    display_name: string | null;
  };
}
