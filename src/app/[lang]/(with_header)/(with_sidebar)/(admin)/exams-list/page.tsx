'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { LanguageTypeEnum } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, SortingState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { v4 as uuidv4 } from 'uuid';
import { ExamService } from '@/api/services/exam.service';
import CreateExamModal from '@/components/molecules/CreateExamModal';
import SearchTable from '@/components/organisms/SearchTable';
import useDebounce from '@/hooks/useDebounce';
import { Locale } from '@/i18n';
import { ITEMS_PER_PAGE } from '@/utils/constants/common';
import { ROUTE_EXAMS } from '@/utils/constants/routes';
import { languagePathHelper } from '@/utils/helpers/language';
import { QUERY_KEY } from '@/utils/helpers/queryClient';
import { ExamModel } from '@/utils/models/exam';

export default function ExamsList({ params }: { params: { lang: Locale } }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const t = useTranslations();

  const {
    isOpen: isCreateExamModalIsOpen,
    onOpen: openCreateExamModal,
    onClose: closeCreateExamModal,
  } = useDisclosure();

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: QUERY_KEY.allExams(debouncedSearch, page),
    queryFn: () =>
      ExamService.list({
        offset: page === 1 ? 0 : (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
        sorting: sorting,
        search: debouncedSearch,
      }),
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

  // `${ROUTE_EXAMS}/create-edit/${res.id}/${variables.subjectId}?language=${LanguageTypeEnum.EN}`

  const columnHelper = createColumnHelper<ExamModel>();
  const columns = [
    columnHelper.accessor('course.title', {
      id: uuidv4(),
      cell: info => info.getValue(),
      header: t('course'),
    }),
    columnHelper.accessor('id', {
      id: uuidv4(),
      cell: info => (
        <Link
          href={languagePathHelper(
            params.lang,
            `${ROUTE_EXAMS}/create-edit/${info.getValue()}/${info.row.original.subject?.id}?language=${LanguageTypeEnum.EN}`,
          )}>
          Edit Exam
        </Link>
      ),
      header: t('edit'),
    }),
    columnHelper.accessor('courseGroup.title', {
      id: uuidv4(),
      cell: info => info.getValue(),
      header: t('courseGroup'),
    }),
    columnHelper.accessor('subject.title', {
      id: uuidv4(),
      cell: info => info.getValue(),
      header: t('subject'),
    }),
    columnHelper.accessor('createdAt', {
      id: uuidv4(),
      cell: info => {
        const currentDate = dayjs(info.getValue());
        return currentDate.format('YYYY-MM-DD');
      },
      header: t('createdAt'),
    }),
  ];

  return (
    <>
      <SearchTable
        title={t('examList')}
        isLoading={isLoading}
        data={data?.exams || []}
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
        addNew={openCreateExamModal}
      />
      <CreateExamModal isOpen={isCreateExamModalIsOpen} onClose={closeCreateExamModal} />
    </>
  );
}
