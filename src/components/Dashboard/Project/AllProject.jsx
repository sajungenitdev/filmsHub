"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/utils/auth';

const AllProject = () => {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://film-server-qlxt.onrender.com';

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        filterProjects();
    }, [searchTerm, projects]);

    // In your AllProject component
    // In AllProject component
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const token = getToken();

            if (!token) {
                router.push('/login');
                return;
            }

            // Use the new endpoint
            const response = await fetch(`${API_URL}/api/projects/user/list`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setProjects(data.data);
                setFilteredProjects(data.data);
            } else {
                setError(data.message || 'Failed to fetch projects');
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterProjects = () => {
        if (!searchTerm) {
            setFilteredProjects(projects);
        } else {
            const filtered = projects.filter(project =>
                project.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.projectType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProjects(filtered);
        }
        setCurrentPage(1);
    };

    const handleView = (project) => {
        setSelectedProject(project);
        setViewModalOpen(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatRuntime = (project) => {
        const hours = parseInt(project.runtimeHours) || 0;
        const minutes = parseInt(project.runtimeMinutes) || 0;
        const seconds = parseInt(project.runtimeSeconds) || 0;

        if (hours === 0 && minutes === 0 && seconds === 0) return 'Not specified';

        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);

        return parts.join(' ');
    };

    const getLanguageName = (code) => {
        const languages = {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
            'it': 'Italian', 'pt': 'Portuguese', 'zh': 'Chinese', 'ja': 'Japanese',
            'ko': 'Korean', 'hi': 'Hindi', 'bn': 'Bengali', 'ar': 'Arabic',
            'ru': 'Russian', 'tr': 'Turkish', 'nl': 'Dutch', 'other': 'Other'
        };
        return languages[code] || code || 'Not specified';
    };

    const getProjectTypeBadgeColor = (type) => {
        const colors = {
            'Feature Film': 'bg-blue-50 text-blue-600 border-blue-100',
            'Short Film': 'bg-purple-50 text-purple-600 border-purple-100',
            'Documentary': 'bg-green-50 text-green-600 border-green-100',
            'Music Video': 'bg-pink-50 text-pink-600 border-pink-100',
            'Commercial': 'bg-yellow-50 text-yellow-600 border-yellow-100',
            'Web Series': 'bg-indigo-50 text-indigo-600 border-indigo-100'
        };
        return colors[type] || 'bg-gray-50 text-gray-600 border-gray-100';
    };

    // Pagination calculations
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredProjects.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredProjects.length / entriesPerPage);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1EB97A] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen font-sans max-w-7xl mx-auto">
            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-600 text-sm">{error}</p>
                        <button
                            onClick={() => setError('')}
                            className="ml-auto text-red-600 hover:text-red-800"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Total Projects: {projects.length} | Manage your film submissions
                    </p>
                </div>
                <Link
                    href="/projects/drop-project"
                    className="bg-[#1EB97A] hover:bg-[#189663] text-white px-6 py-2.5 rounded-md font-semibold flex items-center gap-2 transition-all shadow-sm w-fit"
                >
                    <span className="text-xl">+</span> Add New Project
                </Link>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Table Controls */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Show</span>
                        <select
                            value={entriesPerPage}
                            onChange={(e) => {
                                setEntriesPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                        <span>entries</span>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search by title, type, or email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* The Table */}
                {currentEntries.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-gray-500 text-lg">No projects found</p>
                        <p className="text-gray-400 text-sm mt-1">Get started by creating your first project</p>
                        <Link href="/projects/drop-project" className="inline-block mt-4 bg-[#1EB97A] text-white px-6 py-2 rounded-md">
                            Create Project
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F6F7F9] text-gray-600 uppercase text-[11px] font-bold tracking-wider">
                                    <th className="px-6 py-4">Project Details</th>
                                    <th className="px-6 py-4">Project Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date Created</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentEntries.map((project) => (
                                    <tr key={project._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-md flex items-center justify-center text-white font-bold">
                                                    {getInitials(project.projectTitle)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {project.projectTitle || 'Untitled'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        ID: {project._id?.slice(-6)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getProjectTypeBadgeColor(project.projectType)}`}>
                                                {project.projectType || 'Not specified'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.submissionStatus === 'submitted'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : project.submissionStatus === 'approved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {project.submissionStatus || 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(project.submittedAt || project.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(project)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                                    title="View Project"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Footer */}
                {filteredProjects.length > 0 && (
                    <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                        <p className="text-sm text-gray-500">
                            Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredProjects.length)} of {filteredProjects.length} entries
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={`px-3 py-1 rounded text-sm font-medium transition ${currentPage === index + 1
                                        ? 'bg-[#1EB97A] text-white'
                                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Project Modal */}
            {viewModalOpen && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">
                                Project Details
                            </h2>
                            <button
                                onClick={() => setViewModalOpen(false)}
                                className="text-white hover:text-gray-200 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Project Title */}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{selectedProject.projectTitle}</h3>
                                <p className="text-sm text-gray-500 mt-1">Submitted on {formatDate(selectedProject.submittedAt || selectedProject.createdAt)}</p>
                            </div>

                            {/* Project Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Project Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Project Type</label>
                                        <p className="text-gray-900">{selectedProject.projectType || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Status</label>
                                        <p className="text-gray-900 capitalize">{selectedProject.submissionStatus || 'Draft'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-gray-500">Brief Synopsis</label>
                                        <p className="text-gray-900 text-sm mt-1">{selectedProject.briefSynopsis || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Submitter Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Submitter Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Name</label>
                                        <p className="text-gray-900">{selectedProject.name || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Email</label>
                                        <p className="text-gray-900">{selectedProject.email || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Phone</label>
                                        <p className="text-gray-900">{selectedProject.phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Country</label>
                                        <p className="text-gray-900">{selectedProject.country || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Credits */}
                            {(selectedProject.directors?.length > 0 || selectedProject.writers?.length > 0 ||
                                selectedProject.producers?.length > 0 || selectedProject.keyCast?.length > 0) && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Credits</h4>
                                        {selectedProject.directors?.length > 0 && (
                                            <div className="mb-3">
                                                <label className="text-xs text-gray-500">Directors</label>
                                                <p className="text-gray-900 text-sm">
                                                    {selectedProject.directors.map(d => `${d.firstName} ${d.lastName}`).join(', ')}
                                                </p>
                                            </div>
                                        )}
                                        {selectedProject.writers?.length > 0 && (
                                            <div className="mb-3">
                                                <label className="text-xs text-gray-500">Writers</label>
                                                <p className="text-gray-900 text-sm">
                                                    {selectedProject.writers.map(w => `${w.firstName} ${w.lastName}`).join(', ')}
                                                </p>
                                            </div>
                                        )}
                                        {selectedProject.producers?.length > 0 && (
                                            <div className="mb-3">
                                                <label className="text-xs text-gray-500">Producers</label>
                                                <p className="text-gray-900 text-sm">
                                                    {selectedProject.producers.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                            {/* Technical Specifications */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Technical Specifications</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Genre</label>
                                        <p className="text-gray-900">{selectedProject.genres || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Runtime</label>
                                        <p className="text-gray-900">{formatRuntime(selectedProject)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Language</label>
                                        <p className="text-gray-900">{getLanguageName(selectedProject.language)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Aspect Ratio</label>
                                        <p className="text-gray-900">{selectedProject.aspectRatio || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            {(selectedProject.website || selectedProject.twitter || selectedProject.facebook || selectedProject.instagram) && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Social Links</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {selectedProject.website && (
                                            <a href={selectedProject.website} target="_blank" rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 text-sm">
                                                Website
                                            </a>
                                        )}
                                        {selectedProject.twitter && (
                                            <a href={selectedProject.twitter} target="_blank" rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 text-sm">
                                                Twitter
                                            </a>
                                        )}
                                        {selectedProject.facebook && (
                                            <a href={selectedProject.facebook} target="_blank" rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 text-sm">
                                                Facebook
                                            </a>
                                        )}
                                        {selectedProject.instagram && (
                                            <a href={selectedProject.instagram} target="_blank" rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 text-sm">
                                                Instagram
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setViewModalOpen(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllProject;