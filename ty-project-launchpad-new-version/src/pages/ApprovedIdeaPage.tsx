import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import { API_BASE_URL } from '@/config/api';
import { handleApiError } from '@/utils/errorHandler';

const ApprovedIdeaPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    approvedIdea: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Public endpoint (no login required)
      const response = await fetch(`${API_BASE_URL}/api/approved-ideas/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          approved_idea: formData.approvedIdea,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to submit idea' }));
        throw new Error(errorData.detail || errorData.message || 'Failed to submit idea');
      }

      // Set one-time banner for /projects
      sessionStorage.setItem(
        'post_submit_banner',
        "Your idea is submitted. We will reach you soon. You can explore our projects."
      );

      setIsSubmitted(true);

      // Redirect to Projects after 1 second (still shows the local success UI briefly)
      setTimeout(() => {
        setFormData({ name: '', phone: '', approvedIdea: '' });
        navigate('/projects');
      }, 1000);
    } catch (error) {
      console.error('Submission error:', error);
      handleApiError(error, 'Failed to submit your approved idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <div className="py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Got Your Own Custom Idea?
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Share your approved project idea with us and we'll help bring it to life
          </p>
        </div>
      </div>
      <main className='pb-16 px-4'>
        <div className='max-w-lg mx-auto'>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl px-6 py-8 shadow-lg border border-gray-200">
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="mobile-button"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <Input
                type="tel"
                id="phone"
                name='phone'
                pattern='[6-9]{1}[0-9]{9}'
                placeholder='Enter your phone number'
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  handleChange({
                    target: {
                      name: 'phone',
                      value
                    }
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
                maxLength={10}
                className="mobile-button"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="approvedIdea" className="block text-sm font-medium text-gray-700 mb-2">Your Project Idea</label>
              <Textarea
                id="approvedIdea"
                name="approvedIdea"
                value={formData.approvedIdea}
                onChange={handleChange}
                placeholder="Briefly describe your idea or paste details here — we'll contact you to discuss the project and tech stack"
                rows={4}
                className="mobile-button resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mobile-button bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              disabled={isSubmitting || isSubmitted}
            >
              {isSubmitting ? 'Submitting...' : isSubmitted ? '✓ Submitted' : 'Submit Your Idea'}
            </Button>

            {isSubmitted && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Success!</span>
                </div>
                <p className="text-sm">
                  Your idea is submitted. We will reach you soon.
                </p>
                <p className="text-xs mt-2 text-green-600">Redirecting to idea generator...</p>
              </div>
            )}
          </form>
        </div>
      </main>
      
      {/* Back button */}
      <div className="max-w-lg mx-auto px-4 pb-8">
        <Button
          onClick={() => navigate('/idea-generator')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Idea Generator
        </Button>
      </div>
      
      {/* Bottom spacing for mobile */}
      <div className="h-16 sm:h-20"></div>
    </div>
  );
};

export default ApprovedIdeaPage;
