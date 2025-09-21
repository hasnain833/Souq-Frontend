import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { setProfileImage } from '../redux/slices/ProfileSlice';
import { useDispatch } from 'react-redux';
import { saveTokens, saveUser } from '../utils/TokenStorage';

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const userParam = urlParams.get('user');

    try {
      const user = userParam ? JSON.parse(decodeURIComponent(userParam)) : null;
      console.log(user.profile, "user.profile")

      if (accessToken && refreshToken && user) {
        saveTokens({ accessToken, refreshToken });
        saveUser(user);

        if (user.profile?.trim()) {
          const imageUrl = user.profile
          dispatch(setProfileImage(imageUrl));
        }
        navigate("/")
      }

      else {
        console.error("Missing auth data in URL");
        navigate('/');
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
      navigate('/');
    }

  }, [navigate]);

  return <div className="flex items-center justify-center h-screen w-screen">
    <LoadingSpinner fullScreen />
  </div>;
};

export default AuthCallback;
