import React, { useState } from 'react';
import { testWalletAPI, getWallet, getTransactionHistory, getWalletStatistics } from '../../api/WalletService';

const WalletDebug = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      console.log(`🧪 Running ${testName}...`);
      const result = await testFunction();
      console.log(`✅ ${testName} result:`, result);
      setResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result }
      }));
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      setResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults({});
    await runTest('Test API', testWalletAPI);
    await runTest('Get Wallet', getWallet);
    await runTest('Get Transactions', () => getTransactionHistory({ limit: 5 }));
    await runTest('Get Statistics', getWalletStatistics);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Wallet API Debug</h2>
      
      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([testName, result]) => (
          <div key={testName} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center">
              {result.success ? '✅' : '❌'} {testName}
            </h3>
            
            {result.success ? (
              <div className="bg-green-50 p-3 rounded">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-red-50 p-3 rounded">
                <p className="text-red-700 text-sm">{result.error}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information</h3>
        <div className="text-sm space-y-1">
          <p><strong>Base URL:</strong> {import.meta.env.VITE_API_BASE_URL}</p>
          <p><strong>Token:</strong> {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}</p>
          <p><strong>User:</strong> {localStorage.getItem('user') ? 'Present' : 'Missing'}</p>
        </div>
      </div>
    </div>
  );
};

export default WalletDebug;
