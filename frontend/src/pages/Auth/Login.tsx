import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginUser } from '../../store/slices/authSlice';
import { loginSchema, LoginData } from '../../schemas/auth.schemas';
import { RootState, AppDispatch } from '../../store';
import toast from 'react-hot-toast';

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || '/';
  const loading = useSelector((state: RootState) => state.auth.loading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      toast.error((result.payload as string) || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left blue panel — Flipkart style */}
      <div className="hidden lg:flex lg:w-[40%] bg-primary-600 flex-col justify-center px-12 py-16">
        <h2 className="text-3xl font-bold text-white leading-snug mb-3">
          Login
        </h2>
        <p className="text-blue-100 text-base leading-relaxed">
          Get access to your Orders,<br />
          Wishlist and Recommendations
        </p>
        <img
          src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png"
          alt="Login illustration"
          className="mt-8 w-40 mx-auto"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile heading */}
          <h2 className="lg:hidden text-2xl font-semibold text-gray-900 mb-6 text-center">
            Sign in
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                {...register('email')}
                className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-primary-600 transition-colors ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                {...register('password')}
                className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-primary-600 transition-colors ${
                  errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              By continuing, you agree to Flipkart's{' '}
              <span className="text-primary-600 cursor-pointer hover:underline">Terms of Use</span> and{' '}
              <span className="text-primary-600 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={!!loading}
              className="w-full py-3 bg-[#fb641b] hover:bg-[#e85510] text-white font-medium text-sm rounded-sm transition-colors disabled:opacity-50 uppercase tracking-wide"
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">New to Flipkart? </span>
            <Link to="/auth/register" className="text-sm font-medium text-primary-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
