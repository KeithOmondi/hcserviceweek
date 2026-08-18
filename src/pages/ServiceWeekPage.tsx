// src/pages/staff/ServiceWeekList.tsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchReports,
  deleteReport,
  submitReport,
  generatePDF,
  setFilters,
  selectAllReports,
  selectIsLoading,
  selectIsSubmitting,
  selectError,
  selectPagination,
  downloadFile,
} from '../store/slice/serviceweekSlice';
import { SERVICE_WEEK_STATUS_COLORS, SERVICE_WEEK_STATUS_LABELS, type ServiceWeekStatus } from '../types/service-week.types';
import type { AppDispatch } from '../store/store';
import type { ServiceWeekFilters } from '../types/service-week.types';

const STATUS_OPTIONS: { value: ServiceWeekStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
];

// Helper outside component scope to avoid pure function compiler warning
const getTimestamp = () => Date.now();

const ServiceWeekPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const reports = useSelector(selectAllReports);
  const isLoading = useSelector(selectIsLoading);
  const isSubmitting = useSelector(selectIsSubmitting);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);

  const [selectedStatus, setSelectedStatus] = useState<ServiceWeekStatus | 'all'>('all');
  const [searchStation, setSearchStation] = useState('');
  const [searchJudge, setSearchJudge] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    const filterParams: ServiceWeekFilters = {
      limit,
      offset: (currentPage - 1) * limit,
    };

    if (selectedStatus !== 'all') filterParams.status = selectedStatus;
    if (searchStation) filterParams.station = searchStation;
    if (searchJudge) filterParams.judge_name = searchJudge;

    dispatch(setFilters(filterParams));
    dispatch(fetchReports(filterParams));
  }, [dispatch, selectedStatus, searchStation, searchJudge, currentPage, limit]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await dispatch(deleteReport(id)).unwrap();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleSubmit = async (id: string) => {
    if (!confirm('Submit this report? It cannot be edited after submission.')) return;
    try {
      await dispatch(submitReport(id)).unwrap();
      alert('✅ Report submitted successfully!');
    } catch (err) {
      console.error('Failed to submit:', err);
      alert('❌ Failed to submit report');
    }
  };

  const handleDownloadPDF = async (id: string, station: string) => {
    try {
      const blob = await dispatch(generatePDF(id)).unwrap();
      const timestamp = getTimestamp();
      downloadFile(blob, `service-week-${station}-${timestamp}.pdf`);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('❌ Failed to download PDF');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading && reports.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#163328] font-medium animate-pulse">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#163328] p-6 rounded-2xl shadow-sm text-white gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#C48B28]">Service Week Reports</h2>
          <p className="text-emerald-100/80 text-sm mt-1">Manage and submit service week case returns</p>
        </div>
        <button
          onClick={() => navigate('/staff/service-week/new')}
          className="px-5 py-2.5 bg-[#C48B28] text-white font-semibold rounded-xl hover:bg-[#A8741E] transition-all shadow-md active:scale-95"
        >
          + New Entry
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as ServiceWeekStatus | 'all')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#C48B28] focus:border-transparent outline-none bg-gray-50"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search station..."
          value={searchStation}
          onChange={(e) => setSearchStation(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#C48B28] focus:border-transparent outline-none bg-gray-50"
        />

        <input
          type="text"
          placeholder="Search judge..."
          value={searchJudge}
          onChange={(e) => setSearchJudge(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#C48B28] focus:border-transparent outline-none bg-gray-50"
        />

        <span className="text-sm text-gray-500 self-center ml-auto font-medium">
          Showing {reports.length} of {pagination.total} report(s)
        </span>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#163328] text-white">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Station</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Judge</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Week</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Cases</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {report.station}
                      {report.division && <span className="text-gray-400 text-xs ml-1 font-normal">({report.division})</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{report.judge_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(report.week_start).toLocaleDateString()} – {new Date(report.week_end).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{report.cases?.length || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${SERVICE_WEEK_STATUS_COLORS[report.status]}`}>
                        {SERVICE_WEEK_STATUS_LABELS[report.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* Edit - only for draft */}
                        {report.status === 'draft' && (
                          <button
                            onClick={() => navigate(`/staff/service-week/${report.id}/edit`)}
                            className="px-2.5 py-1 bg-slate-700 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            Edit
                          </button>
                        )}

                        {/* Submit - only for draft */}
                        {report.status === 'draft' && (
                          <button
                            onClick={() => handleSubmit(report.id)}
                            disabled={isSubmitting}
                            className="px-2.5 py-1 bg-[#163328] text-white text-xs font-medium rounded-lg hover:bg-[#0f241c] disabled:opacity-50 transition-colors"
                          >
                            Submit
                          </button>
                        )}

                        {/* Delete - only for draft */}
                        {report.status === 'draft' && (
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="px-2.5 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        )}

                        {/* Download PDF */}
                        <button
                          onClick={() => handleDownloadPDF(report.id, report.station)}
                          className="px-2.5 py-1 bg-[#C48B28] text-white text-xs font-medium rounded-lg hover:bg-[#A8741E] transition-colors"
                        >
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-3">
          <div className="text-sm text-gray-500 font-medium">
            Showing page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3.5 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3.5 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceWeekPage;