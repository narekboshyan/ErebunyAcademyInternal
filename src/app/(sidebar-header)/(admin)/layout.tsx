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
  return <Box p="30px 0 0 30px">{children}</Box>;
}
