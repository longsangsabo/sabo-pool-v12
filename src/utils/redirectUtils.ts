export const validateRedirectPath = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (!path.startsWith('/')) return null;
  if (path.startsWith('//')) return null;
  if (path.startsWith('/auth')) return null; // avoid auth loop
  return path;
};

export const choosePostLoginPath = (opts: { redirectParam?: string | null; isClubOwner?: boolean }): string => {
  const valid = validateRedirectPath(opts.redirectParam);
  if (valid) return valid;
  if (opts.isClubOwner) return '/club-management';
  return '/dashboard';
};
