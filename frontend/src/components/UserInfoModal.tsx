import React from 'react';
import type { User } from '../auth/AuthContext';

interface UserInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    userInfo: User | null;
}

export const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, onClose, userInfo }) => {
    if (!isOpen || !userInfo) return null;

    return (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
                onClick={onClose} 
            />
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col relative">
                {/* Header */}
                <div className="bg-[#020617] p-5 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Información de Usuario
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Common Name Section */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                            Nombre Completo
                        </label>
                        <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-slate-800/80 shadow-inner">
                            <span className="text-white font-bold text-lg block truncate">
                                {userInfo.cn || userInfo.username}
                            </span>
                        </div>
                    </div>

                    {/* Username Section */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                            Identificador de Usuario (UPN)
                        </label>
                        <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-slate-800/80">
                            <span className="text-rose-400 font-mono font-bold text-md block truncate">
                                {userInfo.username}
                            </span>
                        </div>
                    </div>

                    {/* Groups Section */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">
                            Grupos y Permisos ({userInfo.groups.length})
                        </label>

                        <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-slate-800/80 max-h-60 overflow-y-auto custom-scrollbar shadow-inner">
                            {userInfo.groups.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {userInfo.groups.map((group: string, index: number) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 border border-slate-800"
                                        >
                                            {group}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm italic p-2">Sin grupos asignados</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[#020617] p-5 border-t border-slate-800 flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                             <span>APP: v1.0.0</span>
                             <span className="text-slate-700">|</span>
                             <span>API: v1.0.0</span>
                        </div>
                        <div className="px-3 py-1 bg-slate-950 rounded border border-slate-800">
                            <span className="text-xs font-mono text-rose-500 font-bold tracking-widest uppercase">
                                DEUDA SATYA
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95"
                    >
                        Cerrar Sesión Informativa
                    </button>
                </div>
            </div>
        </div>
    );
};
