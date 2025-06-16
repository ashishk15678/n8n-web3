"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/server-store";
import {
  User,
  Bell,
  Globe,
  Languages,
  Upload,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Image from "next/image";

interface Settings {
  id: string;
  emailNotifications: boolean;
  avatar: string | null;
  timezone: string;
  language: string;
}

interface UserProfile {
  id: string;
  name: string | null;
  username: string;
  email: string;
}

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
];

export default function SettingsPage() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");

  // Fetch settings
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  // Update settings mutation
  const { mutate: updateSettings, isPending: isUpdating } = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
  });

  // Update profile mutation
  const { mutate: updateProfile } = useMutation({
    mutationFn: async (profileData: { name: string; username: string }) => {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
  });

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("/api/settings/avatar", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload avatar");
      const data = await response.json();
      updateSettings({ avatar: data.avatarUrl });
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    setSaveStatus("saving");
    updateProfile({ name, username });
    updateSettings({ language: settings?.language });
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Section */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-medium text-zinc-900 mb-6 flex items-center gap-2">
              <User size={20} />
              Profile
            </h2>

            {/* Avatar Upload */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-zinc-100 overflow-hidden">
                  {settings.avatar ? (
                    <Image
                      src={settings.avatar}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <User size={32} />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm border border-zinc-200 cursor-pointer hover:bg-zinc-50 transition-colors duration-200"
                >
                  <Upload size={16} className="text-zinc-600" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-zinc-700 mb-1.5"
                    >
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full px-3 py-2 border border-zinc-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-zinc-700 mb-1.5"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full px-3 py-2 border border-zinc-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                      placeholder="Enter your username"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between py-4 border-t border-zinc-100">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-zinc-400" />
                <div>
                  <h3 className="text-sm font-medium text-zinc-900">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Receive email updates about your workflows
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  updateSettings({
                    emailNotifications: !settings.emailNotifications,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  settings.emailNotifications ? "bg-zinc-900" : "bg-zinc-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    settings.emailNotifications
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-medium text-zinc-900 mb-6 flex items-center gap-2">
              <Globe size={20} />
              Preferences
            </h2>

            {/* Timezone Display (Disabled) */}
            <div className="py-4 border-b border-zinc-100">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Timezone
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.timezone}
                  disabled
                  className="block w-full max-w-xs px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-sm text-zinc-500 cursor-not-allowed"
                />
                <span className="text-xs text-zinc-500">
                  (Fixed to Kolkata)
                </span>
              </div>
            </div>

            {/* Language Selection */}
            <div className="py-4">
              <label
                htmlFor="language"
                className="block text-sm font-medium text-zinc-700 mb-1.5"
              >
                Language
              </label>
              <select
                id="language"
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="block w-full max-w-xs px-3 py-2 border border-zinc-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isUpdating || saveStatus === "saving"}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[120px] justify-center"
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : saveStatus === "success" ? (
                <>
                  <CheckCircle2 size={16} className="mr-2 text-emerald-400" />
                  Saved
                </>
              ) : saveStatus === "error" ? (
                <>
                  <XCircle size={16} className="mr-2 text-red-400" />
                  Error
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
