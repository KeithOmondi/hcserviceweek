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
import { FiPlus, FiSearch, FiEye, FiEdit2, FiTrash2, FiDownload, FiCheckCircle } from 'react-icons/fi';

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#163328] p-5 sm:p-6 rounded-2xl shadow-sm text-white gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#C48B28]">Service Week Reports</h2>
            <p className="text-emerald-100/80 text-sm mt-1">Manage and submit service week case returns</p>
          </div>
          <button
            onClick={() => navigate('/staff/service-week/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C48B28] text-white font-semibold rounded-xl hover:bg-[#A8741E] transition-all shadow-md active:scale-95"
          >
            <FiPlus className="w-4 h-4" />
            New Entry
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ServiceWeekStatus | 'all')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#C48B28] focus:border-transparent outline-none bg-gray-50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[150px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search station..."
              value={searchStation}
              onChange={(e) => setSearchStation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#C48B28] focus:border-transparent outline-none bg-gray-50"
            />
          </div>

          <div className="relative flex-1 min-w-[150px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search judge..."
              value={searchJudge}
              onChange={(e) => setSearchJudge(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#C48B28] focus:border-transparent outline-none bg-gray-50"
            />
          </div>

          <span className="text-sm text-gray-500 font-medium ml-auto">
            Showing {reports.length} of {pagination.total} report(s)
          </span>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#163328] text-white">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Station</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Judge</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Week</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">Cases</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <FiSearch className="w-8 h-8 text-gray-300" />
                        <p>No reports found</p>
                        <p className="text-xs text-gray-400">Try adjusting your filters or create a new entry</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div>
                          <div className="font-semibold text-gray-900">{report.station}</div>
                          {report.division && (
                            <div className="text-gray-400 text-xs">{report.division}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 font-medium">{report.judge_name}</td>
                      <td className="px-4 py-3.5 text-gray-600">
                        <div className="flex flex-col">
                          <span>{new Date(report.week_start).toLocaleDateString()}</span>
                          <span className="text-gray-400 text-xs">to</span>
                          <span>{new Date(report.week_end).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-[#163328]/10 text-[#163328] font-semibold rounded-full">
                          {report.cases?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${SERVICE_WEEK_STATUS_COLORS[report.status]}`}>
                          {report.status === 'submitted' && <FiCheckCircle className="w-3 h-3" />}
                          {SERVICE_WEEK_STATUS_LABELS[report.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* View - always available */}
                          <button
                            onClick={() => navigate(`/staff/service-week/${report.id}`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>

                          {/* Edit - only for draft */}
                          {report.status === 'draft' && (
                            <button
                              onClick={() => navigate(`/staff/service-week/${report.id}/edit`)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Submit - only for draft */}
                          {report.status === 'draft' && (
                            <button
                              onClick={() => handleSubmit(report.id)}
                              disabled={isSubmitting}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Submit"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete - only for draft */}
                          {report.status === 'draft' && (
                            <button
                              onClick={() => handleDelete(report.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Download PDF - always available */}
                          <button
                            onClick={() => handleDownloadPDF(report.id, report.station)}
                            className="p-1.5 text-[#C48B28] hover:bg-[#C48B28]/10 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <FiDownload className="w-4 h-4" />
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-6 py-3">
            <div className="text-sm text-gray-500 font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm font-medium bg-[#163328] text-white rounded-lg">
                {pagination.page}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceWeekPage;