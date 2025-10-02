import React from 'react';
import { useAuthStore } from '../../stores/authStore';

const AuthDebug: React.FC = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const localStorageToken = localStorage.getItem('authToken');

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-bold text-sm mb-2">Auth Debug Info</h3>
      <div className="text-xs space-y-1">
        <div>
          <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>User:</strong> {user ? `${user.email} (${user.role})` : 'None'}
        </div>
        <div>
          <strong>Token in Store:</strong> {token ? 'Present' : 'None'}
        </div>
        <div>
          <strong>Token in localStorage:</strong> {localStorageToken ? 'Present' : 'None'}
        </div>
        <div>
          <strong>Tokens Match:</strong> {token === localStorageToken ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
