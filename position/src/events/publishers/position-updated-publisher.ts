import {
  PositionUpdatedEvent,
  Publisher,
  Subjects,
} from '@alsafullstack/common';

class PositionUpdatedPublisher extends Publisher<PositionUpdatedEvent> {
  readonly subject = Subjects.PositionUpdated;
}

export { PositionUpdatedPublisher };
