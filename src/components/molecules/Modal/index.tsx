import React, { FC, PropsWithChildren } from 'react';
import {
  Button,
  Modal as ChakraModal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  primaryAction?: () => void;
  actionText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  isDeleteVariant?: boolean;
};

const Modal: FC<PropsWithChildren<ModalProps>> = ({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  size = '2xl',
  actionText,
  isDeleteVariant = false,
}) => {
  const t = useTranslations();
  return (
    <ChakraModal isOpen={isOpen} onClose={onClose} size={size} isCentered>
      <ModalOverlay />
      <ModalContent py="20px">
        <ModalHeader>
          {actionText} {title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" gap="20px" flexDirection="column">
          {children}
        </ModalBody>
        {actionText && (
          <ModalFooter display="flex" justifyContent="flex-end">
            <Button
              bg="#ccc"
              color="#222"
              _hover={{
                bg: '#BABABA',
                color: '#222',
              }}
              _active={{
                bg: '#BABABA',
                color: '#222',
              }}
              _focus={{
                bg: '#BABABA',
                color: '#222',
              }}
              mr={3}
              onClick={onClose}>
              {t('close')}
            </Button>
            <Button
              onClick={primaryAction}
              colorScheme={isDeleteVariant ? 'red' : 'teal'}
              size="lg">
              {actionText}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </ChakraModal>
  );
};

export default Modal;
