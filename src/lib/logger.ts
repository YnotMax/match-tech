type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Módulos do sistema para filtrar no console
type Module = 'Auth' | 'Firestore' | 'Firebase' | 'Router' | 'API' | 'UI' | 'App';

const COLORS: Record<Module, string> = {
  Auth:      'color: #FF2E93; font-weight: bold',  // neo-pink
  Firestore: 'color: #00E5FF; font-weight: bold',  // neo-cyan
  Firebase:  'color: #FFC900; font-weight: bold',  // neo-yellow
  Router:    'color: #B8FF29; font-weight: bold',  // neo-lime
  API:       'color: #9C27B0; font-weight: bold',  // purple
  UI:        'color: #607D8B; font-weight: bold',  // gray
  App:       'color: #FF5722; font-weight: bold',  // orange
};

const LEVEL_ICONS: Record<LogLevel, string> = {
  info:  'ℹ️',
  warn:  '⚠️',
  error: '❌',
  debug: '🔍',
};

class SystemLogger {
  private module: Module;

  constructor(module: Module = 'App') {
    this.module = module;
  }

  /** Cria um sub-logger para um módulo específico */
  scope(module: Module): SystemLogger {
    return new SystemLogger(module);
  }

  private formatPrefix(level: LogLevel): string {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false, fractionalSecondDigits: 3 });
    return `${LEVEL_ICONS[level]} [${time}] [${this.module}]`;
  }

  info(message: string, data?: any) {
    if (data !== undefined) {
      console.info(`%c${this.formatPrefix('info')}`, COLORS[this.module], message, data);
    } else {
      console.info(`%c${this.formatPrefix('info')}`, COLORS[this.module], message);
    }
  }

  warn(message: string, data?: any) {
    if (data !== undefined) {
      console.warn(`%c${this.formatPrefix('warn')}`, COLORS[this.module], message, data);
    } else {
      console.warn(`%c${this.formatPrefix('warn')}`, COLORS[this.module], message);
    }
  }

  error(message: string, error?: any) {
    if (error !== undefined) {
      console.error(`%c${this.formatPrefix('error')}`, COLORS[this.module], message, error);
    } else {
      console.error(`%c${this.formatPrefix('error')}`, COLORS[this.module], message);
    }
    // Log extra context for Firebase errors
    if (error?.code) {
      console.error(`%c${this.formatPrefix('error')}`, COLORS[this.module], `  └─ Firebase code: ${error.code}`);
    }
    if (error?.message && error?.message !== message) {
      console.error(`%c${this.formatPrefix('error')}`, COLORS[this.module], `  └─ Detail: ${error.message}`);
    }
  }

  debug(message: string, data?: any) {
    if (data !== undefined) {
      console.debug(`%c${this.formatPrefix('debug')}`, COLORS[this.module], message, data);
    } else {
      console.debug(`%c${this.formatPrefix('debug')}`, COLORS[this.module], message);
    }
  }

  /** Mede tempo de execução de uma operação async */
  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    this.debug(`⏱️ ${label} — iniciando...`);
    try {
      const result = await fn();
      const ms = (performance.now() - start).toFixed(1);
      this.info(`✅ ${label} — concluído em ${ms}ms`);
      return result;
    } catch (err) {
      const ms = (performance.now() - start).toFixed(1);
      this.error(`${label} — falhou após ${ms}ms`, err);
      throw err;
    }
  }

  /** Log de tabela para dados estruturados */
  table(label: string, data: any[]) {
    console.groupCollapsed(`%c${this.formatPrefix('info')}`, COLORS[this.module], label);
    console.table(data);
    console.groupEnd();
  }
}

// Loggers pré-configurados por módulo
export const logger = new SystemLogger('App');
export const authLog = new SystemLogger('Auth');
export const firestoreLog = new SystemLogger('Firestore');
export const firebaseLog = new SystemLogger('Firebase');
export const apiLog = new SystemLogger('API');
export const uiLog = new SystemLogger('UI');
