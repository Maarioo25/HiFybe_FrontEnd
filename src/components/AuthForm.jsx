// src/components/AuthForm.jsx
import { useState, useEffect } from 'react';
import {
  FaEnvelope, FaLock, FaUser,
  FaGoogle, FaApple, FaSpotify,
  FaEye, FaEyeSlash
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, register, googleLogin, spotifyLogin, loading } = useAuth();
  const [imageError, setImageError] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  // Reset invalid class on tab switch
  useEffect(() => {
    document.querySelectorAll('input.invalid').forEach(i => i.classList.remove('invalid'));
  }, [activeTab]);

  const validateRegisterForm = (form) => {
    const inputs = form.querySelectorAll('input[required]');
    let errors = [];
    inputs.forEach(input => input.classList.remove('invalid'));
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('invalid');
        errors.push('Por favor, completa todos los campos requeridos');
      }
    });
    if (errors.length) return { isValid: false, error: errors[0] };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      const emailInput = form.querySelector('input[type="email"]');
      emailInput.classList.add('invalid');
      return { isValid: false, error: 'Por favor, ingresa un email válido' };
    }

    if (registerData.password.length < 6 || registerData.password.length > 12) {
      const pw = form.querySelector('input[placeholder="Contraseña"]');
      pw.classList.add('invalid');
      return {
        isValid: false,
        error: registerData.password.length < 6
          ? 'La contraseña debe tener al menos 6 caracteres'
          : 'La contraseña debe tener un máximo de 12 caracteres'
      };
    }

    if (!registerData.confirmPassword.trim()) {
      const cf = form.querySelector('input[placeholder="Repetir contraseña"]');
      cf.classList.add('invalid');
      return { isValid: false, error: 'Debes confirmar tu contraseña' };
    }
    if (registerData.password !== registerData.confirmPassword) {
      const cf = form.querySelector('input[placeholder="Repetir contraseña"]');
      cf.classList.add('invalid');
      return { isValid: false, error: 'Las contraseñas no coinciden' };
    }

    if (!registerData.terms) {
      return { isValid: false, error: 'Debes aceptar los términos y condiciones' };
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
      const msg = error.response?.data?.mensaje || 'Error al iniciar sesión';
      toast.error(msg);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const { isValid, error } = validateRegisterForm(form);
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
      toast.success('Bienvenido a HiFybe!');
      setRegisterData({
        nombre: '', apellidos: '',
        email: '', password: '',
        confirmPassword: '', terms: false
      });
      setActiveTab('login');
    } catch (error) {
      console.error("Error en registro:", error);
      toast.error(
        error.response?.data?.mensaje || 'Error al crear la cuenta'
      );
    }
  };

  return (
    <>
      {/* Logo */}
      <div className="absolute top-4 left-4 w-10 h-10 sm:w-12 sm:h-12">
        {!imageError ? (
          <img
            src="/images/logo.png"
            alt="HiFybe Logo"
            className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-harmony-accent">
            H
          </div>
        )}
      </div>

      {/* Main container */}
      <div className="min-h-screen flex flex-col-reverse sm:flex-row items-center justify-center px-4 sm:px-0 gap-8 sm:gap-20">
        {/* Hero text */}
        <div className="w-full sm:w-1/2 text-center sm:text-left">
          <div className="backdrop-blur-sm bg-harmony-primary/30 p-6 sm:p-8 rounded-2xl border border-harmony-text-secondary/10 shadow-2xl">
            <h1 className="text-4xl sm:text-6xl font-bold mb-3">
              <span className="text-harmony-accent drop-shadow-lg">HiFybe</span>
            </h1>
            <p className="text-lg sm:text-xl text-harmony-text-secondary leading-relaxed">
              Conecta con la música<br />y con quienes la aman
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="form-container w-full max-w-md">
          <div className="bg-harmony-primary/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-harmony-text-secondary/10 shadow-lg">
            {/* Tabs */}
            <div className="flex mb-6 border-b border-harmony-secondary">
              {['login', 'register'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm sm:text-base font-medium ${
                    activeTab === tab
                      ? 'text-harmony-accent border-b-2 border-harmony-accent'
                      : 'text-harmony-text-muted'
                  }`}
                >
                  {tab === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                </button>
              ))}
            </div>

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email */}
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={loginData.email}
                    onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg text-sm sm:text-base"
                    required
                  />
                </div>
                {/* Password */}
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={loginData.password}
                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-2.5 rounded-lg text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-harmony-text-muted"
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
                  className="btn-primary w-full py-2.5 rounded-lg font-semibold text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
                {/* Or */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-harmony-secondary" />
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm text-harmony-text-muted">
                    <span className="px-2 bg-harmony-primary">O continúa con</span>
                  </div>
                </div>
                {/* Social */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={googleLogin}
                    className="social-btn p-2 sm:p-3 rounded-lg border hover:bg-harmony-secondary/40 transition"
                    disabled={loading}
                  >
                    <FaGoogle className="text-red-400" />
                  </button>
                  <button
                    type="button"
                    onClick={spotifyLogin}
                    className="social-btn p-2 sm:p-3 rounded-lg border hover:bg-harmony-secondary/40 transition"
                    disabled={loading}
                  >
                    <FaSpotify className="text-green-400" />
                  </button>
                  <button
                    type="button"
                    className="social-btn p-2 sm:p-3 rounded-lg border-opacity-0 opacity-0"
                    disabled
                  >
                    {/* Placeholder for third icon if needed */}
                    <FaApple className="text-gray-400" />
                  </button>
                </div>
              </form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={registerData.nombre}
                      onChange={e => setRegisterData({ ...registerData, nombre: e.target.value })}
                      className="w-full pl-12 pr-4 py-2.5 rounded-lg text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="relative flex-1">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                    <input
                      type="text"
                      placeholder="Apellidos"
                      value={registerData.apellidos}
                      onChange={e => setRegisterData({ ...registerData, apellidos: e.target.value })}
                      className="w-full pl-12 pr-4 py-2.5 rounded-lg text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
                {/* Email */}
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={registerData.email}
                    onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg text-sm sm:text-base"
                    required
                  />
                </div>
                {/* Password */}
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={registerData.password}
                    onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-2.5 rounded-lg text-sm sm:text-base"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-harmony-text-muted"
                    onMouseDown={() => setShowRegisterPassword(true)}
                    onMouseUp={() => setShowRegisterPassword(false)}
                    onMouseLeave={() => setShowRegisterPassword(false)}
                  >
                    {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {/* Confirm */}
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-harmony-text-muted" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repetir contraseña"
                    value={registerData.confirmPassword}
                    onChange={e => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-2.5 rounded-lg text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-harmony-text-muted"
                    onMouseDown={() => setShowConfirmPassword(true)}
                    onMouseUp={() => setShowConfirmPassword(false)}
                    onMouseLeave={() => setShowConfirmPassword(false)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {/* Terms */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={registerData.terms}
                    onChange={e => setRegisterData({ ...registerData, terms: e.target.checked })}
                    className="form-checkbox text-harmony-accent bg-harmony-secondary/20 border-harmony-text-secondary/20 rounded"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 text-xs sm:text-sm text-harmony-text-secondary">
                    Acepto los <a href="#" className="text-harmony-accent hover:text-harmony-light">Términos</a> y <a href="#" className="text-harmony-accent hover:text-harmony-light">Política de Privacidad</a>
                  </label>
                </div>
                {/* Submit */}
                <button
                  type="submit"
                  className="btn-primary w-full py-2.5 rounded-lg font-semibold text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
                {/* Switch to login */}
                <p className="text-center text-xs sm:text-sm text-harmony-text-secondary">
                  ¿Ya tienes una cuenta?
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-harmony-accent hover:text-harmony-light ml-1"
                  >
                    Inicia sesión
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthForm;
