import { User } from './user.entity';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a user with valid data', () => {
      const user = User.create('john@example.com', 'John Doe');
      expect(user.getEmail()).toBe('john@example.com');
      expect(user.getName()).toBe('John Doe');
      expect(user.getRole()).toBe('user');
      expect(user.isDeleted()).toBe(false);
    });

    it('should create a user without name', () => {
      const user = User.create('jane@example.com');
      expect(user.getEmail()).toBe('jane@example.com');
      expect(user.getName()).toBeNull();
    });
  });

  describe('updateName', () => {
    it('should update user name', () => {
      const user = User.create('john@example.com', 'John');
      user.updateName('John Updated');
      expect(user.getName()).toBe('John Updated');
    });
  });

  describe('markDeleted', () => {
    it('should mark user as deleted', () => {
      const user = User.create('john@example.com', 'John');
      user.markDeleted();
      expect(user.isDeleted()).toBe(true);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a user from persistence', () => {
      const now = new Date();
      const user = User.reconstitute(
        'user-id',
        'john@example.com',
        'John Doe',
        null,
        'admin',
        now,
        now,
        null,
      );
      expect(user.getId()).toBe('user-id');
      expect(user.getEmail()).toBe('john@example.com');
      expect(user.getRole()).toBe('admin');
    });
  });
});
