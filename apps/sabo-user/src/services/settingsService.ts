// Removed supabase import - migrated to services

export const getSettings = async (userId: string) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateSettings = async (userId: string, settings: any) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('user_settings')
      .upsert([{
        user_id: userId,
        ...settings
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getSystemSettings = async () => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
