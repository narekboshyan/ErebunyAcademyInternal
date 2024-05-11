'use client';
import { FC, memo } from 'react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { languages, Locale } from '@/i18n';
import Armenian from '@/icons/armenian.svg';
import English from '@/icons/english.svg';
import Russian from '@/icons/russian.svg';

interface Props {
  lang: Locale;
}

const LanguagePicker: FC<Props> = ({ lang }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const changeLanguage = (pathname: string, locale: string) => {
    if (!pathname) return '/';
    const segments = pathname.split('/');
    segments[1] = locale;
    return `${segments.join('/')}?${new URLSearchParams(searchParams?.toString())}`;
  };

  const languageIconHander = (lng: Locale) => {
    switch (lng) {
      case 'am':
        return <Armenian />;
      case 'en':
        return <English />;
      case 'ru':
        return <Russian />;
    }
  };

  return (
    <Box width="100px">
      <Menu matchWidth>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          display="flex"
          color="#222"
          bg="transparent"
          _focusVisible={{
            bg: 'transparent',
            color: '#222',
          }}
          _focus={{
            bg: 'transparent',
            color: '#222',
          }}
          _focusWithin={{
            bg: 'transparent',
            color: '#222',
          }}
          _active={{
            bg: 'transparent',
            color: '#222',
          }}>
          <Flex gap="8px" alignItems="center">
            {languageIconHander(lang)} {t(`common.${lang}`)}
          </Flex>
        </MenuButton>
        <MenuList width="100px">
          {Object.keys(languages).map(option => (
            <MenuItem
              as={Link}
              key={option}
              display="flex"
              href={changeLanguage(pathname!, option)}
              icon={languageIconHander(option as Locale)}>
              {t(`common.${option}`)}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default memo(LanguagePicker);
