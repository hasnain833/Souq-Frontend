import React from 'react';
import BuyerOrderStatusDisplay from '../src/components/Buyer/BuyerOrderStatusDisplay';

// Mock the API response data provided by the user
const mockTransactionData = {
  "success": true,
  "message": "Transaction status retrieved",
  "data": {
    "transactionId": "PAY_1756108205203_JRF4OH",
    "status": "processing",
    "progress": 40,
    "transactionType": "standard",
    "nextPossibleStatuses": [
      "completed"
    ],
    "statusHistory": [
      {
        "status": "paid",
        "timestamp": "2025-08-25T07:50:44.933Z",
        "description": "Payment completed via standard method",
        "updatedBy": "buyer",
        "_id": "68ac15d4ff1c048e4728ecbc",
        "id": "68ac15d4ff1c048e4728ecbc"
      },
      {
        "status": "shipped",
        "timestamp": "2025-08-26T12:55:49.487Z",
        "description": "Shipped via fedex - Tracking: dsaaaaaaaaaaaaaaaaaacrwrttttttgfwerdrf",
        "updatedBy": "seller",
        "_id": "68adaed56efbedb949b93070",
        "id": "68adaed56efbedb949b93070"
      }
    ],
    "createdAt": "2025-08-25T07:50:05.213Z",
    "updatedAt": "2025-08-26T12:55:49.488Z",
    "userRole": "buyer"
  }
};

// Mock the TransactionService API
jest.mock('../src/api/TransactionService', () => ({
  getTransactionStatus: jest.fn(() => Promise.resolve(mockTransactionData))
}));

const TestBuyerOrderStatusDisplay = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Buyer Order Status Display Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Test Data:</h2>
          <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
            {JSON.stringify(mockTransactionData.data, null, 2)}
          </pre>
        </div>

        <BuyerOrderStatusDisplay 
          transactionId="PAY_1756108205203_JRF4OH"
        />

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Expected Behavior:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Order Status:</strong> Should show "Shipped" (from statusHistory)</li>
            <li><strong>Payment Status:</strong> Should show "Paid" (from statusHistory)</li>
            <li><strong>Shipping Details:</strong> Should display the tracking description with copy button</li>
            <li><strong>Copy Functionality:</strong> Click "Copy" button to copy tracking info to clipboard</li>
            <li><strong>Status Timeline:</strong> Should show both "paid" and "shipped" status entries</li>
            <li><strong>Tracking Description:</strong> "Shipped via fedex - Tracking: dsaaaaaaaaaaaaaaaaaacrwrttttttgfwerdrf"</li>
          </ul>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">How to Test:</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Navigate to an order details page with transaction ID: PAY_1756108205203_JRF4OH</li>
            <li>The component should automatically fetch and display the transaction status</li>
            <li>Verify that "Order Status" shows "Shipped" with blue truck icon</li>
            <li>Verify that "Payment Status" shows "Paid" with green checkmark icon</li>
            <li>Check that the shipping details section appears with the tracking description</li>
            <li>Click the "Copy" button to test clipboard functionality</li>
            <li>Verify the status timeline shows both paid and shipped entries in reverse chronological order</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestBuyerOrderStatusDisplay;