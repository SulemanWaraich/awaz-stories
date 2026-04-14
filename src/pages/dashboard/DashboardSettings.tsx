import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function DashboardSettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) { toast.error("Minimum 6 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated!"); setNewPassword(""); }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 font-heading text-2xl font-bold">Settings</h1>
      <p className="mb-8 text-muted-foreground">Account & preferences</p>

      {/* Password */}
      <div className="mb-8 rounded-2xl bg-card p-6 shadow-soft">
        <h3 className="mb-4 font-heading text-lg font-semibold">Change Password</h3>
        <div className="flex gap-3">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="New password"
          />
          <button
            onClick={handlePasswordChange}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update
          </button>
        </div>
      </div>

      {/* Account info */}
      <div className="mb-8 rounded-2xl bg-card p-6 shadow-soft">
        <h3 className="mb-4 font-heading text-lg font-semibold">Account</h3>
        <p className="text-sm text-muted-foreground">Email: {user?.email}</p>
      </div>

      {/* Danger */}
      <div className="rounded-2xl border border-destructive/20 bg-card p-6 shadow-soft">
        <h3 className="mb-2 font-heading text-lg font-semibold text-destructive">Danger Zone</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Type "DELETE" to confirm account deletion. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none"
            placeholder='Type "DELETE"'
          />
          <button
            disabled={deleteConfirm !== "DELETE"}
            onClick={async () => {
              await signOut();
              navigate("/");
              toast.success("Account deleted");
            }}
            className="rounded-xl bg-destructive px-5 py-3 text-sm font-medium text-destructive-foreground disabled:opacity-40"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
