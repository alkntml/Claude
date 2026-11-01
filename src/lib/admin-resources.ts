import { z } from "zod";

/** Yönetici panelinin yönetebildiği kaynaklar ve izin verilen alanları. */
export const ADMIN_RESOURCES = {
  users: {
    table: "profiles",
    select: "id, email, full_name, institution, role, plan_id, is_suspended, created_at",
    order: "created_at",
    search: "email",
    update: z.object({ role: z.enum(["user", "admin"]).optional(), plan_id: z.string().max(40).optional(), is_suspended: z.boolean().optional(), full_name: z.string().max(200).optional() }),
    create: null,
    deletable: false,
  },
  plans: {
    table: "plans",
    select: "*",
    order: "sort_order",
    search: "name",
    update: z.object({
      name: z.string().max(100).optional(), description: z.string().max(1000).optional(), price_monthly: z.number().min(0).optional(), price_yearly: z.number().min(0).optional(),
      currency: z.string().length(3).optional(), is_active: z.boolean().optional(), sort_order: z.number().int().optional(), features: z.array(z.string().max(200)).max(30).optional(),
      limits: z.object({ ai_requests_month: z.number().int().min(0).nullable().optional(), tokens_month: z.number().int().min(0).nullable().optional(), source_searches_month: z.number().int().min(0).nullable().optional(), projects: z.number().int().min(0).nullable().optional(), storage_mb: z.number().int().min(0).nullable().optional(), export_formats: z.array(z.enum(["txt", "md", "docx", "pdf"])).optional() }).optional(),
    }),
    create: z.object({ id: z.string().regex(/^[a-z0-9_-]{2,40}$/), name: z.string().max(100), description: z.string().max(1000).default(""), price_monthly: z.number().min(0).default(0), price_yearly: z.number().min(0).default(0), currency: z.string().length(3).default("TRY"), limits: z.record(z.string(), z.unknown()).default({}), features: z.array(z.string()).default([]), sort_order: z.number().int().default(10) }),
    deletable: true,
  },
  announcements: {
    table: "announcements",
    select: "*",
    order: "created_at",
    search: "title",
    update: z.object({ title: z.string().max(200).optional(), body: z.string().max(5000).optional(), level: z.enum(["info", "success", "warning", "critical"]).optional(), is_active: z.boolean().optional(), ends_at: z.string().datetime().nullable().optional() }),
    create: z.object({ title: z.string().min(1).max(200), body: z.string().max(5000).default(""), level: z.enum(["info", "success", "warning", "critical"]).default("info"), is_active: z.boolean().default(true), ends_at: z.string().datetime().nullable().optional() }),
    deletable: true,
  },
  feedback: {
    table: "feedback",
    select: "id, user_id, page, category, message, status, admin_note, created_at",
    order: "created_at",
    search: "message",
    update: z.object({ status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(), admin_note: z.string().max(5000).optional() }),
    create: null,
    deletable: true,
  },
  help: {
    table: "help_articles",
    select: "*",
    order: "sort_order",
    search: "title",
    update: z.object({ title: z.string().max(200).optional(), body: z.string().max(50000).optional(), category: z.string().max(60).optional(), is_published: z.boolean().optional(), sort_order: z.number().int().optional() }),
    create: z.object({ slug: z.string().regex(/^[a-z0-9-]{2,80}$/), title: z.string().min(1).max(200), body: z.string().max(50000).default(""), category: z.string().max(60).default("genel"), is_published: z.boolean().default(false) }),
    deletable: true,
  },
  settings: {
    table: "app_settings",
    select: "key, value, updated_at",
    order: "key",
    search: "key",
    update: z.object({ value: z.unknown() }),
    create: null,
    deletable: false,
  },
  organizations: {
    table: "organizations",
    select: "id, name, plan_id, seats, join_code, email_domain, active, expires_at, notes, created_at",
    order: "created_at",
    search: "name",
    update: z.object({ name: z.string().min(1).max(200).optional(), plan_id: z.string().max(40).optional(), seats: z.number().int().min(1).max(100000).optional(), email_domain: z.string().max(200).nullable().optional(), active: z.boolean().optional(), expires_at: z.string().datetime().nullable().optional(), notes: z.string().max(5000).optional() }),
    create: z.object({ name: z.string().min(1).max(200), plan_id: z.string().max(40).default("pro"), seats: z.number().int().min(1).max(100000).default(50), email_domain: z.string().max(200).nullable().optional(), expires_at: z.string().datetime().nullable().optional(), notes: z.string().max(5000).default("") }),
    deletable: true,
  },
  errors: {
    table: "error_logs",
    select: "id, user_id, route, message, stack, meta, created_at",
    order: "created_at",
    search: "message",
    update: null,
    create: null,
    deletable: true,
  },
} as const;

export type AdminResource = keyof typeof ADMIN_RESOURCES;
export const SETTING_KEYS = ["ai.models", "ai.system_prompt", "ai.stage_prompts", "sources.enabled", "limits.rate", "plagiarism", "billing.student", "referral", "site.contact"] as const;
