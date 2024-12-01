import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Landing Page
      'welcome': 'Welcome to xtron Task Manager',
      'getStarted': 'Get Started',
      'login': 'Login',
      'register': 'Register',
      'Organize your tasks efficiently with our modern task management solution': 'Organize your tasks efficiently with our modern task management solution',
      'Easy to Use': 'Easy to Use',
      'Real-time Updates': 'Real-time Updates',
      'Customizable': 'Customizable',
      'Intuitive interface for managing tasks': 'Intuitive interface for managing tasks',
      'Stay synchronized with your team': 'Stay synchronized with your team',
      'Personalize your task management experience': 'Personalize your task management experience',
      
      // Auth
      'email': 'Email',
      'password': 'Password',
      'currentPassword': 'Current Password',
      'newPassword': 'New Password',
      'confirmPassword': 'Confirm Password',
      'signIn': 'Sign In',
      'signUp': 'Sign Up',
      'forgotPassword': 'Forgot Password?',
      'rememberMe': 'Remember me',
      'loginFailed': 'Login failed. Please check your credentials.',
      'serverConnectionFailed': 'Could not connect to server',
      'registrationSuccessful': 'Registration successful! Please log in.',
      'registrationFailed': 'Registration failed. Please try again.',
      'passwordTooShort': 'Password must be at least {{minLength}} characters long',
      'passwordNeedsBothCases': 'Password must contain both uppercase and lowercase letters',
      'passwordNeedsNumber': 'Password must contain at least one number',
      'passwordNeedsSpecialChar': 'Password must contain at least one special character',
      'passwordsDoNotMatch': 'Passwords do not match',
      'dontHaveAccount': "Don't have an account?",
      'alreadyHaveAccount': 'Already have an account?',
      
      // Dashboard
      'myTasks': 'My Tasks',
      'addTask': 'Add Task',
      'editTask': 'Edit Task',
      'deleteTask': 'Delete Task',
      'taskTitle': 'Task Title',
      'taskDescription': 'Task Description',
      'dueDate': 'Due Date',
      'time': 'Time',
      'color': 'Color',
      'priority': 'Priority',
      'status': 'Status',
      'pin': 'Pin task',
      'unpin': 'Unpin task',
      'toggleComplete': 'Toggle completion',
      'share': 'Share',
      'shareTask': 'Share Task',
      'userEmail': 'User Email',
      'allowEdit': 'Allow editing',
      'sharedBy': 'Shared by {{name}}',
      'canEdit': 'Can edit',
      'canView': 'View only',
      'permission': 'Permission',
      
      // Task Status
      'pending': 'Pending',
      'inProgress': 'In Progress',
      'completed': 'Completed',
      
      // Share Invitations
      'shareInvitations': 'Share Invitations',
      'noInvitations': 'No pending invitations',
      'taskInvitation': '{{user}} wants to share "{{task}}" with you',
      'accept': 'Accept',
      'decline': 'Decline',
      
      // Settings
      'settings': 'Settings',
      'editProfile': 'Edit Profile',
      'newUsername': 'New Username',
      'profileUpdated': 'Profile updated successfully',
      'currentPasswordRequired': 'Current password is required',
      'invalidCurrentPassword': 'Current password is incorrect',
      
      // Misc
      'save': 'Save',
      'add': 'Add',
      'cancel': 'Cancel',
      'delete': 'Delete',
      'edit': 'Edit',
      'close': 'Close',
      'logout': 'Logout'
    }
  },
  fa: {
    translation: {
      // Landing Page
      'welcome': 'به مدریت برنامه اکسترون خوش امدید',
      'getStarted': 'شروع کنید',
      'login': 'ورود',
      'register': 'ثبت نام',
      'Organize your tasks efficiently with our modern task management solution': 'مدیریت کارآمد برنامه ها با راهکار مدرن مدیریت وظایف ما',
      'Easy to Use': 'رابطه کاربری راحت و روان',
      'Real-time Updates': 'اپدیت شدن ریل تایم',
      'Customizable': 'قابل شخصی‌سازی',
      'Intuitive interface for managing tasks': 'رابط کاربری بدیهی برای مدیریت وظایف',
      'Stay synchronized with your team': 'همگام‌سازی با تیم خود',
      'Personalize your task management experience': 'شخصی‌سازی تجربه مدیریت وظایف',
      
      // Auth
      'email': 'ایمیل',
      'password': 'رمز عبور',
      'currentPassword': 'رمز عبور فعلی',
      'newPassword': 'رمز عبور جدید',
      'confirmPassword': 'تایید رمز عبور',
      'signIn': 'ورود',
      'signUp': 'ثبت نام',
      'forgotPassword': 'رمز عبور را فراموش کرده‌اید؟',
      'rememberMe': 'مرا به خاطر بسپار',
      'loginFailed': 'ورود ناموفق. لطفا اطلاعات خود را بررسی کنید.',
      'serverConnectionFailed': 'اتصال به سرور برقرار نشد',
      'registrationSuccessful': 'ثبت نام با موفقیت انجام شد! لطفا وارد شوید.',
      'registrationFailed': 'ثبت نام ناموفق. لطفا دوباره تلاش کنید.',
      'passwordTooShort': 'رمز عبور باید حداقل {{minLength}} کاراکتر باشد',
      'passwordNeedsBothCases': 'رمز عبور باید شامل حروف بزرگ و کوچک باشد',
      'passwordNeedsNumber': 'رمز عبور باید شامل حداقل یک عدد باشد',
      'passwordNeedsSpecialChar': 'رمز عبور باید شامل حداقل یک کاراکتر خاص باشد',
      'passwordsDoNotMatch': 'رمزهای عبور مطابقت ندارند',
      'dontHaveAccount': 'حساب کاربری ندارید؟',
      'alreadyHaveAccount': ' حساب کاربری دارید؟',
      
      // Dashboard
      'myTasks': 'وظایف من',
      'addTask': 'افزودن وظیفه',
      'editTask': 'ویرایش وظیفه',
      'deleteTask': 'حذف وظیفه',
      'taskTitle': 'عنوان وظیفه',
      'taskDescription': 'توضیحات وظیفه',
      'dueDate': 'تاریخ سررسید',
      'time': 'زمان',
      'color': 'رنگ',
      'priority': 'اولویت',
      'status': 'وضعیت',
      'pin': 'سنجاق کردن',
      'unpin': 'برداشتن سنجاق',
      'toggleComplete': 'تغییر وضعیت تکمیل',
      'share': 'اشتراک‌گذاری',
      'shareTask': 'اشتراک‌گذاری وظیفه',
      'userEmail': 'ایمیل کاربر',
      'allowEdit': 'اجازه ویرایش',
      'sharedBy': 'به اشتراک گذاشته شده توسط {{name}}',
      'canEdit': 'امکان ویرایش',
      'canView': 'فقط مشاهده',
      'permission': 'سطح دسترسی',
      
      // Task Status
      'pending': 'در انتظار',
      'inProgress': 'در حال انجام',
      'completed': 'تکمیل شده',
      
      // Share Invitations
      'shareInvitations': 'دعوت‌های اشتراک‌گذاری',
      'noInvitations': 'دعوت در انتظاری وجود ندارد',
      'taskInvitation': '{{user}} می‌خواهد "{{task}}" را با شما به اشتراک بگذارد',
      'accept': 'پذیرش',
      'decline': 'رد',
      
      // Settings
      'settings': 'تنظیمات',
      'editProfile': 'ویرایش پروفایل',
      'newUsername': 'نام کاربری جدید',
      'newEmail': 'ایمیل جدید',
      'showPassword': 'نمایش رمز عبور',
      'hidePassword': 'پنهان کردن رمز عبور',
      'profileUpdated': 'پروفایل با موفقیت به‌روز شد',
      'currentPasswordRequired': 'رمز عبور فعلی الزامی است',
      'invalidCurrentPassword': 'رمز عبور فعلی نادرست است',
      
      // Misc
      'save': 'ذخیره',
      'add': 'افزودن',
      'cancel': 'لغو',
      'delete': 'حذف',
      'edit': 'ویرایش',
      'close': 'بستن',
      'logout': 'خروج'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en', // default language
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });


export default i18n;
