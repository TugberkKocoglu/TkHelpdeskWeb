import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from "axios";

// Netlify demonstration only: no HTTP calls, no real authentication or database.
// Changes are stored in this browser's localStorage, never in PostgreSQL.
type Row = Record<string, unknown>;
type DemoDb = {
  companies: Row[];
  users: Row[];
  tickets: Row[];
  comments: Row[];
  notifications: Row[];
  histories: Row[];
};

const KEY = "tkhelpdesk_demo_db_v1";
const now = () => new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
const departments = [
  { id: 1, name: "Helpdesk", is_active: true },
  { id: 2, name: "Yazılım", is_active: true },
  { id: 3, name: "Yazılım Destek", is_active: true },
];
const initial: DemoDb = {
  companies: [
    [1, "Örnek Teknoloji"], [2, "Mavi Bilişim"], [3, "Kuzey Yazılım"], [4, "Nova İletişim"],
  ].map(([id, name]) => ({ id, name, contact_email: `iletisim${id}@example.com`, contact_phone: "0212 000 00 00", is_active: true, created_at: daysAgo(25), updated_at: daysAgo(25) })),
  users: [
    { id: 1, first_name: "Demo", last_name: "Helpdesk", email: "helpdesk@demo.com", role: "Helpdesk", department_id: 1, is_active: true },
    { id: 2, first_name: "Demo", last_name: "Personel", email: "employee@demo.com", role: "Employee", department_id: 3, is_active: true },
    { id: 3, first_name: "Ayşe", last_name: "Örnek", email: "ayse@example.com", role: "Employee", department_id: 2, is_active: true },
  ].map(x => ({ ...x, created_at: daysAgo(25), department: departments.find(d => d.id === x.department_id) })),
  tickets: [
    { id: 1, title: "Uygulamada giriş sorunu", description: "Kullanıcı giriş yaparken hata görüyor.", company_id: 1, department_id: 3, priority: "High", status: "InPool", assigned_user_id: null, created_at: daysAgo(1) },
    { id: 2, title: "Rapor ekranı iyileştirmesi", description: "Aylık raporlara yeni filtre eklenmesi talep edildi.", company_id: 2, department_id: 2, priority: "Normal", status: "InPool", assigned_user_id: null, created_at: daysAgo(3) },
    { id: 3, title: "Bildirimler görüntülenmiyor", description: "Mobil bildirim kontrolü gerekiyor.", company_id: 3, department_id: 3, priority: "Critical", status: "InProgress", assigned_user_id: 2, created_at: daysAgo(6) },
    { id: 4, title: "Kullanıcı yetki talebi", description: "Yeni departman erişimi tanımlanacak.", company_id: 4, department_id: 3, priority: "Low", status: "Closed", assigned_user_id: 2, created_at: daysAgo(8), closed_at: daysAgo(4), resolution_note: "Yetkiler güncellendi." },
    { id: 5, title: "Müşteri kayıt kontrolü", description: "Firma alanları gözden geçirilecek.", company_id: 1, department_id: 3, priority: "Normal", status: "Claimed", assigned_user_id: 2, created_at: daysAgo(2) },
    { id: 6, title: "Yeni modül talebi", description: "Yeni bir modülün planlanması isteniyor.", company_id: 2, department_id: 2, priority: "Normal", status: "Closed", assigned_user_id: 3, created_at: daysAgo(12), closed_at: daysAgo(7), resolution_note: "Planlama tamamlandı." },
  ].map(t => ({ ticket_number: `TK-DEMO-${String(t.id).padStart(4, "0")}`, created_by_user_id: 1, claimed_at: t.assigned_user_id ? t.created_at : null, closed_at: null, resolution_note: null, updated_at: t.created_at, ...t })),
  comments: [{ id: 1, ticket_id: 3, user_id: 2, userName: "Demo Personel", content: "İnceleme devam ediyor.", created_at: daysAgo(2) }],
  notifications: [
    { id: 1, user_id: 2, ticket_id: 1, title: "Yeni Talep Oluşturuldu", message: "Departman havuzunuza yeni bir talep eklendi.", type: "TicketCreated", is_read: false, read_at: null, created_at: daysAgo(1) },
    { id: 2, user_id: 1, ticket_id: 4, title: "Talep Kapatıldı", message: "Kullanıcı yetki talebi çözüldü.", type: "TicketClosed", is_read: false, read_at: null, created_at: daysAgo(4) },
  ],
  histories: [],
};

