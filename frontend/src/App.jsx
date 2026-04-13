function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Success!
          </h1>
          <p className="text-gray-600 mb-6">
            Your React + Vite + Tailwind CSS v4 project is ready!
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">React</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">✓ Ready</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-purple-700">Vite</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">✓ Ready</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-700">Tailwind CSS v4</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">✓ Ready</span>
            </div>
          </div>
          <button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
