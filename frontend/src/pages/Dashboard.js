import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment-jalaali';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import FarsiDatePicker from '../components/FarsiDatePicker'; // Importing FarsiDatePicker
import {
  Button, IconButton, Typography, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Fab, Card, 
  CardContent, Menu, MenuItem, Checkbox, FormControlLabel,
  Badge, Tooltip, InputAdornment, styled
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Language,
  Logout,
  Settings,
  PushPin,
  Share,
  CheckCircle,
  Notifications,
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
  },
  '& .MuiInputBase-root': {
    direction: isRTL ? 'rtl' : 'ltr'
  }
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [shareDialog, setShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [invitations, setInvitations] = useState([]);
  const [showInvitations, setShowInvitations] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false
  });
  const [profileForm, setProfileForm] = useState({
    currentPassword: '',
    newPassword: '',
    newEmail: ''
  });
  const [profileError, setProfileError] = useState('');

  const isRTL = i18n.language === 'fa';

  // Get user email on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setUserEmail(data.username);
      })
      .catch(err => console.error('Error fetching user profile:', err));
    }
  }, []);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    color: '#2563eb',
    date: '',
    time: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTasks();
    fetchInvitations();
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // First sort by pin status, then by position within each group
        const pinnedTasks = data.filter(task => task.is_pinned).sort((a, b) => a.position - b.position);
        const unpinnedTasks = data.filter(task => !task.is_pinned).sort((a, b) => a.position - b.position);
        setTasks([...pinnedTasks, ...unpinnedTasks]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks/share-invitations/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleTogglePin = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/pin`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setSelectedTask(task);
      setTaskForm({
        title: task.title,
        description: task.description,
        color: task.color,
        date: task.date,
        time: task.time
      });
    } else {
      setSelectedTask(null);
      setTaskForm({
        title: '',
        description: '',
        color: '#2563eb',
        date: '',
        time: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  // Format date based on language
  const formatDate = (date) => {
    if (!date) return '';
    if (isRTL) {
      return moment(date).format('jYYYY/jMM/jDD');
    }
    return moment(date).format('YYYY-MM-DD');
  };

  // Format time based on language
  const formatTime = (time) => {
    if (!time) return '';
    return moment(time, 'HH:mm').format('HH:mm');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const url = selectedTask
        ? `http://localhost:5000/api/tasks/${selectedTask.id}`
        : 'http://localhost:5000/api/tasks';
      
      const method = selectedTask ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskForm),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchTasks();
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleShare = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shareWithUsername: shareEmail,
          permissionLevel: sharePermission
        }),
      });
      if (response.ok) {
        setShareDialog(false);
        setShareEmail('');
        setSharePermission('view');
      }
    } catch (error) {
      console.error('Error sharing task:', error);
    }
  };

  const handleInvitationResponse = async (invitationId, accept) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/share-invitations/${invitationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accept }),
      });
      if (response.ok) {
        fetchInvitations();
        fetchTasks();
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
    }
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleUpdateProfile = async () => {
    setProfileError('');

    if (profileForm.newPassword) {
      const passwordError = validatePassword(profileForm.newPassword);
      if (passwordError) {
        setProfileError(passwordError);
        return;
      }
    }

    if (profileForm.newEmail && !validateEmail(profileForm.newEmail)) {
      setProfileError(t('invalidEmail'));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword,
          newUsername: profileForm.newEmail
        }),
      });

      if (response.ok) {
        setProfileDialog(false);
        setProfileForm({
          currentPassword: '',
          newPassword: '',
          newEmail: ''
        });
        if (profileForm.newEmail) {
          setUserEmail(profileForm.newEmail);
        }
      } else {
        const data = await response.json();
        setProfileError(data.message || t('updateProfileFailed'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError(t('serverConnectionFailed'));
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fa' : 'en';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'fa' ? 'rtl' : 'ltr';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Typography variant="h6" className="font-bold text-primary">
              {isRTL ? 
                `${t('myTasks')} ${userEmail ? userEmail.split('@')[0] : ''}` :
                `${userEmail ? userEmail.split('@')[0] : ''} ${t('myTasks')}`
              }
            </Typography>
          </div>
          <div className="flex items-center gap-4">
            <Badge badgeContent={invitations.length} color="error">
              <IconButton onClick={() => setShowInvitations(true)} color="primary">
                <Notifications />
              </IconButton>
            </Badge>
            <IconButton onClick={toggleLanguage} color="primary">
              <Language />
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="primary">
              <Settings />
            </IconButton>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="h-full"
              >
                <Card 
                  className={`h-full ${task.is_completed ? 'opacity-60' : ''}`}
                  style={{ 
                    borderLeft: isRTL ? 'none' : `4px solid ${task.color}`,
                    borderRight: isRTL ? `4px solid ${task.color}` : 'none'
                  }}
                >
                  <CardContent className="h-full flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <Typography 
                        variant="h6"
                        className={`${task.is_completed ? 'line-through' : ''} ${isRTL ? 'text-right' : 'text-left'}`}
                        style={{ width: '100%' }}
                      >
                        {task.title}
                      </Typography>
                      <div className="flex gap-1">
                        {task.access_level === 'owner' && (
                          <Tooltip title={task.is_pinned ? t('unpin') : t('pin')}>
                            <IconButton
                              size="small"
                              onClick={() => handleTogglePin(task.id)}
                              color={task.is_pinned ? 'primary' : 'default'}
                            >
                              <PushPin />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={t('toggleComplete')}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleComplete(task.id)}
                            color={task.is_completed ? 'primary' : 'default'}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                    <Typography 
                      variant="body2" 
                      className={`mb-4 flex-grow ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      {task.description}
                    </Typography>
                    <div className="flex justify-between items-center mt-auto">
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(task.date)} {formatTime(task.time)}
                      </Typography>
                      <div className="flex gap-2">
                        {task.access_level === 'owner' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedTask(task);
                                setShareDialog(true);
                              }}
                              className="text-primary"
                            >
                              <Share />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(task)}
                              className="text-primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(task.id)}
                              className="text-red-500"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </div>
                    </div>
                    {task.owner_name && task.access_level !== 'owner' && (
                      <Typography variant="caption" className="mt-2 text-gray-500">
                        {t('sharedBy', { name: task.owner_name })}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <Fab
          color="primary"
          className={`fixed bottom-8 ${isRTL ? 'left-8' : 'right-8'}`}
          onClick={() => handleOpenDialog()}
        >
          <AddIcon />
        </Fab>

        {/* Task Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedTask ? t('editTask') : t('addTask')}
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <RTLTextField
                fullWidth
                label={t('taskTitle')}
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                required
                isRTL={isRTL}
              />
              <RTLTextField
                fullWidth
                label={t('taskDescription')}
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                multiline
                rows={4}
                isRTL={isRTL}
              />
              <div className="flex gap-4">
                <FarsiDatePicker
                  value={taskForm.date ? moment(taskForm.date).format('jYYYY/jMM/jDD') : ''}
                  onChange={(date) => {
                    const m = moment(date, 'jYYYY/jMM/jDD');
                    if (m.isValid()) {
                      setTaskForm({ ...taskForm, date: m.format('YYYY-MM-DD') });
                    }
                  }}
                  isRTL={isRTL} // Pass the isRTL prop
                />
                <RTLTextField
                  type="time"
                  label={t('time')}
                  value={taskForm.time}
                  onChange={(e) => setTaskForm({ ...taskForm, time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  isRTL={isRTL}
                  inputProps={{
                    style: { textAlign: 'center' }
                  }}
                />
              </div>
              <RTLTextField
                type="color"
                label={t('color')}
                value={taskForm.color}
                onChange={(e) => setTaskForm({ ...taskForm, color: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
                isRTL={isRTL}
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t('cancel')}</Button>
            <Button onClick={handleSubmit} color="primary">
              {selectedTask ? t('save') : t('add')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={shareDialog} onClose={() => setShareDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('shareTask')}</DialogTitle>
          <DialogContent>
            <div className="space-y-4 mt-4">
              <RTLTextField
                fullWidth
                label={t('userEmail')}
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                required
                isRTL={isRTL}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sharePermission === 'edit'}
                    onChange={(e) => setSharePermission(e.target.checked ? 'edit' : 'view')}
                  />
                }
                label={t('allowEdit')}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareDialog(false)}>{t('cancel')}</Button>
            <Button 
              onClick={() => handleShare(selectedTask.id)} 
              color="primary"
              disabled={!shareEmail}
            >
              {t('share')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Invitations Dialog */}
        <Dialog 
          open={showInvitations} 
          onClose={() => setShowInvitations(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('shareInvitations')}</DialogTitle>
          <DialogContent>
            {invitations.length === 0 ? (
              <Typography>{t('noInvitations')}</Typography>
            ) : (
              <div className="space-y-4 mt-4">
                {invitations.map((invitation) => (
                  <Card key={invitation.id} className="p-4">
                    <Typography variant="subtitle1">
                      {t('taskInvitation', { 
                        task: invitation.task_title,
                        user: invitation.from_username 
                      })}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-2">
                      {t('permission')}: {
                        invitation.permission_level === 'edit' ? t('canEdit') : t('canView')
                      }
                    </Typography>
                    <div className="flex justify-end gap-2">
                      <Button 
                        onClick={() => handleInvitationResponse(invitation.id, false)}
                        color="error"
                      >
                        {t('decline')}
                      </Button>
                      <Button 
                        onClick={() => handleInvitationResponse(invitation.id, true)}
                        color="primary"
                      >
                        {t('accept')}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowInvitations(false)}>{t('close')}</Button>
          </DialogActions>
        </Dialog>

        {/* Settings Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            setAnchorEl(null);
            setProfileDialog(true);
          }}>
            {t('editProfile')}
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            {t('logout')}
          </MenuItem>
        </Menu>

        {/* Profile Dialog */}
        <Dialog 
          open={profileDialog} 
          onClose={() => setProfileDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('editProfile')}</DialogTitle>
          <DialogContent>
            <div className="space-y-4 mt-4">
              {profileError && (
                <Typography color="error" className="mb-2">
                  {profileError}
                </Typography>
              )}
              <RTLTextField
                fullWidth
                label={t('currentPassword')}
                type={showPassword.currentPassword ? 'text' : 'password'}
                value={profileForm.currentPassword}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  currentPassword: e.target.value
                })}
                required
                isRTL={isRTL}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position={isRTL ? "end" : "end"}>
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword({
                          ...showPassword,
                          currentPassword: !showPassword.currentPassword
                        })}
                        edge={isRTL ? "end" : "end"}
                        sx={{ visibility: profileForm.currentPassword ? 'visible' : 'hidden' }}
                      >
                        {showPassword.currentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <RTLTextField
                fullWidth
                label={t('newEmail')}
                type="email"
                value={profileForm.newEmail}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  newEmail: e.target.value
                })}
                isRTL={isRTL}
              />
              <RTLTextField
                fullWidth
                label={t('newPassword')}
                type={showPassword.newPassword ? 'text' : 'password'}
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  newPassword: e.target.value
                })}
                isRTL={isRTL}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position={isRTL ? "end" : "end"}>
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword({
                          ...showPassword,
                          newPassword: !showPassword.newPassword
                        })}
                        edge={isRTL ? "end" : "end"}
                        sx={{ visibility: profileForm.newPassword ? 'visible' : 'hidden' }}
                      >
                        {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProfileDialog(false)}>{t('cancel')}</Button>
            <Button 
              onClick={handleUpdateProfile}
              color="primary"
              disabled={!profileForm.currentPassword}
            >
              {t('save')}
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </div>
  );
};

export default Dashboard;

