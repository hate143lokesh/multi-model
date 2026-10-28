import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import apiService from '../services/api';

export default function DashboardLayout() {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    apiService.getProjects()
      .then(res => {
        if (res.data && res.data.length > 0) {
          setProjects(res.data);
          setActiveProject(res.data[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col text-slate-100">
      <Navbar 
        activeProject={activeProject} 
        onSelectProject={setActiveProject} 
        projects={projects} 
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <Outlet context={{ activeProject, projects, setActiveProject }} />
        </main>
      </div>
    </div>
  );
}
