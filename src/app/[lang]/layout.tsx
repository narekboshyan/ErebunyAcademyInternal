import type { Metadata } from 'next';
import { Locale } from 'next/dist/compiled/@vercel/og/satori';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Providers from '../providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EMAF',
  description: 'Erebuni Medical Academy Foundation',
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
  const message = await getMessages();

  return (
    <html lang={params.lang}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={params.lang} messages={message}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
