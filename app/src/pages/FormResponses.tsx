import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Download,
  FileText,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader,
  RefreshCw,
  Search,
  Clock,
} from 'lucide-react';
import { ApiError, formsApi } from '../lib/api';
import type { Form, FormResponse, Question, Answer } from '@/types/form';

type FormResponseRow = FormResponse & { respondentEmail?: string };

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  if (diffInHours < 48) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const FormResponses = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(
    async (showGlobalLoader = false) => {
      if (!id) {
        setError('Invalid form URL');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (showGlobalLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        const [formData, responsesData] = await Promise.all([
          formsApi.getByIdAdmin(id),
          formsApi.getResponses(id),
        ]);

        setForm(formData);
        setResponses(responsesData);
      } catch (err: unknown) {
        const message = err instanceof ApiError ? err.message : 'Failed to load responses';
        setError(message);

        if (err instanceof ApiError && err.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, navigate],
  );

  useEffect(() => {
    void fetchData(true);
  }, [fetchData]);

  const safeResponses = Array.isArray(responses) ? responses : [];

  const filteredResponses = safeResponses.filter((response) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesEmail = response.respondentEmail?.toLowerCase().includes(searchLower);
    const matchesContent = response.answers?.some((a: Answer) =>
      String(a.value).toLowerCase().includes(searchLower),
    );
    return matchesEmail || matchesContent;
  });

  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const paginatedResponses = filteredResponses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleExportCSV = () => {
    if (!form || !responses.length) return;

    const headers = [
      'Submission Date',
      'Email',
      ...form.questions.map((q: Question) => `"${q.title}"`),
    ];

    const rows = responses.map((response: FormResponseRow) => {
      const date = `"${new Date(response.submittedAt).toLocaleString()}"`;
      const respondentEmail = response.respondentEmail || 'Anonymous';
      const answers = form.questions.map((q: Question) => {
        const answerObj = response.answers.find((a: Answer) => a.questionId === q.id);
        let val = answerObj ? answerObj.value : '';
        if (Array.isArray(val)) val = val.join(', ');
        val = String(val || '').replace(/"/g, '""');
        return `"${val}"`;
      });

      return [date, respondentEmail, ...answers].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${form.title}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: safeResponses.length,
    today: safeResponses.filter((r) => {
      const date = new Date(r.submittedAt);
      const now = new Date();
      return date.toDateString() === now.toDateString();
    }).length,
    thisWeek: safeResponses.filter((r) => {
      const date = new Date(r.submittedAt);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    }).length,
    uniqueEmails: new Set(safeResponses.map((r) => r.respondentEmail)).size,
  };

  const questions = form?.questions ?? [];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-400">
          <Loader className="h-4 w-4 animate-spin" />
          Loading responses
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 text-center">
          <h2 className="text-lg font-semibold text-zinc-100">Failed to Load</h2>
          <p className="mt-2 text-sm text-zinc-400">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-5 rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-zinc-100 sm:text-base">{form?.title}</h1>
          <p className="text-xs text-zinc-500">Response analytics</p>
        </div>
          <button
            onClick={handleExportCSV}
            disabled={responses.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
      </div>
      <main>
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Total Responses', value: stats.total, icon: FileText },
            { label: 'Today', value: stats.today, icon: Clock },
            { label: 'This Week', value: stats.thisWeek, icon: Calendar },
            { label: 'Unique Users', value: stats.uniqueEmails, icon: Users },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-zinc-500">{stat.label}</p>
                <stat.icon className="h-4 w-4 text-zinc-400" />
              </div>
              <p className="text-2xl font-semibold text-zinc-100">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium text-zinc-300">Responses ({filteredResponses.length})</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search responses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-600 sm:w-72"
              />
            </div>
            <button
              onClick={() => void fetchData(false)}
              disabled={refreshing}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-60"
            >
              {refreshing ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Reload</span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/60">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Date</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Respondent</th>
                  {questions.map((q: Question) => (
                    <th key={q.id} className="min-w-[180px] px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      <span className="block truncate max-w-[180px]">{q.title}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {paginatedResponses.length === 0 ? (
                  <tr>
                    <td colSpan={questions.length + 2} className="px-4 py-12 text-center text-sm text-zinc-500">
                      No responses found
                    </td>
                  </tr>
                ) : (
                  paginatedResponses.map((response) => (
                    <tr key={response.id || response._id} className="hover:bg-zinc-900">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-400">{formatDate(response.submittedAt)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-200">{response.respondentEmail || 'Anonymous'}</td>
                      {questions.map((q: Question) => {
                        const answerObj = response.answers?.find((a: Answer) => a.questionId === q.id);
                        const val = answerObj ? answerObj.value : '-';
                        const display = Array.isArray(val)
                          ? val.join(', ')
                          : val instanceof File
                            ? val.name
                            : String(val ?? '-');
                        return (
                          <td key={q.id} className="px-4 py-3 text-sm text-zinc-300">
                            <span className="line-clamp-2">{display}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-zinc-700 bg-zinc-950 p-2 text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-zinc-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-zinc-700 bg-zinc-950 p-2 text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
