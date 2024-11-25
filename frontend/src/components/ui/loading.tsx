import React from 'react';
const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen"
     style={{
      backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pattern-01-qX0NjZaOV8g9QrnkzzOeFWx1ByjbJH.png')`,
      backgroundRepeat: 'repeat',
      height: '92vh',
      width: '100vw',
    }}>
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 border-t-transparent"></div>
      <p className="mt-4 text-lg text-blue-500">Loading...</p>
    </div>
  );
};
export default Loading;