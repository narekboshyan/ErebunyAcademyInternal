'use client';
import React, { FC, memo, useCallback, useMemo } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Flex,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { Locale } from '@/i18n';
import { ROUTE_PROFILE, ROUTE_SIGN_IN } from '@/utils/constants/routes';
import { generateUserAvatar } from '@/utils/helpers/aws';
import { languagePathHelper } from '@/utils/helpers/language';
import { LinkItemProps } from '@/utils/helpers/permissionRoutes';

type ProfileNavItemProps = {
  user: User;
  onClose: () => void;
  linkItems: LinkItemProps[];
  lang: Locale;
};

const ProfileNavItem: FC<ProfileNavItemProps> = ({ user, onClose, linkItems, lang }) => {
  const router = useRouter();
  const name = useMemo(
    () => `${user?.firstName} ${user?.lastName}`,
    [user?.firstName, user?.lastName],
  );

  const logout = useCallback(() => {
    signOut({ callbackUrl: languagePathHelper(lang, ROUTE_SIGN_IN) });
    router.refresh();
  }, [router, lang]);

  return (
    <AccordionItem pl={8}>
      <AccordionButton display="flex">
        <Flex flex={6} textAlign="left" gap="8px" as={Link} href={ROUTE_PROFILE} onClick={onClose}>
          <Avatar name={name} src={generateUserAvatar(user)} bg="#F3F4F6" color="#C0C0C0" />
          <Flex flexDirection="column" gap="4px">
            <Text
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="14px"
              fontWeight={600}
              lineHeight="20px">
              {name}
            </Text>
            <Text color="#5B5B5B" fontSize="14px" fontWeight={400}>
              My Profile
            </Text>
          </Flex>
        </Flex>
        <Box flex={1}>
          <AccordionIcon />
        </Box>
      </AccordionButton>
      <AccordionPanel pb={0} bg="#F9FAFB" pt={0}>
        <Accordion allowToggle>
          {linkItems.map(({ href, name, icon, id }) => (
            <AccordionItem key={id}>
              <AccordionButton
                {...(href ? { as: Link, href } : { onClick: id === 9 ? logout : () => {} })}>
                <Flex as="span" flex="1" textAlign="left" pl="24px" alignItems="center" gap="8px">
                  {icon}
                  {name}
                </Flex>
              </AccordionButton>
            </AccordionItem>
          ))}
        </Accordion>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default memo(ProfileNavItem);
