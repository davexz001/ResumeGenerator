import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ResumeData, emptyResumeData } from '../types';
import { ArrowLeft, Save, Sparkles, Printer, LayoutTemplate } from 'lucide-react';
import TemplateRenderer from '../components/TemplateRenderer';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function Builder() {
  const { id } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [data, setData] = useState<ResumeData>(emptyResumeData);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [templatePrompt, setTemplatePrompt] = useState('');

  useEffect(() => {
    if (id && session) {
      supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data: resData, error }) => {
          if (!error && resData) {
            setTitle(resData.title);
            // Ensure templateId exists for old resumes
            const parsedData = resData.data as ResumeData;
            setData({ ...parsedData, templateId: parsedData.templateId || 'minimalist' });
          }
        });
    }
  }, [id, session]);

  const generateTemplateWithAI = async () => {
    if (!templatePrompt || !session) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-template', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ prompt: templatePrompt })
      });
      const dataJson = await res.json();
      if (dataJson.result) {
        setData(prev => ({ ...prev, templateId: 'custom', customTemplateHtml: dataJson.result }));
      }
    } catch (e) {
      alert("Failed to generate template");
    }
    setIsGenerating(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await supabase
      .from('resumes')
      .update({ title, data, updated_at: new Date().toISOString() })
      .eq('id', id);
    setIsSaving(false);
  };

  const generateWithAI = async (text: string, type: string, onSuccess: (result: string) => void) => {
    if (!text || !session) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ prompt: text, type })
      });
      const aiData = await res.json();
      if (aiData.result) {
        onSuccess(aiData.result);
      }
    } catch (e) {
      console.error(e);
      alert('AI Generation failed');
    }
    setIsGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between no-print shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            className="font-semibold text-lg bg-transparent border-none focus:ring-0 focus:outline-none text-slate-900 w-64"
            placeholder="Resume Title"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePrint} 
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'PDF'}
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor Sidebar */}
        <div className="w-1/2 overflow-y-auto bg-slate-50 border-r border-slate-200 p-6 no-print space-y-8">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center mb-4">
              <LayoutTemplate className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Template Layout</h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: 'minimalist', name: 'Minimalist' },
                { id: 'modern', name: 'Modern' },
                { id: 'elegant', name: 'Elegant' },
                { id: 'custom', name: 'Custom AI' }
              ].map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => setData({ ...data, templateId: tpl.id })}
                  className={`py-3 px-2 rounded-lg border text-sm font-medium transition-colors text-center ${
                    data.templateId === tpl.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {tpl.name}
                </button>
              ))}
            </div>

            {data.templateId === 'custom' && (
              <div className="mt-4 p-4 border border-blue-200 bg-blue-50/50 rounded-lg space-y-3">
                <h3 className="font-semibold text-blue-900 text-sm">AI Template Generator</h3>
                <p className="text-xs text-blue-700">Paste your own HTML/Handlebars template or describe what you want and AI will search and generate it.</p>
                <textarea 
                  value={templatePrompt}
                  onChange={e => setTemplatePrompt(e.target.value)}
                  placeholder="e.g. A Google Software Engineer resume template. Or paste HTML directly."
                  className="w-full text-sm rounded border-blue-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button 
                    onClick={generateTemplateWithAI}
                    disabled={isGenerating || !templatePrompt}
                    className="flex-1 bg-blue-600 text-white rounded py-2 px-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating...' : 'Search & Generate Template'}
                  </button>
                  <button 
                    onClick={() => setData(prev => ({ ...prev, customTemplateHtml: templatePrompt }))}
                    disabled={!templatePrompt}
                    className="bg-slate-200 text-slate-800 rounded py-2 px-3 text-sm font-medium hover:bg-slate-300 disabled:opacity-50"
                  >
                    Apply HTML
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name" className="border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" value={data.personalInfo.name} onChange={e => setData({...data, personalInfo: {...data.personalInfo, name: e.target.value}})} />
              <input type="email" placeholder="Email" className="border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" value={data.personalInfo.email} onChange={e => setData({...data, personalInfo: {...data.personalInfo, email: e.target.value}})} />
              <input type="text" placeholder="Phone" className="border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" value={data.personalInfo.phone} onChange={e => setData({...data, personalInfo: {...data.personalInfo, phone: e.target.value}})} />
              <input type="text" placeholder="Location" className="border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" value={data.personalInfo.location} onChange={e => setData({...data, personalInfo: {...data.personalInfo, location: e.target.value}})} />
              <input type="text" placeholder="LinkedIn / Portfolio" className="border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 col-span-2" value={data.personalInfo.linkedin} onChange={e => setData({...data, personalInfo: {...data.personalInfo, linkedin: e.target.value}})} />
              <div className="col-span-2 relative">
                <textarea placeholder="Professional Summary" rows={4} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" value={data.personalInfo.summary} onChange={e => setData({...data, personalInfo: {...data.personalInfo, summary: e.target.value}})} />
                <button onClick={() => generateWithAI(data.personalInfo.summary, 'professional summary', (res) => setData({...data, personalInfo: {...data.personalInfo, summary: res}}))} disabled={isGenerating || !data.personalInfo.summary} className="absolute bottom-2 right-2 p-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded text-xs inline-flex items-center font-medium disabled:opacity-50 transition-colors">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Enhance
                </button>
              </div>
            </div>
          </div>


          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Experience</h2>
              <button onClick={() => setData({...data, experience: [...data.experience, { id: Date.now().toString(), company: '', role: '', duration: '', description: '' }]})} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add New</button>
            </div>
            <div className="space-y-6">
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="relative border border-slate-200 p-4 rounded-lg bg-slate-50/50">
                   <button onClick={() => setData({...data, experience: data.experience.filter(e => e.id !== exp.id)})} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-sm">Remove</button>
                   <div className="grid grid-cols-2 gap-3 mt-4">
                     <input type="text" placeholder="Company" className="border-slate-300 rounded test-sm shadow-sm" value={exp.company} onChange={e => { const newExp = [...data.experience]; newExp[i].company = e.target.value; setData({...data, experience: newExp}); }} />
                     <input type="text" placeholder="Role Title" className="border-slate-300 rounded test-sm shadow-sm" value={exp.role} onChange={e => { const newExp = [...data.experience]; newExp[i].role = e.target.value; setData({...data, experience: newExp}); }} />
                     <input type="text" placeholder="Duration (e.g., 2021 - Present)" className="border-slate-300 rounded test-sm shadow-sm col-span-2" value={exp.duration} onChange={e => { const newExp = [...data.experience]; newExp[i].duration = e.target.value; setData({...data, experience: newExp}); }} />
                     <div className="col-span-2 relative">
                        <textarea placeholder="Description & Achievements" rows={4} className="mt-1 block w-full rounded border-slate-300 shadow-sm text-sm" value={exp.description} onChange={e => { const newExp = [...data.experience]; newExp[i].description = e.target.value; setData({...data, experience: newExp}); }} />
                        <button onClick={() => generateWithAI(exp.description, 'work experience bullets', (res) => { const newExp = [...data.experience]; newExp[i].description = res; setData({...data, experience: newExp}); })} disabled={isGenerating || !exp.description} className="absolute bottom-2 right-2 p-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded text-xs inline-flex items-center font-medium disabled:opacity-50">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Enhance
                        </button>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Education</h2>
              <button onClick={() => setData({...data, education: [...data.education, { id: Date.now().toString(), school: '', degree: '', graduationDate: '' }]})} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add New</button>
            </div>
            <div className="space-y-4">
              {data.education.map((edu, i) => (
                <div key={edu.id} className="relative border border-slate-200 p-4 rounded-lg bg-slate-50/50">
                   <button onClick={() => setData({...data, education: data.education.filter(e => e.id !== edu.id)})} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-sm">Remove</button>
                   <div className="grid grid-cols-2 gap-3 mt-4">
                     <input type="text" placeholder="School/University" className="border-slate-300 rounded test-sm shadow-sm" value={edu.school} onChange={e => { const newEdu = [...data.education]; newEdu[i].school = e.target.value; setData({...data, education: newEdu}); }} />
                     <input type="text" placeholder="Degree" className="border-slate-300 rounded test-sm shadow-sm" value={edu.degree} onChange={e => { const newEdu = [...data.education]; newEdu[i].degree = e.target.value; setData({...data, education: newEdu}); }} />
                     <input type="text" placeholder="Graduation Year" className="border-slate-300 rounded test-sm shadow-sm col-span-2" value={edu.graduationDate} onChange={e => { const newEdu = [...data.education]; newEdu[i].graduationDate = e.target.value; setData({...data, education: newEdu}); }} />
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, i) => (
                <span key={skill.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                  {skill.name}
                  <button onClick={() => setData({...data, skills: data.skills.filter(s => s.id !== skill.id)})} className="ml-2 text-slate-400 hover:text-red-500">&times;</button>
                </span>
              ))}
              <input 
                type="text" 
                placeholder="Add a skill..." 
                className="border-none bg-transparent focus:ring-0 py-1 px-2 text-sm max-w-[120px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    setData({...data, skills: [...data.skills, { id: Date.now().toString(), name: e.currentTarget.value }]});
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>

        </div>

        {/* Live Preview Pane */}
        <div className="w-1/2 p-8 bg-slate-200/50 overflow-y-auto no-print">
          <div className="bg-white mx-auto shadow-2xl w-full max-w-[800px] min-h-[1056px] box-border print-area">
            <TemplateRenderer data={data} />
          </div>
        </div>

      </div>
    </div>
  );
}
