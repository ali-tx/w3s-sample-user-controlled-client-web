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

import '../../globals.css';

import React from 'react';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';

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
          <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="mx-auto max-w-7xl  h-screen  flex items-center justify-center p-5  ">
              <AppContainer>{children}</AppContainer>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

// Adds top banner/borders for
const AppContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full h-full lg:max-h-[660px] lg:max-w-lg flex flex-col   ">
    {children}
  </div>
);

export const metadata: Metadata = {
  title: 'Programmable Wallet SDK Web Sample App',
  description: "An example of how to use Circle's Programmable Wallet SDK",
};
