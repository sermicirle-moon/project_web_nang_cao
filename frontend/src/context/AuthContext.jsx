import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const fullName = localStorage.getItem('fullName');
    const username = localStorage.getItem('username');
    const avatarUrl = localStorage.getItem('avatarUrl');
    if (storedToken && fullName) {
      setToken(storedToken);
      setUser({ fullName, username, avatarUrl });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('fullName', userData.fullName);
    localStorage.setItem('username', userData.username);
    if (userData.avatarUrl) localStorage.setItem('avatarUrl', userData.avatarUrl);
    setToken(userData.token);
    setUser({ fullName: userData.fullName, username: userData.username, avatarUrl: userData.avatarUrl });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    localStorage.removeItem('username');
    localStorage.removeItem('avatarUrl');
    setToken(null);
    setUser(null);
  };
  const updateUser = (updates) => {
    setUser(prev => {
      const newUser = { ...prev, ...updates };
      if (updates.fullName) localStorage.setItem('fullName', updates.fullName);
      if (updates.avatarUrl) localStorage.setItem('avatarUrl', updates.avatarUrl);
      return newUser;
    });
  };
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};