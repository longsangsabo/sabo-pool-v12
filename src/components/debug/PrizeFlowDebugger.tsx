// Debug component to test prize data flow
import React, { useState } from 'react';
import { TournamentPrizesManager } from '../tournament/TournamentPrizesManager';
import { TournamentPrizesService } from '@/services/tournament-prizes.service';

export const PrizeFlowDebugger = () => {
  const [receivedPrizes, setReceivedPrizes] = useState([]);
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (message) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCreateDefaultTemplate = () => {
    try {
      addTestResult('Testing createDefaultPrizeTemplate...');
      const template = TournamentPrizesService.createDefaultPrizeTemplate(
        'debug-test-123',
        'standard',
        1000000
      );
      
      addTestResult(`✅ Template created: ${template.length} positions`);
      addTestResult(`First position: ${template[0]?.position_name} - ${template[0]?.cash_amount}₫`);
      return template;
    } catch (error) {
      addTestResult(`❌ Template creation failed: ${error.message}`);
      return null;
    }
  };

  const testBulkCreate = async (template) => {
    if (!template) return;
    
    try {
      addTestResult('Testing createBulkTournamentPrizes...');
      const result = await TournamentPrizesService.createBulkTournamentPrizes(template);
      addTestResult(`✅ Bulk create success: ${result.length} prizes saved`);
      
      // Clean up test data
      // Note: We'd need a delete method to clean up properly
      addTestResult('Test data needs manual cleanup from database');
      
    } catch (error) {
      addTestResult(`❌ Bulk create failed: ${error.message}`);
    }
  };

  const runFullTest = async () => {
    addTestResult('🎯 Starting full prize flow test...');
    const template = testCreateDefaultTemplate();
    if (template) {
      await testBulkCreate(template);
    }
  };

  return (
    <div className="p-6 space-y-4 border-2 border-red-500 rounded-lg">
      <h2 className="text-xl font-bold text-red-700">🔍 Prize Flow Debugger</h2>
      
      <div className="space-y-2">
        <button 
          onClick={testCreateDefaultTemplate}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test createDefaultPrizeTemplate
        </button>
        
        <button 
          onClick={runFullTest}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Run Full Test
        </button>
        
        <button 
          onClick={() => { setTestResults([]); setReceivedPrizes([]); }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-green-700">TournamentPrizesManager Preview</h3>
          <div className="border p-2 h-40 overflow-auto">
            <TournamentPrizesManager
              tournamentId="debug-preview-mode"
              initialPrizePool={1000000}
              isPreviewMode={true}
              onPrizesChange={(prizes) => {
                console.log('🏆 [Debugger] Received prizes:', prizes.length);
                setReceivedPrizes(prizes);
                addTestResult(`📨 Received ${prizes.length} prizes from TournamentPrizesManager`);
              }}
            />
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-purple-700">Received Prizes ({receivedPrizes.length})</h3>
          <div className="border p-2 h-40 overflow-auto text-xs">
            {receivedPrizes.map((prize, idx) => (
              <div key={idx} className="border-b py-1">
                {prize.position_name}: {prize.cash_amount}₫
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-orange-700">Test Results</h3>
        <div className="border p-2 h-32 overflow-auto text-xs bg-gray-50">
          {testResults.map((result, idx) => (
            <div key={idx} className="font-mono">
              {result}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
