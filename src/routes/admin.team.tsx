import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { SAMPLE_TEAM, type TeamMember } from "../lib/data";
import { Upload, Trash2, Plus, X } from "lucide-react";

export const Route = createFileRoute("/admin/team")({
  component: AdminTeamPage,
});

const DEFAULT_TEAM = [
  { name: "Anil Chandrakant Patil", role: "Founder & Consultant", phone: "9029847968", display_order: 0 },
  { name: "Ganesh Rathod", role: "Junior Executive", phone: "8424872525", display_order: 1 },
  { name: "Vaibhav Patil", role: "Senior Executive", phone: "9970548582", display_order: 2 },
  { name: "Akshata Ghanekar", role: "Senior Executive", phone: "9326313320", display_order: 3 },
  { name: "Kushal More", role: "Junior Executive", phone: "9137201473", display_order: 4 },
  { name: "Rohit Gadve", role: "Junior Executive", phone: "7021162127", display_order: 5 },
];

function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "", role: "", phone: "", photo_url: "", display_order: 0,
  });

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("team_members").select("*").order("display_order");
    if (error || !data || data.length === 0) {
      setMembers(SAMPLE_TEAM);
    } else {
      setMembers(data as TeamMember[]);
    }
    setLoading(false);
  };

  const seedDefaultTeam = async () => {
    setLoading(true);
    for (const member of DEFAULT_TEAM) {
      await supabase.from("team_members").insert(member);
    }
    await fetchMembers();
    setSuccess("Default team members added!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const path = `team/${Date.now()}_${file.name.replace(/\s/g, "_")}`;
    const { data, error } = await supabase.storage
      .from("team-photos")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw new Error("Photo upload failed: " + error.message);
    const { data: { publicUrl } } = supabase.storage
      .from("team-photos").getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploading(true);
    try {
      let photo_url = form.photo_url || "";
      if (photoFile) photo_url = await uploadPhoto(photoFile);
      const memberData = { ...form, photo_url };
      if (editingMember?.id) {
        const { error } = await supabase.from("team_members")
          .update(memberData).eq("id", editingMember.id);
        if (error) throw error;
        setSuccess("Team member updated!");
      } else {
        const { error } = await supabase.from("team_members").insert(memberData);
        if (error) throw error;
        setSuccess("Team member added!");
      }
      resetForm();
      await fetchMembers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      role: member.role,
      phone: member.phone || "",
      photo_url: member.photo_url || "",
      display_order: member.display_order || 0,
    });
    setPhotoPreview(member.photo_url || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team member?")) return;
    await supabase.from("team_members").delete().eq("id", id);
    await fetchMembers();
  };

  const resetForm = () => {
    setForm({ name: "", role: "", phone: "", photo_url: "", display_order: 0 });
    setEditingMember(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowForm(false);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Team Members</h1>
        <div className="flex gap-3">
          {members.every(m => m.id.startsWith("t")) && (
            <button onClick={seedDefaultTeam}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Sync to Database
            </button>
          )}
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
            <Plus size={16} /> Add Member
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg">{error}</div>}
      {success && <div className="mb-4 p-3 bg-emerald-900/50 text-emerald-300 rounded-lg">{success}</div>}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-lg">
                {editingMember ? "Edit Member" : "Add Team Member"}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-amber-500" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-500 text-2xl font-bold">
                    {form.name ? getInitials(form.name) : "?"}
                  </div>
                )}
                <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
                  <Upload size={14} />
                  {photoPreview ? "Change Photo" : "Upload Photo"}
                  <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                </label>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Full Name *</label>
                <input required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 outline-none"
                  placeholder="e.g. Ganesh Rathod" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Role *</label>
                <input required value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 outline-none"
                  placeholder="e.g. Senior Executive" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Phone Number</label>
                <input value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 outline-none"
                  placeholder="e.g. 9970548582" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Display Order</label>
                <input type="number" value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="flex-1 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800">
                  Cancel
                </button>
                <button type="submit" disabled={uploading}
                  className="flex-1 py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 disabled:opacity-50">
                  {uploading ? "Saving..." : editingMember ? "Update" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading team members...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div key={member.id}
              className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col items-center text-center">
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-amber-500 mb-3" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-500 text-xl font-bold mb-3">
                  {getInitials(member.name)}
                </div>
              )}
              <h3 className="text-white font-semibold">{member.name}</h3>
              <p className="text-emerald-400 text-sm">{member.role}</p>
              <p className="text-gray-400 text-sm mt-1">{member.phone}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleEdit(member)}
                  className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30">
                  Edit
                </button>
                <button onClick={() => handleDelete(member.id)}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}