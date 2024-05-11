'use client';
import React, { ChangeEvent, FC, useCallback, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Button as ChakraButton,
  Flex,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Country } from 'country-state-city';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { UserService } from '@/api/services/user.service';
import { FormInput, Loading } from '@/components/atoms';
import SelectLabel from '@/components/atoms/SelectLabel';
import { generateAWSUrl } from '@/utils/helpers/aws';
import { ChangePasswordValidation, UserProfileFormValidation } from '@/utils/validation/user';

const resolver = classValidatorResolver(UserProfileFormValidation);
const changePasswordResolver = classValidatorResolver(ChangePasswordValidation);

interface Props {
  sessionUser: User;
}

const Profile: FC<Props> = ({ sessionUser }) => {
  const [localImage, setLocalImage] = useState<{ file: File; localUrl: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const t = useTranslations();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UserProfileFormValidation>({
    defaultValues: {
      firstName: sessionUser?.firstName || '',
      lastName: sessionUser?.lastName || '',
      email: sessionUser?.email || '',
      state: sessionUser?.state || '',
      city: sessionUser?.city || '',
      country: sessionUser?.country || 'Armenia',
      address: sessionUser?.address || '',
    },
    resolver,
  });

  const {
    control: passwordChangeControl,
    handleSubmit: passwordChangeHandlerSubmit,
    reset,
    formState: { errors: changePasswordErrors, isSubmitting: passwordSubmitting },
  } = useForm<ChangePasswordValidation>({
    defaultValues: { confirmPassword: '', currentPassword: '', newPassword: '' },
    resolver: changePasswordResolver,
  });

  const { mutateAsync: updateUserProfileMutation } = useMutation<
    number,
    { message: string },
    UserProfileFormValidation
  >({
    mutationFn: UserService.updateUserProfile,
  });

  const { mutateAsync: changePasswordMutation } = useMutation<
    number,
    { message: string },
    ChangePasswordValidation
  >({
    mutationFn: UserService.changeUserPassword,
  });

  const onSubmit: SubmitHandler<UserProfileFormValidation> = useCallback(
    async data => {
      setIsLoading(true);
      try {
        let avatar = data.avatar;
        if (localImage) {
          // todo, need to change aws url
          avatar = `academy/users/${sessionUser?.id}/${localImage?.file.name}`;
          const { url } = await UserService.getPreSignedUrl(avatar);
          await axios.put(url, localImage.file);
        }
        await updateUserProfileMutation({ ...data });
        toast({ title: 'Success', status: 'success' });
      } catch (error) {
        console.log(error);
      } finally {
        router.refresh();
        setIsLoading(false);
      }
    },
    [localImage, router, sessionUser?.id, toast, updateUserProfileMutation],
  );

  const onFileSelect = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      setLocalImage({ file: files[0], localUrl: URL.createObjectURL(files[0]) });
    }
  }, []);

  const onPasswordChangeSubmit: SubmitHandler<ChangePasswordValidation> = useCallback(
    async data => {
      try {
        await changePasswordMutation(data);
        toast({ title: 'Success', status: 'success' });
      } catch (error) {
        console.log(error);
      } finally {
        reset();
      }
    },
    [changePasswordMutation, reset, toast],
  );

  const avatarSrc = localImage?.localUrl
    ? localImage.localUrl
    : sessionUser?.firstName
      ? generateAWSUrl(sessionUser.firstName)
      : '';

  return (
    <>
      {isSubmitting || passwordSubmitting || isLoading ? <Loading /> : null}
      <Box
        width="700px"
        margin="0 auto"
        p={{ base: '20px 16px 30px 16px', md: '96px 16px 159px 16px', xl: '96px 0 159px 0' }}>
        <Text
          display={{ base: 'none', sm: 'block' }}
          textAlign="center"
          as="h3"
          width="100%"
          fontSize="44px"
          fontWeight={700}
          lineHeight="normal">
          {t('common.editProfile')}
        </Text>
        <Flex
          gap={16}
          textAlign="center"
          paddingTop={{ base: '0', sm: '40px' }}
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems={{ base: 'center', md: 'flex-start' }}>
          <Box
            borderRadius="50%"
            overflow="hidden"
            position="relative"
            width="101px"
            height="101px">
            <Avatar
              name={`${sessionUser?.firstName} ${sessionUser?.lastName}`}
              src={avatarSrc}
              bg="#F3F4F6"
              color="#C0C0C0"
              size="xl"
            />
          </Box>
          <Box>
            <Text
              fontSize={{ base: '16px', sm: '24px' }}
              fontWeight={700}
              lineHeight="normal"
              m={{ base: '0 0 8px 0', sm: '0 0 16px 0' }}>
              {`${sessionUser?.firstName || ''} ${sessionUser?.lastName || ''}`}
            </Text>
            <Box
              cursor="pointer"
              position="relative"
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="22px">
              <ChakraButton
                height="100%"
                cursor="pointer"
                color="#1F1646"
                backgroundColor="#fff"
                _hover={{
                  color: '#1F1646',
                  backgroundColor: '#fff',
                }}
                _focus={{
                  color: '#1F1646',
                  backgroundColor: '#fff',
                }}>
                <Controller
                  name="avatar"
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field: { onChange, name } }) => (
                    <Input
                      as="input"
                      name={name}
                      type="file"
                      width="100%"
                      position="absolute"
                      left={0}
                      right={0}
                      bottom={0}
                      opacity={0}
                      cursor="pointer"
                      onChange={e => {
                        onFileSelect(e);
                        onChange(e);
                      }}
                      color="#1F1646"
                      backgroundColor="#fff"
                      _hover={{
                        color: '#1F1646',
                        backgroundColor: '#fff',
                      }}
                      _focus={{
                        color: '#1F1646',
                        backgroundColor: '#fff',
                      }}
                    />
                  )}
                />
                {t('common.changeAvatar')}
              </ChakraButton>
            </Box>
          </Box>
        </Flex>
        <Flex paddingTop={{ base: '36px', md: '40px' }} flexDirection="column" gap={24}>
          <Flex gap="24px" flexDirection={{ base: 'column', lg: 'row' }}>
            <Controller
              name="firstName"
              control={control}
              rules={{
                required: 'This field is required',
              }}
              render={({ field: { onChange, value, name } }) => (
                <FormInput
                  isRequired
                  name="firstName"
                  type="text"
                  formLabelName={t('user.firstName')}
                  placeholder={t('user.firstName')}
                  value={value}
                  handleInputChange={onChange}
                  isInvalid={!!errors[name]?.message}
                  formErrorMessage={errors[name]?.message}
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              rules={{
                required: 'This field is required',
              }}
              render={({ field: { onChange, value, name } }) => (
                <FormInput
                  isRequired
                  name="lastName"
                  type="text"
                  formLabelName={t('user.lastName')}
                  value={value}
                  placeholder={t('user.lastName')}
                  handleInputChange={onChange}
                  isInvalid={!!errors[name]?.message}
                  formErrorMessage={errors[name]?.message}
                />
              )}
            />
          </Flex>
          <Flex gap="24px" flexDirection={{ base: 'column', lg: 'row' }}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'This field is required',
              }}
              render={({ field: { onChange, value, name } }) => (
                <FormInput
                  isRequired
                  name="email"
                  type="email"
                  formLabelName={t('user.email')}
                  placeholder="you@gmail.com"
                  value={value}
                  handleInputChange={onChange}
                  isInvalid={!!errors[name]?.message}
                  formErrorMessage={errors[name]?.message}
                />
              )}
            />
            <Controller
              name="address"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormInput
                  isRequired
                  name="address"
                  type="text"
                  formLabelName={t('user.address')}
                  placeholder="33062 komitas, 5st."
                  value={value}
                  handleInputChange={onChange}
                  isInvalid={!!errors[name]?.message}
                  formErrorMessage={errors[name]?.message}
                />
              )}
            />
          </Flex>

          <Flex gap="24px" flexDirection={{ base: 'column', lg: 'row' }}>
            <Controller
              name="country"
              control={control}
              render={({ field: { onChange, value } }) => (
                <SelectLabel
                  options={Country.getAllCountries()}
                  labelName={t('user.country')}
                  valueLabel="name"
                  nameLabel="name"
                  onChange={onChange}
                  value={value}
                />
              )}
            />
            <Controller
              name="state"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormInput
                  name="state"
                  type="text"
                  formLabelName={t('user.state')}
                  placeholder={t('user.enterYourState')}
                  value={value}
                  handleInputChange={onChange}
                  isInvalid={!!errors[name]?.message}
                  formErrorMessage={errors[name]?.message}
                />
              )}
            />
            <Controller
              name="city"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormInput
                  name="city"
                  type="text"
                  formLabelName={t('user.city')}
                  placeholder={t('user.enterYourCity')}
                  value={value}
                  handleInputChange={onChange}
                  isInvalid={!!errors[name]?.message}
                  formErrorMessage={errors[name]?.message}
                />
              )}
            />
          </Flex>
          <Flex alignItems="flex-end" justifyContent="flex-end">
            <Button
              width="162px"
              height="53px"
              fontSize="16px"
              isDisabled={!isDirty}
              onClick={handleSubmit(onSubmit)}>
              {t('common.saveChanges')}
            </Button>
          </Flex>
          <Flex></Flex>
        </Flex>
        <Flex flexDirection="column" gap={24} mt={{ base: '12px', md: '40px' }}>
          <Text color="#000" fontSize={28} fontWeight={700}>
            {t('common.privateSettings')}
          </Text>
          <Flex gap={24} flexDirection="column">
            <Controller
              name="currentPassword"
              control={passwordChangeControl}
              render={({ field: { onChange, value, name } }) => (
                <FormInput
                  isRequired
                  isInvalid={!!changePasswordErrors[name]?.message}
                  name="Current Password"
                  type="password"
                  formLabelName={t('common.currentPassword')}
                  placeholder={t('common.currentPassword')}
                  value={value}
                  handleInputChange={onChange}
                  formHelperText={t('validations.passwordValidation')}
                  formErrorMessage={changePasswordErrors[name]?.message}
                />
              )}
            />
            <Controller
              name="newPassword"
              control={passwordChangeControl}
              render={({ field: { onChange, value, name } }) => (
                <FormInput
                  isRequired
                  isInvalid={!!changePasswordErrors[name]?.message}
                  name="New Password"
                  type="password"
                  formLabelName={t('common.newPassword')}
                  placeholder={t('common.newPassword')}
                  value={value}
                  handleInputChange={onChange}
                  formHelperText={t('validations.passwordValidation')}
                  formErrorMessage={changePasswordErrors[name]?.message}
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={passwordChangeControl}
              render={({ field: { onChange, value, name } }) => (
                <FormInput
                  isRequired
                  isInvalid={!!changePasswordErrors[name]?.message}
                  name="Confirm Password"
                  type="password"
                  formLabelName={t('common.confirmPassword')}
                  placeholder={t('common.confirmPassword')}
                  value={value}
                  handleInputChange={onChange}
                  formHelperText={t('validations.passwordValidation')}
                  formErrorMessage={changePasswordErrors[name]?.message}
                />
              )}
            />
          </Flex>
          <Flex alignItems="flex-end" justifyContent="flex-end">
            <Button
              width="162px"
              height="53px"
              fontSize="16px"
              onClick={passwordChangeHandlerSubmit(onPasswordChangeSubmit)}>
              {t('common.changePassword')}
            </Button>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

export default Profile;
