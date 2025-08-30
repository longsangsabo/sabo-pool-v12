export const validateRedirectPath = (
  path: string | undefined | undefined
): string | undefined => {
  if (!path) return null;
  if (!path.startsWith('/')) return null;
  if (path.startsWith('//')) return null;
  if (path.startsWith('/auth')) return null; // avoid auth loop
  return path;
};

export const choosePostLoginPath = (opts: {
  redirectParam?: string | undefined;
  isClubOwner?: boolean;
}): string => {
  const valid = validateRedirectPath(opts.redirectParam);
  if (valid) return valid;
  if (opts.isClubOwner) return '/club-management';
  return '/dashboard';
};
