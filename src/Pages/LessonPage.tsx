import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import cssModule from '../App.module.css';
import ReviewButtons from '../ReviewButtons';
import type { LessonCard } from '../courses/lessons';
import { courses } from '../courses/lessons';
import { CardTypeMapper } from '../database/attributes';
import type { IdType } from '../database/types';
import { generateIndexedDatabase2 } from '../functions/generateIndexedDatabase';
import { Reviewer } from '../functions/reviewer';
import { roundNumber } from '../utils/number';
import { formatTime } from '../utils/time';

const LessonPage = () => {
  const params = useParams();
  const navigate = useNavigate();

  const courseId = +(params.courseId as string);
  const lessonId = +(params.lessonId as string);
  const myCourse = useMemo(() => {
    return courses.find((course) => course.id === courseId);
  }, [courseId]);

  const [reviewer] = useState(() => new Reviewer(courseId, lessonId));

  const cardsDatabase = useMemo(generateIndexedDatabase2, []);
  const getCard = (card: LessonCard) => {
    return cardsDatabase.getCard(card.type, card.value);
  };

  const goToCourse = () => {
    navigate(`/course/${courseId}`);
  };

  if (!myCourse) return <div>Course not found</div>;

  const myLesson = myCourse.lessons.find((lesson) => lesson.id === lessonId);
  if (!myLesson) return <div>Lesson not found</div>;

  const lessonCards = myLesson.cards.filter((e) => !e.hidden);

  const lessonsInfo = lessonCards.map((lessonCard) => {
    const card = getCard(lessonCard);
    if (!card) return { lessonCard, isUnknown: true as const };
    const closestDueDate = reviewer.getClosestDueDate(card);
    return { lessonCard, isUnknown: false as const, closestDueDate, card };
  });
  const studiedCards = lessonsInfo.filter((item) => !item.isUnknown && item.closestDueDate !== Infinity).length;
  const allCards = lessonsInfo.length;

  return (
    <div className='body'>
      <div>
        <span onClick={goToCourse} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
          {myCourse.title}
        </span>{' '}
        - {myLesson.title} ({lessonCards.length} items. Studied: {roundNumber((studiedCards / allCards) * 100, 1)}%)
      </div>
      <ReviewButtons courseId={courseId} lessonId={lessonId} />
      <table className={cssModule.lessonTable}>
        <tbody>
          {lessonsInfo.map((item) => {
            const key = item.lessonCard.type + item.lessonCard.value;
            if (item.isUnknown) {
              return (
                <div key={key}>
                  Card {item.lessonCard.value} ({toReadableType(item.lessonCard.type)}) not found
                </div>
              );
            }
            const { closestDueDate, card } = item;
            return (
              <tr key={key} className={cssModule.row}>
                <td className={cssModule.lessonCardType}>{toReadableType(card.mainType ?? card.type)}</td>
                <td className={cssModule.lessonCardValue}>{card.value}</td>
                <td className={cssModule.lessonCardTranslation}>{card.translation}</td>
                <td className={cssModule.lessonCardTranslation}>
                  {closestDueDate === Infinity
                    ? null
                    : closestDueDate < 0
                      ? 'Ready'
                      : 'In ' + formatTime(closestDueDate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const toReadableType = (type: IdType) => {
  switch (type) {
    case CardTypeMapper.NOUN:
      return 'n.';
    case CardTypeMapper.VERB:
      return 'v.';
    case CardTypeMapper.ARTICLE:
      return 'art.';
    case CardTypeMapper.ADJECTIVE:
      return 'adj.adv.';
    case CardTypeMapper.CONJUNCTION:
      return 'konj.';
    case CardTypeMapper.PREPOSITION:
      return 'präp.';
    case CardTypeMapper.PHRASE:
      return 'phrase';
    case CardTypeMapper.NUMBER:
      return 'nummer';
    case CardTypeMapper.PRONOUN:
      return 'pron.';
    default:
      return 'Unknown';
  }
};

export default LessonPage;
