import { useState } from 'react';
import { supabase } from '@sabo/shared-auth';
import { 
  Save, 
  Shield, 
  Bell, 
  Globe, 
  Database, 
  LogOut,
  Check
} from 'lucide-react';

export default function AdminSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    siteName: 'SABO Pool Arena Hub',
    siteUrl: 'https://sabopool.com',
    siteDescription: 'Professional billiards tournament management platform in Vietnam',
    language: 'en',
    twoFactor: false,
    sessionTimeout: true,
    maxLoginAttempts: 5,
    emailNotifications: true,
    pushNotifications: true,
    adminEmail: 'admin@sabopool.com',
    maintenanceMode: false,
    debugMode: false,
    cacheTimeout: 60,
    maxFileSize: 10,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      
      // In a real implementation, this would save to a settings table
      // For now, we'll simulate the save operation
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('❌ Failed to save settings:', error);
      setError(error.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect would happen here in a real implementation
      alert('Logged out successfully');
    } catch (error: any) {
      console.error('❌ Failed to sign out:', error);
      setError(error.message || 'Failed to sign out');
    }
  };

  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    disabled = false 
  }: { 
    checked: boolean; 
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  if (error) {
    return (
      <div className="text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Settings Error</h2>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-white'>⚙️ System Settings</h1>
            <p className='text-gray-400'>
              Manage system configuration and preferences
            </p>
          </div>
          <div className='flex gap-3'>
            <button
              onClick={handleLogout}
              className='flex items-center gap-2 px-4 py-2 text-red-400 border border-red-700 rounded hover:bg-red-900/20 transition-colors'
            >
              <LogOut className='w-4 h-4' />
              Sign Out
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50'
            >
              <Save className='w-4 h-4' />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-400">{successMessage}</span>
          </div>
        )}

        {/* Settings Sections */}
        <div className='grid gap-6'>
          {/* General Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className='w-5 h-5' />
                General Settings
              </h2>
              <p className="text-gray-400">Basic system configuration</p>
            </div>
            <div className="p-6 space-y-4">
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className="block text-sm font-medium text-gray-300">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className='space-y-2'>
                  <label className="block text-sm font-medium text-gray-300">
                    Main URL
                  </label>
                  <input
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <label className="block text-sm font-medium text-gray-300">
                  Site Description
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div className='space-y-2'>
                <label className="block text-sm font-medium text-gray-300">
                  Default Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className='w-5 h-5' />
                Security
              </h2>
              <p className="text-gray-400">Security and access control settings</p>
            </div>
            <div className="p-6 space-y-4">
              <div className='flex items-center justify-between'>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Require Two-Factor Authentication
                  </label>
                  <p className='text-sm text-gray-500'>
                    Require all admins to enable 2FA
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.twoFactor}
                  onChange={(checked) => handleSettingChange('twoFactor', checked)}
                />
              </div>
              <div className='flex items-center justify-between'>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Auto Logout
                  </label>
                  <p className='text-sm text-gray-500'>
                    Logout after 30 minutes of inactivity
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.sessionTimeout}
                  onChange={(checked) => handleSettingChange('sessionTimeout', checked)}
                />
              </div>
              <div className='space-y-2'>
                <label className="block text-sm font-medium text-gray-300">
                  Maximum Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bell className='w-5 h-5' />
                Notifications
              </h2>
              <p className="text-gray-400">Notification system configuration</p>
            </div>
            <div className="p-6 space-y-4">
              <div className='flex items-center justify-between'>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Email Notifications
                  </label>
                  <p className='text-sm text-gray-500'>
                    Send emails for important events
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.emailNotifications}
                  onChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              <div className='flex items-center justify-between'>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Push Notifications
                  </label>
                  <p className='text-sm text-gray-500'>
                    Send push notifications via browser
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.pushNotifications}
                  onChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>
              <div className='space-y-2'>
                <label className="block text-sm font-medium text-gray-300">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className='w-5 h-5' />
                System
              </h2>
              <p className="text-gray-400">Technical configuration and performance</p>
            </div>
            <div className="p-6 space-y-4">
              <div className='flex items-center justify-between'>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Maintenance Mode
                  </label>
                  <p className='text-sm text-gray-500'>
                    Temporarily disable user access
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.maintenanceMode}
                  onChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                />
              </div>
              <div className='flex items-center justify-between'>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Debug Mode
                  </label>
                  <p className='text-sm text-gray-500'>
                    Show detailed debug information
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.debugMode}
                  onChange={(checked) => handleSettingChange('debugMode', checked)}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className="block text-sm font-medium text-gray-300">
                    Cache Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.cacheTimeout}
                    onChange={(e) => handleSettingChange('cacheTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className='space-y-2'>
                  <label className="block text-sm font-medium text-gray-300">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Account Management */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className='w-5 h-5' />
                Admin Account Management
              </h2>
              <p className="text-gray-400">
                Operations with admin login session
              </p>
            </div>
            <div className="p-6">
              <div className='bg-red-900/20 border border-red-700 rounded-lg p-4'>
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='font-medium text-red-400'>Admin Logout</h3>
                    <p className='text-sm text-red-300 mt-1'>
                      Sign out from admin system and return to main page
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className='ml-4 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors'
                  >
                    <LogOut className='w-4 h-4' />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
