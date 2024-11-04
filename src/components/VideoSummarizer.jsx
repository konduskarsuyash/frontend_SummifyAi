import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

const VideoSummarizer = () => {
  const [formData, setFormData] = useState({
    videoUrl: '',
    uploadedFile: null,
    uploadedFileName: ''
  });
  const [summary, setSummary] = useState('');
  const [displayedSummary, setDisplayedSummary] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);

  const validateYoutubeUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return regex.test(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        videoUrl: '',
        uploadedFile: file,
        uploadedFileName: file.name
      });
      setError('');
    }
  };

  const handleUrlChange = (e) => {
    setFormData({
      videoUrl: e.target.value,
      uploadedFile: null,
      uploadedFileName: ''
    });
    setError('');
  };

  const processVideoSummary = async (formPayload) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/video_summaeizer/`, {
        method: 'POST',
        headers: {
          ...(formPayload instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formPayload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process video');
      }

      const data = await response.json();
      setSummary(data.summary || data.explanation);
      setDisplayedSummary('');
      setIsSummaryVisible(true);
    } catch (err) {
      setError(err.message || 'An error occurred while processing the video');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (formData.uploadedFile) {
        const fileFormData = new FormData();
        fileFormData.append('video_file', formData.uploadedFile);
        await processVideoSummary(fileFormData);
      } else if (formData.videoUrl) {
        if (!validateYoutubeUrl(formData.videoUrl)) {
          throw new Error('Invalid YouTube URL');
        }
        await processVideoSummary(JSON.stringify({ youtube_url: formData.videoUrl }));
      } else {
        throw new Error('Please provide either a YouTube URL or upload a video file');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (summary) {
      const words = summary.split(' ');
      let currentIndex = 0;

      const intervalId = setInterval(() => {
        if (currentIndex < words.length) {
          setDisplayedSummary(prev => `${prev} ${words[currentIndex]}`.trim());
          currentIndex++;
        } else {
          clearInterval(intervalId);
        }
      }, 50);

      return () => clearInterval(intervalId);
    }
  }, [summary]);

  return (
    <div className="min-h-screen bg-black text-white p-8 relative">
      <Link 
        to="/features" 
        className="mb-12 flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-md hover:bg-white hover:text-black transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="max-w-8xl mx-auto flex justify-center gap-8">
        <div className={isSummaryVisible ? "w-1/4" : "w-1/2"}>
          <h1 className="text-4xl font-bold text-center mb-4">Get Detail Summary of the Lectures</h1>
          <p className="text-center text-xl mb-12">Just paste the YouTube lecture URL or upload the video of the lecture</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={formData.uploadedFileName || formData.videoUrl}
                onChange={handleUrlChange}
                placeholder="Enter YouTube URL or upload video"
                className="w-full bg-zinc-800 rounded-md p-3 text-white placeholder-gray-400"
                readOnly={!!formData.uploadedFileName}
              />
              <label className="cursor-pointer" title="Upload Video">
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept="video/*"
                  className="hidden" 
                />
                <svg className="stroke-blue-300 fill-none mt-2" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 25 25">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.17 11.053L11.18 15.315C10.8416 15.6932 10.3599 15.9119 9.85236 15.9178C9.34487 15.9237 8.85821 15.7162 8.51104 15.346C7.74412 14.5454 7.757 13.2788 8.54004 12.494L13.899 6.763C14.4902 6.10491 15.3315 5.72677 16.2161 5.72163C17.1006 5.71649 17.9463 6.08482 18.545 6.736C19.8222 8.14736 19.8131 10.2995 18.524 11.7L12.842 17.771C12.0334 18.5827 10.9265 19.0261 9.78113 18.9971C8.63575 18.9682 7.55268 18.4695 6.78604 17.618C5.0337 15.6414 5.07705 12.6549 6.88604 10.73L12.253 5" />
                </svg>
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full bg-white text-black font-semibold py-3 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Submit'}
            </button>
          </form>

          {error && (
            <p className="text-red-500 mt-4 text-center">{error}</p>
          )}
        </div>

        {isSummaryVisible && (
          <div className="w-3/4 max-h-[80vh] flex flex-col overflow-hidden">
            <h2 className="text-2xl font-bold mb-4">Summary:</h2>
            <div className="bg-gray-800 p-4 rounded-md flex-1 overflow-y-auto">
              <ReactMarkdown
                components={{
                  code: ({ node, inline, className, children, ...props }) => (
                    inline ? (
                      <code className="bg-gray-700 px-1 rounded" {...props}>{children}</code>
                    ) : (
                      <pre className="bg-gray-900 p-2 rounded-md overflow-auto" {...props}>
                        <code>{children}</code>
                      </pre>
                    )
                  ),
                  p: ({ children }) => (
                    <p className="mb-2">{children}</p>
                  )
                }}
              >
                {displayedSummary}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
        </div>
      )}
    </div>
  );
};

export default VideoSummarizer;