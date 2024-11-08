import React from 'react';

const WelcomeModal = ({ walletAddress, onContinue }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <div className="flex flex-col items-center">
          <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center">
            <span className="text-white">✔️</span>
          </div>
          <h2 className="text-xl font-bold mt-4">Welcome to Dynamic</h2>
          <p className="text-gray-600 mt-2">We need a bit of information to get started</p>
          <p className="text-gray-800 font-semibold mt-2">{walletAddress}</p>
          <button
            onClick={onContinue}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Continue
          </button>
          <button
            onClick={() => console.log('Log out')}
            className="mt-2 text-gray-500 hover:underline"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;