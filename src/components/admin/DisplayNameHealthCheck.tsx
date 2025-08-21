import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const DisplayNameHealthCheck = () => {
  const [checking, setChecking] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const checkConsistency = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.rpc('check_display_name_consistency');
      
      if (error) {
        console.error('Health check error:', error);
        toast.error('Failed to check display name health');
        return;
      }

      setHealthStatus(data);
      console.log('Display name health:', data);
      
      if (data?.all_consistent) {
        toast.success('✅ All display names are consistent!');
      } else {
        toast.warning(`Found ${data?.inconsistent_count || 0} inconsistencies`);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error('Health check failed');
    } finally {
      setChecking(false);
    }
  };

  const repairInconsistencies = async () => {
    setRepairing(true);
    try {
      const { data, error } = await supabase.rpc('repair_display_name_inconsistencies');
      
      if (error) {
        console.error('Repair error:', error);
        toast.error('Failed to repair inconsistencies');
        return;
      }

      console.log('Repair result:', data);
      toast.success(`✅ Repaired ${data?.repaired_count || 0} display names!`);
      
      // Re-check after repair
      setTimeout(checkConsistency, 1000);
    } catch (error) {
      console.error('Repair failed:', error);
      toast.error('Repair failed');
    } finally {
      setRepairing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Display Name Health Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        {healthStatus && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              {healthStatus.all_consistent ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="font-medium">
                Status: {healthStatus.all_consistent ? 'Healthy' : 'Needs Repair'}
              </span>
            </div>
            <div>
              <span className="font-medium">Total Profiles: </span>
              {healthStatus.total_profiles || 0}
            </div>
            <div>
              <span className="font-medium">Consistent: </span>
              {healthStatus.consistent_count || 0}
            </div>
            <div>
              <span className="font-medium">Inconsistent: </span>
              <span className={healthStatus.inconsistent_count > 0 ? 'text-red-500' : 'text-green-500'}>
                {healthStatus.inconsistent_count || 0}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={checkConsistency}
            disabled={checking}
            variant="outline"
          >
            {checking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Health'
            )}
          </Button>
          
          <Button 
            onClick={repairInconsistencies}
            disabled={repairing}
            variant="default"
          >
            {repairing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Repairing...
              </>
            ) : (
              'Repair Issues'
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground">
          <p>
            This tool checks if all display names in the database are consistent with the unified 
            <code className="mx-1 px-1 bg-muted rounded">get_user_display_name()</code> function.
          </p>
          <p className="mt-2">
            The repair function will update any inconsistent display names to match the unified logic.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
