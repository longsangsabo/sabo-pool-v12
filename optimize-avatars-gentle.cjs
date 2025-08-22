const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function optimizeAvatarsGently() {
  console.log('🖼️  Gently optimizing avatar images for better performance...\n');
  
  try {
    // Get all files in avatars bucket
    const { data: files, error: listError } = await supabase
      .storage
      .from('avatars')
      .list('', {
        limit: 100,
        offset: 0
      });
    
    if (listError) {
      console.error('❌ Error listing files:', listError);
      return;
    }
    
    console.log(`📁 Found ${files?.length || 0} files in avatars bucket\n`);
    
    // Analyze file sizes and suggest optimizations
    let largeFiles = [];
    let normalFiles = [];
    let totalSize = 0;
    
    for (const file of files || []) {
      const sizeKB = Math.round(file.metadata?.size / 1024) || 0;
      const sizeMB = (sizeKB / 1024).toFixed(2);
      totalSize += sizeKB;
      
      if (sizeKB > 500) { // Files larger than 500KB
        largeFiles.push({
          name: file.name,
          sizeKB,
          sizeMB,
          needsOptimization: sizeKB > 1000 // Only optimize if >1MB
        });
      } else {
        normalFiles.push({
          name: file.name,
          sizeKB,
          sizeMB
        });
      }
    }
    
    console.log('📊 FILE SIZE ANALYSIS:');
    console.log(`Total storage used: ${(totalSize / 1024).toFixed(2)} MB`);
    console.log(`Files >500KB: ${largeFiles.length}`);
    console.log(`Files <500KB: ${normalFiles.length}\n`);
    
    // Show large files that need optimization
    if (largeFiles.length > 0) {
      console.log('🚨 LARGE FILES (>500KB):');
      largeFiles.forEach((file, index) => {
        const status = file.needsOptimization ? '❌ NEEDS OPTIMIZATION' : '⚠️  LARGE BUT OK';
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   Size: ${file.sizeKB} KB (${file.sizeMB} MB) - ${status}`);
      });
      console.log('');
    }
    
    // Show recommendations
    console.log('💡 RECOMMENDATIONS:');
    
    const needsOptimization = largeFiles.filter(f => f.needsOptimization);
    if (needsOptimization.length > 0) {
      console.log(`📐 ${needsOptimization.length} files need gentle optimization:`);
      console.log('   • Resize to max 1024x1024 (keep aspect ratio)');
      console.log('   • Quality: 85% (high quality, good compression)');
      console.log('   • Convert to modern formats (WebP with JPEG fallback)');
      console.log('   • Target size: 200-500KB per image');
    }
    
    // Check avatar URLs in profiles
    console.log('\n👤 CHECKING PROFILE AVATAR URLs:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name, avatar_url')
      .not('avatar_url', 'is', null)
      .neq('avatar_url', '');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`Found ${profiles?.length || 0} users with avatar URLs:`);
      
      for (const profile of profiles || []) {
        const name = profile.full_name || profile.display_name || 'Unknown';
        console.log(`• ${name}: ${profile.avatar_url}`);
        
        // Check if URL is accessible
        if (profile.avatar_url) {
          try {
            const { data: publicUrl } = supabase.storage
              .from('avatars')
              .getPublicUrl(profile.avatar_url.split('/avatars/')[1] || profile.avatar_url);
            
            console.log(`  📍 Public URL: ${publicUrl.publicUrl}`);
          } catch (error) {
            console.log(`  ❌ URL issue: ${error.message}`);
          }
        }
      }
    }
    
    // Frontend optimization suggestions
    console.log('\n🔧 FRONTEND OPTIMIZATION SUGGESTIONS:');
    console.log('1. 🖼️  Image Component Improvements:');
    console.log('   • Add lazy loading: loading="lazy"');
    console.log('   • Add placeholder/skeleton while loading');
    console.log('   • Use next/image or similar optimized components');
    console.log('   • Set proper width/height to prevent layout shift');
    
    console.log('\n2. 📱 Performance Improvements:');
    console.log('   • Generate thumbnails (150x150) for lists');
    console.log('   • Use full size (512x512) only for profile details');
    console.log('   • Implement progressive loading');
    console.log('   • Add error fallbacks');
    
    console.log('\n3. 🎨 CSS Optimizations:');
    console.log('   • Use object-fit: cover for consistent sizing');
    console.log('   • Add border-radius in CSS, not image processing');
    console.log('   • Use CSS transforms for hover effects');
    
    // Create sample optimized Avatar component
    console.log('\n📝 SAMPLE OPTIMIZED AVATAR COMPONENT:');
    const optimizedComponent = `
// OptimizedAvatar.tsx
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedAvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16'
};

export const OptimizedAvatar = ({ 
  src, 
  alt, 
  size = 'md', 
  fallback,
  className 
}: OptimizedAvatarProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  if (!src || hasError) {
    return (
      <div className={cn(
        'rounded-full bg-gradient-to-br from-blue-500 to-purple-600',
        'flex items-center justify-center text-white font-semibold',
        sizeClasses[size],
        className
      )}>
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }
  
  return (
    <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size], className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn(
          'w-full h-full object-cover transition-opacity duration-200',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};`;
    
    console.log(optimizedComponent);
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Review large files listed above');
    console.log('2. Test avatar loading in browser dev tools');
    console.log('3. Implement OptimizedAvatar component');
    console.log('4. Consider generating thumbnails for better performance');
    console.log('5. Only resize images >1MB to maintain quality');
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

optimizeAvatarsGently();
