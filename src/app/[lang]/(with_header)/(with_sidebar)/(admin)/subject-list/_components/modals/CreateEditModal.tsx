'use client';
import React, { FC, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { CourseService } from '@/api/services/courses.service';
import { SubjectService } from '@/api/services/subject.service';
import { FormInput, SelectLabel } from '@/components/atoms';
import Modal from '@/components/molecules/Modal';
import { GetCoursesListModel } from '@/utils/models/course';
import { SubjectModel } from '@/utils/models/subject';
import { CreateEditSubjectValidation } from '@/utils/validation/subject';

type CreateEditModalProps = {
  isCreateEditModalOpen: boolean;
  closeCreateEditModal: () => void;
  refetch: () => void;
  reset: () => void;
  selectedSubject: SubjectModel | null;
  isValid: boolean;
  handleSubmit: (
    onSubmit: (data: CreateEditSubjectValidation) => void,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<CreateEditSubjectValidation>;
  control: Control<CreateEditSubjectValidation>;
};

const CreateEditModal: FC<CreateEditModalProps> = ({
  isCreateEditModalOpen,
  closeCreateEditModal,
  refetch,
  reset,
  selectedSubject,
  isValid,
  errors,
  handleSubmit,
  control,
}) => {
  const t = useTranslations();

  const { data: courseQueryData } = useQuery<GetCoursesListModel>({
    queryKey: ['course'],
    queryFn: CourseService.list,
    enabled: isCreateEditModalOpen,
  });

  const { mutate: createFaculty } = useMutation({
    mutationFn: SubjectService.createSubject,
    onSuccess() {
      refetch();
      reset();
      closeCreateEditModal();
    },
  });

  const { mutate: updateFaculty } = useMutation({
    mutationFn: SubjectService.updateSubject,
    onSuccess() {
      refetch();
      reset();
      closeCreateEditModal();
    },
  });

  const onSubmitHandler = useCallback(
    (data: CreateEditSubjectValidation) => {
      if (selectedSubject) {
        updateFaculty(data);
      } else {
        createFaculty(data);
      }
    },
    [createFaculty, selectedSubject, updateFaculty],
  );

  return (
    <Modal
      isOpen={isCreateEditModalOpen}
      onClose={closeCreateEditModal}
      title={'subject'}
      primaryAction={handleSubmit(onSubmitHandler)}
      isDisabled={!isValid}
      actionText={selectedSubject ? 'edit' : 'create'}>
      <Controller
        name="title"
        control={control}
        render={({ field: { onChange, value, name } }) => (
          <FormInput
            isRequired
            name={name}
            type="text"
            formLabelName={t('subjectName')}
            value={value}
            placeholder="enterTitle"
            handleInputChange={onChange}
            isInvalid={!!errors.title?.message}
            formErrorMessage={errors.title?.message}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field: { onChange, value, name } }) => (
          <FormInput
            name={name}
            type="text"
            formLabelName={t('subjectDescription')}
            value={value}
            placeholder="enterDescription"
            handleInputChange={onChange}
            isInvalid={!!errors.description?.message}
            formErrorMessage={errors.description?.message}
          />
        )}
      />
      <Controller
        name="courseId"
        control={control}
        render={({ field: { onChange, value, name } }) => (
          <SelectLabel
            name={name}
            isRequired
            options={courseQueryData || []}
            labelName="course"
            valueLabel="id"
            nameLabel="title"
            onChange={onChange}
            value={value}
            isInvalid={!!errors.courseId?.message}
            formErrorMessage={errors.courseId?.message}
          />
        )}
      />
    </Modal>
  );
};

export default CreateEditModal;
