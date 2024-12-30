import { useState } from 'react';

interface VideoInputProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
}

export default function VideoInput({ onSubmit, disabled }: VideoInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="video-url" className="text-sm font-medium text-gray-700">
          YouTube Video URL
        </label>
        <input
          id="video-url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={disabled}
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !url}
        className={`w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Fetch Comments
      </button>
    </form>
  );
}
