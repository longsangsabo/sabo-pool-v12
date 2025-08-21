import { getDisplayName } from '@/types/unified-profile';

describe('Display Name Logic', () => {
  test('should prioritize display_name', () => {
    const profile = {
      display_name: 'Preferred Name',
      full_name: 'Full Name',
      email: 'test@example.com',
      user_id: 'test-id'
    };
    expect(getDisplayName(profile)).toBe('Preferred Name');
  });

  test('should fallback to full_name when display_name is empty', () => {
    const profile = {
      display_name: '',
      full_name: 'Full Name',
      email: 'test@example.com',
      user_id: 'test-id'
    };
    expect(getDisplayName(profile)).toBe('Full Name');
  });

  test('should fallback to nickname when display_name and full_name are empty', () => {
    const profile = {
      display_name: '',
      full_name: '',
      nickname: 'Cool Player',
      email: 'test@example.com',
      user_id: 'test-id'
    };
    expect(getDisplayName(profile)).toBe('Cool Player');
  });

  test('should fallback to email when display_name, full_name, and nickname are empty', () => {
    const profile = {
      display_name: '',
      full_name: '',
      nickname: '',
      email: 'player@example.com',
      user_id: 'test-id'
    };
    expect(getDisplayName(profile)).toBe('player@example.com');
  });

  test('should fallback to User ID when all other fields are empty', () => {
    const profile = {
      display_name: '',
      full_name: '',
      nickname: '',
      email: '',
      user_id: 'test-user-id-12345'
    };
    expect(getDisplayName(profile)).toBe('User test-use');
  });

  test('should handle undefined values', () => {
    const profile = {
      user_id: 'test-id-12345'
    };
    expect(getDisplayName(profile)).toBe('User test-id-');
  });

  test('should trim whitespace from display_name', () => {
    const profile = {
      display_name: '  Spaced Name  ',
      full_name: 'Full Name',
      user_id: 'test-id'
    };
    expect(getDisplayName(profile)).toBe('Spaced Name');
  });

  test('should skip empty trimmed display_name', () => {
    const profile = {
      display_name: '   ',
      full_name: 'Full Name',
      user_id: 'test-id'
    };
    expect(getDisplayName(profile)).toBe('Full Name');
  });
});
