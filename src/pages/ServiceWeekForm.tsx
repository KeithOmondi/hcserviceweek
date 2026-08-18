// src/pages/ServiceWeekForm.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createReport,
  updateReport,
  fetchReportById,
  selectIsSubmitting,
  selectCurrentReport,
  selectError,
  clearCurrentReport,
} from '../store/slice/serviceweekSlice';
import type {
  CaseReturnFormValues,
  ServiceWeekFormValues,
  ServiceWeekReport,
} from '../types/service-week.types';
import type { AppDispatch } from '../store/store';

const initialCase: CaseReturnFormValues = {
  serial_number: '',
  case_number: '',
  cause_listed_activity: '',
  outcome: '',
  remarks: '',
};

const emptyForm: ServiceWeekFormValues = {
  station: '',
  division: '',
  week_start: '',
  week_end: '',
  date: '',
  judge_name: '',
  cases: [{ ...initialCase }],
  prepared_by: '',
  prepared_designation: '',
  prepared_date: '',
  confirmed_by: '',
  confirmed_designation: '',
  confirmed_date: '',
  approved_by: '',
  approved_designation: '',
  approved_date: '',
};

// Pure mapping function — no setState involved, just data shaping.
function mapReportToFormValues(report: ServiceWeekReport): ServiceWeekFormValues {
  return {
    station: report.station,
    division: report.division || '',
    week_start: report.week_start,
    week_end: report.week_end,
    date: report.date,
    judge_name: report.judge_name,
    cases: report.cases.map((c) => ({
      serial_number: c.serial_number,
      case_number: c.case_number,
      cause_listed_activity: c.cause_listed_activity,
      outcome: c.outcome,
      remarks: c.remarks || '',
    })),
    prepared_by: report.prepared_by,
    prepared_designation: report.prepared_designation,
    prepared_date: report.prepared_date || '',
    confirmed_by: report.confirmed_by || '',
    confirmed_designation: report.confirmed_designation || '',
    confirmed_date: report.confirmed_date || '',
    approved_by: report.approved_by || '',
    approved_designation: report.approved_designation || '',
    approved_date: report.approved_date || '',
  };
}

/**
 * Outer component: owns the fetch-on-mount effect (a legitimate effect —
 * synchronizing with an external system, the API/Redux store) and decides
 * whether to show a loading state or the actual form.
 */
const ServiceWeekForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const currentReport = useSelector(selectCurrentReport);
  const error = useSelector(selectError);

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchReportById(id));
    }
    return () => {
      dispatch(clearCurrentReport());
    };
  }, [dispatch, id, isEdit]);

  // Still loading the report we're supposed to edit — don't mount the form yet.
  if (isEdit && !currentReport) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-sm text-stone-500">
        {error ? (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        ) : (
          'Loading report…'
        )}
      </div>
    );
  }

  // key={id ?? 'new'} forces a fresh mount (and fresh lazy-initial-state)
  // whenever we switch between editing different reports or start a new one.
  return (
    <ServiceWeekFormInner
      key={id ?? 'new'}
      isEdit={isEdit}
      initialValues={isEdit && currentReport ? mapReportToFormValues(currentReport) : emptyForm}
    />
  );
};

/**
 * Inner component: pure form. Initial state is derived once via a lazy
 * initializer — no effect, no setState-after-mount, no cascading render.
 */
