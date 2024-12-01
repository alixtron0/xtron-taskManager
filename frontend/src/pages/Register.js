import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  TextField, 
  Button, 
  Typography, 
  IconButton, 
  Alert,
  InputAdornment,
  Box,
  styled
} from '@mui/material';
import { 
  Language, 
  ArrowBack, 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';

// Custom styled TextField for RTL support
const RTLTextField = styled(TextField)(({ theme, isRTL }) => ({
  '& label': {
    right: isRTL ? 20 : 'unset',
    left: isRTL ? 'unset' : 20,
    transformOrigin: isRTL ? 'right' : 'left',
  },
  '& legend': {
    textAlign: isRTL ? 'right' : 'left',
    marginRight: isRTL ? 15 : 0,
  },
  '& .MuiInputLabel-root[data-shrink="true"]': {
    transform: isRTL 
      ? 'translate(-20px, -9px) scale(0.75)'
      : 'translate(14px, -9px) scale(0.75)',
  }
}));

const Register = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  const isRTL = i18n.language === 'fa';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return t('passwordTooShort', { minLength });
    }
    if (!hasUpperCase || !hasLowerCase) {
      return t('passwordNeedsBothCases');
    }
    if (!hasNumbers) {
      return t('passwordNeedsNumber');
    }
    if (!hasSpecialChar) {
      return t('passwordNeedsSpecialChar');
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t('registrationFailed'));
      }

      // Show success message before redirecting
      navigate('/login', { 
        state: { 
          successMessage: t('registrationSuccessful')
        }
      });
    } catch (err) {
      setError(err.message || t('serverConnectionFailed'));
    }
  };

  const toggleShowPassword = (field, e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const toggleLanguage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newLang = i18n.language === 'en' ? 'fa' : 'en';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'fa' ? 'rtl' : 'ltr';
  };

  const getInputProps = (isPassword = false) => ({
    style: { 
      textAlign: isRTL ? 'right' : 'left',
      direction: isRTL ? 'rtl' : 'ltr'
    },
    inputProps: {
      style: {
        textAlign: isRTL ? 'right' : 'left',
        direction: isRTL ? 'rtl' : 'ltr'
      }
    }
  });

  const getPasswordAdornment = (field) => {
    const AdornmentComponent = (
      <InputAdornment position={isRTL ? "end" : "end"}>
        <IconButton
          aria-label="toggle password visibility"
          onClick={(e) => toggleShowPassword(field, e)}
          edge={isRTL ? "end" : "end"}
          sx={{ visibility: formData[field] ? 'visible' : 'hidden' }}
        >
          {showPassword[field] ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    );

    return { endAdornment: AdornmentComponent };
  };

  return (
    <Box 
      className="min-h-screen bg-gray-100 flex items-center justify-center p-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl"
      >
        <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-center mb-6`}>
          <IconButton onClick={() => navigate('/')} className="text-primary">
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col items-center">
            <IconButton onClick={toggleLanguage} className="text-primary">
              <Language />
            </IconButton>
            <span className="text-xs mt-1">
              {i18n.language === 'en' ? 'fa' : 'en'}
            </span>
          </div>
        </div>

        <Typography variant="h4" className="text-center mb-6 text-primary font-bold">
          {t('register')}
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <RTLTextField
            fullWidth
            label={t('email')}
            name="username"
            type="email"
            variant="outlined"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="email"
            className="mb-4"
            isRTL={isRTL}
            {...getInputProps()}
          />
          <RTLTextField
            fullWidth
            label={t('password')}
            name="password"
            type={showPassword.password ? 'text' : 'password'}
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            isRTL={isRTL}
            {...getInputProps(true)}
            InputProps={{
              ...getInputProps(true),
              ...getPasswordAdornment('password')
            }}
          />
          <RTLTextField
            fullWidth
            label={t('confirmPassword')}
            name="confirmPassword"
            type={showPassword.confirmPassword ? 'text' : 'password'}
            variant="outlined"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            isRTL={isRTL}
            {...getInputProps(true)}
            InputProps={{
              ...getInputProps(true),
              ...getPasswordAdornment('confirmPassword')
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            className="mt-6"
          >
            {t('signUp')}
          </Button>
        </form>

        <div className="text-center mt-4">
          <span>{t('alreadyHaveAccount')} </span>
          <Button
            color="primary"
            onClick={() => navigate('/login')}
            className="font-medium"
          >
            {t('login')}
          </Button>
        </div>
      </motion.div>
    </Box>
  );
};

export default Register;