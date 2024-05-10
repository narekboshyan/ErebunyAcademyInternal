'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { MenuItem, useDisclosure } from '@chakra-ui/react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper, SortingState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { FacultyService } from '@/api/services/faculty.service';
import { FormInput } from '@/components/atoms';
import ActionButtons from '@/components/molecules/ActionButtons';
import Modal from '@/components/molecules/Modal';
import SearchTable from '@/components/organisms/SearchTable';
import useDebounce from '@/hooks/useDebounce';
import { ITEMS_PER_PAGE } from '@/utils/constants/common';
import { QUERY_KEY } from '@/utils/helpers/queryClient';
import { Maybe } from '@/utils/models/common';
import { FacultyModel } from '@/utils/models/faculty';
import { CreateEditFacultyValidation } from '@/utils/validation/faculty';

const resolver = classValidatorResolver(CreateEditFacultyValidation);

const Faculty = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const [selectedFaculty, setSelectedFaculty] = useState<Maybe<FacultyModel>>(null);
  const t = useTranslations();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateEditFacultyValidation>({
    resolver,
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const {
    isOpen: isCreateEditModalOpen,
    onOpen: openCreateEditModal,
    onClose: closeCreateEditModal,
  } = useDisclosure({
    onClose() {
      reset();
      setSelectedFaculty(null);
    },
  });

  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure({
    onClose() {
      setSelectedFaculty(null);
    },
  });

  const { data, isLoading, isPlaceholderData, refetch } = useQuery({
    queryKey: QUERY_KEY.allUsers(debouncedSearch, page),
    queryFn: () =>
      FacultyService.facultyList({
        offset: page === 1 ? 0 : (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
        sorting: sorting,
        search: debouncedSearch,
      }),
  });

  const { mutate: createFaculty } = useMutation({
    mutationFn: FacultyService.createFaculty,
    onSuccess() {
      refetch();
      reset();
      closeCreateEditModal();
    },
  });

  const { mutate: updateFaculty } = useMutation({
    mutationFn: FacultyService.updateFaculty,
    onSuccess() {
      refetch();
      reset();
      closeCreateEditModal();
    },
  });

  const { mutate } = useMutation({
    mutationFn: FacultyService.deleteFaculty,
    onSuccess() {
      closeDeleteModal();
      refetch();
    },
  });

  const pageCount = useMemo(() => {
    if (data?.count) {
      return Math.ceil(data.count / ITEMS_PER_PAGE);
    }
  }, [data?.count]);

  const setSearchValue = useCallback(
    (value: string) => {
      if (!!value && page !== 1) {
        setPage(1);
      }
      setSearch(value);
    },
    [page],
  );

  const columnHelper = createColumnHelper<FacultyModel>();
  const columns = [
    columnHelper.accessor('title', {
      id: uuidv4(),
      cell: info => info.getValue(),
      header: t('list.title'),
    }),
    columnHelper.accessor('description', {
      id: uuidv4(),
      cell: info => info.getValue(),
      header: t('list.description'),
    }),
    columnHelper.accessor('createdAt', {
      id: uuidv4(),
      cell: info => {
        const currentDate = dayjs(info.getValue());
        return currentDate.format('YYYY-MM-DD HH:mm:ss');
      },
      header: t('list.createdAt'),
    }),
    columnHelper.accessor('id', {
      id: uuidv4(),
      cell: ({ row }) => (
        <ActionButtons>
          <MenuItem
            color="green"
            onClick={() => {
              setSelectedFaculty(row.original);
              setValue('title', row.original.title || '');
              setValue('description', row.original.description || '');
              openCreateEditModal();
            }}>
            Edit
          </MenuItem>
          <MenuItem
            color="red"
            onClick={() => {
              setSelectedFaculty(row.original);
              openDeleteModal();
            }}>
            Delete
          </MenuItem>
        </ActionButtons>
      ),
      header: t('list.actions'),
    }),
  ];

  const addNewFacultyHandler = useCallback(() => {
    openCreateEditModal();
  }, [openCreateEditModal]);

  const onSubmitHandler = useCallback(
    (data: CreateEditFacultyValidation) => {
      if (selectedFaculty) {
        updateFaculty({ data, id: selectedFaculty.id });
      } else {
        createFaculty(data);
      }
    },
    [createFaculty, selectedFaculty, updateFaculty],
  );

  return (
    <>
      <SearchTable
        title={t('list.facultyList')}
        isLoading={isLoading}
        data={data?.faculties || []}
        count={data?.count || 0}
        // @ts-ignore
        columns={columns}
        sorting={sorting}
        search={search}
        setSorting={setSorting}
        setSearch={setSearchValue}
        hasNextPage={useMemo(
          () => !(!pageCount || page === pageCount || isPlaceholderData),
          [isPlaceholderData, page, pageCount],
        )}
        hasPreviousPage={useMemo(
          () => !(page === 1 || isPlaceholderData),
          [isPlaceholderData, page],
        )}
        fetchNextPage={useCallback(() => setPage(prev => ++prev), [])}
        fetchPreviousPage={useCallback(() => setPage(prev => --prev), [])}
        addNew={addNewFacultyHandler}
      />

      <Modal
        isOpen={isCreateEditModalOpen}
        onClose={closeCreateEditModal}
        title={t('user.faculty')}
        primaryAction={handleSubmit(onSubmitHandler)}
        actionText={selectedFaculty ? 'Update' : 'Create'}>
        <Controller
          name="title"
          control={control}
          rules={{ required: 'This field is required' }}
          render={({ field: { onChange, value, name } }) => (
            <FormInput
              isRequired
              isInvalid={!!errors.title?.message}
              name={name}
              type="text"
              formLabelName="Faculty name"
              value={value}
              placeholder="Please enter title"
              handleInputChange={onChange}
              formErrorMessage={errors.title?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          rules={{ required: 'This field is required' }}
          render={({ field: { onChange, value, name } }) => (
            <FormInput
              isInvalid={!!errors.description?.message}
              name={name}
              type="text"
              formLabelName="Faculty Description"
              value={value}
              placeholder="Please enter description"
              handleInputChange={onChange}
              formErrorMessage={errors.description?.message}
            />
          )}
        />
      </Modal>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Faculty"
        primaryAction={() => {
          if (selectedFaculty) {
            mutate(selectedFaculty?.id);
          }
        }}
        actionText="Delete">
        Are you sure you want to delete this faculty?
      </Modal>
    </>
  );
};

export default Faculty;
