'use client';
import React, { FC, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { ThematicPlanDescription } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { v4 } from 'uuid';
import { AcademicRegisterService } from '@/api/services/academic-register.service';
import { SelectLabel } from '@/components/atoms';
import Modal from '@/components/molecules/Modal';
import SimpleTable from '@/components/organisms/SimpleTable';
import { markAttentandOptionData, periodListData } from '@/utils/constants/common';
import { GetScheduleByIdModel } from '@/utils/models/schedule';
import { CreateStudentAttentdanceRecordValidation } from '@/utils/validation/academic-register';

type AcademicRegisterProps = {
  schedule: GetScheduleByIdModel;
};

const resolver = classValidatorResolver(CreateStudentAttentdanceRecordValidation);

const AcademicRegister: FC<AcademicRegisterProps> = ({ schedule }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedLessonOfTheDay = searchParams?.get('lessonOfTheDay');
  const [lessonOfTheDay, setLessonOfTheDay] = useState('');
  const t = useTranslations();

  console.log({ schedule });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid },
  } = useForm<CreateStudentAttentdanceRecordValidation>({
    resolver,
    defaultValues: {
      students: schedule.courseGroup.students.map(student => ({
        id: student.id,
        isPresent: true,
        mark: '',
      })),
      thematicPlanIds: [],
    },
  });

  const selectedPeriodData = periodListData.find(p => p.id === +(selectedLessonOfTheDay || 0));

  const { mutate: createStudentMark } = useMutation({
    mutationFn: (data: CreateStudentAttentdanceRecordValidation) =>
      AcademicRegisterService.createStudentMark(
        data,
        schedule.id,
        selectedLessonOfTheDay || lessonOfTheDay,
      ),
  });

  const { fields } = useFieldArray({
    control,
    name: 'students',
  });

  const { isOpen: chooseLessonModalOpen, onClose: closeChooseLessonModal } = useDisclosure({
    defaultIsOpen: schedule.type === 'CYCLIC' && !selectedLessonOfTheDay,
  });

  const onSubmit = (data: CreateStudentAttentdanceRecordValidation) => {
    createStudentMark(data);
  };

  const thematicPlanIds = watch('thematicPlanIds');

  const handleCheckboxChange = (id: string) => {
    if (thematicPlanIds.includes(id)) {
      setValue(
        'thematicPlanIds',
        thematicPlanIds.filter(existingId => existingId !== id),
      );
    } else {
      setValue('thematicPlanIds', [...thematicPlanIds, id]);
    }
  };

  const columnHelperStudents = createColumnHelper<ThematicPlanDescription>();

  const studentsColumns = [
    columnHelperStudents.accessor('id', {
      id: v4(),
      cell: info => (
        <Checkbox
          isChecked={thematicPlanIds.includes(info.getValue())}
          onChange={() => handleCheckboxChange(info.getValue())}
        />
      ),
      header: undefined,
    }),
    columnHelperStudents.accessor('title', {
      id: v4(),
      cell: info => info.getValue(),
      header: t('title'),
    }),
    columnHelperStudents.accessor('hour', {
      id: v4(),
      cell: info => info.getValue(),
      header: t('totalHours'),
    }),
  ];

  return (
    <Box width="100%" mt="50px" mx="20px">
      <Text fontSize={{ base: '18px', sm: '24px' }} fontWeight={700} mb="15px">
        {t('forLessonTitleStart')}{' '}
        <Text as="span" color="#319795">
          {selectedPeriodData?.title}
        </Text>{' '}
        {t('forLessonTitleEnd')}
      </Text>
      <Box overflowY="auto" maxWidth={{ base: '340px', sm: '670px', lg: '700px', xl: '100%' }}>
        <Table>
          <Thead>
            <Tr>
              <Th>{t('student')}</Th>
              <Th>{t('presentTitle')}</Th>
              <Th>{t('marks')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {fields.map((field, index) => {
              const isPresent = watch(`students.${index}.isPresent`);
              return (
                <Tr key={field.id} height="32px">
                  <Td minWidth="200px">
                    {schedule.courseGroup.students[index].user.firstName}{' '}
                    {schedule.courseGroup.students[index].user.lastName}
                  </Td>
                  <Td border="1px solid #eee" minWidth="200px">
                    <Controller
                      control={control}
                      name={`students.${index}.isPresent`}
                      render={({ field }) => (
                        <Checkbox
                          isChecked={field.value}
                          onChange={e => {
                            field.onChange(e);
                            if (!e.target.checked) {
                              setValue(`students.${index}.mark`, '');
                            }
                          }}
                          defaultChecked>
                          {t('present')}
                        </Checkbox>
                      )}
                    />
                  </Td>
                  <Td border="1px solid #eee" minWidth="200px">
                    <Controller
                      control={control}
                      name={`students.${index}.mark`}
                      render={({ field }) => (
                        <SelectLabel
                          isRequired
                          options={markAttentandOptionData}
                          valueLabel="id"
                          nameLabel="title"
                          onChange={e => {
                            field.onChange(e);
                            if (e.target.value) {
                              setValue(`students.${index}.isPresent`, true);
                            }
                          }}
                          value={field.value}
                          isDisabled={!selectedLessonOfTheDay || !isPresent}
                        />
                      )}
                    />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
      <Flex justifyContent="space-between" mt="20px">
        <Button isDisabled={!isValid} onClick={handleSubmit(onSubmit)}>
          {t('endClass')}
        </Button>
      </Flex>

      <Flex flexDirection="column">
        {schedule.thematicPlans.map(thematicPlan => (
          <>
            <SimpleTable
              key={thematicPlan.id}
              columns={studentsColumns}
              title={thematicPlan.type}
              data={thematicPlan.thematicPlanDescription}
            />
          </>
        ))}
      </Flex>

      <Modal
        isOpen={chooseLessonModalOpen}
        onClose={() => {
          if (lessonOfTheDay) {
            closeChooseLessonModal();
          }
        }}
        isDisabled={!lessonOfTheDay}
        title="lesson"
        size="4xl"
        primaryAction={() => {
          router.push(`?lessonOfTheDay=${lessonOfTheDay}`);
          closeChooseLessonModal();
        }}
        actionText="start"
        withoutCancelBtn>
        <SelectLabel
          isRequired
          options={periodListData}
          labelName="period"
          valueLabel="id"
          nameLabel="title"
          onChange={e => setLessonOfTheDay(e.target.value)}
          value={lessonOfTheDay}
        />
      </Modal>
    </Box>
  );
};

export default AcademicRegister;
