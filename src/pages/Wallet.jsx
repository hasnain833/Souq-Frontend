import React from 'react';
import WalletComponent from '../components/Settings/Wallet';
import { Helmet } from 'react-helmet';

const WalletPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Wallet - Habibi ماركت</title>
        <meta
          name="description"
          content="Welcome to Habibi ماركت. We provide the best services for your needs."
        />
      </Helmet>
      <div className="container mx-auto py-8 px-4">
        <WalletComponent />
      </div>
    </div>
  );
};

export default WalletPage;
