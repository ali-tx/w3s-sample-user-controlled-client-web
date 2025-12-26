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
import Button from '@mui/joy/Button';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/16/solid';
import FaucetSvg from '/public/Faucet.svg';
import { TokenBalance } from '@/app/shared/types';
import { useRouter } from 'next/navigation';
import {
  useWallet,
  useWalletBalances,
  useFaucetDripMutation,
} from '@/app/axios';
import { LoadingWrapper, Content, TokenCard } from '@/app/components';
import { Typography, Card, CardContent, Box, Stack, Chip, Alert, CircularProgress } from '@mui/joy';
import { useCallback, useMemo } from 'react';
import { blockchainMeta, tokenHelper } from '../shared/utils';
import { WalletActivity } from './WalletActivity';
import Image from 'next/image';

interface WalletDetailsProps {
  id: string;
}

export const WalletDetails: React.FC<WalletDetailsProps> = ({ id }) => {
  const router = useRouter();

  const { data: balanceData, isLoading } = useWalletBalances(id);
  const { data: walletData } = useWallet(id);
  const dripFaucet = useFaucetDripMutation();

  const mainBalance = useMemo(() => {
    if (!balanceData?.data) {
      return;
    }

    const sorted = balanceData.data.tokenBalances.sort((a, b) => {
      // if native token with amount go first
      if (a.token.isNative && parseFloat(a.amount) > 0) {
        return -1;
      }

      if (parseFloat(a.amount) > parseFloat(b.amount)) {
        return -1;
      }

      return 1;
    });

    return sorted[0];
  }, [balanceData?.data]);

  const getUsdc = useCallback(async () => {
    await dripFaucet.mutateAsync({
      address: walletData?.data.wallet.address ?? '',
      blockchain: walletData?.data.wallet.blockchain ?? '',
    });
  }, [
    dripFaucet,
    walletData?.data.wallet.address,
    walletData?.data.wallet.blockchain,
  ]);

  const nativeTokenInfo = tokenHelper(mainBalance?.token.name);
  const blockchainInfo = blockchainMeta(walletData?.data.wallet.blockchain);
  const isWalletEmpty =
    !isLoading && balanceData?.data.tokenBalances.length === 0;

  return (
    <LoadingWrapper isLoading={isLoading}>
      <Content>
        <Box className="space-y-8">
          {/* Header with Network Info */}
          <Box className="flex justify-between items-center">
            <Box>
              <Typography level="h4" className="font-bold text-gray-900">
                Wallet Details
              </Typography>
              <Typography level="body-sm" className="text-gray-500 mt-1">
                {walletData?.data.wallet.address ?
                  `${walletData.data.wallet.address.slice(0, 6)}...${walletData.data.wallet.address.slice(-4)}` :
                  'Loading address...'
                }
              </Typography>
            </Box>
            <Chip
              size="lg"
              variant="outlined"
              className="border-gray-200 bg-gray-50"
              startDecorator={
                <Image
                  src={blockchainInfo.logoUrl}
                  alt={blockchainInfo.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              }
            >
              {blockchainInfo.name}
            </Chip>
          </Box>

          {/* Main Balance Card - Enhanced Design */}
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white shadow-2xl rounded-2xl border-0 overflow-hidden">
            <CardContent className="p-8">
              <Box className="flex justify-between items-start mb-6">
                <Box>
                  <Typography level="body-xs" className="text-blue-100/80 font-medium mb-1">
                    TOTAL BALANCE
                  </Typography>
                  <Typography className="text-5xl font-bold tracking-tight" fontWeight={800}>
                    {mainBalance?.amount ?? '0'}
                  </Typography>
                  <Typography level="title-lg" className="text-blue-100/90 mt-2">
                    {mainBalance
                      ? nativeTokenInfo.name
                      : blockchainInfo.nativeTokenName}
                  </Typography>
                </Box>
                <Box className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <Image
                    src={blockchainInfo.logoUrl}
                    alt={blockchainInfo.name}
                    width={48}
                    height={48}
                    className="drop-shadow-lg"
                  />
                </Box>
              </Box>

              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="mt-8">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                  startDecorator={<ArrowDownIcon width={20} />}
                  onClick={() => router.push(`/wallets/${id}/deposit`)}
                  fullWidth
                >
                  Deposit
                </Button>

                {isWalletEmpty ? (
                  <Button
                    size="lg"
                    disabled={
                      dripFaucet.isLoading ||
                      dripFaucet.isSuccess ||
                      dripFaucet.isError
                    }
                    variant="outlined"
                    className="border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl"
                    startDecorator={
                      dripFaucet.isLoading ? (
                        <CircularProgress size="sm" color="neutral" />
                      ) : (
                        <FaucetSvg width={20} />
                      )
                    }
                    onClick={getUsdc}
                    fullWidth
                  >
                    {dripFaucet.isLoading ? 'Requesting...' : 'Get USDC'}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-white/20 text-white hover:bg-white/30 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                    startDecorator={<ArrowUpIcon width={20} />}
                    onClick={() => router.push(`/wallets/${id}/send`)}
                    fullWidth
                  >
                    Send
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Faucet Status Messages */}
          {dripFaucet.isSuccess && (
            <Alert
              variant="soft"
              color="success"
              className="rounded-xl border-l-4 border-green-500"
            >
              <Typography level="body-sm" className="font-medium">
                🎉 Funds requested! Please wait up to 10 seconds for the transaction to settle.
              </Typography>
            </Alert>
          )}

          {dripFaucet.isError && (
            <Alert
              variant="soft"
              color="danger"
              className="rounded-xl border-l-4 border-red-500"
            >
              <Typography level="body-sm" className="font-medium">
                ⚠️ There was an issue requesting tokens. Please use our{' '}
                <a
                  href="https://faucet.circle.com"
                  className="no-underline text-blue-600 font-semibold hover:text-blue-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  public faucet
                </a>{' '}
                instead.
              </Typography>
            </Alert>
          )}

          {/* Empty State */}
          {isWalletEmpty && (dripFaucet?.status === 'idle' || dripFaucet?.status === 'loading') && (
            <Card className="shadow-lg rounded-2xl border border-gray-100">
              <CardContent className="p-10 text-center">
                <Box className="mb-6">
                  <Image
                    alt="empty wallet"
                    src={`/NoTokens.svg`}
                    height={140}
                    width={140}
                    className="mx-auto opacity-80"
                  />
                </Box>
                <Typography level="h5" className="text-gray-700 mb-2 font-bold">
                  No tokens yet
                </Typography>
                <Typography level="body-sm" className="text-gray-500 max-w-md mx-auto">
                  Your wallet is empty. Deposit funds or get USDC from the faucet to get started.
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Tokens Section */}
          {!isWalletEmpty && (
            <Card className="shadow-lg rounded-2xl border border-gray-100">
              <CardContent className="p-6">
                <Typography
                  level="title-lg"
                  className="font-bold text-gray-900 mb-6"
                >
                  Tokens
                </Typography>
                <Box className="space-y-4">
                  {balanceData?.data.tokenBalances.map(
                    (token: TokenBalance) => (
                      <TokenCard
                        key={token?.token.name}
                        amount={token?.amount}
                        token={token.token}
                      />
                    ),
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Activity Section */}
          {!isWalletEmpty && (
            <Card className="shadow-lg rounded-2xl border border-gray-100">
              <CardContent className="p-6">
                <Box className="flex justify-between items-center mb-6">
                  <Typography
                    level="title-lg"
                    className="font-bold text-gray-900"
                  >
                    Recent Activity
                  </Typography>
                  <Button
                    size="sm"
                    variant="plain"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => router.push(`/wallets/${id}/activity`)}
                  >
                    View All
                  </Button>
                </Box>
                <WalletActivity id={id} />
              </CardContent>
            </Card>
          )}

          {/* Quick Stats Row */}
          {!isWalletEmpty && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Card variant="outlined" className="rounded-xl flex-1">
                <CardContent className="p-4">
                  <Typography level="body-sm" className="text-gray-500 mb-1">
                    Total Tokens
                  </Typography>
                  <Typography level="h4" className="font-bold text-gray-900">
                    {balanceData?.data.tokenBalances.length || 0}
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" className="rounded-xl flex-1">
                <CardContent className="p-4">
                  <Typography level="body-sm" className="text-gray-500 mb-1">
                    Network
                  </Typography>
                  <Typography level="h4" className="font-bold text-gray-900">
                    {blockchainInfo.name}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          )}
        </Box>
      </Content>
    </LoadingWrapper>
  );
};
