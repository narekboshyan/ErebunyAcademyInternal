import React, { FC } from 'react';
import { Avatar, Button, Flex } from '@chakra-ui/react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { Attachment, AttachmentTypeEnum, LanguageTypeEnum } from '@prisma/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { CourseGroupService } from '@/api/services/course-group.service';
import { CourseService } from '@/api/services/courses.service';
import { ExamService } from '@/api/services/exam.service';
import { FacultyService } from '@/api/services/faculty.service';
import { StudentService } from '@/api/services/student.service';
import { SubjectService } from '@/api/services/subject.service';
import { FormInput, SelectLabel } from '@/components/atoms';
import TableCheckbox from '@/components/organisms/TableCheckbox';
import { ROUTE_EXAMS } from '@/utils/constants/routes';
import { generateAWSUrl } from '@/utils/helpers/aws';
import { UserStudentModel } from '@/utils/models/student';
import { CreateExamValidation } from '@/utils/validation/exam';
import Modal from '../Modal';

type CreateExamModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const resolver = classValidatorResolver(CreateExamValidation);

const CreateExamModal: FC<CreateExamModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations();
  const router = useRouter();
  const {
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateExamValidation>({
    resolver,
    defaultValues: {
      facultyId: '',
      subjectId: '',
      courseId: '',
      courseGroupId: '',
      duration: '',
      studentIds: [],
    },
  });

  const faculty = watch('facultyId');
  const course = watch('courseId');
  const courseGroup = watch('courseGroupId');

  const { data: facultyQueryData } = useQuery({
    queryKey: ['faculty'],
    queryFn: FacultyService.list,
  });

  const { data: courseQueryData } = useQuery({
    queryKey: ['student-grade', faculty],
    queryFn: () => CourseService.getCourseByFacultyId(faculty),
    enabled: !!faculty,
  });

  const { data: courseGroupQueryData } = useQuery({
    queryKey: ['course-group', courseQueryData],
    queryFn: () => CourseGroupService.getCourseGroupByCourseId(course),
    enabled: !!course,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students', courseGroup],
    queryFn: () => StudentService.getStudentsByCourseGroupId(courseGroup),
    enabled: !!courseGroup,
  });

  const { mutate: createExamMutation, isPending } = useMutation({
    mutationFn: ExamService.createExam,
    onSuccess(res, variables) {
      router.push(
        `${ROUTE_EXAMS}/create-edit/${res.id}/${variables.subjectId}?language=${LanguageTypeEnum.EN}`,
      );
    },
  });

  const { data: subjectList } = useQuery({
    queryKey: ['subject-list'],
    queryFn: SubjectService.list,
  });
  const columnHelper = createColumnHelper<UserStudentModel>();

  const columns = [
    columnHelper.accessor('user.attachment', {
      id: uuidv4(),
      cell: (info: any) => {
        const existingAvatar = info
          .getValue()
          .find((attachment: Attachment) => attachment.type === AttachmentTypeEnum.AVATAR);
        return (
          <Avatar
            bg="#319795"
            color="#fff"
            name={`${info.row.original.user.firstName} ${info.row.original.user.lastName}`}
            src={generateAWSUrl(existingAvatar?.key || '')}
          />
        );
      },
      header: t('avatar'),
    }),
    columnHelper.accessor('user.firstName', {
      id: uuidv4(),
      cell: info => info.getValue(),
      header: t('firstName'),
    }),
    columnHelper.accessor('user.lastName', {
      id: uuidv4(),
      cell: info => info.getValue(),
      header: t('lastName'),
    }),
    columnHelper.accessor('user.email', {
      id: uuidv4(),
      cell: info => info.getValue(),
      header: t('email'),
    }),
  ];

  const onSubmit = (data: CreateExamValidation) => {
    createExamMutation(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="createExam" size="6xl">
      <Flex
        gap={{ base: '18px', sm: '30px' }}
        flexDirection={{ base: 'column', sm: 'row' }}
        alignItems="center">
        <Flex
          width={{ base: '100%', sm: '50%' }}
          gap={{ base: '18px', sm: '30px' }}
          flexDirection={{ base: 'column', xl: 'row' }}>
          <Flex width={{ base: '100%', xl: '50%' }}>
            <Controller
              name="facultyId"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <SelectLabel
                  isRequired
                  name={name}
                  options={(facultyQueryData || []) as any}
                  labelName="selectFaculty"
                  valueLabel="id"
                  nameLabel="title"
                  onChange={e => {
                    onChange(e.target.value);
                    setValue('courseId', '');
                  }}
                  value={value}
                  isInvalid={!!errors.facultyId?.message}
                  formErrorMessage={errors.facultyId?.message}
                />
              )}
            />
          </Flex>
          <Flex width={{ base: '100%', xl: '50%' }}>
            <Controller
              name="courseId"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <SelectLabel
                  isRequired
                  name={name}
                  options={courseQueryData || []}
                  labelName="selectCourse"
                  valueLabel="id"
                  nameLabel="title"
                  onChange={e => {
                    onChange(e.target.value);
                    setValue('courseGroupId', '');
                  }}
                  value={value}
                  isInvalid={!!errors.courseId?.message}
                  formErrorMessage={errors.courseId?.message}
                />
              )}
            />
          </Flex>
        </Flex>

        <Flex
          width={{ base: '100%', sm: '50%' }}
          gap={{ base: '18px', sm: '30px' }}
          flexDirection={{ base: 'column', xl: 'row' }}>
          <Flex width={{ base: '100%', xl: '50%' }}>
            <Controller
              name="courseGroupId"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <SelectLabel
                  isRequired
                  name={name}
                  options={courseGroupQueryData || []}
                  labelName="selectCourseGroup"
                  valueLabel="id"
                  nameLabel="title"
                  onChange={e => {
                    onChange(e.target.value);
                    setValue('studentIds', []);
                  }}
                  value={value}
                  isInvalid={!!errors.courseGroupId?.message}
                  formErrorMessage={errors.courseGroupId?.message}
                />
              )}
            />
          </Flex>
          <Flex width={{ base: '100%', xl: '50%' }}>
            <Controller
              name="subjectId"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <SelectLabel
                  isRequired
                  name={name}
                  options={subjectList || []}
                  labelName="selectSubject"
                  valueLabel="id"
                  nameLabel="title"
                  onChange={onChange}
                  value={value}
                  isInvalid={!!errors.subjectId?.message}
                  formErrorMessage={errors.subjectId?.message}
                />
              )}
            />
          </Flex>
        </Flex>
      </Flex>
      <Flex width={{ base: '100%', sm: '50%', xl: '254px' }}>
        <Controller
          name="duration"
          control={control}
          render={({ field: { onChange, value, name } }) => (
            <FormInput
              isRequired
              name={name}
              type="number"
              formLabelName={t('examDurationLabelName')}
              handleInputChange={onChange}
              value={value}
              isInvalid={!!errors.duration?.message}
              formErrorMessage={errors.duration?.message}
            />
          )}
        />
      </Flex>

      <Flex maxHeight="400px" height={600} overflowY="auto">
        <Controller
          name="studentIds"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TableCheckbox
              isRequired
              title="selectStudentsForExam"
              data={studentsData || []}
              selectedValues={value}
              onChange={onChange}
              // @ts-ignore
              columns={columns || []}
              isInvalid={!!errors.studentIds?.message}
              formErrorMessage={errors.studentIds?.message}
            />
          )}
        />
      </Flex>
      <Button isLoading={isPending} onClick={handleSubmit(onSubmit)} isDisabled={!isValid}>
        {t('create')}
      </Button>
    </Modal>
  );
};

export default CreateExamModal;
