import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button, IconButton, Typography } from '@mui/material';
import { Language } from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const toggleLanguage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newLang = i18n.language === 'en' ? 'fa' : 'en';
    i18n.changeLanguage(newLang).then(() => {
      localStorage.setItem('language', newLang); // Save the selected language to local storage
      document.dir = newLang === 'fa' ? 'rtl' : 'ltr'; // Set the document direction
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary text-white" dir={i18n.language === 'fa' ? 'rtl' : 'ltr'}>
      <nav className="p-4">
        <div className={`container mx-auto flex ${i18n.language === 'fa' ? 'flex-row-reverse' : 'flex-row'} justify-between items-center`}>
          <motion.div
            initial={{ opacity: 0, x: i18n.language === 'fa' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h6" className="font-bold">
              XTaskManager
            </Typography>
          </motion.div>
          <div className={`flex items-center gap-4 ${i18n.language === 'fa' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="flex flex-col items-center">
              <IconButton 
                color="inherit" 
                onClick={toggleLanguage}
                className="z-50"
              >
                <Language />
              </IconButton>
              <span className="text-xs mt-1">
                {i18n.language === 'en' ? 'fa' : 'en'}
              </span>
            </div>
            <motion.div
              initial={{ opacity: 0, x: i18n.language === 'fa' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                className="hover:bg-white hover:text-primary transition-colors"
              >
                {t('login')}
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <Typography variant="h2" className="mb-6 font-bold">
            {t('welcome')}
          </Typography>
          <Typography variant="h5" className="mb-12 opacity-90">
            {t('Organize your tasks efficiently with our modern task management solution')}
          </Typography>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              color="inherit"
              size="large"
              onClick={() => navigate('/register')}
              className="bg-white text-primary hover:bg-opacity-90 px-8 py-3"
            >
              {t('getStarted')}
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { title: 'Easy to Use', description: 'Intuitive interface for managing tasks' },
            { title: 'Real-time Updates', description: 'Stay synchronized with your team' },
            { title: 'Customizable', description: 'Personalize your task management experience' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm"
            >
              <Typography variant="h6" className="mb-3 font-bold">
                {t(feature.title)}
              </Typography>
              <Typography variant="body1" className="opacity-80">
                {t(feature.description)}
              </Typography>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;
