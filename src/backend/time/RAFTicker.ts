type Listener = () => void;

class RAFTicker {
  
  private listeners = new Set<Listener>();
  private rafId: number | null = null;

  private loop = () => {
    this.listeners.forEach((listener) => listener());
    this.rafId = requestAnimationFrame(this.loop);
  };

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.loop);
    }

    return () => {
      this.listeners.delete(listener);

      if (this.listeners.size === 0 && this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    };
  }
}

export const rafTicker = new RAFTicker();