const ServiceWeekFormInner: React.FC<{
  isEdit: boolean;
  initialValues: ServiceWeekFormValues;
}> = ({ isEdit, initialValues }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isSubmitting = useSelector(selectIsSubmitting);
  const error = useSelector(selectError);

  const [formData, setFormData] = useState<ServiceWeekFormValues>(() => initialValues);
  const [saveAsDraft, setSaveAsDraft] = useState(true);

  const updateField = <K extends keyof ServiceWeekFormValues>(
    field: K,
    value: ServiceWeekFormValues[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateCase = (index: number, field: keyof CaseReturnFormValues, value: string | number) => {
    const updatedCases = [...formData.cases];
    updatedCases[index] = { ...updatedCases[index], [field]: value };
    setFormData((prev) => ({ ...prev, cases: updatedCases }));
  };

  const addCase = () => {
    setFormData((prev) => ({
      ...prev,
      cases: [...prev.cases, { ...initialCase, serial_number: prev.cases.length + 1 }],
    }));
  };

  const removeCase = (index: number) => {
    if (formData.cases.length <= 1) return;
    const updated = formData.cases.filter((_, i) => i !== index);
    const renumbered = updated.map((c, i) => ({ ...c, serial_number: i + 1 }));
    setFormData((prev) => ({ ...prev, cases: renumbered }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.cases.length === 0) {
      alert('Please add at least one case');
      return;
    }

    const payload = {
      station: formData.station,
      division: formData.division || undefined,
      week_start: formData.week_start,
      week_end: formData.week_end,
      date: formData.date,
      judge_name: formData.judge_name,
      cases: formData.cases.map((c) => ({
        serial_number: Number(c.serial_number),
        case_number: c.case_number,
        cause_listed_activity: c.cause_listed_activity,
        outcome: c.outcome,
        remarks: c.remarks || undefined,
      })),
      prepared_by: formData.prepared_by,
      prepared_designation: formData.prepared_designation,
      prepared_date: formData.prepared_date || undefined,
      confirmed_by: formData.confirmed_by || undefined,
      confirmed_designation: formData.confirmed_designation || undefined,
      confirmed_date: formData.confirmed_date || undefined,
      approved_by: formData.approved_by || undefined,
      approved_designation: formData.approved_designation || undefined,
      approved_date: formData.approved_date || undefined,
    };

    try {
      if (isEdit && id) {
        await dispatch(
          updateReport({ id, data: { ...payload, status: saveAsDraft ? 'draft' : 'submitted' } })
        ).unwrap();
        alert('✅ Report updated successfully!');
      } else {
        await dispatch(createReport({ ...payload, saveAsDraft })).unwrap();
        alert('✅ Report saved successfully!');
      }
      navigate('/staff/service-week');
    } catch (err) {
      console.error('Failed to save:', err);
      alert('❌ Failed to save report');
    }
  };

  const handleSaveAsDraft = () => {
    setSaveAsDraft(true);
    const form = document.getElementById('serviceWeekForm') as HTMLFormElement;
    if (form) form.requestSubmit();
  };

  const handleSubmitDirect = () => {
    setSaveAsDraft(false);
    const form = document.getElementById('serviceWeekForm') as HTMLFormElement;
    if (form) form.requestSubmit();
  };

  return (
    <form id="serviceWeekForm" onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#1E4620] mb-4">
          {isEdit ? 'Edit Service Week Report' : 'New Service Week Report'}
        </h2>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Report Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Station *</label>
            <input
              type="text"
              value={formData.station}
              onChange={(e) => updateField('station', e.target.value)}
              required
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Division</label>
            <input
              type="text"
              value={formData.division}
              onChange={(e) => updateField('division', e.target.value)}
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Judge Name *</label>
            <input
              type="text"
              value={formData.judge_name}
              onChange={(e) => updateField('judge_name', e.target.value)}
              required
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Week Start *</label>
            <input
              type="date"
              value={formData.week_start}
              onChange={(e) => updateField('week_start', e.target.value)}
              required
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Week End *</label>
            <input
              type="date"
              value={formData.week_end}
              onChange={(e) => updateField('week_end', e.target.value)}
              required
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Report Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => updateField('date', e.target.value)}
              required
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Cases Table */}
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9C7A1E] mt-4 mb-2">
          Cases ({formData.cases.length})
        </h3>
        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">#</th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Case Number</th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Activity</th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Outcome</th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Remarks</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {formData.cases.map((caseItem, index) => (
                <tr key={index}>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={caseItem.serial_number}
                      onChange={(e) => updateCase(index, 'serial_number', Number(e.target.value))}
                      className="w-full border border-stone-300 rounded px-1 py-1 text-sm"
                      min="1"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={caseItem.case_number}
                      onChange={(e) => updateCase(index, 'case_number', e.target.value)}
                      className="w-full border border-stone-300 rounded px-2 py-1 text-sm"
                      placeholder="e.g. HCCRA/E082/2024"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={caseItem.cause_listed_activity}
                      onChange={(e) => updateCase(index, 'cause_listed_activity', e.target.value)}
                      className="w-full border border-stone-300 rounded px-2 py-1 text-sm"
                      placeholder="e.g. Mention"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={caseItem.outcome}
                      onChange={(e) => updateCase(index, 'outcome', e.target.value)}
                      className="w-full border border-stone-300 rounded px-2 py-1 text-sm"
                      placeholder="e.g. Judgment"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={caseItem.remarks}
                      onChange={(e) => updateCase(index, 'remarks', e.target.value)}
                      className="w-full border border-stone-300 rounded px-2 py-1 text-sm"
                      placeholder="Optional remarks"
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeCase(index)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                      disabled={formData.cases.length <= 1}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={addCase}
          className="mt-2 text-xs font-semibold text-[#1E4620] border border-[#1E4620] rounded-md px-3 py-1.5 hover:bg-stone-50"
        >
          + Add Case
        </button>

        {/* Signatures */}
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9C7A1E] mt-6 mb-2">Signatures</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border border-stone-200 rounded-lg">
            <h4 className="text-sm font-semibold text-stone-700 mb-2">Prepared by (Court Assistant)</h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Name"
                value={formData.prepared_by}
                onChange={(e) => updateField('prepared_by', e.target.value)}
                className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                placeholder="Designation"
                value={formData.prepared_designation}
                onChange={(e) => updateField('prepared_designation', e.target.value)}
                className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              />
              <input
                type="date"
                value={formData.prepared_date}
                onChange={(e) => updateField('prepared_date', e.target.value)}
                className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="p-3 border border-stone-200 rounded-lg">
            <h4 className="text-sm font-semibold text-stone-700 mb-2">Confirmed by (Deputy Registrar)</h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Name"
                value={formData.confirmed_by}
                onChange={(e) => updateField('confirmed_by', e.target.value)}
                className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                placeholder="Designation"
                value={formData.confirmed_designation}
                onChange={(e) => updateField('confirmed_designation', e.target.value)}
                className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              />
              <input
                type="date"
                value={formData.confirmed_date}
                onChange={(e) => updateField('confirmed_date', e.target.value)}
                className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="p-3 border border-stone-200 rounded-lg">
            <h4 className="text-sm font-semibold text-stone-700 mb-2">Approved by (Judge)</h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Name"
                value={formData.approved_by}
                onChange={(e) => updateField('approved_by', e.target.value)}
                className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                placeholder="Designation"
                value={formData.approved_designation}
                onChange={(e) => updateField('approved_designation', e.target.value)}
                className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              />
              <input
                type="date"
                value={formData.approved_date}
                onChange={(e) => updateField('approved_date', e.target.value)}
                className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-stone-200">
          <button
            type="submit"
            onClick={handleSubmitDirect}
            disabled={isSubmitting}
            className="bg-[#1E4620] text-white text-sm font-semibold rounded-md px-4 py-2 hover:bg-[#132A1D] disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : isEdit ? 'Update & Submit' : 'Submit'}
          </button>

          <button
            type="button"
            onClick={handleSaveAsDraft}
            disabled={isSubmitting}
            className="bg-stone-600 text-white text-sm font-semibold rounded-md px-4 py-2 hover:bg-stone-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save as Draft'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/staff/service-week')}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default ServiceWeekForm;