import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { runAllAITests, getAPIKeyStatus } from "@/utils/aiFeatureTest";
import { getAPIKeyStatus as getConfigStatus, logAIConfigStatus } from "@/config/aiConfig";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export function AIFeatureDiagnostics() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [configStatus, setConfigStatus] = useState<any>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    logAIConfigStatus();
    
    try {
      const results = await runAllAITests();
      setTestResults(results);
      setConfigStatus(getConfigStatus());
    } catch (error) {
      console.error("[v0] Test error:", error);
      setTestResults([]);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Features Diagnostic</CardTitle>
          <CardDescription>Test and verify all AI features are working correctly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <h3 className="font-semibold mb-2">API Key Status</h3>
              <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono space-y-1">
                <div>Key: {getAPIKeyStatus().keyPartial}</div>
                <div>Configured: {getAPIKeyStatus().configured ? "✓ Yes" : "✗ No"}</div>
              </div>
            </div>

            <Button 
              onClick={handleRunTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? "Running Tests..." : "Run All AI Feature Tests"}
            </Button>

            {configStatus && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Configuration</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>API Key Valid:</span>
                    <Badge variant={configStatus.isValid ? "default" : "destructive"}>
                      {configStatus.isValid ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Enabled Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {configStatus.features.map((feature: string) => (
                        <Badge key={feature} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              {testResults.filter(r => r.status === "success").length} / {testResults.length} features working
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="mt-1">{getStatusIcon(result.status)}</div>
                  <div className="flex-1">
                    <div className="font-medium">{result.feature}</div>
                    <div className="text-sm text-gray-600">{result.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AIFeatureDiagnostics;
