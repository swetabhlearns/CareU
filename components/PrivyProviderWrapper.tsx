'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PrivyProvider
        appId="cmir868ry00ajl80cawmk3w55"
        config={{
          loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord', 'github'],
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
          },
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'users-without-wallets',
            },
          },
        }}
      >
        {children}
      </PrivyProvider>
    </>
  );
}
