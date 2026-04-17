import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App error boundary caught:", error, info);
    // TODO: Sentry.captureException(error, { extra: info });
  }

  reset = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
              ⚠️
            </div>
            <h1 className="font-heading text-2xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              An unexpected error interrupted the story. Try reloading the page.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
              >
                Reload page
              </button>
              <button
                onClick={this.reset}
                className="rounded-full border border-border px-5 py-2 text-sm font-medium"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
