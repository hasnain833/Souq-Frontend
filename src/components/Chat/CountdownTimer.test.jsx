import React from 'react';
import CountdownTimer from './CountdownTimer';

// Simple test component to verify countdown timer functionality
const CountdownTimerTest = () => {
  const handleExpire = () => {
    console.log('Timer expired!');
    alert('Timer expired!');
  };

  // Test with different expiration times
  const now = new Date();
  const in5Minutes = new Date(now.getTime() + 5 * 60 * 1000);
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const expired = new Date(now.getTime() - 1000); // 1 second ago

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Countdown Timer Tests</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Expires in 5 minutes (should show red):</h3>
          <CountdownTimer 
            expiresAt={in5Minutes} 
            onExpire={handleExpire}
            showIcon={true}
            size="sm"
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Expires in 2 hours (should show orange):</h3>
          <CountdownTimer 
            expiresAt={in2Hours} 
            onExpire={handleExpire}
            showIcon={true}
            size="md"
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Expires in 48 hours (should show gray):</h3>
          <CountdownTimer 
            expiresAt={in48Hours} 
            onExpire={handleExpire}
            showIcon={true}
            size="sm"
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Already expired (should show "Expired"):</h3>
          <CountdownTimer 
            expiresAt={expired} 
            onExpire={handleExpire}
            showIcon={true}
            size="sm"
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">No icon version:</h3>
          <CountdownTimer 
            expiresAt={in2Hours} 
            onExpire={handleExpire}
            showIcon={false}
            size="sm"
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• Colors should change based on time remaining (red &lt; 2hrs, orange &lt; 6hrs, gray &gt; 6hrs)</li>
          <li>• Timers should update every second</li>
          <li>• Expired timer should show "Expired" in red</li>
          <li>• When a timer reaches 0, it should trigger the onExpire callback</li>
          <li>• Format should be "Xh Ym Zs left" or just "Ym Zs left" for &lt;1 hour</li>
        </ul>
      </div>
    </div>
  );
};

export default CountdownTimerTest;
