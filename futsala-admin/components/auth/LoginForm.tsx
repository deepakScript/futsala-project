'use client';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import axios, { isAxiosError } from '@/lib/axios';
import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: 'Email is required',
    })
    .email({
      message: 'Please enter a valid email',
    }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
});

const LoginForm = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post('/auth/login', data);

      if (response.status === 200) {
        setUser(response.data.user);
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: unknown) {
      const message = isAxiosError(error) && error.response?.data?.message 
        ? error.response.data.message 
        : 'Something went wrong';
      toast.error(message);
    }
  };

  return (
    <Card className='shadow-xl border-t-4 border-t-primary'>
      <CardHeader className='space-y-1 pb-6'>
        <CardTitle className='text-3xl font-bold tracking-tight'>Sign in</CardTitle>
        <CardDescription className='text-base'>
          Enter your email and password to access the venue owner dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className='pb-8'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-5'
          >
            <FormField
              control={form.control}
              name='email'
              
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-semibold text-foreground'>
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='h-11 bg-muted/50 border-input transition-all focus:bg-background'
                      placeholder='name@example.com'
                      autoComplete='email'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
 
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-sm font-semibold text-foreground'>
                      Password
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type='password'
                      className='h-11 bg-muted/50 border-input transition-all focus:bg-background'
                      placeholder='Enter your password'
                      autoComplete='current-password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
 
            <Button className='w-full h-11 text-base font-medium shadow-sm hover:shadow-md transition-all' type='submit'>
              Continue to Dashboard
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;