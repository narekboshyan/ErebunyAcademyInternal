'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { IconButton, Menu, MenuButton, MenuItem, MenuList, useDisclosure } from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper, SortingState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { StudentGradeGroupService } from '@/api/services/student-grade-group.service';
import { UserService } from '@/api/services/user.service';
import SharedAlertDialog from '@/components/molecules/Modals/SharedAlertDialog';
import SearchTable from '@/components/organisms/SearchTable';
import useDebounce from '@/hooks/useDebounce';
import DotsIcon from '@/icons/dots-horizontal.svg';
import { ITEMS_PER_PAGE } from '@/utils/constants/common';
import { QUERY_KEY } from '@/utils/helpers/queryClient';
import { Maybe } from '@/utils/models/common';
import { StudentGradeGroupModel } from '@/utils/models/studentGradeGroup';

const StudentGradeGroups = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const [selectedStudent, setSelectedStudent] = useState<Maybe<StudentGradeGroupModel>>(null);

  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose() {
      setSelectedStudent(null);
    },
  });

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: QUERY_KEY.allUsers(debouncedSearch, page),
    queryFn: () =>
      StudentGradeGroupService.studentGradeGroupList({
        offset: page === 1 ? 0 : (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
        sorting: sorting,
        search: debouncedSearch,
      }),
  });

  const { mutate: deleteUserById } = useMutation({
    mutationFn: UserService.deleteStudentById,
  });

  const { mutate: confirmUserById } = useMutation({
    mutationFn: UserService.confirmUserVerificationById,
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

  const columnHelper = createColumnHelper<StudentGradeGroupModel>();

  const columns = [
    columnHelper.accessor('title', {
      id: uuidv4(),
      cell: info => info.getValue(),
      header: 'Title',
    }),
    columnHelper.accessor('description', {
      id: uuidv4(),
      cell: info => info.getValue(),
      header: 'Description',
    }),

    columnHelper.accessor('createdAt', {
      id: uuidv4(),
      cell: info => {
        const currentDate = dayjs(info.getValue());
        return currentDate.format('YYYY-MM-DD HH:mm:ss');
      },
      header: 'Created At',
    }),
    columnHelper.accessor('id', {
      id: uuidv4(),
      cell: ({ row }) => (
        <Menu>
          <MenuButton as={IconButton} icon={<DotsIcon />} />
          <MenuList>
            <MenuItem
              color="green"
              onClick={() => {
                confirmUserById(row.original.id);
              }}>
              Confirm
            </MenuItem>
            <MenuItem
              color="red"
              onClick={() => {
                onOpen();
                setSelectedStudent(row.original as StudentGradeGroupModel);
              }}>
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      ),
      header: 'Actions',
    }),
  ];

  return (
    <>
      <SearchTable
        title="Students Grade Group List"
        isLoading={isLoading}
        data={data?.studentGradeGroups || []}
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
      />
      {isOpen && (
        <SharedAlertDialog
          body={`Are you sure you want to delete ${selectedStudent?.title} grade group?`}
          isOpen={isOpen}
          title="Delete grade group"
          isLoading={isLoading}
          deleteFn={() => {
            if (selectedStudent?.id) {
              deleteUserById(selectedStudent.id);
            }
          }}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default StudentGradeGroups;
