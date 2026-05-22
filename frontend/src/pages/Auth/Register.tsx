import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '../../api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import { registerSchema, RegisterData } from '../../schemas/auth.schemas';
import { AppDispatch } from '../../store';
import { useState } from 'react';
import toast from 'react-hot-toast';


const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      // Strip confirmPassword — backend schema doesn't accept it
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _cp, ...payload } = data;
      const response = await authApi.register(payload as Parameters<typeof authApi.register>[0]);
      if (response.success && response.data) {
        dispatch(setCredentials({
          user: response.data.user,
          token: response.data.accessToken,
        }));
        toast.success('Account created! Welcome to Flipkart 🎉');
        navigate('/');
      } else {
        toast.error(response.message || 'Registration failed. Try again.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left blue panel */}
      <div className="hidden lg:flex lg:w-[40%] bg-primary-600 flex-col justify-center px-12 py-16">
        <h2 className="text-3xl font-bold text-white leading-snug mb-3">
          Looks like you're new here!
        </h2>
        <p className="text-blue-100 text-base leading-relaxed">
          Sign up with your email to get started<br />
          with Flipkart
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-sm">
          <h2 className="lg:hidden text-2xl font-semibold text-gray-900 mb-6 text-center">
            Create account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                {...register('name')}
                className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-primary-600 transition-colors ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="John Doe"
                autoComplete="name"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                {...register('email')}
                className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-primary-600 transition-colors ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                {...register('password')}
                className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-primary-600 transition-colors ${
                  errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="reg-confirm-password"
                type="password"
                {...register('confirmPassword')}
                className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-primary-600 transition-colors ${
                  errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              By continuing, you agree to Flipkart's{' '}
              <span className="text-primary-600 cursor-pointer hover:underline">Terms of Use</span> and{' '}
              <span className="text-primary-600 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#fb641b] hover:bg-[#e85510] text-white font-medium text-sm rounded-sm transition-colors disabled:opacity-50 uppercase tracking-wide"
            >
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <Link to="/auth/login" className="text-sm font-medium text-primary-600 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;