import {
  PositionCreatedEvent,
  Publisher,
  Subjects,
} from '@alsafullstack/common';

class PositionCreatedPublisher extends Publisher<PositionCreatedEvent> {
  readonly subject = Subjects.PositionCreated;
}

export { PositionCreatedPublisher };
