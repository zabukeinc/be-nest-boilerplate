import { Email } from './email.vo';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('John@Example.COM');
      expect(email.getValue()).toBe('john@example.com');
    });

    it('should throw for invalid email', () => {
      expect(() => Email.create('invalid')).toThrow('Invalid email format');
    });

    it('should throw for empty email', () => {
      expect(() => Email.create('')).toThrow('Invalid email format');
    });
  });

  describe('equals', () => {
    it('should return true for same emails', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
});
