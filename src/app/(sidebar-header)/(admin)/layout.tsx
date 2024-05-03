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
  return <Box marginTop="60px">{children}</Box>;
}
