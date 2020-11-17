import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@alsafullstack/common';

class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}

export { ExpirationCompletePublisher };
