import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Target, Flame, Clock, Trophy } from 'lucide-react';

const ChallengeTabsDebug: React.FC = () => {
  return (
    <div className="card-spacing">
      <h1 className="text-heading-bold mb-4">Challenge Tabs Debug</h1>
      
      <Card>
        <CardContent className="card-spacing">
          <Tabs defaultValue="keo" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="keo">
                <Target className="w-4 h-4 mr-2" />
                Kèo
              </TabsTrigger>
              <TabsTrigger value="live">
                <Flame className="w-4 h-4 mr-2" />
                Live
              </TabsTrigger>
              <TabsTrigger value="sap">
                <Clock className="w-4 h-4 mr-2" />
                Sắp
              </TabsTrigger>
              <TabsTrigger value="xong">
                <Trophy className="w-4 h-4 mr-2" />
                Xong
              </TabsTrigger>
            </TabsList>

            <TabsContent value="keo" className="mt-4">
              <div className="p-4 border rounded">
                <h3 className="font-semibold">Kèo Tab</h3>
                <p>Content for Kèo tab</p>
              </div>
            </TabsContent>

            <TabsContent value="live" className="mt-4">
              <div className="p-4 border rounded">
                <h3 className="font-semibold">Live Tab</h3>
                <p>Content for Live tab</p>
              </div>
            </TabsContent>

            <TabsContent value="sap" className="mt-4">
              <div className="p-4 border rounded">
                <h3 className="font-semibold">Sắp Tab</h3>
                <p>Content for Sắp tab</p>
              </div>
            </TabsContent>

            <TabsContent value="xong" className="mt-4">
              <div className="p-4 border rounded">
                <h3 className="font-semibold">Xong Tab</h3>
                <p>Content for Xong tab</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeTabsDebug;
