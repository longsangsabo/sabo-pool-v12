export const formatPhoneToE164 = (raw: string, defaultCountryCode = '+84') => {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');

  // Already in +84... form
  if (raw.startsWith('+')) return raw;

  // If starts with 84 treat as country code missing plus
  if (digits.startsWith('84')) return `+${digits}`;

  // Common VN pattern: 0xxxxxxxxx -> +84xxxxxxxxx
  if (digits.startsWith('0')) return `${defaultCountryCode}${digits.slice(1)}`;

  // Fallback: just prefix +
  return `+${digits}`;
};

export const maskPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return phone;
  const last4 = cleaned.slice(-4);
  return `••• ••• ••${last4}`;
};
