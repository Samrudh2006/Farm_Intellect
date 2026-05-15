import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reportError } from '@/lib/error-handling';

interface State {
  hasError: boolean;
  error?: Error;
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("[v0] Error boundary caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    console.error("[v0] Error boundary logging error:", error.message, error.stack);
    reportError('AppErrorBoundary', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The application hit an unexpected error. You can refresh the page and continue working.
              </p>
              {this.state.error && (
                <div className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  <code className="text-muted-foreground">{this.state.error.message}</code>
                </div>
              )}
              <Button onClick={() => window.location.reload()}>Reload application</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
