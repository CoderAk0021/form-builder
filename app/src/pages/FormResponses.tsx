import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { getFormById, getFormResponses } from '../lib/api';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString() + ' ' + 
         new Date(dateString).toLocaleTimeString();
};

export const FormResponses = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Function to download data as CSV
  const handleExportCSV = () => {
    if (!form || !responses.length) return;

    // 1. Create Headers: ["Submission Date", "Question 1", "Question 2"...]
    const headers = ['Submission Date','Email',...form.questions.map((q: any) => `"${q.title}"`)];

    // 2. Create Rows
    const rows = responses.map((response) => {
      const date = `"${new Date(response.submittedAt).toLocaleString()}"`;
      const respondentEmail = response.respondentEmail;
      const answers = form.questions.map((q: any) => {
        // FIND the answer in the array matching the question ID
        const answerObj = response.answers.find((a: any) => a.questionId === q.id);
        let val = answerObj ? answerObj.value : '';

        // Handle arrays (like checkboxes) and escape quotes
        if (Array.isArray(val)) val = val.join(', ');
        val = String(val || '').replace(/"/g, '""'); // Escape double quotes
        return `"${val}"`;
      });

      return [date,respondentEmail,...answers].join(',');
    });

    // 3. Trigger Download
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600">
      Error: {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{form?.title}</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {responses.length} responses collected
            </p>
          </div>
          
          <button 
            onClick={handleExportCSV}
            disabled={responses.length === 0}
            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Responses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                    Submission Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                    Email
                  </th>
                  {/* Dynamic Headers */}
                  {form?.questions.map((q: any) => (
                    <th key={q.id} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[150px] bg-gray-50">
                      {q.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {responses.length === 0 ? (
                  <tr>
                    <td colSpan={form.questions.length + 1} className="px-6 py-12 text-center text-gray-500">
                      No responses yet.
                    </td>
                  </tr>
                ) : (
                  responses.map((response) => (
                    <tr key={response._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(response.submittedAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {response.respondentEmail}
                      </td>
                      
                      {/* Dynamic Cells */}
                      {form.questions.map((q: any) => {
                        // FIX: Find the specific answer object in the array
                        const answerObj = response.answers.find((a: any) => a.questionId === q.id);
                        
                        const answerValue = answerObj ? answerObj.value : null;
                        
                        // Handle array values (like checkboxes)
                        const displayValue = Array.isArray(answerValue) 
                          ? answerValue.join(', ') 
                          : (answerValue || '-');

                        return (
                          <td key={q.id} className="px-6 py-4 text-sm text-gray-900">
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

