import { Publisher, UserDeletedEvent, Subjects } from '@alsafullstack/common';

class UserDeletedPublisher extends Publisher<UserDeletedEvent> {
  readonly subject = Subjects.UserDeleted;
}

export { UserDeletedPublisher };
