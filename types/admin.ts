export type Role = "user" | "moderator" | "admin";

export interface AdminUserView {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: string;
  stripe_customer_id: string | null;
  role: Role;
  username: string | null;
  banned_at: string | null;
  banned_reason: string | null;
  banned_by: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

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
