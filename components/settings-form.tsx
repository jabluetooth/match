"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Save,
  Loader2,
  AlertCircle,
  Briefcase,
  User,
  Sliders,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SettingsFormProps {
  profile: {
    id: number;
    baseResumeUrl: string | null;
    skills: string[];
    experienceYears: number | null;
    jobTitles: string[];
    industries: string[];
    minSalary: number | null;
    maxSalary: number | null;
    preferredLocations: string[];
    workType: string | null;
  };
  userId: string;
}

const SECTIONS = [
  { id: "resume", label: "Resume", icon: FileText },
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Job preferences", icon: Sliders },
] as const;

const ACCEPTED_TYPES = ".pdf,.doc,.docx";
const MAX_BYTES = 5 * 1024 * 1024;

interface ResumeMeta {
  fileName: string;
  size: number | null;
  uploadedAt: Date | null;
  viewUrl: string;
}

function parseList(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
}

function formatBytes(n: number | null): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const initial = useMemo(
    () => ({
      skills: profile.skills.join(", "),
      experienceYears: profile.experienceYears?.toString() ?? "",
      jobTitles: profile.jobTitles.join(", "),
      industries: profile.industries.join(", "),
      minSalary: profile.minSalary?.toString() ?? "",
      maxSalary: profile.maxSalary?.toString() ?? "",
      preferredLocations: profile.preferredLocations.join(", "),
      workType: profile.workType ?? "remote",
    }),
    [profile],
  );

  const [skills, setSkills] = useState(initial.skills);
  const [experienceYears, setExperienceYears] = useState(initial.experienceYears);
  const [jobTitles, setJobTitles] = useState(initial.jobTitles);
  const [industries, setIndustries] = useState(initial.industries);
  const [minSalary, setMinSalary] = useState(initial.minSalary);
  const [maxSalary, setMaxSalary] = useState(initial.maxSalary);
  const [preferredLocations, setPreferredLocations] = useState(initial.preferredLocations);
  const [workType, setWorkType] = useState(initial.workType);

  const [resume, setResume] = useState<ResumeMeta | null>(
    profile.baseResumeUrl
      ? {
          fileName: profile.baseResumeUrl.split("/").pop() ?? "resume",
          size: null,
          uploadedAt: null,
          viewUrl: "/api/resume/file",
        }
      : null,
  );

  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty =
    skills !== initial.skills ||
    experienceYears !== initial.experienceYears ||
    jobTitles !== initial.jobTitles ||
    industries !== initial.industries ||
    minSalary !== initial.minSalary ||
    maxSalary !== initial.maxSalary ||
    preferredLocations !== initial.preferredLocations ||
    workType !== initial.workType;

  // Scroll-spy: highlight nav item for the visible section.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.split(",").some((ext) => file.name.toLowerCase().endsWith(ext.trim()))) {
      toast.error("Unsupported file", "Use PDF, DOC, or DOCX.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File too large", "Max 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.details || error.error || "Upload failed");
      }

      const result = await response.json();
      setResume({
        fileName: result.file_name ?? result.stored_as ?? file.name,
        size: result.size ?? file.size,
        uploadedAt: new Date(),
        viewUrl: "/api/resume/file",
      });
      toast.success("Resume uploaded", `${file.name} is on file.`);
    } catch (error: any) {
      console.error("Failed to upload resume:", error);
      toast.error("Upload failed", error.message || "Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = ""; // reset so re-selecting the same file fires onChange
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemoveResume = async () => {
    if (!resume) return;
    if (!confirm("Remove your resume? Tailored resumes won’t be re-generated until you upload a new one.")) {
      return;
    }
    try {
      const res = await fetch("/api/resume/delete", { method: "POST" });
      if (!res.ok) throw new Error("Delete failed");
      setResume(null);
      toast.success("Resume removed");
    } catch (err: any) {
      toast.error("Couldn’t remove resume", err.message || "Please try again.");
    }
  };

  const validationError = (() => {
    const min = minSalary ? parseInt(minSalary, 10) : null;
    const max = maxSalary ? parseInt(maxSalary, 10) : null;
    if (min != null && max != null && max < min) {
      return { field: "salary", message: "Maximum salary must be greater than or equal to minimum." };
    }
    if (experienceYears && parseInt(experienceYears, 10) < 0) {
      return { field: "experienceYears", message: "Experience can’t be negative." };
    }
    return null;
  })();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) {
      toast.error("Check the form", validationError.message);
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: parseList(skills),
          experience_years: experienceYears ? parseInt(experienceYears, 10) : null,
          job_titles: parseList(jobTitles),
          industries: parseList(industries),
          min_salary: minSalary ? parseInt(minSalary, 10) : null,
          max_salary: maxSalary ? parseInt(maxSalary, 10) : null,
          preferred_locations: parseList(preferredLocations),
          work_type: workType,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.details?.formErrors?.[0] || error.error || "Save failed");
      }

      toast.success("Profile saved", "Your changes are live.");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error("Couldn’t save profile", error.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const skillsChips = parseList(skills);
  const titlesChips = parseList(jobTitles);
  const industriesChips = parseList(industries);
  const locationsChips = parseList(preferredLocations);

  return (
    <form onSubmit={handleSave} className="settings-grid" style={{ alignItems: "start" }}>
      {/* ─── Left nav ─── */}
      <nav className="settings-nav" aria-label="Settings sections">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`settings-nav-item${activeSection === id ? " active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <Icon size={14} />
            {label}
          </a>
        ))}
      </nav>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* ─── Resume ─── */}
        <section id="resume" className="card settings-section" style={{ scrollMarginTop: 90, marginBottom: 0 }}>
          <h3>Resume</h3>
          <p>Your base resume powers job matching, AI tailoring, and interview prep.</p>

          {resume ? (
            <ResumeCard meta={resume} onRemove={handleRemoveResume} onReplace={() => fileInputRef.current?.click()} uploading={uploading} />
          ) : (
            <Dropzone
              dragOver={dragOver}
              uploading={uploading}
              onPick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
            />
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleFileChange}
            disabled={uploading}
            className="sr-only"
            style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}
          />
        </section>

        {/* ─── Profile ─── */}
        <section id="profile" className="card settings-section" style={{ scrollMarginTop: 90, marginBottom: 0 }}>
          <h3>Profile</h3>
          <p>Tell us about your background so we can match you to the right roles.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            <FieldChips
              label="Skills"
              value={skills}
              chips={skillsChips}
              onChange={setSkills}
              placeholder="React, TypeScript, Node.js"
              helper="Comma-separated. Press save to apply."
            />

            <Field label="Years of experience">
              <input
                type="number"
                min={0}
                max={80}
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="5"
                className="form-input"
              />
            </Field>

            <FieldChips
              label="Job titles"
              value={jobTitles}
              chips={titlesChips}
              onChange={setJobTitles}
              placeholder="Software Engineer, Frontend Developer"
            />

            <FieldChips
              label="Industries"
              value={industries}
              chips={industriesChips}
              onChange={setIndustries}
              placeholder="Tech, Finance, Healthcare"
            />
          </div>
        </section>

        {/* ─── Job preferences ─── */}
        <section id="preferences" className="card settings-section" style={{ scrollMarginTop: 90, marginBottom: 0 }}>
          <h3>Job preferences</h3>
          <p>Filters used by the matcher when scoring roles for you.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            <Field label="Minimum salary (USD)" error={validationError?.field === "salary" ? validationError.message : undefined}>
              <input
                type="number"
                min={0}
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="80000"
                className="form-input"
              />
            </Field>

            <Field label="Maximum salary (USD)" error={validationError?.field === "salary" ? validationError.message : undefined}>
              <input
                type="number"
                min={0}
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="150000"
                className="form-input"
              />
            </Field>

            <FieldChips
              label="Preferred locations"
              value={preferredLocations}
              chips={locationsChips}
              onChange={setPreferredLocations}
              placeholder="Remote, New York, San Francisco"
            />

            <Field label="Work type">
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="form-select"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </Field>
          </div>
        </section>
      </div>

      <SaveBar dirty={dirty} saving={saving} hasError={!!validationError} />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">{label}</label>
      {children}
      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "var(--danger)" }}>
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

function FieldChips({
  label,
  value,
  chips,
  onChange,
  placeholder,
  helper,
}: {
  label: string;
  value: string;
  chips: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input"
      />
      {chips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {chips.map((c) => (
            <span
              key={c}
              style={{
                fontSize: 11.5,
                fontWeight: 500,
                color: "var(--primary-ink)",
                background: "var(--primary-soft)",
                padding: "4px 9px",
                borderRadius: 999,
                border: "1px solid color-mix(in oklab, var(--accent-c) 50%, transparent)",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      )}
      {helper && chips.length === 0 && (
        <p style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink-3)" }}>{helper}</p>
      )}
    </div>
  );
}

function ResumeCard({
  meta,
  uploading,
  onReplace,
  onRemove,
}: {
  meta: ResumeMeta;
  uploading: boolean;
  onReplace: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: 16,
        background: "var(--primary-soft)",
        border: "1px solid color-mix(in oklab, var(--accent-c) 50%, transparent)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          display: "grid",
          placeItems: "center",
          borderRadius: 12,
          background: "#fff",
          border: "1px solid var(--line)",
          color: "var(--accent-strong)",
          flexShrink: 0,
        }}
      >
        <FileText size={18} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={14} style={{ color: "var(--success)", flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {meta.fileName}
          </p>
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--ink-3)" }}>
          {[
            meta.size != null ? formatBytes(meta.size) : null,
            meta.uploadedAt ? `Uploaded ${meta.uploadedAt.toLocaleDateString()}` : "On file",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <a
          href={meta.viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
          style={{ textDecoration: "none" }}
        >
          <ExternalLink size={12} />
          View
        </a>
        <button
          type="button"
          onClick={onReplace}
          disabled={uploading}
          className="btn btn-ghost btn-sm"
        >
          {uploading ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={12} />}
          {uploading ? "Uploading…" : "Replace"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={uploading}
          className="btn btn-ghost btn-sm"
          style={{ color: "var(--danger)" }}
          aria-label="Remove resume"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function Dropzone({
  dragOver,
  uploading,
  onPick,
  onDrop,
  onDragOver,
  onDragLeave,
}: {
  dragOver: boolean;
  uploading: boolean;
  onPick: () => void;
  onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLLabelElement>) => void;
  onDragLeave: () => void;
}) {
  return (
    <label
      onClick={onPick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPick();
        }
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "32px 24px",
        background: dragOver ? "var(--primary-soft)" : "var(--bg-2)",
        border: `2px dashed ${dragOver ? "var(--accent-strong)" : "var(--line-2)"}`,
        borderRadius: "var(--radius-md)",
        cursor: uploading ? "wait" : "pointer",
        transition: "background 0.15s ease, border-color 0.15s ease",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          display: "grid",
          placeItems: "center",
          borderRadius: 12,
          background: "#fff",
          border: "1px solid var(--line)",
          color: "var(--accent-strong)",
        }}
      >
        {uploading ? (
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <Upload size={20} />
        )}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>
          {uploading ? "Uploading your resume…" : "Drop your resume here, or click to browse"}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-3)" }}>
          PDF, DOC, or DOCX · up to 5 MB
        </p>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </label>
  );
}

function SaveBar({ dirty, saving, hasError }: { dirty: boolean; saving: boolean; hasError: boolean }) {
  return (
    <div
      aria-hidden={!dirty}
      style={{
        gridColumn: "1 / -1",
        position: "sticky",
        bottom: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 16px",
        background: "color-mix(in oklab, var(--card) 96%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        boxShadow: "var(--shadow-pop)",
        opacity: dirty ? 1 : 0,
        transform: dirty ? "translateY(0)" : "translateY(12px)",
        pointerEvents: dirty ? "auto" : "none",
        transition: "opacity .2s ease, transform .2s ease",
        marginTop: 4,
      }}
    >
      <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 8 }}>
        <Briefcase size={13} />
        You have unsaved changes.
      </p>
      <button
        type="submit"
        disabled={saving || hasError}
        className="btn btn-primary btn-sm"
        style={saving || hasError ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
      >
        {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={13} />}
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
