import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Download, FileText, BarChart3, Users, 
  Calendar, ChevronLeft, ChevronRight, Search, Clock, 
} from 'lucide-react';
// 1. CHANGE: Import the secure formsApi instead of the raw functions
import { formsApi } from '../lib/api'; 

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
        
        // 2. CHANGE: Use formsApi. This ensures cookies are sent.
        const [formData, responsesData] = await Promise.all([
          formsApi.getById(id),
          formsApi.getResponses(id)
        ]);
        
        setForm(formData);
        setResponses(responsesData);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load responses");
        
        // Optional: If error is auth related, redirect to login
        if (err.message === "User Need to Login" || err.status === 401) {
             navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // Safe check to ensure responses is an array before filtering
  // This prevents crashes if the API returns an error object unexpectedly
  const safeResponses = Array.isArray(responses) ? responses : [];

  const filteredResponses = safeResponses.filter(response => {
    const searchLower = searchQuery.toLowerCase();
    const matchesEmail = response.respondentEmail?.toLowerCase().includes(searchLower);
    const matchesContent = response.answers?.some((a: any) => 
      String(a.value).toLowerCase().includes(searchLower)
    );
    return matchesEmail || matchesContent;
  });

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
      const respondentEmail = response.respondentEmail || 'Anonymous';
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

  const stats = {
    total: safeResponses.length,
    today: safeResponses.filter(r => {
      const date = new Date(r.submittedAt);
      const now = new Date();
      return date.toDateString() === now.toDateString();
    }).length,
    thisWeek: safeResponses.filter(r => {
      const date = new Date(r.submittedAt);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    }).length,
    uniqueEmails: new Set(safeResponses.map(r => r.respondentEmail)).size
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0f0f12] to-[#0f0f12]" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/5 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-white/40 font-medium tracking-wider uppercase">Loading Analytics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/[0.02] border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <BarChart3 className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load</h2>
          <p className="text-white/40 mb-4">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px]" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-[#0f0f12]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/dashboard')}
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
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Responses</h2>
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/60 text-xs font-medium border border-white/10">
                {filteredResponses.length}
              </span>
            </div>

            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search responses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 w-full sm:w-64"
                />
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 text-xs font-medium text-white/40 uppercase tracking-wider whitespace-nowrap">Date</th>
                    <th className="px-6 py-4 text-xs font-medium text-white/40 uppercase tracking-wider whitespace-nowrap">Respondent</th>
                    {form?.questions.map((q: any) => (
                      <th key={q.id} className="px-6 py-4 text-xs font-medium text-white/40 uppercase tracking-wider min-w-[200px]">
                        <span className="truncate block max-w-[150px]">{q.title}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {paginatedResponses.length === 0 ? (
                      <tr>
                        <td colSpan={form.questions.length + 2} className="px-6 py-16 text-center">
                          <p className="text-white/40">No responses found</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedResponses.map((response, idx) => (
                        <motion.tr 
                          // 3. CHANGE: Use response.id if available, fallback to _id
                          key={response.id || response._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60 font-mono">
                            {formatDate(response.submittedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                             {response.respondentEmail || 'Anonymous'}
                          </td>
                          {form.questions.map((q: any) => {
                            const answerObj = response.answers?.find((a: any) => a.questionId === q.id);
                            const val = answerObj ? answerObj.value : '-';
                            const display = Array.isArray(val) ? val.join(', ') : val;
                            return (
                              <td key={q.id} className="px-6 py-4 text-sm text-white/70">
                                <span className="line-clamp-2">{display}</span>
                              </td>
                            );
                          })}
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
             {totalPages > 1 && (
              <div className="border-t border-white/5 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-white/60">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};