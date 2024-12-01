import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Checkbox,
  FormControlLabel,
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

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isRTL = i18n.language === 'fa';

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Clear the success message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('loginFailed'));
      }

      // Store the token
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || t('serverConnectionFailed'));
    }
  };

  const toggleShowPassword = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(!showPassword);
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

  const getPasswordAdornment = () => {
    const AdornmentComponent = (
      <InputAdornment position={isRTL ? "end" : "end"}>
        <IconButton
          aria-label="toggle password visibility"
          onClick={toggleShowPassword}
          edge={isRTL ? "end" : "end"}
          sx={{ visibility: formData.password ? 'visible' : 'hidden' }}
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
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
          {t('login')}
        </Typography>

        {successMessage && (
          <Alert severity="success" className="mb-4">
            {successMessage}
          </Alert>
        )}

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
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            isRTL={isRTL}
            {...getInputProps(true)}
            InputProps={{
              ...getInputProps(true),
              ...getPasswordAdornment()
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                color="primary"
              />
            }
            label={t('rememberMe')}
            className={isRTL ? 'mr-0' : 'ml-0'}
            sx={{
              marginLeft: 0,
              marginRight: 0,
              '& .MuiFormControlLabel-label': {
                marginLeft: isRTL ? 0 : '8px',
                marginRight: isRTL ? '8px' : 0,
              }
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
            {t('login')}
          </Button>
        </form>

        <div className="text-center mt-4">
          <span>{t('dontHaveAccount')} </span>
          <Button
            color="primary"
            onClick={() => navigate('/register')}
            className="font-medium"
          >
            {t('register')}
          </Button>
        </div>
      </motion.div>
    </Box>
  );
};

export default Login;
