import React from "react";
import { LogIn, Loader2 } from "lucide-react";
import { Input } from "../ui/Input";
import { Btn } from "../ui/Btn";
import { Alert } from "../ui/Alert";
import { QuatmoLogo } from "../ui/QuatmoLogo";

export function LoginForm({ proxyUrl, setProxyUrl, apiKey, setApiKey, authErr, loading, handleConnect }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-3xl shadow-2xl p-8 w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/20 border border-orange-200 shadow-md mb-4 p-2">
            <QuatmoLogo className="w-16 h-16" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Quạt Mo Bubble Chat</h1>
          <p className="text-slate-500 text-sm mt-1">Multi-app embeddable AI chatbot management</p>
        </div>

        <form onSubmit={handleConnect} className="flex flex-col gap-4">
          <Input
            label="Proxy URL"
            id="proxyUrl"
            type="url"
            value={proxyUrl}
            onChange={e => setProxyUrl(e.target.value)}
            placeholder="http://localhost:3000"
          />
          <Input
            label="Proxy API Key"
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-..."
            autoComplete="current-password"
          />
          {authErr && <Alert type="error">{authErr}</Alert>}
          <Btn type="submit" disabled={loading} size="lg" className="w-full justify-center mt-1">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Connect
              </>
            )}
          </Btn>
        </form>
      </div>
    </div>
  );
}
