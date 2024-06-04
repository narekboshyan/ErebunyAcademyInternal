'use client';
import React, { useEffect, useState } from 'react';
import { DeleteIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Heading, HStack, IconButton, Stack } from '@chakra-ui/react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { LanguageTypeEnum, TestQuestionLevelEnum, TestQuestionTypeEnum } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { TestQuestionService } from '@/api/services/test-question.service';
import { SelectLabel } from '@/components/atoms';
import FormTextarea from '@/components/atoms/FormTextarea';
import AnswersControl from '@/components/molecules/AnswerControl';
import ExamsUploadByExcel, { UploadedExcelData } from '@/components/organisms/ExamsUploadByExcel';
import { Locale } from '@/i18n';
import { ROUTE_SUBJECTS } from '@/utils/constants/routes';
import { languagePathHelper } from '@/utils/helpers/language';
import { Maybe } from '@/utils/models/common';
import { TestQuestionValidation } from '@/utils/validation/exam';

const questionTypes = [
  {
    id: TestQuestionTypeEnum.RADIO,
    type: 'Single',
  },
  {
    id: TestQuestionTypeEnum.CHECKBOX,
    type: 'Multiple',
  },
];

const skillLevels = [
  {
    id: TestQuestionLevelEnum.EASY,
    skillLevel: 'Beginner',
  },
  {
    id: TestQuestionLevelEnum.MEDIUM,
    skillLevel: 'Intermediate',
  },
  {
    id: TestQuestionLevelEnum.HARD,
    skillLevel: 'Advanced',
  },
];

const initValue = {
  title: '',
  type: TestQuestionTypeEnum.CHECKBOX,
  subjectId: '',
  skillLevel: TestQuestionLevelEnum.EASY,
  options: [{ title: '', isRightAnswer: false }],
  lang: LanguageTypeEnum.AM,
};

const resolver = classValidatorResolver(TestQuestionValidation);

const CreateTestQuestions = ({
  params: { lang, subjectId },
  searchParams: { language },
}: {
  params: { lang: Locale; subjectId: string };
  searchParams: { language: LanguageTypeEnum };
}) => {
  const router = useRouter();
  const t = useTranslations();
  const [excelData, setExcelData] = useState<UploadedExcelData>(null);

  const {
    control,
    watch,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<TestQuestionValidation>({
    resolver,
    defaultValues: {
      questions: [initValue],
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: 'questions',
  });

  const { mutate, isPending } = useMutation<boolean, { message: string }, TestQuestionValidation>({
    mutationFn: data => TestQuestionService.createTestQuestions(data, subjectId, language),
  });

  const onSubmit: SubmitHandler<TestQuestionValidation> = data => {
    mutate(data, {
      onSuccess: () => {
        router.push(languagePathHelper(lang || 'am', ROUTE_SUBJECTS));
      },
    });
  };

  useEffect(() => {
    if (excelData) {
      reset({
        questions: excelData.map(item => ({
          title: item.question as string,
          type:
            item.answers?.length || 0 > 1
              ? TestQuestionTypeEnum.CHECKBOX
              : TestQuestionTypeEnum.RADIO,
          skillLevel: item.level as TestQuestionLevelEnum,
          lang: language,
          options: Array.isArray(item.options)
            ? item.options.map(opt => {
                if (!opt) {
                  return {};
                }
                const arr = Object.entries(opt);
                return {
                  title: arr[0][1] as string,
                  isRightAnswer: !!(item.answers as Maybe<string[]>)?.includes(arr[0][0]),
                };
              })
            : [],
        })),
      });
      setExcelData(null);
    }
  }, [excelData, language, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box my={{ base: '25px', md: '50px' }}>
        <HStack spacing={10}>
          <Heading textAlign="center" fontSize={{ base: '22px', md: '28px' }}>
            {t('createExamQuestions')}
          </Heading>
          <ExamsUploadByExcel setUploadedResults={setExcelData} />
        </HStack>
        {questionFields.map((question, questionIndex) => {
          const questionType = watch(`questions.${questionIndex}.type`);
          return (
            <Stack
              key={question.id}
              borderWidth="1px"
              borderRadius="lg"
              px="24px"
              py="32px"
              mt="20px">
              <Flex justifyContent="space-between" alignItems="center">
                <Heading size="md">
                  {t('question')} {questionIndex + 1}
                </Heading>
                {questionIndex > 0 && (
                  <IconButton
                    size={{ base: 'sm', lg: 'md' }}
                    colorScheme="red"
                    aria-label={t('deleteQuestion')}
                    icon={<DeleteIcon />}
                    onClick={() => removeQuestion(questionIndex)}
                  />
                )}
              </Flex>
              <Flex
                mb="15px"
                gap={{ base: '20px', lg: '30px' }}
                flexDirection={{ base: 'column', lg: 'row' }}>
                <Controller
                  name={`questions.${questionIndex}.title`}
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <FormTextarea
                      isRequired
                      placeholder={t('question')}
                      name={name}
                      formLabelName={t('question')}
                      value={value}
                      handleInputChange={onChange}
                    />
                  )}
                />
                <Controller
                  name={`questions.${questionIndex}.type`}
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <SelectLabel
                      isRequired
                      name={name}
                      options={questionTypes}
                      labelName={t('questionType')}
                      valueLabel="id"
                      nameLabel="type"
                      onChange={onChange}
                      value={value}
                    />
                  )}
                />
                <Controller
                  name={`questions.${questionIndex}.skillLevel`}
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <SelectLabel
                      isRequired
                      name={name}
                      options={skillLevels}
                      labelName={t('skillLevel')}
                      valueLabel="id"
                      nameLabel="skillLevel"
                      onChange={onChange}
                      value={value}
                    />
                  )}
                />
              </Flex>
              <AnswersControl
                control={control}
                questionIndex={questionIndex}
                questionType={questionType}
              />
              {questionIndex === questionFields.length - 1 && (
                <Button
                  mt={5}
                  onClick={() => appendQuestion(initValue)}
                  width="50%"
                  fontSize={{ base: '16px', lg: '20px' }}>
                  {t('addQuestion')}
                </Button>
              )}
            </Stack>
          );
        })}
        <Flex justifyContent="flex-end">
          <Button
            mt="15px"
            colorScheme="teal"
            type="submit"
            isLoading={isPending}
            fontSize={{ base: '16px', lg: '20px' }}
            overflowWrap="break-word"
            whiteSpace="normal"
            isDisabled={!isValid}>
            {t('submitTestQuestions')}
          </Button>
        </Flex>
      </Box>
    </form>
  );
};

export default CreateTestQuestions;
