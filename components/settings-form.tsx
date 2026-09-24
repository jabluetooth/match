"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Save,
  Loader2,
  AlertCircle,
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
  fullName: string | null;
  userId: string;
}

const SECTIONS = [
  { id: "resume", label: "Resume" },
  { id: "profile", label: "Profile" },
  { id: "preferences", label: "Job preferences" },
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

export function SettingsForm({ profile, fullName }: SettingsFormProps) {
  const initial = useMemo(
    () => ({
      fullName: fullName ?? "",
      skills: profile.skills.join(", "),
      experienceYears: profile.experienceYears?.toString() ?? "",
      jobTitles: profile.jobTitles.join(", "),
      industries: profile.industries.join(", "),
      minSalary: profile.minSalary?.toString() ?? "",
      maxSalary: profile.maxSalary?.toString() ?? "",
      preferredLocations: profile.preferredLocations.join(", "),
      workType: profile.workType ?? "remote",
    }),
    [profile, fullName],
  );

  const [fullNameInput, setFullNameInput] = useState(initial.fullName);
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
    fullNameInput !== initial.fullName ||
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
    if (fullNameInput.trim().length === 0) {
      return { field: "fullName", message: "Name can’t be empty." };
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
          full_name: fullNameInput.trim(),
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
    <form onSubmit={handleSave} className="grid items-start gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
      {/* Section index: sticky on desktop, a scrolling row on mobile. */}
      <nav aria-label="Settings sections" className="-mx-1 flex gap-1 overflow-x-auto lg:sticky lg:top-[calc(var(--topbar-h)+32px)] lg:mx-0 lg:flex-col">
        {SECTIONS.map(({ id, label }, i) => {
          const active = activeSection === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active ? "true" : undefined}
              className={
                "flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors " +
                (active ? "bg-raised text-ink" : "text-ink-3 hover:text-ink-2")
              }
            >
              <span className={"font-mono text-[11px] " + (active ? "text-accent" : "text-ink-3")}>0{i + 1}</span>
              {label}
            </a>
          );
        })}
      </nav>

      <div className="min-w-0 space-y-6">
        <Section id="resume" title="Resume" lead="Your base resume powers matching, tailoring and interview prep.">
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
            tabIndex={-1}
            aria-hidden="true"
          />
        </Section>

        <Section id="profile" title="Profile" lead="Your background, so the matcher can tell a good fit from a near miss.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full name" helper="Used on tailored resumes and in email greetings." error={validationError?.field === "fullName" ? validationError.message : undefined}>
              {(id) => (
                <input id={id} type="text" value={fullNameInput} onChange={(e) => setFullNameInput(e.target.value)} placeholder="Jane Doe" className="field" />
              )}
            </Field>
            <Field label="Years of experience">
              {(id) => (
                <input id={id} type="number" min={0} max={80} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="5" className="field font-mono" />
              )}
            </Field>
            <FieldChips label="Skills" value={skills} chips={skillsChips} onChange={setSkills} placeholder="React, TypeScript, Node.js" helper="Comma-separated." wide />
            <FieldChips label="Job titles" value={jobTitles} chips={titlesChips} onChange={setJobTitles} placeholder="Software Engineer, Frontend Developer" />
            <FieldChips label="Industries" value={industries} chips={industriesChips} onChange={setIndustries} placeholder="Tech, Finance, Healthcare" />
          </div>
        </Section>

        <Section id="preferences" title="Job preferences" lead="Filters the matcher applies when it scores roles for you.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Minimum salary (USD)" error={validationError?.field === "salary" ? validationError.message : undefined}>
              {(id) => (
                <input id={id} type="number" min={0} value={minSalary} onChange={(e) => setMinSalary(e.target.value)} placeholder="80000" className="field font-mono" />
              )}
            </Field>
            <Field label="Maximum salary (USD)" error={validationError?.field === "salary" ? validationError.message : undefined}>
              {(id) => (
                <input id={id} type="number" min={0} value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} placeholder="150000" className="field font-mono" />
              )}
            </Field>
            <FieldChips label="Preferred locations" value={preferredLocations} chips={locationsChips} onChange={setPreferredLocations} placeholder="Remote, New York, San Francisco" />
            <Field label="Work type">
              {(id) => (
                <select id={id} value={workType} onChange={(e) => setWorkType(e.target.value)} className="field">
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              )}
            </Field>
          </div>
        </Section>
      </div>

      <SaveBar dirty={dirty} saving={saving} hasError={!!validationError} />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function Section({ id, title, lead, children }: { id: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section id={id} className="panel p-5 sm:p-6" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="font-display text-2xl text-ink">{title}</h2>
      <p className="mb-5 mt-1 text-[13px] text-ink-3">{lead}</p>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  helper,
  children,
}: {
  label: string;
  error?: string;
  helper?: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {children(id)}
      {error ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-danger">
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </p>
      ) : helper ? (
        <p className="mt-1.5 text-xs text-ink-3">{helper}</p>
      ) : null}
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
  wide,
}: {
  label: string;
  value: string;
  chips: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  helper?: string;
  wide?: boolean;
}) {
  const id = useId();
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <label htmlFor={id} className="field-label">{label}</label>
      <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field" />
      {chips.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`${label} as entered`}>
          {chips.map((c) => (
            <li key={c} className="inline-flex h-6 items-center rounded border border-accent/25 bg-accent/10 px-2 font-mono text-[11px] text-accent-ink">
              {c}
            </li>
          ))}
        </ul>
      ) : helper ? (
        <p className="mt-1.5 text-xs text-ink-3">{helper}</p>
      ) : null}
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
    <div className="flex flex-wrap items-center gap-4 rounded-md border border-line bg-raised p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded border border-line bg-surface text-accent">
        <FileText size={17} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-medium text-ink">
          <CheckCircle2 size={14} className="shrink-0 text-success" aria-label="On file" />
          <span className="truncate">{meta.fileName}</span>
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-ink-3">
          {[
            meta.size != null ? formatBytes(meta.size) : null,
            meta.uploadedAt ? `uploaded ${meta.uploadedAt.toLocaleDateString()}` : "on file",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <a href={meta.viewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-quiet btn-sm">
          <ExternalLink size={12} aria-hidden="true" />
          View
        </a>
        <button type="button" onClick={onReplace} disabled={uploading} className="btn btn-ghost btn-sm">
          {uploading ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <Upload size={12} aria-hidden="true" />}
          {uploading ? "Uploading…" : "Replace"}
        </button>
        <button type="button" onClick={onRemove} disabled={uploading} className="btn btn-danger btn-sm px-2" aria-label="Remove resume">
          <Trash2 size={13} aria-hidden="true" />
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
      className={
        "flex flex-col items-center justify-center gap-3 rounded-md border border-dashed px-6 py-10 text-center transition-colors " +
        (dragOver ? "border-accent bg-accent/[0.06]" : "border-line-strong bg-raised/40 hover:border-ink-3") +
        (uploading ? " cursor-wait" : " cursor-pointer")
      }
    >
      <span className="grid size-10 place-items-center rounded border border-line bg-surface text-accent">
        {uploading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Upload size={17} aria-hidden="true" />}
      </span>
      <span>
        <span className="block text-sm font-medium text-ink">
          {uploading ? "Uploading your resume…" : "Drop your resume here, or click to browse"}
        </span>
        <span className="mt-1 block font-mono text-[11px] text-ink-3">PDF, DOC or DOCX · up to 5 MB</span>
      </span>
    </label>
  );
}

function SaveBar({ dirty, saving, hasError }: { dirty: boolean; saving: boolean; hasError: boolean }) {
  return (
    <div
      aria-hidden={!dirty}
      className={
        "sticky bottom-4 flex items-center justify-between gap-3 rounded-lg border border-line-strong bg-raised px-4 py-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-200 motion-reduce:transition-none lg:col-start-2 " +
        (dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0")
      }
    >
      <p className="flex items-center gap-2 text-[13px] text-ink-2">
        <span aria-hidden="true" className="size-1.5 animate-stage-pulse rounded-full bg-accent" />
        Unsaved changes
      </p>
      <button type="submit" disabled={saving || hasError} tabIndex={dirty ? 0 : -1} className="btn btn-primary btn-sm">
        {saving ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <Save size={13} aria-hidden="true" />}
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
