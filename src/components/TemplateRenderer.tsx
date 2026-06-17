import React, { useMemo } from 'react';
import { ResumeData } from '../types';
import Handlebars from 'handlebars';

export default function TemplateRenderer({ data }: { data: ResumeData }) {
  const templateId = data.templateId || 'minimalist';

  const customHtml = useMemo(() => {
    if (templateId !== 'custom' || !data.customTemplateHtml) return null;
    try {
      const template = Handlebars.compile(data.customTemplateHtml);
      return template(data);
    } catch (e) {
      console.error("Handlebars compilation error:", e);
      return `<div class="p-8 text-red-600 bg-red-50">Error rendering custom template. Please check your HTML/Handlebars syntax.</div>`;
    }
  }, [templateId, data.customTemplateHtml, data]);

  if (templateId === 'custom' && customHtml !== null) {
    return <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: customHtml }} />;
  }

  if (templateId === 'modern') {
    return (
      <div className="w-full h-full font-sans">
        <div className="bg-blue-800 text-white p-8 mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase">{data.personalInfo.name || 'Your Name'}</h1>
          <div className="flex flex-wrap gap-x-4 text-blue-100 font-medium">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
            {data.personalInfo.linkedin && <span>• {data.personalInfo.linkedin}</span>}
          </div>
        </div>
        
        <div className="px-8 pb-8 flex space-x-8">
          <div className="w-2/3 space-y-6">
            {data.personalInfo.summary && (
              <div>
                <h3 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-3">About Me</h3>
                <p className="text-sm leading-relaxed text-slate-700">{data.personalInfo.summary}</p>
              </div>
            )}

            {data.experience.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4">Experience</h3>
                <div className="space-y-5">
                  {data.experience.map(exp => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-slate-900">{exp.role}</h4>
                        <span className="text-sm font-semibold text-blue-600">{exp.duration}</span>
                      </div>
                      <div className="font-semibold text-slate-700 mb-2">{exp.company}</div>
                      <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {exp.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-1/3 space-y-6 border-l border-slate-200 pl-8">
            {data.education.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4">Education</h3>
                <div className="space-y-4">
                  {data.education.map(edu => (
                    <div key={edu.id}>
                      <h4 className="font-bold text-slate-900 leading-tight">{edu.school}</h4>
                      <div className="text-sm text-slate-700 mt-1">{edu.degree}</div>
                      <div className="text-xs font-semibold text-blue-600 mt-1">{edu.graduationDate}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.skills.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map(skill => (
                    <span key={skill.id} className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === 'elegant') {
    return (
      <div className="w-full h-full font-serif px-12 py-12">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-normal text-slate-900 mb-4">{data.personalInfo.name || 'Your Name'}</h1>
          <div className="flex justify-center flex-wrap gap-x-4 text-sm text-slate-600">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>| {data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>| {data.personalInfo.location}</span>}
            {data.personalInfo.linkedin && <span>| {data.personalInfo.linkedin}</span>}
          </div>
        </div>

        {data.personalInfo.summary && (
          <div className="mb-8 text-center px-12">
            <p className="text-sm leading-relaxed text-slate-700 italic">{data.personalInfo.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg text-slate-900 border-b border-slate-300 pb-2 mb-4 font-semibold uppercase tracking-widest text-center">Experience</h3>
            <div className="space-y-6">
              {data.experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-lg font-semibold text-slate-900">{exp.company}</h4>
                    <span className="text-sm text-slate-500 italic">{exp.duration}</span>
                  </div>
                  <div className="text-md text-slate-800 mb-2 italic">{exp.role}</div>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pl-4 border-l border-slate-200">
                    {exp.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          {data.education.length > 0 && (
            <div>
              <h3 className="text-lg text-slate-900 border-b border-slate-300 pb-2 mb-4 font-semibold uppercase tracking-widest text-center">Education</h3>
              <div className="space-y-4">
                {data.education.map(edu => (
                  <div key={edu.id} className="text-center">
                    <h4 className="font-semibold text-slate-900">{edu.school}</h4>
                    <div className="text-sm text-slate-800">{edu.degree}</div>
                    <div className="text-sm text-slate-500 italic">{edu.graduationDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.skills.length > 0 && (
            <div>
              <h3 className="text-lg text-slate-900 border-b border-slate-300 pb-2 mb-4 font-semibold uppercase tracking-widest text-center">Skills</h3>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {data.skills.map(skill => (
                  <span key={skill.id} className="text-sm text-slate-800">{skill.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Minimalist (default)
  return (
    <div className="w-full h-full font-sans p-12">
      <div className="border-b-2 border-slate-900 pb-6 mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase">{data.personalInfo.name || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-x-4 text-sm text-slate-600 font-medium">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
          {data.personalInfo.linkedin && <span>• {data.personalInfo.linkedin}</span>}
        </div>
      </div>

      {data.personalInfo.summary && (
        <div className="mb-6">
          <p className="text-sm leading-relaxed text-slate-700">{data.personalInfo.summary}</p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold tracking-widest text-slate-900 uppercase border-b border-slate-200 pb-1 mb-4">Experience</h3>
          <div className="space-y-5">
            {data.experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-slate-900">{exp.role}</h4>
                  <span className="text-sm font-semibold text-slate-500">{exp.duration}</span>
                </div>
                <div className="font-semibold text-slate-700 mb-2">{exp.company}</div>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {exp.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold tracking-widest text-slate-900 uppercase border-b border-slate-200 pb-1 mb-4">Education</h3>
          <div className="space-y-4">
            {data.education.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h4 className="font-bold text-slate-900">{edu.school}</h4>
                  <div className="text-sm text-slate-700">{edu.degree}</div>
                </div>
                <span className="text-sm font-semibold text-slate-500">{edu.graduationDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills.length > 0 && (
        <div>
          <h3 className="text-lg font-bold tracking-widest text-slate-900 uppercase border-b border-slate-200 pb-1 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {data.skills.map(skill => (
              <span key={skill.id} className="text-sm font-medium text-slate-800">{skill.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
