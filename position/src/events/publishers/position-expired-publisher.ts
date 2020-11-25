import {
  PositionExpiredEvent,
  Publisher,
  Subjects,
} from '@alsafullstack/common';

class PositionExpiredPublisher extends Publisher<PositionExpiredEvent> {
  readonly subject = Subjects.PositionExpired;
}

export { PositionExpiredPublisher };
