/**
 * SERVICE AUTO-DOCUMENTATION GENERATOR
 * ===================================
 * 
 * Script to automatically generate service documentation
 * Copilot có thể run script này để get latest service info
 */

import fs from 'fs';
import path from 'path';

const SERVICES_DIR = '/workspaces/sabo-pool-v12/apps/sabo-user/src/services';
const SHARED_DIR = '/workspaces/sabo-pool-v12/packages/shared-business/src';

interface ServiceInfo {
  name: string;
  filePath: string;
  methods: string[];
  dependencies: string[];
  imports: string[];
  exports: string[];
  lastModified: string;
}

/**
 * Parse a service file and extract metadata
 */
function parseServiceFile(filePath: string): ServiceInfo | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, '.ts');
    
    // Extract methods (public async methods)
    const methodRegex = /async\s+(\w+)\s*\(/g;
    const methods: string[] = [];
    let match;
    while ((match = methodRegex.exec(content)) !== null) {
      methods.push(match[1]);
    }
    
    // Extract imports
    const importRegex = /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g;
    const imports: string[] = [];
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // Extract exports
    const exportRegex = /export\s+(?:const|class|function)\s+(\w+)/g;
    const exports: string[] = [];
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    // Get dependencies (other services imported)
    const dependencies = imports
      .filter(imp => imp.includes('Service') || imp.includes('/services/'))
      .map(imp => imp.split('/').pop()?.replace('.ts', '') || imp);
    
    const stats = fs.statSync(filePath);
    
    return {
      name: fileName,
      filePath,
      methods,
      dependencies,
      imports,
      exports,
      lastModified: stats.mtime.toISOString()
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Scan directory for service files
 */
function scanServiceDirectory(dir: string): ServiceInfo[] {
  const services: ServiceInfo[] = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      if (file.endsWith('Service.ts') || file.endsWith('service.ts')) {
        const filePath = path.join(dir, file);
        const serviceInfo = parseServiceFile(filePath);
        
        if (serviceInfo) {
          services.push(serviceInfo);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  
  return services;
}

/**
 * Generate service documentation
 */
function generateServiceDocs(): void {
  console.log('🔍 Scanning for services...');
  
  // Scan main services directory
  const mainServices = scanServiceDirectory(SERVICES_DIR);
  
  // Scan shared services directories
  const sharedDirs = [
    path.join(SHARED_DIR, 'user'),
    path.join(SHARED_DIR, 'payment'),
    path.join(SHARED_DIR, 'mobile'),
    path.join(SHARED_DIR, 'tournament'),
    path.join(SHARED_DIR, 'club')
  ];
  
  const sharedServices: ServiceInfo[] = [];
  for (const dir of sharedDirs) {
    if (fs.existsSync(dir)) {
      sharedServices.push(...scanServiceDirectory(dir));
    }
  }
  
  // Generate documentation
  const allServices = [...mainServices, ...sharedServices];
  
  console.log(`📊 Found ${allServices.length} services`);
  
  // Generate markdown documentation
  const markdown = generateMarkdownDocs(allServices);
  
  // Write to file
  const outputPath = '/workspaces/sabo-pool-v12/SERVICE_AUTO_DOCS.md';
  fs.writeFileSync(outputPath, markdown);
  
  console.log(`✅ Documentation generated: ${outputPath}`);
  
  // Generate JSON for programmatic access
  const json = JSON.stringify(allServices, null, 2);
  const jsonPath = '/workspaces/sabo-pool-v12/services-metadata.json';
  fs.writeFileSync(jsonPath, json);
  
  console.log(`✅ Metadata generated: ${jsonPath}`);
}

/**
 * Generate markdown documentation
 */
function generateMarkdownDocs(services: ServiceInfo[]): string {
  const now = new Date().toISOString();
  
  let markdown = `# Auto-Generated Service Documentation\n\n`;
  markdown += `Generated: ${now}\n\n`;
  markdown += `Total Services: ${services.length}\n\n`;
  
  // Group by category
  const categories: Record<string, ServiceInfo[]> = {};
  
  services.forEach(service => {
    const category = determineCategory(service.name);
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(service);
  });
  
  // Generate docs for each category
  Object.entries(categories).forEach(([category, categoryServices]) => {
    markdown += `## ${category.toUpperCase()}\n\n`;
    
    categoryServices.forEach(service => {
      markdown += `### ${service.name}\n\n`;
      markdown += `**File**: \`${service.filePath}\`\n\n`;
      markdown += `**Last Modified**: ${service.lastModified}\n\n`;
      
      if (service.methods.length > 0) {
        markdown += `**Methods**:\n`;
        service.methods.forEach(method => {
          markdown += `- \`${method}()\`\n`;
        });
        markdown += `\n`;
      }
      
      if (service.dependencies.length > 0) {
        markdown += `**Dependencies**:\n`;
        service.dependencies.forEach(dep => {
          markdown += `- ${dep}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
  });
  
  return markdown;
}

/**
 * Determine service category based on name
 */
function determineCategory(serviceName: string): string {
  const name = serviceName.toLowerCase();
  
  if (name.includes('user') || name.includes('auth') || name.includes('profile')) {
    return 'Authentication';
  }
  if (name.includes('tournament') || name.includes('challenge') || name.includes('match')) {
    return 'Tournaments';
  }
  if (name.includes('payment') || name.includes('wallet') || name.includes('transaction')) {
    return 'Payments';
  }
  if (name.includes('club') || name.includes('member') || name.includes('role')) {
    return 'Clubs';
  }
  if (name.includes('notification') || name.includes('email') || name.includes('message')) {
    return 'Communication';
  }
  if (name.includes('storage') || name.includes('cache') || name.includes('sync')) {
    return 'Data';
  }
  if (name.includes('analytics') || name.includes('report') || name.includes('metrics')) {
    return 'Analytics';
  }
  
  return 'Other';
}

/**
 * COPILOT UTILITY FUNCTIONS
 * =========================
 */

/**
 * Get current service information
 * Copilot: Run this to get fresh service data
 */
export function getCCurrentServiceInfo(): ServiceInfo[] {
  const mainServices = scanServiceDirectory(SERVICES_DIR);
  const sharedServices = scanServiceDirectory(SHARED_DIR);
  return [...mainServices, ...sharedServices];
}

/**
 * Find service by name
 * Copilot: Use this to locate specific services
 */
export function findService(name: string): ServiceInfo | null {
  const services = getCCurrentServiceInfo();
  return services.find(s => 
    s.name.toLowerCase().includes(name.toLowerCase()) ||
    s.filePath.toLowerCase().includes(name.toLowerCase())
  ) || null;
}

/**
 * Get services by category
 * Copilot: Use this to explore services in specific domains
 */
export function getServicesByCategory(category: string): ServiceInfo[] {
  const services = getCCurrentServiceInfo();
  return services.filter(s => determineCategory(s.name).toLowerCase() === category.toLowerCase());
}

// Run if executed directly
if (require.main === module) {
  generateServiceDocs();
}

export { generateServiceDocs, parseServiceFile, scanServiceDirectory };
