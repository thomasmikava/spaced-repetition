import type { FC } from 'react';
import { memo, useState } from 'react';
import type { LessonDTO } from '../../api/controllers/lessons/lessons.schema';
import { LessonBox } from './LessonBox';
import cssModule from './styles.module.css';
import PlusOutlined from '@ant-design/icons/lib/icons/PlusOutlined';
import { specialBoxClasses } from '../Home/boxes';
import Modal from 'antd/es/modal';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { useUpdateCourseContent } from '../../api/controllers/courses/courses.query';
import type { CourseWordStatistics } from '../../api/controllers/words/words.hooks';

interface Props {
  courseId: number;
  lessonId: number | null;
  lessons: LessonDTO[];
  canManageCourse: boolean;
  courseStats: CourseWordStatistics | undefined;
}

export const LessonBody: FC<Props> = memo(({ courseId, lessons, lessonId, courseStats }) => {
  return (
    <div className={cssModule.lessonsContainer}>
      {lessons.map((lesson) => (
        <LessonBox key={lesson.id} lesson={lesson} courseId={courseId} stats={courseStats?.lessons[lesson.id]} />
      ))}
      <AddNewLessonBox courseId={courseId} parentLessonId={lessonId} />
    </div>
  );
});

const AddNewLessonBox = ({ courseId, parentLessonId }: { courseId: number; parentLessonId: number | null }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <div className={specialBoxClasses.container} onClick={() => setIsModalOpen(true)}>
        <PlusOutlined />
        <span className={specialBoxClasses.title}>Create a lesson</span>
      </div>
      {isModalOpen && (
        <AddLessonModal courseId={courseId} parentLessonId={parentLessonId} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

interface AddLessonModalProps {
  onClose: () => void;
  courseId: number;
  parentLessonId: number | null;
}

const AddLessonModal: FC<AddLessonModalProps> = ({ onClose, courseId, parentLessonId }) => {
  const { mutate, isPending, isError } = useUpdateCourseContent();
  const [value, setValue] = useState('');
  const onCreate = () => {
    if (!value.trim()) return;
    mutate(
      {
        courseId,
        actions: !parentLessonId
          ? [
              {
                type: 'new-lesson',
                description: null,
                title: value.trim(),
              },
            ]
          : [
              {
                type: 'update-lesson',
                lessonId: parentLessonId,
                items: [
                  {
                    type: 'new-lesson',
                    description: null,
                    title: value.trim(),
                    parentLessonId,
                  },
                ],
              },
            ],
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };
  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
      <Button label={'Cancel'} onClick={onClose} />
      <Button label={'Create'} onClick={onCreate} loading={isPending} variant={'primary'} />
    </div>
  );

  return (
    <Modal
      title={'Add new Lesson'}
      open={true}
      onOk={() => {}}
      onCancel={onClose}
      width={500}
      style={{ maxWidth: 'calc(100% - 84px)' }}
      footer={footer}
    >
      {isError && <div style={{ color: 'red' }}>Failed to create lesson</div>}
      <Input placeholder='Lesson title' onChange={(e) => setValue(e.target.value)} />
    </Modal>
  );
};
