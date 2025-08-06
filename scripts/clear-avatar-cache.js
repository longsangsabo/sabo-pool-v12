/**
 * Script để clear localStorage avatar cache
 * Chạy trong browser console để reset avatar về Premium Octagon mặc định
 */

console.log('🎯 CLEARING AVATAR CACHE - RESET TO PREMIUM OCTAGON DEFAULT');

// Clear all avatar-related localStorage keys
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (
    key.includes('avatar_frameType_') || 
    key.includes('avatar_variant_') ||
    key.includes('avatar_intensity_') ||
    key.includes('avatar_speed_')
  )) {
    keysToRemove.push(key);
  }
}

console.log(`Found ${keysToRemove.length} avatar cache keys to remove:`, keysToRemove);

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ Removed: ${key}`);
});

console.log('🎉 AVATAR CACHE CLEARED! Refresh page to see Premium Octagon as default.');
console.log('💎 Premium Octagon will now be the default frame for all users.');
