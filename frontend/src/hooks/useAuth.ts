import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);
  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
  };
};
