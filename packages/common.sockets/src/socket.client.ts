/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';
import { SOCKET_ENDPOINT, SOCKET_OPTIONS } from './socket.config';

/**
 * Класс для работы с Socket.IO
 */
class SocketClient {
  private socket: Socket | null = null;
  private eventHandlers = new Map<string, Set<(...args: any[]) => void>>();

  /**
   * Подключение к серверу Socket.IO
   */
  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_ENDPOINT, SOCKET_OPTIONS);

      // Регистрируем обработчики для всех событий
      this.eventHandlers.forEach((handlers, event) => {
        handlers.forEach((handler) => {
          this.socket?.on(event, handler);
        });
      });
    } else if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  /**
   * Отключение от сервера Socket.IO
   */
  disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  /**
   * Подписка на событие
   */
  on<T = any>(event: string, handler: (data: T) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)?.add(handler);

    if (this.socket) {
      this.socket.on(event, handler);
    }

    // Возвращаем функцию для отписки
    return () => this.off(event, handler);
  }

  /**
   * Отписка от события
   */
  off(event: string, handler: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, handler);
    }

    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  /**
   * Отправка события
   */
  emit<T = any>(event: string, data?: T): void {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket is not connected. Connecting and trying again...');
      this.connect();
      // Ждем подключения и отправляем событие
      setTimeout(() => {
        if (this.socket) {
          this.socket.emit(event, data);
        }
      }, 100);
    }
  }

  /**
   * Является ли сокет подключенным
   */
  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  /**
   * Получение экземпляра сокета
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Экспортируем синглтон
export const socketClient = new SocketClient();
