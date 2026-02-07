import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  BarChart3, 
  Users, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  TrendingUp,
  Clock,
  Mail,
  Hash
} from 'lucide-react';
import { getFormById, getFormResponses } from '../lib/api';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

export const FormResponses = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const [formData, responsesData] = await Promise.all([
          getFormById(id),
          getFormResponses(id)
        ]);
        setForm(formData);
        setResponses(responsesData);
      } catch (err: any) {
        setError(err.message || "Failed to load responses");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Filter responses based on search
  const filteredResponses = responses.filter(response => {
    const searchLower = searchQuery.toLowerCase();
    const matchesEmail = response.respondentEmail?.toLowerCase().includes(searchLower);
    const matchesContent = response.answers.some((a: any) => 
      String(a.value).toLowerCase().includes(searchLower)
    );
    return matchesEmail || matchesContent;
  });

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const paginatedResponses = filteredResponses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    if (!form || !responses.length) return;

    const headers = ['Submission Date','Email',...form.questions.map((q: any) => `"${q.title}"`)];
    const rows = responses.map((response) => {
      const date = `"${new Date(response.submittedAt).toLocaleString()}"`;
      const respondentEmail = response.respondentEmail;
      const answers = form.questions.map((q: any) => {
        const answerObj = response.answers.find((a: any) => a.questionId === q.id);
        let val = answerObj ? answerObj.value : '';
        if (Array.isArray(val)) val = val.join(', ');
        val = String(val || '').replace(/"/g, '""');
        return `"${val}"`;
      });
      return [date,respondentEmail,...answers].join(',');
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

  // Calculate stats
  const stats = {
    total: responses.length,
    today: responses.filter(r => {
      const date = new Date(r.submittedAt);
      const now = new Date();
      return date.toDateString() === now.toDateString();
    }).length,
    thisWeek: responses.filter(r => {
      const date = new Date(r.submittedAt);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    }).length,
    uniqueEmails: new Set(responses.map(r => r.respondentEmail)).size
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0f] to-[#0a0a0f]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-white/5 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-white/40 font-medium tracking-wider uppercase">Loading Analytics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-[#0a0a0f] to-[#0a0a0f]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white/[0.02] backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <BarChart3 className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load</h2>
          <p className="text-white/40">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px]" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <h1 className="text-lg font-semibold text-white">{form?.title}</h1>
                  <p className="text-xs text-white/40">Response Analytics</p>
                </div>
              </div>

              <button 
                onClick={handleExportCSV}
                disabled={responses.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Responses', value: stats.total, icon: FileText, trend: '+12%', color: 'indigo' },
              { label: 'Today', value: stats.today, icon: Clock, trend: 'Live', color: 'cyan' },
              { label: 'This Week', value: stats.thisWeek, icon: Calendar, trend: '+5', color: 'purple' },
              { label: 'Unique Users', value: stats.uniqueEmails, icon: Users, trend: '100%', color: 'emerald' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-all group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/40 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className={`text-xs text-${stat.color}-400 mt-1 flex items-center gap-1`}>
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Responses</h2>
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/60 text-xs font-medium border border-white/10">
                {filteredResponses.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search responses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 w-full sm:w-64"
                />
              </div>
              
              <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 text-xs font-medium text-white/40 uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-xs font-medium text-white/40 uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" />
                        Respondent
                      </div>
                    </th>
                    {form?.questions.map((q: any, idx: number) => (
                      <th key={q.id} className="px-6 py-4 text-xs font-medium text-white/40 uppercase tracking-wider min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{q.title}</span>
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-xs font-medium text-white/40 uppercase tracking-wider w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {paginatedResponses.length === 0 ? (
                      <tr>
                        <td colSpan={form.questions.length + 3} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                              <FileText className="w-8 h-8 text-white/20" />
                            </div>
                            <p className="text-white/40 font-medium mb-1">No responses found</p>
                            <p className="text-white/20 text-sm">Responses will appear here once submitted</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedResponses.map((response, idx) => (
                        <motion.tr 
                          key={response._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
                              <span className="text-sm text-white/60 font-mono">
                                {formatDate(response.submittedAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-medium text-indigo-300">
                                {response.respondentEmail?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <span className="text-sm text-white/80 truncate max-w-[150px]">
                                {response.respondentEmail || 'Anonymous'}
                              </span>
                            </div>
                          </td>
                          {form.questions.map((q: any) => {
                            const answerObj = response.answers.find((a: any) => a.questionId === q.id);
                            const answerValue = answerObj ? answerObj.value : null;
                            const displayValue = Array.isArray(answerValue) 
                              ? answerValue.join(', ') 
                              : (answerValue || '-');

                            return (
                              <td key={q.id} className="px-6 py-4">
                                <span className="text-sm text-white/70 line-clamp-2 max-w-[200px]">
                                  {displayValue}
                                </span>
                              </td>
                            );
                          })}
                          <td className="px-6 py-4">
                            <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-white/5 px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-white/40">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredResponses.length)} of {filteredResponses.length} responses
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-white/60 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};