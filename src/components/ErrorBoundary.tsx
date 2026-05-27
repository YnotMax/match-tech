import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../lib/logger';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('React component threw an error', { error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-neo-bg flex items-center justify-center p-6 font-sans"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M40 40H0V0h1v39h39v1z' fill='%23000' fill-opacity='0.1'/%3E%3C/svg%3E")`
          }}
        >
          <div className="max-w-2xl w-full">
            {/* Main error card */}
            <div className="bg-white border-[4px] border-neo-black shadow-[8px_8px_0_0_#000] p-8 md:p-12 relative">
              
              {/* Decorative corner accent */}
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-neo-pink border-[3px] border-neo-black rotate-12 shadow-[3px_3px_0_0_#000]"></div>
              <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-neo-lime border-[3px] border-neo-black -rotate-6 shadow-[3px_3px_0_0_#000]"></div>

              {/* Alert icon */}
              <div className="w-20 h-20 bg-neo-yellow border-[4px] border-neo-black shadow-[4px_4px_0_0_#000] flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-heading font-black">⚠️</span>
              </div>

              {/* Title */}
              <h1 className="font-heading font-black text-3xl md:text-5xl uppercase tracking-tighter text-center mb-4">
                OOPS, ALGO QUEBROU_
              </h1>

              {/* Friendly message */}
              <div className="bg-neo-bg border-[3px] border-neo-black p-6 mb-6">
                <p className="font-bold text-base md:text-lg mb-3">
                  Olá! Parece que algo deu errado, né? 😅
                </p>
                <p className="text-sm md:text-base mb-3">
                  Este é o <span className="bg-neo-yellow px-1 font-bold">primeiro projeto desta turma</span> — dá um desconto! 
                  Que tal me avisar sobre esse erro?
                </p>
                <p className="text-sm md:text-base">
                  Você pode inspecionar a página (<kbd className="bg-neo-black text-white px-2 py-0.5 font-mono text-xs border-[2px] border-neo-black shadow-[2px_2px_0_0_#B8FF29]">F12</kbd> → Console), 
                  copiar o log e me mandar. Já vai ajudar <span className="font-black uppercase">MUITO</span>.
                </p>
              </div>

              {/* Technical error - terminal style */}
              <div className="bg-neo-black text-neo-lime p-4 border-[3px] border-neo-black mb-6 font-mono text-xs md:text-sm overflow-x-auto">
                <p className="text-neo-pink mb-1 font-bold">{'>'} error.message:</p>
                <p className="break-all mb-2 opacity-90">{this.state.error?.message || 'Unknown error'}</p>
                <p className="text-neo-cyan text-[10px] opacity-60">Copie esse texto e mande pro Tony ;)</p>
              </div>

              {/* Action button */}
              <div className="flex justify-center">
                <button 
                  className="px-8 py-4 bg-neo-lime text-neo-black font-heading font-black text-lg uppercase border-[4px] border-neo-black shadow-[6px_6px_0_0_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                  onClick={() => window.location.reload()}
                >
                  RECARREGAR PÁGINA →
                </button>
              </div>
            </div>

            {/* Fun footer */}
            <div className="mt-6 text-center">
              <p className="font-mono text-xs font-bold bg-white border-[3px] border-neo-black shadow-[4px_4px_0_0_#000] inline-block px-4 py-2">
                Foi um erro mesmo ou eu fiz isso de propósito pra você ver esta linda página? 🤔
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
