"use client";

import { useState } from 'react';
import { Upload, Save, Loader2, FileText, CheckCircle2 } from 'lucide-react';

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

export function SettingsForm({ profile, userId }: SettingsFormProps) {
  const [resumeUrl, setResumeUrl] = useState(profile.baseResumeUrl || '');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(
    profile.baseResumeUrl ? profile.baseResumeUrl.split('/').pop() ?? null : null
  );
  const [skills, setSkills] = useState(profile.skills.join(', '));
  const [experienceYears, setExperienceYears] = useState(profile.experienceYears?.toString() || '');
  const [jobTitles, setJobTitles] = useState(profile.jobTitles.join(', '));
  const [industries, setIndustries] = useState(profile.industries.join(', '));
  const [minSalary, setMinSalary] = useState(profile.minSalary?.toString() || '');
  const [maxSalary, setMaxSalary] = useState(profile.maxSalary?.toString() || '');
  const [preferredLocations, setPreferredLocations] = useState(profile.preferredLocations.join(', '));
  const [workType, setWorkType] = useState(profile.workType || 'remote');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          base_resume_url: resumeUrl,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          experience_years: experienceYears ? parseInt(experienceYears) : null,
          job_titles: jobTitles.split(',').map(s => s.trim()).filter(Boolean),
          industries: industries.split(',').map(s => s.trim()).filter(Boolean),
          min_salary: minSalary ? parseInt(minSalary) : null,
          max_salary: maxSalary ? parseInt(maxSalary) : null,
          preferred_locations: preferredLocations.split(',').map(s => s.trim()).filter(Boolean),
          work_type: workType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to update profile');
      }

      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to upload resume');
      }

      const result = await response.json();
      setResumeUrl(result.resume_url);
      setUploadedFileName(result.file_name);
    } catch (error: any) {
      console.error('Failed to upload resume:', error);
      alert(error.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Resume Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Base Resume</h2>

        <div className="space-y-4">
          {/* Current resume status */}
          {uploadedFileName ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-md border border-green-200 bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800">Resume uploaded</p>
                <p className="text-xs text-green-600 truncate mt-0.5">{uploadedFileName}</p>
              </div>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-700 underline shrink-0"
                >
                  View
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 rounded-md border border-gray-200 bg-gray-50">
              <FileText className="h-5 w-5 text-gray-400 shrink-0" />
              <p className="text-sm text-gray-500">No resume uploaded yet</p>
            </div>
          )}

          {/* Upload button */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? 'Uploading...' : uploadedFileName ? 'Replace Resume' : 'Upload Resume'}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-500">PDF, DOC, or DOCX</span>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, Node.js"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            <input
              type="number"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              placeholder="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Titles (comma-separated)
            </label>
            <input
              type="text"
              value={jobTitles}
              onChange={(e) => setJobTitles(e.target.value)}
              placeholder="Software Engineer, Frontend Developer"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industries (comma-separated)
            </label>
            <input
              type="text"
              value={industries}
              onChange={(e) => setIndustries(e.target.value)}
              placeholder="Tech, Finance, Healthcare"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Job Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Preferences</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Salary ($)
            </label>
            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              placeholder="80000"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Salary ($)
            </label>
            <input
              type="number"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
              placeholder="150000"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Locations (comma-separated)
            </label>
            <input
              type="text"
              value={preferredLocations}
              onChange={(e) => setPreferredLocations(e.target.value)}
              placeholder="Remote, New York, San Francisco"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Type
            </label>
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
