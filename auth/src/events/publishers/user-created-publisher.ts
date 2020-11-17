import { Publisher, UserCreatedEvent, Subjects } from '@alsafullstack/common';

class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  readonly subject = Subjects.UserCreated;
}

export { UserCreatedPublisher };
