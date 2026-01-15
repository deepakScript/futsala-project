import LoginForm from '@/components/auth/LoginForm';

const AuthPage = () => {
  return (
    <div className='flex items-center justify-center min-h-[90vh] w-full px-4'>
      <div className='w-full max-w-lg'>
        <LoginForm />
      </div>
    </div>
  );
};

export default AuthPage;
