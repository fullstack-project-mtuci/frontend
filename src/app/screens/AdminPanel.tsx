import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldAlert, Users, Building2, Layers, Tags, Wallet } from "lucide-react";
import {
  adminCreateBudget,
  adminCreateCategory,
  adminCreateDepartment,
  adminCreateProject,
  adminCreateUser,
  adminDeleteCategory,
  adminDeleteDepartment,
  adminDeleteProject,
  adminListCategories,
  adminListDepartments,
  adminListProjects,
  adminListUsers,
  adminUpdateCategory,
  adminUpdateDepartment,
  adminUpdateProject,
  adminUpdateUser,
  listBudgets,
} from "../api";
import type {
  AdminUserInput,
  Budget,
  BudgetInput,
  Department,
  DepartmentInput,
  ExpenseCategory,
  ExpenseCategoryInput,
  Project,
  ProjectInput,
  Role,
  User,
} from "../types";
import { ApiError } from "../api/client";
import { useAuth } from "../providers/AuthProvider";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { formatCurrency, formatDate } from "../lib/format";

const tabs = [
  { id: "users", label: "Users" },
  { id: "departments", label: "Departments" },
  { id: "projects", label: "Projects" },
  { id: "categories", label: "Categories" },
  { id: "budgets", label: "Budgets" },
];

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const refreshUsers = useCallback(async () => {
    const list = await adminListUsers({ includeInactive: true });
    setUsers(list);
  }, []);

  const refreshDepartments = useCallback(async () => {
    const list = await adminListDepartments();
    setDepartments(list);
  }, []);

  const refreshProjects = useCallback(async () => {
    const list = await adminListProjects();
    setProjects(list);
  }, []);

  const refreshCategories = useCallback(async () => {
    const list = await adminListCategories();
    setCategories(list);
  }, []);

  const refreshBudgets = useCallback(async () => {
    const list = await listBudgets({});
    setBudgets(list);
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") {
      return;
    }
    let ignore = false;
    const bootstrap = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          refreshUsers(),
          refreshDepartments(),
          refreshProjects(),
          refreshCategories(),
          refreshBudgets(),
        ]);
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setError("Failed to load admin data");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    void bootstrap();
    return () => {
      ignore = true;
    };
  }, [user, refreshUsers, refreshDepartments, refreshProjects, refreshCategories, refreshBudgets]);

  if (!user || user.role !== "admin") {
    return (
      <Card className="p-8 flex flex-col items-center text-center gap-3">
        <ShieldAlert className="w-10 h-10 text-orange-500" />
        <h2 className="text-xl font-semibold text-[#0F172A]">Admins only</h2>
        <p className="text-sm text-gray-600">You need administrator privileges to access this workspace.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wide text-gray-500">System Administration</p>
        <h1 className="text-2xl font-semibold text-[#0F172A]">Control Center</h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          Manage users, organizational structures, spending categories, and budgets from a single place.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">{error}</div>
      )}

      {loading ? (
        <Card className="p-8 text-center text-gray-500">Loading admin data...</Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="users">
            <UsersSection users={users} departments={departments} onRefresh={refreshUsers} />
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentsSection
              departments={departments}
              onRefresh={refreshDepartments}
            />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsSection
              projects={projects}
              departments={departments}
              onRefreshProjects={refreshProjects}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesSection
              categories={categories}
              onRefresh={refreshCategories}
            />
          </TabsContent>

          <TabsContent value="budgets">
            <BudgetsSection
              budgets={budgets}
              departments={departments}
              projects={projects}
              onRefresh={refreshBudgets}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

type UserFormState = {
  id?: string | null;
  email: string;
  fullName: string;
  role: Role;
  password: string;
  departmentId: string;
  managerId: string;
  isActive: boolean;
};

const emptyUserForm: UserFormState = {
  email: "",
  fullName: "",
  role: "employee",
  password: "",
  departmentId: "",
  managerId: "",
  isActive: true,
};

function UsersSection({ users, departments, onRefresh }: { users: User[]; departments: Department[]; onRefresh: () => Promise<void> }) {
  const [form, setForm] = useState<UserFormState>({ ...emptyUserForm });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const managerOptions = useMemo(() => users.filter((u) => u.role !== "employee"), [users]);
  const isEditing = Boolean(form.id);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.email.trim() || !form.fullName.trim()) {
      setError("Email and full name are required");
      return;
    }
    if (!isEditing && !form.password.trim()) {
      setError("Password is required for new users");
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload: AdminUserInput = {
      email: form.email,
      fullName: form.fullName,
      role: form.role,
      password: form.password.trim() ? form.password : undefined,
      departmentId: form.departmentId || null,
      managerId: form.managerId || null,
      isActive: form.isActive,
    };

    try {
      if (form.id) {
        await adminUpdateUser(form.id, payload);
      } else {
        await adminCreateUser(payload);
      }
      setForm({ ...emptyUserForm });
      await onRefresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof ApiError ? err.message : "Unable to save user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setForm({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      password: "",
      departmentId: user.departmentId || "",
      managerId: user.managerId || "",
      isActive: user.isActive,
    });
  };

  const handleReset = () => {
    setForm({ ...emptyUserForm });
    setError(null);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-[#2563EB]" />
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A]">Manage Users</h2>
          <p className="text-sm text-gray-600">Invite new teammates, assign roles, and keep access in sync.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Email</label>
          <Input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} type="email" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Full name</label>
          <Input value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as Role }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="accountant">Accountant</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Temporary password</label>
          <Input
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            type="password"
            placeholder={isEditing ? "Leave blank to keep" : "Set initial password"}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Department</label>
          <select
            value={form.departmentId}
            onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Manager</label>
          <select
            value={form.managerId}
            onChange={(e) => setForm((prev) => ({ ...prev, managerId: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">No manager</option>
            {managerOptions.map((mgr) => (
              <option key={mgr.id} value={mgr.id}>
                {mgr.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Active</label>
          <div className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-2 h-10">
            <Switch checked={form.isActive} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))} />
            <span className="text-sm text-gray-700">{form.isActive ? "Active" : "Suspended"}</span>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {isEditing ? "Update user" : "Invite user"}
          </Button>
          {isEditing && (
            <Button type="button" variant="ghost" onClick={handleReset}>
              Cancel
            </Button>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase border-b border-gray-200">
            <tr>
              <th className="text-left font-medium py-2">Name</th>
              <th className="text-left font-medium py-2">Email</th>
              <th className="text-left font-medium py-2">Role</th>
              <th className="text-left font-medium py-2">Department</th>
              <th className="text-left font-medium py-2">Status</th>
              <th className="text-right font-medium py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((usr) => (
              <tr key={usr.id} className="border-b border-gray-100">
                <td className="py-2 text-[#0F172A] font-medium">{usr.fullName}</td>
                <td className="py-2 text-gray-600">{usr.email}</td>
                <td className="py-2 capitalize text-gray-700">{usr.role}</td>
                <td className="py-2 text-gray-600">{usr.departmentId ? usr.departmentId.slice(0, 8) : "—"}</td>
                <td className="py-2">
                  <Badge className={usr.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}>
                    {usr.isActive ? "Active" : "Suspended"}
                  </Badge>
                </td>
                <td className="py-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(usr)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function DepartmentsSection({ departments, onRefresh }: { departments: Department[]; onRefresh: () => Promise<void> }) {
  const [form, setForm] = useState<DepartmentInput>({ name: "", code: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setError("Name and code are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await adminUpdateDepartment(editingId, form);
      } else {
        await adminCreateDepartment(form);
      }
      setForm({ name: "", code: "" });
      setEditingId(null);
      await onRefresh();
    } catch (err) {
      console.error(err);
      setError("Unable to save department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id);
    setForm({ name: dept.name, code: dept.code });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    try {
      await adminDeleteDepartment(id);
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete department");
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-[#2563EB]" />
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A]">Departments</h2>
          <p className="text-sm text-gray-600">Define business units for budgets and approvals.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Name</label>
          <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Code</label>
          <Input value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} />
        </div>
        <div className="flex items-end gap-3">
          <Button type="submit" disabled={submitting}>
            {editingId ? "Update" : "Add"}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm({ name: "", code: "" }); }}>
              Cancel
            </Button>
          )}
        </div>
        {error && <span className="text-sm text-red-600 md:col-span-3">{error}</span>}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#0F172A]">{dept.name}</p>
              <p className="text-xs text-gray-500">Code {dept.code} • {formatDate(dept.createdAt)}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(dept)}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void handleDelete(dept.id)}>
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

function ProjectsSection({
  projects,
  departments,
  onRefreshProjects,
}: {
  projects: Project[];
  departments: Department[];
  onRefreshProjects: () => Promise<void>;
}) {
  const [form, setForm] = useState<ProjectInput>({ name: "", code: "", departmentId: "", isActive: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setError("Name and code are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await adminUpdateProject(editingId, form);
      } else {
        await adminCreateProject(form);
      }
      setForm({ name: "", code: "", departmentId: "", isActive: true });
      setEditingId(null);
      await onRefreshProjects();
    } catch (err) {
      console.error(err);
      setError("Unable to save project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setForm({
      name: project.name,
      code: project.code,
      departmentId: project.departmentId || "",
      isActive: project.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await adminDeleteProject(id);
      await onRefreshProjects();
    } catch (err) {
      console.error(err);
      alert("Failed to delete project");
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-[#2563EB]" />
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A]">Projects</h2>
          <p className="text-sm text-gray-600">Map travel requests to initiatives and report per project.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Name</label>
          <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Code</label>
          <Input value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Department</label>
          <select
            value={form.departmentId ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Status</label>
          <div className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-2 h-10">
            <Switch checked={form.isActive} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))} />
            <span className="text-sm text-gray-700">{form.isActive ? "Active" : "Archived"}</span>
          </div>
        </div>
        <div className="md:col-span-4 flex gap-3">
          <Button type="submit" disabled={submitting}>
            {editingId ? "Update" : "Add"}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm({ name: "", code: "", departmentId: "", isActive: true }); }}>
              Cancel
            </Button>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      <div className="space-y-3">
        {projects.map((project) => (
          <Card key={project.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#0F172A]">{project.name}</p>
              <p className="text-xs text-gray-500">Code {project.code} • {project.departmentId ? project.departmentId.slice(0, 8) : "No department"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={project.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}>
                {project.isActive ? "Active" : "Archived"}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => handleEdit(project)}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void handleDelete(project.id)}>
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

function CategoriesSection({ categories, onRefresh }: { categories: ExpenseCategory[]; onRefresh: () => Promise<void> }) {
  const [form, setForm] = useState<ExpenseCategoryInput>({ name: "", code: "", isActive: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setError("Name and code are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await adminUpdateCategory(editingId, form);
      } else {
        await adminCreateCategory(form);
      }
      setForm({ name: "", code: "", isActive: true });
      setEditingId(null);
      await onRefresh();
    } catch (err) {
      console.error(err);
      setError("Unable to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingId(category.id);
    setForm({ name: category.name, code: category.code, isActive: category.isActive });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await adminDeleteCategory(id);
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Tags className="w-5 h-5 text-[#2563EB]" />
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A]">Expense categories</h2>
          <p className="text-sm text-gray-600">Group receipts and spending limits by label.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Name</label>
          <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Code</label>
          <Input value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Active</label>
          <div className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-2 h-10">
            <Switch checked={form.isActive} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))} />
            <span className="text-sm text-gray-700">{form.isActive ? "Enabled" : "Hidden"}</span>
          </div>
        </div>
        <div className="md:col-span-3 flex gap-3">
          <Button type="submit" disabled={submitting}>
            {editingId ? "Update" : "Add"}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm({ name: "", code: "", isActive: true }); }}>
              Cancel
            </Button>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#0F172A]">{category.name}</p>
              <p className="text-xs text-gray-500">Code {category.code}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={category.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}>
                {category.isActive ? "Active" : "Inactive"}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void handleDelete(category.id)}>
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

function BudgetsSection({
  budgets,
  departments,
  projects,
  onRefresh,
}: {
  budgets: Budget[];
  departments: Department[];
  projects: Project[];
  onRefresh: () => Promise<void>;
}) {
  const [form, setForm] = useState<BudgetInput>({
    scopeType: "department",
    scopeId: "",
    periodStart: new Date().toISOString().slice(0, 10),
    periodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    totalLimit: 5000,
    currency: "USD",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.scopeId.trim()) {
      setError("Scope ID is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await adminCreateBudget(form);
      setForm((prev) => ({ ...prev, totalLimit: 5000 }));
      await onRefresh();
    } catch (err) {
      console.error(err);
      setError("Failed to create budget");
    } finally {
      setSubmitting(false);
    }
  };

  const summary = useMemo(() => {
    const total = budgets.reduce((sum, b) => sum + b.totalLimit, 0);
    const reserved = budgets.reduce((sum, b) => sum + b.reservedAmount, 0);
    const spent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
    return { total, reserved, spent };
  }, [budgets]);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="w-5 h-5 text-[#2563EB]" />
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A]">Budgets</h2>
          <p className="text-sm text-gray-600">Allocate spending guardrails for departments and projects.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Scope</label>
          <select
            value={form.scopeType}
            onChange={(e) => setForm((prev) => ({ ...prev, scopeType: e.target.value as BudgetInput["scopeType"], scopeId: "" }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="department">Department</option>
            <option value="project">Project</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Scope ID</label>
          <select
            value={form.scopeId}
            onChange={(e) => setForm((prev) => ({ ...prev, scopeId: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            {(form.scopeType === "department" ? departments : projects).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.id.slice(0, 8)})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Start</label>
          <Input type="date" value={form.periodStart} onChange={(e) => setForm((prev) => ({ ...prev, periodStart: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">End</label>
          <Input type="date" value={form.periodEnd} onChange={(e) => setForm((prev) => ({ ...prev, periodEnd: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Limit ({form.currency})</label>
          <Input
            type="number"
            value={form.totalLimit}
            onChange={(e) => setForm((prev) => ({ ...prev, totalLimit: Number(e.target.value) }))}
            min={0}
          />
        </div>
        <div className="md:col-span-5 flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            Create budget
          </Button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryTile label="Total" value={formatCurrency(summary.total)} />
        <SummaryTile label="Reserved" value={formatCurrency(summary.reserved)} />
        <SummaryTile label="Spent" value={formatCurrency(summary.spent)} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase border-b border-gray-200">
            <tr>
              <th className="text-left font-medium py-2">Scope</th>
              <th className="text-left font-medium py-2">Period</th>
              <th className="text-left font-medium py-2">Limit</th>
              <th className="text-left font-medium py-2">Reserved</th>
              <th className="text-left font-medium py-2">Spent</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((budget) => (
              <tr key={budget.id} className="border-b border-gray-100">
                <td className="py-3 text-[#0F172A] font-medium capitalize">
                  {budget.scopeType} • {budget.scopeId.slice(0, 8)}
                </td>
                <td className="py-3 text-gray-600">
                  {formatDate(budget.periodStart)} – {formatDate(budget.periodEnd)}
                </td>
                <td className="py-3 text-gray-700">{formatCurrency(budget.totalLimit, budget.currency)}</td>
                <td className="py-3 text-gray-700">{formatCurrency(budget.reservedAmount, budget.currency)}</td>
                <td className="py-3 text-gray-700">{formatCurrency(budget.spentAmount, budget.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-[#0F172A]">{value}</p>
    </Card>
  );
}
