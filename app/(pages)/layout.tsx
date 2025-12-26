// Layout improvements
import '../globals.css';

import Image from 'next/image';
import React from 'react';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';

import { ClientProviders, Footer } from '@/app/components';
import { Button, Typography } from '@mui/joy';
import { BookOpenIcon } from '@heroicons/react/16/solid';

const inter = Inter({
  subsets: ['cyrillic'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="__next">
          <ClientProviders>
            <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
              <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
                <AppContainer>{children}</AppContainer>
              </div>
              {/* <Footer /> */}
            </div>
          </ClientProviders>
        </div>
      </body>
    </html>
  );
}

// Adds top banner/borders for
const AppContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="py-6">{children}</div>
);

export const metadata: Metadata = {
  title: 'Programmable Wallet SDK Web Sample App',
  description: "An example of how to use Circle's Programmable Wallet SDK",
};
