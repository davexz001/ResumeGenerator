import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { emptyResumeData } from '../types';
import Layout from '../components/Layout';

export default function Dashboard() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    const { data, error } = await supabase
      .from('resumes')
      .select('id, title, created_at, updated_at')
      .order('updated_at', { ascending: false });
    
    if (!error && data) {
      setResumes(data);
    }
  };

  const handleCreate = async () => {
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        title: 'Untitled Resume',
        data: emptyResumeData,
        user_id: user?.id
      })
      .select()
      .single();
      
    if (!error && data) {
      navigate(`/builder/${data.id}`);
    } else if (error) {
      console.error(error);
      alert('Error creating resume.');
    }
  };

  const confirmDelete = async () => {
    if (!resumeToDelete) return;
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeToDelete);
      
    if (!error) {
      setResumeToDelete(null);
      fetchResumes();
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Resumes</h1>
          <button onClick={handleCreate} className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            New Resume
          </button>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No resumes</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating a new AI-powered resume.</p>
            <div className="mt-6">
              <button onClick={handleCreate} className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Resume
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map(resume => (
              <div key={resume.id} className="relative flex flex-col items-center space-x-3 rounded-lg border border-slate-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:border-slate-400 transition-colors">
                <div className="flex-1 w-full flex justify-between items-start">
                  <Link to={`/builder/${resume.id}`} className="focus:outline-none flex-1">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-lg font-medium text-slate-900">{resume.title}</p>
                    <p className="truncate text-sm text-slate-500 mt-1">Updated {new Date(resume.updated_at).toLocaleDateString()}</p>
                  </Link>
                  <button onClick={(e) => { e.preventDefault(); setResumeToDelete(resume.id); }} className="relative z-10 text-slate-400 hover:text-red-600 p-1 bg-white rounded hover:bg-slate-50">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {resumeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Resume</h3>
              <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this resume? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setResumeToDelete(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

