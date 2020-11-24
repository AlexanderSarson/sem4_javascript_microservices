import {
  PositionDeletedEvent,
  Publisher,
  Subjects,
} from '@alsafullstack/common';

class PositionDeletedPublisher extends Publisher<PositionDeletedEvent> {
  readonly subject = Subjects.PositionDeleted;
}

export { PositionDeletedPublisher };
