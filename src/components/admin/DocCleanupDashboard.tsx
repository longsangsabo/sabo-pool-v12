import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  FileText, Archive, Trash2, AlertTriangle, CheckCircle, 
  Play, Eye, RefreshCw, Activity, HardDrive, Zap 
} from 'lucide-react';

/**
 * 📊 DOC CLEANUP ADMIN COMPONENT
 * React component for monitoring document cleanup system
 */

const DocCleanupDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  // API base URL - adjust according to your setup
  const API_BASE = import.meta.env.VITE_CLEANUP_API || 'http://localhost:3001/api';

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('Loading dashboard data from:', API_BASE);
      
      const [metricsRes, trendsRes, healthRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard`),
        fetch(`${API_BASE}/metrics/trends?period=30d`),
        fetch(`${API_BASE}/system/health`)
      ]);

      console.log('API responses status:', {
        metrics: metricsRes.status,
        trends: trendsRes.status,
        health: healthRes.status
      });

      const [metricsData, trendsData, healthData] = await Promise.all([
        metricsRes.json(),
        trendsRes.json(),
        healthRes.json()
      ]);

      console.log('Loaded data:', { metricsData, trendsData, healthData });

      setMetrics(metricsData);
      setTrends(trendsData);
      setHealth(healthData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set fallback data to prevent white screen
      setMetrics({
        summary: { totalFiles: 0, cleanupEfficiency: 0, systemHealth: 0 },
        alerts: [],
        recentActivity: []
      });
      setTrends({ trends: [] });
      setHealth({ status: 'error', message: 'Failed to connect to API' });
    } finally {
      setLoading(false);
    }
  };

  const triggerCleanup = async (dryRun = false) => {
    setTriggering(true);
    try {
      const response = await fetch(`${API_BASE}/cleanup/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'full', dryRun })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        setTimeout(loadDashboardData, 2000); // Refresh after 2s
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    } finally {
      setTriggering(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading cleanup dashboard...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">🤖 Doc Cleanup Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage intelligent document cleanup automation
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => triggerCleanup(true)}
            disabled={triggering}
          >
            <Eye className="h-4 w-4 mr-2" />
            Dry Run
          </Button>
          <Button 
            onClick={() => triggerCleanup(false)}
            disabled={triggering}
          >
            {triggering ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Cleanup
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {metrics?.alerts?.length > 0 && (
        <div className="space-y-2">
          {metrics.alerts.map((alert, index) => (
            <Alert key={index} variant={alert.level === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.message}</strong> - {alert.action}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.summary?.totalFiles || 0}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Space Saved</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(metrics?.summary?.spaceSaved || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Through automated cleanup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cleanup Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.summary?.cleanupEfficiency || 0}%</div>
            <Progress value={metrics?.summary?.cleanupEfficiency || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{health?.overall || 0}%</div>
              {health?.daemon ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {health?.daemon ? 'Daemon running' : 'Daemon stopped'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>📈 File Count Trend</CardTitle>
            <CardDescription>Document count over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends?.fileCount || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={formatDate}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🧹 Cleanup Activity</CardTitle>
            <CardDescription>Files processed and removed daily</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends?.cleanupActivity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={formatDate}
                />
                <Bar dataKey="filesProcessed" fill="#8884d8" name="Processed" />
                <Bar dataKey="filesRemoved" fill="#82ca9d" name="Removed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>⚙️ System Status</CardTitle>
            <CardDescription>Current status of cleanup components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Cleanup Daemon</span>
              <Badge variant={health?.daemon ? "default" : "destructive"}>
                {health?.daemon ? "Running" : "Stopped"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Configuration</span>
              <Badge variant={health?.configuration ? "default" : "destructive"}>
                {health?.configuration ? "Valid" : "Invalid"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Storage Access</span>
              <Badge variant={health?.storage ? "default" : "destructive"}>
                {health?.storage ? "OK" : "Error"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Permissions</span>
              <Badge variant={health?.permissions ? "default" : "destructive"}>
                {health?.permissions ? "OK" : "Error"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Recent Activity</CardTitle>
            <CardDescription>Latest cleanup operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.recentActivity?.map((activity, index) => (
                <div key={index} className="flex flex-col space-y-1 pb-3 border-b last:border-0">
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-sm text-muted-foreground">{activity.result}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Document Distribution</CardTitle>
          <CardDescription>Current organization of documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics?.fileDistribution?.active || 0}
              </div>
              <div className="text-sm text-muted-foreground">Active Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics?.fileDistribution?.archived || 0}
              </div>
              <div className="text-sm text-muted-foreground">Archived</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {metrics?.fileDistribution?.quarantine || 0}
              </div>
              <div className="text-sm text-muted-foreground">In Quarantine</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocCleanupDashboard;
