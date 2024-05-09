import type { Metadata } from 'next';
import { Box } from '@chakra-ui/react';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box p={{ base: '16px', md: '25px' }} width="100%">
      {children}
    </Box>
  );
}