function db(): DemoDb {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as DemoDb : structuredClone(initial);
  } catch {
    return structuredClone(initial);
  }
}
function save(data: DemoDb) { localStorage.setItem(KEY, JSON.stringify(data)); }
function body(config: AxiosRequestConfig): Row {
  if (typeof config.data === "string") { try { return JSON.parse(config.data) as Row; } catch { return {}; } }
  return (config.data ?? {}) as Row;
}
function numeric(value: unknown, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function val(v: unknown) { return typeof v === "string" ? v : ""; }
function nextId(items: Row[]) { return Math.max(0, ...items.map(x => numeric(x.id))) + 1; }
function currentUserId() {
  try { return numeric((JSON.parse(sessionStorage.getItem("tkhelpdesk_demo_user") ?? "null") as Row | null)?.id, 1); }
  catch { return 1; }
}
function response(config: AxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return { data: { success: true, data }, status, statusText: "OK", headers: {}, config: config as AxiosResponse["config"] };
}
function notFound(config: AxiosRequestConfig, message = "Demo kaydı bulunamadı"): AxiosResponse {
  return { data: { success: false, message }, status: 404, statusText: "Not Found", headers: {}, config: config as AxiosResponse["config"] };
}
function listResult(items: Row[], params: Row) {
  const page = Math.max(1, numeric(params.page, 1));
  const pageSize = Math.max(1, numeric(params.pageSize, 20));
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize, totalPages: Math.max(1, Math.ceil(items.length / pageSize)) };
}
function fullName(u?: Row) { return u ? `${val(u.first_name)} ${val(u.last_name)}`.trim() : null; }
function report(data: DemoDb, params: Row) {
  const year = numeric(params.year, new Date().getFullYear());
  const month = numeric(params.month);
  const start = new Date(Date.UTC(year, month ? month - 1 : 0, 1));
  const end = new Date(Date.UTC(month ? year : year + 1, month ? month : 0, 1));
  const tickets = data.tickets.filter(t => {
    const created = new Date(val(t.created_at));
    return created >= start && created < end;
  });
  const closed = tickets.filter(t => t.status === "Closed");
  const distribution = (keys: string[], key: string) => Object.fromEntries(keys.map(k => [k, tickets.filter(t => t[key] === k).length]));
  const group = (rows: Row[], foreignKey: string) => rows.map(x => {
    const relevant = tickets.filter(t => t[foreignKey] === x.id);
    const closedCount = relevant.filter(t => t.status === "Closed").length;
    return { id: x.id, name: x.name, total: relevant.length, open: relevant.length - closedCount, closed: closedCount };
  });
  const resolutionMinutes = closed.map(t => (new Date(val(t.closed_at)).getTime() - new Date(val(t.created_at)).getTime()) / 60000).filter(n => Number.isFinite(n) && n >= 0);
  return {
    period: { year, month: month || null, startDate: start.toISOString(), endDateExclusive: end.toISOString(), timeZone: "UTC" },
    overview: { totalTickets: tickets.length, openTickets: tickets.length - closed.length, closedTickets: closed.length,
      closureRate: tickets.length ? Number(((closed.length / tickets.length) * 100).toFixed(1)) : 0,
      averageResolutionMinutes: resolutionMinutes.length ? Math.round(resolutionMinutes.reduce((a, b) => a + b, 0) / resolutionMinutes.length) : null },
    statusDistribution: distribution(["InPool", "Claimed", "InProgress", "Closed"], "status"),
    priorityDistribution: distribution(["Low", "Normal", "High", "Critical"], "priority"),
    byCompany: group(data.companies, "company_id"), byDepartment: group(departments, "department_id"),
  };
}

