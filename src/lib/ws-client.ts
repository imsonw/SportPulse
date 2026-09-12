import { WS_URL } from './env';

type MessageListener<T = unknown> = (data: T) => void;

interface WSClientOptions {
  url: string;
  initialRetryDelay?: number; // Thời gian chờ thử lại ban đầu (mặc định 1000ms)
  maxRetryDelay?: number; // Thời gian chờ thử lại tối đa (mặc định 30000ms)
}

export class WSClient {
  private url: string;
  private socket: WebSocket | null = null;
  private listeners: Set<MessageListener> = new Set();
  private retryCount = 0;
  private initialRetryDelay: number;
  private maxRetryDelay: number;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isIntentionallyClosed = false;

  constructor(options: WSClientOptions) {
    this.url = options.url;
    this.initialRetryDelay = options.initialRetryDelay ?? 1000;
    this.maxRetryDelay = options.maxRetryDelay ?? 30000;
  }

  /**
   * Khởi tạo kết nối WebSocket.
   */
  public connect(): void {
    this.isIntentionallyClosed = false;

    // Tránh khởi tạo chồng chéo nếu socket đang mở hoặc đang kết nối
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        // WHY: Bắt buộc reset retryCount = 0 khi kết nối thành công,
        // để lần đứt mạng tiếp theo sẽ bắt đầu lại từ delay ban đầu (1s) thay vì lùi lại quá lâu.
        this.retryCount = 0;
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const parsedData = JSON.parse(event.data);
          this.notifyListeners(parsedData);
        } catch {
          // Nếu dữ liệu dạng text thuần không phải JSON, gửi trực tiếp
          this.notifyListeners(event.data);
        }
      };

      this.socket.onerror = () => {
        // Xử lý đứt mạng sẽ được tự động kích hoạt ở onclose
      };

      this.socket.onclose = () => {
        this.socket = null;
        // Chỉ tự động reconnect nếu không phải do app chủ động đóng kết nối (disconnect)
        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  /**
   * Tính toán thời gian lùi theo thuật toán Exponential Backoff và đặt Timer thử kết nối lại.
   *
   * WHY: Thuật toán (initialDelay * 2^retryCount) giới hạn bởi maxRetryDelay giúp tránh bào mòn
   * tài nguyên Pin thiết bị và ngăn chặn hiện tượng dồn ép làm sập Server khi mạng khôi phục.
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(
      this.initialRetryDelay * Math.pow(2, this.retryCount),
      this.maxRetryDelay,
    );

    this.retryCount++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Đăng ký lắng nghe sự kiện từ WebSocket.
   * Trả về hàm cleanup để unsubscribe dễ dàng trong useEffect.
   */
  public subscribe<T = unknown>(listener: MessageListener<T>): () => void {
    const genericListener = listener as MessageListener;
    this.listeners.add(genericListener);

    return () => {
      this.listeners.delete(genericListener);
    };
  }

  /**
   * Bắn dữ liệu giả lập cho môi trường Test/Dev (không cần Server WS thật)
   */
  public emitMockEvent<T>(data: T): void {
    this.notifyListeners(data);
  }

  private notifyListeners(data: unknown): void {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error('Error in WS listener:', err);
      }
    });
  }

  /**
   * Chủ động đóng kết nối (ví dụ khi app bị kill hoặc unmount hoàn toàn).
   */
  public disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Singleton Instance sử dụng trong toàn bộ dự án
export const wsClient = new WSClient({
  url: WS_URL, // Đọc từ app.json > extra qua env.ts — không hardcode URL (nguyên tắc TASK-23 Sprint 1)
  initialRetryDelay: 1000,
  maxRetryDelay: 30000,
});
