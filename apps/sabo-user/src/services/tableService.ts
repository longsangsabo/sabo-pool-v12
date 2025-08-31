// Removed supabase import - migrated to services

export const getTableBookings = async (filters?: any) => {
  try {
//     let query = supabase
      .from('table_bookings')
      .select(`
        *,
        user:profiles(*),
        table:pool_tables(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.date) {
      query = query.eq('booking_date', filters.date);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const createTableBooking = async (bookingData: any) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('table_bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const cancelTableBooking = async (bookingId: string) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('table_bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getTables = async () => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('pool_tables')
      .select('*')
      .eq('is_active', true)
      .order('table_number');

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
