import { User } from '../../../domain/user/user.entity';
import { UserOrmEntity } from '../entities/user.orm-entity';

export class UserMapper {
  static toDomain(row: UserOrmEntity): User {
    return User.restore({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      tokenVersion: row.tokenVersion,
      role: row.role,
      profile: {
        ageGroup: row.ageGroup,
        skillLevel: row.skillLevel,
        goals: row.goals ?? [],
        dominantHand: row.dominantHand,
        restrictions: row.restrictions,
      },
      createdAt: row.createdAt,
    });
  }

  static toPersistence(user: User): UserOrmEntity {
    const row = new UserOrmEntity();
    row.id = user.id;
    row.name = user.name;
    row.email = user.email;
    row.passwordHash = user.passwordHash;
    row.tokenVersion = user.tokenVersion;
    row.role = user.role;
    row.ageGroup = user.profile.ageGroup;
    row.skillLevel = user.profile.skillLevel;
    row.goals = user.profile.goals;
    row.dominantHand = user.profile.dominantHand;
    row.restrictions = user.profile.restrictions;
    row.createdAt = user.createdAt;
    return row;
  }
}
