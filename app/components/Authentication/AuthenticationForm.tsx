// Copyright (c) 2024, Circle Technologies, LLC. All rights reserved.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use client';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useW3sContext } from '../Providers/W3sProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Button from '@mui/joy/Button';
import { signIn, signOut, useSession } from 'next-auth/react';
import { TextField } from '@/app/components/TextField';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/16/solid';
import { IconButton, Typography } from '@mui/joy';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { LockClosedIcon } from '@heroicons/react/24/outline';

const formSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email.')
    .required('Email required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password required'),
});

type FormInputs = yup.InferType<typeof formSchema>;

interface AuthenticationFormProps {
  /**
   * Is the form a sign in form
   */
  isSignIn?: boolean;
}

export const AuthenticationForm: React.FC<AuthenticationFormProps> = ({
  isSignIn = true,
}) => {
  const { register, handleSubmit, formState } = useForm<FormInputs>({
    resolver: yupResolver(formSchema),
  });
  const [loading, setLoading] = useState(false);
  const [isMasked, setIsMasked] = useState(true);
  const [formMessage, setFormMessage] = useState<string | undefined>(undefined);
  const [redirect, setRedirect] = useState<boolean>(false);
  const [isSignupFlow, setIsSignupFlow] = useState<boolean>(false);
  const router = useRouter();
  const { client } = useW3sContext();
  const { data: session } = useSession();

  useEffect(() => {
    if (redirect && client && session) {
      if (isSignupFlow) {
        // Signup flow: complete setup, then destroy session and redirect to signin
        if (session.user.challengeId) {
          client.execute(session.user.challengeId, (error, result) => {
            if (error) {
              setFormMessage('An error occurred on PIN Setup. Please try again.');
            } else if (result) {
              // Setup complete, sign out and redirect to signin
              signOut({ redirect: false }).then(() => {
                router.push('/signin');
              });
            }
          });
        } else {
          // No PIN setup needed, sign out and redirect to signin
          signOut({ redirect: false }).then(() => {
            router.push('/signin');
          });
        }
      } else {
        // Signin flow: proceed to wallets
        if (session.user.challengeId) {
          client.execute(session.user.challengeId, (error, result) => {
            if (error) {
              setFormMessage('An error occurred on PIN Setup. Please try again.');
            } else if (result) {
              // only navigate to wallets if PIN setup complete
              router.push('/wallets');
            }
          });
        } else {
          router.push('/wallets');
        }
      }
      setLoading(false);
    }
  }, [redirect, session, session?.user, client, router, isSignupFlow]);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setLoading(true);
    if (!isSignIn) {
      const res = await signIn('SignUp', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.ok) {
        setIsSignupFlow(true);
        return setRedirect(true);
      } else if (res?.error) {
        setFormMessage(res.error);
      } else {
        setFormMessage('An error occurred on Sign Up. Please try again.');
      }
      setLoading(false);
    } else {
      const res = await signIn('SignIn', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.ok) {
        return setRedirect(true);
      } else {
        setFormMessage('Invalid Credentials.');
      }
      setLoading(false);
    }
  };
  return (
    <>
      {/* <h1 className="text-center font-bold text-3xl my-2 pt-8">
        {isSignIn ? 'Sign In' : 'Sign Up'}
      </h1> */}
      <div className="text-center ">
        <div
          className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4"
          suppressHydrationWarning
        >
          <LockClosedIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {!isSignIn ? 'Welcome Back' : 'Create your account'}
        </h1>
        <p className="text-gray-600">
          {!isSignIn
            ? 'Sign in to your account to continue'
            : 'Join us and start your journey'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center bg-white rounded-2xl shadow-xl border border-gray-100 lg:max-h-[660px] lg:h-full p-5"
      >
        <div className="space-y-4">
          <TextField
            placeholder="Email"
            label=" Email Address"
            type="email"
            autoComplete="email"
            className="flex"
            error={!!formState.errors.email?.message}
            helperText={formState.errors.email?.message}
            {...register('email')}
          />
          <TextField
            placeholder="Password"
            label="Password"
            type={isMasked ? 'password' : 'text'}
            className="flex"
            autoComplete={isSignIn ? 'current-password' : 'new-password'}
            error={!!formState.errors.password?.message}
            helperText={formState.errors.password?.message}
            endDecorator={
              <IconButton onClick={() => setIsMasked((f) => !f)}>
                {isMasked ? <EyeSlashIcon /> : <EyeIcon />}
              </IconButton>
            }
            {...register('password')}
          />
          <Button
            variant="solid"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl w-full"
            size="lg"
            type="submit"
            loading={loading}
          >
            {isSignIn ? 'Sign In' : 'Sign Up'}
          </Button>
          <p className="text-yellow-500">{formMessage ? formMessage : ''}</p>
        </div>
        <div className="flex items-center justify-center">
          <Typography className="text-center text-sm font-medium">
            {isSignIn ? "Don't have an account?" : 'Already have an account?'}
          </Typography>

          <Button
            variant="plain"
            className="hover:bg-transparent hover:underline"
            onClick={
              isSignIn
                ? () => router.push('/signup')
                : () => router.push('/signin')
            }
          >
            {!isSignIn ? 'Sign In' : 'Sign Up'}
          </Button>
        </div>
      </form>
    </>
  );
};