export const demoAdapter: AxiosAdapter = async config => {
  const data = db();
  const method = (config.method ?? "get").toLowerCase();
  const path = (config.url ?? "").split("?")[0].replace(/^\/api/, "");
  const input = body(config);
  const params = (config.params ?? {}) as Row;
  const parts = path.split("/").filter(Boolean);
  const id = numeric(parts[1]);
  const timestamp = now();
  let result: unknown;

  if (path === "/departments" && method === "get") result = departments;
  else if (path === "/auth/me" && method === "get") {
    const u = data.users.find(x => x.id === currentUserId());
    result = { id: u?.id, firstName: u?.first_name, lastName: u?.last_name, email: u?.email, role: u?.role, departmentId: u?.department_id };
  }
  else if (path === "/auth/change-password") result = null;
  else if (parts[0] === "companies") {
    const found = data.companies.find(x => x.id === id);
    if (method === "get" && !id) result = data.companies;
    else if (method === "get") result = found;
    else if (method === "post") {
      const item: Row = { id: nextId(data.companies), name: input.name, contact_email: input.contactEmail || null, contact_phone: input.contactPhone || null, is_active: true, created_at: timestamp, updated_at: timestamp };
      data.companies.push(item); result = item; save(data);
    } else if (found && method === "put") {
      Object.assign(found, { name: input.name, contact_email: input.contactEmail || null, contact_phone: input.contactPhone || null, updated_at: timestamp }); result = found; save(data);
    } else if (found && method === "patch") {
      found.is_active = Boolean(input.isActive); found.updated_at = timestamp; result = found; save(data);
    } else return notFound(config);
  }
  else if (parts[0] === "users") {
    const found = data.users.find(x => x.id === id);
    if (method === "get") result = data.users;
    else if (method === "post") {
      const item: Row = { id: nextId(data.users), first_name: input.firstName, last_name: input.lastName, email: input.email, role: input.role, department_id: numeric(input.departmentId), is_active: true, created_at: timestamp, department: departments.find(x => x.id === numeric(input.departmentId)) };
      data.users.push(item); result = item; save(data);
    } else if (found && method === "put") {
      Object.assign(found, { first_name: input.firstName, last_name: input.lastName, email: input.email, role: input.role, department_id: numeric(input.departmentId), department: departments.find(x => x.id === numeric(input.departmentId)) }); result = found; save(data);
    } else if (found && method === "patch") {
      if (parts[2] === "status") found.is_active = Boolean(input.isActive);
      result = found; save(data);
    } else return notFound(config);
  }
  else if (parts[0] === "tickets") {
    const found = data.tickets.find(x => x.id === id);
    if (method === "get" && parts.length === 1) {
      const actor = data.users.find(u => u.id === currentUserId());
      const filtered = data.tickets.filter(t =>
        (actor?.role !== "Employee" || t.department_id === actor.department_id) &&
        (!params.status || t.status === params.status) &&
        (!params.companyId || t.company_id === numeric(params.companyId)) &&
        (!params.departmentId || t.department_id === numeric(params.departmentId)));
      filtered.sort((a, b) => val(b.created_at).localeCompare(val(a.created_at)));
      result = listResult(filtered, params);
    } else if (method === "get" && parts.length === 2) {
      if (!found) return notFound(config);
      result = { ...found, assignedUserName: fullName(data.users.find(u => u.id === found.assigned_user_id)), history: data.histories.filter(h => h.ticket_id === id) };
    } else if (method === "post" && parts.length === 1) {
      const newId = nextId(data.tickets);
      const item: Row = { id: newId, ticket_number: `TK-DEMO-${String(newId).padStart(4, "0")}`, company_id: numeric(input.companyId), department_id: numeric(input.departmentId), created_by_user_id: 1,
        assigned_user_id: null, title: input.title, description: input.description, priority: input.priority || "Normal", status: "InPool", claimed_at: null, closed_at: null, resolution_note: null, created_at: timestamp, updated_at: timestamp };
      data.tickets.unshift(item); result = item; save(data);
    } else if (parts[2] === "comments" && method === "get") {
      result = data.comments.filter(c => c.ticket_id === id);
    } else if (parts[2] === "comments" && method === "post") {
      const u = data.users.find(x => x.id === currentUserId());
      const item: Row = { id: nextId(data.comments), ticket_id: id, user_id: currentUserId(), userName: fullName(u), content: input.content, created_at: timestamp };
      data.comments.push(item); result = item; save(data);
    } else if (found && parts[2] === "priority" && method === "patch") {
      found.priority = input.priority; found.updated_at = timestamp; result = found; save(data);
    } else if (found && parts[2] === "claim" && method === "post") {
      found.assigned_user_id = currentUserId(); found.status = "Claimed"; found.claimed_at = timestamp; found.updated_at = timestamp; result = found; save(data);
    } else if (found && parts[2] === "start" && method === "patch") {
      found.status = "InProgress"; found.updated_at = timestamp; result = found; save(data);
    } else if (found && parts[2] === "close" && method === "patch") {
      found.status = "Closed"; found.closed_at = timestamp; found.updated_at = timestamp; found.resolution_note = input.resolutionNote; result = found; save(data);
    } else return notFound(config);
  }
  else if (path === "/reports/summary" && method === "get") result = report(data, params);
  else if (parts[0] === "notifications") {
    const mine = data.notifications.filter(n => n.user_id === currentUserId());
    if (method === "get") {
      const sliced = listResult(mine.sort((a, b) => val(b.created_at).localeCompare(val(a.created_at))), params);
      result = { ...sliced, unreadCount: mine.filter(n => !n.is_read).length };
    } else if (method === "patch") {
      let changed = 0;
      for (const item of data.notifications) {
        if (item.user_id === currentUserId() && !item.is_read && (parts[1] === "read-all" || item.id === id)) {
          item.is_read = true; item.read_at = timestamp; changed++;
        }
      }
      save(data); result = { updatedCount: changed };
    }
  }
  if (result === undefined) return notFound(config, `Demo endpoint bulunamadı: ${method.toUpperCase()} ${path}`);
  return response(config, result);
};
