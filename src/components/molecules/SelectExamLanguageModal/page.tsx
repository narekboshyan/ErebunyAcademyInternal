'use client';
import React, { FC, useState } from 'react';
import { Button, Flex, Stack } from '@chakra-ui/react';
import { LanguageTypeEnum } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { SelectLabel } from '@/components/atoms';
import { ROUTE_EXAMINATION } from '@/utils/constants/routes';
import Modal from '../Modal';

type SelectExamLanguageModalProps = {
  examTranslation: { id: string; language: LanguageTypeEnum }[];
  examId: string;
};

const SelectExamLanguageModal: FC<SelectExamLanguageModalProps> = ({ examTranslation, examId }) => {
  const [examTr, setExamTr] = useState('');
  const router = useRouter();
  const formSubmitHandler = () => {
    router.push(`${ROUTE_EXAMINATION}/${examId}/${examTr}`);
  };
  return (
    <Modal isOpen onClose={() => {}} title={'In which language you would prefer to start exam?'}>
      <Stack>
        <Flex flexDirection="column" gap="20px">
          <SelectLabel
            isRequired
            options={examTranslation}
            labelName={'course'}
            valueLabel="id"
            nameLabel="language"
            name="examTranslation"
            value={examTr}
            onChange={e => setExamTr(e.target.value)}
          />
          <Button onClick={formSubmitHandler}>Create exam</Button>
        </Flex>
      </Stack>
    </Modal>
  );
};

export default SelectExamLanguageModal;
