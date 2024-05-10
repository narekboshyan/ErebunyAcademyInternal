import { FC, memo, useMemo } from 'react';
import { Box, Center, Flex, Grid, GridItem, useMediaQuery } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoIcon from '@/icons/college_main_icon.svg';
import { breakpoints } from '@/utils/constants/chakra';
import { FORGOT_PASSWORD_ROUTE, HOMEPAGE_ROUTE } from '@/utils/constants/routes';

interface Props {
  isCenter: boolean;
  children: React.ReactNode;
}

const RightComponent: FC<Props> = memo(({ isCenter, children }) =>
  isCenter ? (
    <Center h={'100%'}>
      <Box w={'100%'}>{children}</Box>
    </Center>
  ) : (
    children
  ),
);
RightComponent.displayName = 'RightComponent';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isLargerThanMd] = useMediaQuery(`(max-width: ${breakpoints.md})`);

  const isCenter = useMemo(
    () => pathname === FORGOT_PASSWORD_ROUTE && isLargerThanMd,
    [isLargerThanMd, pathname],
  );

  return (
    <Grid h={'100vh'}>
      <GridItem
        paddingY={{
          base: isCenter ? 'unset' : '40px',
          md: '60px',
          '2xl': '126px',
        }}
        paddingX={{ md: 5 }}
        maxH={'100%'}
        overflow={'auto'}>
        <RightComponent isCenter={isCenter}>
          <Flex justifyContent="center">
            <Link href={HOMEPAGE_ROUTE}>
              <LogoIcon width={80} height={80} />
            </Link>
          </Flex>
          <Flex justifyContent="center">{children}</Flex>
        </RightComponent>
      </GridItem>
    </Grid>
  );
};

export default memo(AuthWrapper);
