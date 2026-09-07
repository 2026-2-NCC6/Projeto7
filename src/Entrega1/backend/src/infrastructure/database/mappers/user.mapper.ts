import { User } from '../../../domain/user/user.entity';
import { UserOrmEntity } from '../entities/user.orm-entity';

export class UserMapper {
  static toDomain(row: UserOrmEntity): User {
    return User.restore({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(user: User): UserOrmEntity {
    const row = new UserOrmEntity();
    row.id = user.id;
    row.name = user.name;
    row.email = user.email;
    row.passwordHash = user.passwordHash;
    row.createdAt = user.createdAt;
    return row;
  }
}
