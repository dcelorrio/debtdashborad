import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

// --- Icons ---
const Icons = {
    Eye: (props: React.SVGProps<SVGSVGElement>) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
    EyeOff: (props: React.SVGProps<SVGSVGElement>) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
}

export const Login: React.FC = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('scope', 'APP_DEUDA_');

            const response = await fetch('/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            if (!response.ok) {
                let errMessage = `Error HTTP: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errMessage = errorData.detail || errMessage;
                } catch (e) {
                    console.error("Error parsing response:", e);
                }
                setError(errMessage);
                return;
            }

            const data = await response.json();
            
            // Decodificar el JWT para sacar el username y los grupos de forma básica
            const token = data.access_token;
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            
            const user = {
                username: decodedPayload.sub,
                groups: decodedPayload.groups || [],
                cn: decodedPayload.cn || '',
                dn: decodedPayload.dn || ''
            };

            // Intentar hacer login (si no tiene los grupos, lanzará error)
            login(token, user);

        } catch (err: any) {
            setError(err.message || "Error al conectar con el servidor SSO.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0f172a] rounded-2xl border border-slate-800 shadow-2xl p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-4">
                        <img src="/satya_logo.png" alt="Logo" className="h-32 object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2 uppercase tracking-wider">DEUDA SATYA</h1>
                    <p className="text-slate-400 text-sm">Acceso al Sistema</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#1e293b] text-white px-4 py-3 rounded-xl border border-slate-700 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all font-mono"
                            placeholder="admin"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#1e293b] text-white px-4 py-3 pr-12 rounded-xl border border-slate-700 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all font-mono"
                                placeholder="••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                                tabIndex={-1}
                            >
                                {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-bold text-center animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-rose-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Verificando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};
