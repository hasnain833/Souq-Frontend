import React, { useState } from "react";
import SettingsTabs from "../components/Settings/SettingsTabs";
import { Helmet } from "react-helmet";

const SettingsPage = () => {

  return (
    <div className="container mx-auto flex flex-col md:flex-row min-h-screen bg-white">
      <Helmet>
        <title>Settings - Souq</title>
        <meta
          name="description"
          content="Welcome to My Website. We provide the best services for your needs."
        />
      </Helmet>
      <SettingsTabs />
    </div>
  );
};

export default SettingsPage;
