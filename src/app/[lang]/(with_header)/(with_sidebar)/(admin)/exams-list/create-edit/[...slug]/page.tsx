import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import CreateEditExam from '@/components/pages/CreateEditExam';

const CreateEdit = async ({ params }: { params: { slug: string[] } }) => {
  const [examId, subjectId] = params.slug;

  return (
    <>
      <Tabs variant="unstyled" mt="30px">
        <TabList gap="20px">
          <Tab fontSize="22px" _selected={{ color: '#319795', borderBottom: '3px solid #319795' }}>
            English
          </Tab>
          <Tab fontSize="22px" _selected={{ color: '#319795', borderBottom: '3px solid #319795' }}>
            Russian
          </Tab>
          <Tab fontSize="22px" _selected={{ color: '#319795', borderBottom: '3px solid #319795' }}>
            Armenian
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <CreateEditExam examId={examId} subjectId={subjectId} />;
          </TabPanel>
          <TabPanel>
            <CreateEditExam examId={examId} subjectId={subjectId} />;
          </TabPanel>
          <TabPanel>
            <CreateEditExam examId={examId} subjectId={subjectId} />;
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default CreateEdit;
