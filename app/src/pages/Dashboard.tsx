import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, FileText, BarChart3, Trash2, 
  Edit3, ExternalLink, MoreVertical, Search,
  LayoutGrid, List, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useForms } from '@/hooks/useForms';
import type { Form } from '@/types/form';
import { DEFAULT_FORM } from '@/types/form';
import { generateId } from '@/utils/id';

interface DashboardProps {
  onEditForm: (form: Form) => void;
}

export function Dashboard({ onEditForm }: DashboardProps) {
  const { forms, loading, createForm, deleteForm } = useForms();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateForm = async () => {
    const newForm = {
      ...DEFAULT_FORM,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const created = await createForm(newForm);
    if (created) {
      onEditForm(created);
    }
    setShowTemplates(false);
  };

  const handleCreateFromTemplate = async (templateName: string) => {
    const templates: Record<string, Partial<Form>> = {
      'Event Registration': {
        title: 'Event Registration',
        description: 'Register for our upcoming event',
        questions: [
          {
            id: generateId(),
            type: 'short_text',
            title: 'Full Name',
            required: true,
          },
          {
            id: generateId(),
            type: 'email',
            title: 'Email Address',
            required: true,
          },
          {
            id: generateId(),
            type: 'dropdown',
            title: 'Ticket Type',
            required: true,
            options: [
              { id: '1', label: 'General Admission', value: 'general' },
              { id: '2', label: 'VIP', value: 'vip' },
              { id: '3', label: 'Student', value: 'student' },
            ],
          },
        ],
      },
      'Customer Feedback': {
        title: 'Customer Feedback Survey',
        description: 'Help us improve our services',
        questions: [
          {
            id: generateId(),
            type: 'rating',
            title: 'How satisfied are you with our service?',
            required: true,
            maxRating: 5,
          },
          {
            id: generateId(),
            type: 'long_text',
            title: 'What can we improve?',
            required: false,
          },
          {
            id: generateId(),
            type: 'checkbox',
            title: 'Which features do you use?',
            required: false,
            options: [
              { id: '1', label: 'Feature A', value: 'feature_a' },
              { id: '2', label: 'Feature B', value: 'feature_b' },
              { id: '3', label: 'Feature C', value: 'feature_c' },
            ],
          },
        ],
      },
      'Job Application': {
        title: 'Job Application',
        description: 'Apply for a position at our company',
        questions: [
          {
            id: generateId(),
            type: 'short_text',
            title: 'Full Name',
            required: true,
          },
          {
            id: generateId(),
            type: 'email',
            title: 'Email Address',
            required: true,
          },
          {
            id: generateId(),
            type: 'short_text',
            title: 'Position Applying For',
            required: true,
          },
          {
            id: generateId(),
            type: 'file_upload',
            title: 'Resume/CV',
            required: true,
          },
        ],
      },
    };

    const template = templates[templateName];
    if (template) {
      const newForm = {
        ...DEFAULT_FORM,
        ...template,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const created = await createForm(newForm);
      if (created) {
        onEditForm(created);
      }
    }
    setShowTemplates(false);
  };

  const handleDelete = async () => {
    if (formToDelete) {
      await deleteForm(formToDelete);
      setFormToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">FormCraft</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative hidden sm:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48 lg:w-64"
                />
              </div>

              <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create Form</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Choose a Template</DialogTitle>
                    <DialogDescription>
                      Start with a template or create a blank form
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <button
                      onClick={handleCreateForm}
                      className="p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-300 
                                 hover:bg-purple-50 transition-all text-center"
                    >
                      <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="font-medium text-gray-900">Blank Form</p>
                      <p className="text-sm text-gray-500">Start from scratch</p>
                    </button>
                    {['Event Registration', 'Customer Feedback', 'Job Application'].map((template) => (
                      <button
                        key={template}
                        onClick={() => handleCreateFromTemplate(template)}
                        className="p-6 border border-gray-200 rounded-xl hover:border-purple-300 
                                   hover:bg-purple-50 transition-all text-left"
                      >
                        <FileText className="w-8 h-8 mb-2 text-purple-500" />
                        <p className="font-medium text-gray-900">{template}</p>
                        <p className="text-sm text-gray-500">Pre-built template</p>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Forms</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{forms.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Responses</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {forms.reduce((acc, form) => acc + form.responseCount, 0)}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Published Forms</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {forms.filter((f) => f.isPublished).length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Your Forms</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredForms.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
              <p className="text-sm text-gray-500 mb-4">Create your first form to get started</p>
              <Button onClick={handleCreateForm} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Form
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4' 
              : 'divide-y divide-gray-200'
            }>
              <AnimatePresence>
                {filteredForms.map((form, index) => (
                  <motion.div
                    key={form.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className={
                      viewMode === 'grid'
                        ? 'group bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer'
                        : 'group flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer'
                    }
                    onClick={() => onEditForm(form)}
                  >
                    <div className={viewMode === 'grid' ? '' : 'flex-1 min-w-0'}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1 text-sm sm:text-base">
                          {form.title}
                        </h3>
                        {viewMode === 'grid' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <button className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditForm(form); }}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); setFormToDelete(form._id || form.id); }}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-3">
                        {form.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={form.isPublished ? 'default' : 'secondary'} className="text-xs">
                          {form.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {form.responseCount} responses
                        </span>
                      </div>
                    </div>

                    {viewMode === 'list' && (
                      <div className="flex items-center gap-1 sm:gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); onEditForm(form); }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setFormToDelete(form._id || form.id); }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={!!formToDelete} onOpenChange={() => setFormToDelete(null)}>
        <AlertDialogContent className="max-w-sm sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form and all its responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
