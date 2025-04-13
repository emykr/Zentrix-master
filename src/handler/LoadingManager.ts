interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
}

class LoadingManager {
  private static instance: LoadingManager;
  private subscribers: ((state: LoadingState) => void)[] = [];
  private currentState: LoadingState = {
    isLoading: false,
    progress: 0,
    message: ''
  };
  private minLoadingTime = 1500; // 최소 1.5초
  private startTime: number = 0;

  private constructor() {}

  public static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  public subscribe(callback: (state: LoadingState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  public async startLoading(message: string): Promise<void> {
    this.startTime = Date.now();
    this.updateState({
      isLoading: true,
      progress: 0,
      message
    });
  }

  public updateProgress(progress: number, message?: string): void {
    this.updateState({
      ...this.currentState,
      progress: Math.min(100, Math.max(0, progress)),
      ...(message && { message })
    });
  }

  public async stopLoading(): Promise<void> {
    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, this.minLoadingTime - elapsed);
    
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }

    this.updateState({
      isLoading: false,
      progress: 100,
      message: ''
    });
  }

  private updateState(newState: Partial<LoadingState>): void {
    this.currentState = { ...this.currentState, ...newState };
    this.notifySubscribers(this.currentState);
  }

  private notifySubscribers(state: LoadingState): void {
    this.subscribers.forEach(callback => callback(state));
  }
}

export default LoadingManager;