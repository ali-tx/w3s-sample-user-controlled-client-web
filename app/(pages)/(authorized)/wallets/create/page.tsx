'use client';

import { useCreateWallet, useWallets } from '@/app/axios';
import { BackButton, Content, useW3sContext } from '@/app/components';
import { BlockchainEnum, blockchainNames } from '@/app/shared/types';
import { blockchainMeta } from '@/app/shared/utils';
import { CheckIcon } from '@heroicons/react/16/solid';
import { Button, Radio, RadioGroup, Sheet, Typography } from '@mui/joy';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function CreateWalletPage() {
  const createWalletMutation = useCreateWallet();
  const router = useRouter();
  const { client } = useW3sContext();

  const previousWalletsCount = useRef<number>(0); // Ref to hold the previous value

  const [selected, setSelected] = useState<BlockchainEnum>();
  const [loading, setLoading] = useState(false);

  const walletsQuery = useWallets(
    undefined,
    createWalletMutation.status === 'success' ? 1000 : undefined,
  );

  useEffect(() => {
    // make sure first wallet is created.
    if (
      previousWalletsCount?.current > 0 &&
      previousWalletsCount.current !== walletsQuery.data?.data.wallets.length
    ) {
      router.push('/wallets');
    }

    previousWalletsCount.current = walletsQuery.data?.data.wallets.length ?? 0;
  }, [router, walletsQuery.data?.data.wallets.length]);

  const createLoading = createWalletMutation.isLoading || loading;

  return (
    <Content>
      <nav className="pt-4">
        <BackButton onClick={() => router.push('/wallets')}>
          <Typography level="title-md">Create Wallet</Typography>
        </BackButton>
      </nav>
      {/* Select a chain to deploy your wallet */}
      Choose a network to create your wallet on
      <RadioGroup
        className="flex flex-col gap-3"
        value={selected}
        onChange={(e) => setSelected(e.currentTarget.value as BlockchainEnum)}
      >
        {[
          BlockchainEnum.MATIC_AMOY,
          BlockchainEnum.ETH_SEPOLIA,
          BlockchainEnum.AVAX_FUJI,
          BlockchainEnum.SOL_DEVNET,
        ].map((blockchain) => {
          const meta = blockchainMeta(blockchain);
          const walletExists = walletsQuery.data?.data.wallets.some(
            (wallet) => wallet.blockchain === blockchain,
          );
          const isSelected = selected === blockchain;
          const isDisabled = createLoading || walletExists;

          return (
            <label
              key={blockchain}
              className={`relative block rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-70'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <Radio
                value={blockchain}
                checked={isSelected}
                disabled={isDisabled}
                className="peer absolute inset-0 opacity-0 cursor-pointer"
                disableIcon
              />
              <div className="flex items-center justify-between p-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                    <Image
                      alt={`${blockchain}-icon`}
                      src={meta.svg}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-medium text-gray-900">
                    {blockchainNames[blockchain]}
                  </span>
                </div>

                {walletExists ? (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                    Already created
                  </span>
                ) : isSelected ? (
                  <CheckIcon className="text-blue-500" width={20} />
                ) : null}
              </div>
            </label>
          );
        })}
      </RadioGroup>
      <div className="grow" />
      {createLoading && (
        <Typography level="body-xs" className="text-center">
          Please wait while we create your brand new wallet.
        </Typography>
      )}
      <Button
        disabled={!selected}
        loading={createLoading}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 "
        onClick={async () => {
          if (selected) {
            const { data: challengeId } =
              await createWalletMutation.mutateAsync({
                blockchain: selected,
              });

            client?.execute(challengeId, (err) => {
              setLoading(true);
              if (err) {
                setLoading(false);
                return; // handle error
              }
            });
          }
        }}
      >
        Create Wallet
      </Button>
    </Content>
  );
}
