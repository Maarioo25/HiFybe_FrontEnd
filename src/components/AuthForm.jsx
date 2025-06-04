import { useState } from 'react';
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaGoogle,
  FaApple,
  FaSpotify,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const AuthForm = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, register, googleLogin, spotifyLogin, loading } = useAuth();
  const [imageError, setImageError] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  const validateRegisterForm = (form) => {
    const inputs = form.querySelectorAll('input[required]');
    let errors = [];
    inputs.forEach(input => input.classList.remove('invalid'));
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('invalid');
        errors.push(t('auth.validation.requiredFields'));
      }
    });
    if (errors.length) return { isValid: false, error: errors[0] };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      form.querySelector('input[type="email"]').classList.add('invalid');
      return { isValid: false, error: t('auth.validation.invalidEmail') };
    }

    if (registerData.password.length < 6 || registerData.password.length > 12) {
      form.querySelector('input[placeholder="' + t('auth.register.passwordPlaceholder') + '"]').classList.add('invalid');
      return { isValid: false, error: t('auth.validation.passwordLength') };
    }
    if (!registerData.confirmPassword.trim()) {
      form.querySelector('input[placeholder="' + t('auth.register.confirmPasswordPlaceholder') + '"]').classList.add('invalid');
      return { isValid: false, error: t('auth.validation.confirmPassword') };
    }
    if (registerData.password !== registerData.confirmPassword) {
      form.querySelector('input[placeholder="' + t('auth.register.confirmPasswordPlaceholder') + '"]').classList.add('invalid');
      return { isValid: false, error: t('auth.validation.passwordsMismatch') };
    }
    if (!registerData.terms) {
      return { isValid: false, error: t('auth.validation.acceptTerms') };
    }
    return { isValid: true, error: null };
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({
        email: loginData.email.trim().toLowerCase(),
        password: loginData.password
      });
    } catch (error) {
      toast.error(error.response?.data?.mensaje || t('auth.toast.loginError'));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { isValid, error } = validateRegisterForm(e.target);
    if (!isValid) {
      toast.error(error);
      return;
    }
    try {
      await register({
        nombre: registerData.nombre.trim(),
        apellidos: registerData.apellidos.trim(),
        email: registerData.email.trim().toLowerCase(),
        password: registerData.password
      });
      toast.success(t('auth.toast.welcome'));
      setRegisterData({
        nombre: '',
        apellidos: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false
      });
      setActiveTab('login');
    } catch (error) {
      console.error(error);
      // Si el backend devuelve un error relacionado con email ya registrado,
      // marcamos el input de email como inválido
      if (error.response?.data?.mensaje?.toLowerCase().includes('inicia')) {
        e.target.querySelector('input[type="email"]').classList.add('invalid');
      }
    }
  };

  return (
    <>
      {/* Logo adaptable móvil */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
        {!imageError ? (
          <img
            src="/images/logo.png"
            alt={t('auth.logoAlt')}
            className="w-full h-full object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-xl md:text-2xl font-bold text-harmony-accent">H</div>
        )}
      </div>

      {/* Contenedor principal responsive */}
      <div className="min-h-screen flex flex-col-reverse md:flex-row items-center gap-8 md:gap-20 justify-center p-4">
        {/* Sección de texto */}
        <div className="w-full md:w-auto text-center md:text-left mb-8 md:mb-0">
          <div className="backdrop-blur-sm bg-harmony-primary/30 p-6 md:p-8 rounded-2xl border border-harmony-text-secondary/10 shadow-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 relative">
              <span className="text-harmony-accent drop-shadow-lg">HiFybe</span>
            </h1>
            <p className="text-lg md:text-xl text-harmony-text-secondary leading-relaxed">
              {t('auth.tagline.line1')}<br />
              {t('auth.tagline.line2')}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="form-container w-full max-w-md rounded-lg p-6 md:p-8 relative overflow-hidden">
          {/* Tabs */}
          <div className="flex mb-6 border-b border-harmony-secondary">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 font-medium ${
                activeTab === 'login'
                  ? 'text-harmony-accent border-b-2 border-harmony-accent'
                  : 'text-harmony-text-muted'
              }`}
            >
              {t('auth.tabs.login')}
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 font-medium ${
                activeTab === 'register'
                  ? 'text-harmony-accent border-b-2 border-harmony-accent'
                  : 'text-harmony-text-muted'
              }`}
            >
              {t('auth.tabs.register')}
            </button>
          </div>

          {/* Login */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email */}
              <div className="input-group relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                <input
                  type="email"
                  placeholder={t('auth.login.emailPlaceholder')}
                  value={loginData.email}
                  onChange={e =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg text-sm"
                  required
                />
              </div>

              {/* Password */}
              <div className="input-group relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  value={loginData.password}
                  onChange={e =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="w-full pl-12 pr-12 py-2.5 rounded-lg text-sm"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-harmony-text-muted hover:text-harmony-text-primary transition-colors"
                  onMouseDown={() => setShowLoginPassword(true)}
                  onMouseUp={() => setShowLoginPassword(false)}
                  onMouseLeave={() => setShowLoginPassword(false)}
                >
                  {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary w-full py-2.5 rounded-lg font-semibold text-sm"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-harmony-dark mr-2"></div>
                    {t('auth.login.loading')}
                  </div>
                ) : (
                  t('auth.login.submit')
                )}
              </button>

              {/* Social */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-harmony-secondary"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-harmony-primary text-harmony-text-muted">
                    {t('auth.login.socialOrContinue')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={googleLogin}
                  className="social-btn flex items-center justify-center py-2 rounded-lg hover:bg-harmony-secondary/40 transition"
                  disabled={loading}
                  aria-label="Google"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-400"></div>
                  ) : (
                    <FaGoogle className="text-red-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={spotifyLogin}
                  className="social-btn flex items-center justify-center py-2 rounded-lg transition"
                  disabled={loading}
                  aria-label="Spotify"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-400"></div>
                  ) : (
                    <FaSpotify className="text-green-400" />
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Register */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="input-group relative flex-1">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                  <input
                    type="text"
                    placeholder={t('auth.register.firstNamePlaceholder')}
                    value={registerData.nombre}
                    onChange={e =>
                      setRegisterData({ ...registerData, nombre: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg text-sm"
                    required
                  />
                </div>
                <div className="input-group relative flex-1">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                  <input
                    type="text"
                    placeholder={t('auth.register.lastNamePlaceholder')}
                    value={registerData.apellidos}
                    onChange={e =>
                      setRegisterData({ ...registerData, apellidos: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="input-group relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                <input
                  type="email"
                  placeholder={t('auth.register.emailPlaceholder')}
                  value={registerData.email}
                  onChange={e =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="input-group relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  placeholder={t('auth.register.passwordPlaceholder')}
                  value={registerData.password}
                  onChange={e =>
                    setRegisterData({ ...registerData, password: e.target.value })
                  }
                  className="w-full pl-12 pr-12 py-2.5 rounded-lg text-sm"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-harmony-text-muted hover:text-harmony-text-primary transition-colors"
                  onMouseDown={() => setShowRegisterPassword(true)}
                  onMouseUp={() => setShowRegisterPassword(false)}
                  onMouseLeave={() => setShowRegisterPassword(false)}
                >
                  {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="input-group relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('auth.register.confirmPasswordPlaceholder')}
                  value={registerData.confirmPassword}
                  onChange={e =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value
                    })
                  }
                  className="w-full pl-12 pr-12 py-2.5 rounded-lg text-sm"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-harmony-text-muted hover:text-harmony-text-primary transition-colors"
                  onMouseDown={() => setShowConfirmPassword(true)}
                  onMouseUp={() => setShowConfirmPassword(false)}
                  onMouseLeave={() => setShowConfirmPassword(false)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  checked={registerData.terms}
                  onChange={e =>
                    setRegisterData({ ...registerData, terms: e.target.checked })
                  }
                  className="form-checkbox text-harmony-accent bg-harmony-secondary/20 border-harmony-text-secondary/20 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-xs text-harmony-text-secondary">
                  {t('auth.register.acceptTermsPrefix')}{' '}
                  <a href="#" className="text-harmony-accent hover:text-harmony-light">
                    {t('auth.register.terms')}
                  </a>{' '}
                  {t('auth.register.and')}{' '}
                  <a href="#" className="text-harmony-accent hover:text-harmony-light">
                    {t('auth.register.privacyPolicy')}
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2.5 rounded-lg font-semibold pulse text-sm"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-harmony-dark mr-2"></div>
                    {t('auth.register.loading')}
                  </div>
                ) : (
                  t('auth.register.submit')
                )}
              </button>

              <p className="text-center text-xs text-harmony-text-secondary">
                {t('auth.register.haveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-harmony-accent hover:text-harmony-light ml-1"
                >
                  {t('auth.register.loginLink')}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthForm;
