import cssModule from './App.module.css';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LessonCard, courses } from './course/lessons';
import { generateIndexedDatabase } from './functions/generateIndexedDatabase';
import { CardType } from './database/types';
import ReviewButtons from './ReviewButtons';
import { Reviewer } from './functions/reviewer';

const LessonPage = () => {
  let params = useParams();
  const navigate = useNavigate();

  const courseId = +(params.courseId as string);
  const lessonId = +(params.lessonId as string);
  const myCourse = useMemo(() => {
    return courses.find((course) => course.id === courseId);
  }, []);

  const [reviewer] = useState(() => new Reviewer(courseId, lessonId));

  const cardsDatabase = useMemo(generateIndexedDatabase, []);
  const getCard = (card: LessonCard) => {
    return cardsDatabase[card.type][card.value];
  };

  const goToCourse = () => {
    navigate(`/course/${courseId}`);
  };

  if (!myCourse) return <div>Course not found</div>;

  const myLesson = myCourse.lessons.find((lesson) => lesson.id === lessonId);
  if (!myLesson) return <div>Lesson not found</div>;

  return (
    <div className='body'>
      <div>
        <span onClick={goToCourse}>{myCourse.title}</span> - {myLesson.title}
      </div>
      <ReviewButtons courseId={courseId} lessonId={lessonId} />
      <table className={cssModule.lessonTable}>
        <tbody>
          {myLesson.cards.map((lessonCard) => {
            const key = lessonCard.type + lessonCard.value;
            const card = getCard(lessonCard);
            if (!card) {
              return <div key={key}>Card {lessonCard.value} not found</div>;
            }
            const closestDueDate = reviewer.getClosestDueDate(card);
            return (
              <tr key={key} className={cssModule.row}>
                <td className={cssModule.lessonCardType}>{toReadableType(card.type)}</td>
                <td className={cssModule.lessonCardValue}>{card.value}</td>
                <td className={cssModule.lessonCardTranslation}>{card.translation}</td>
                <td className={cssModule.lessonCardTranslation}>
                  {closestDueDate === Infinity
                    ? null
                    : closestDueDate < 0
                      ? 'Ready'
                      : 'In ' + Math.round(closestDueDate / 60) + ' min'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const toReadableType = (type: CardType) => {
  switch (type) {
    case CardType.NOUN:
      return 'n.';
    case CardType.VERB:
      return 'v.';
    case CardType.ARTICLE:
      return 'art.';
    default:
      return 'Unknown';
  }
};

export default LessonPage;
