import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, LogIn, ShieldCheck, Truck, UserRound, X } from 'lucide-react';
import { getProfileRole, supabase } from '../services/supabase.js';
import RiderDashboard from './RiderOperationalDashboard.jsx';
import ProfileMenu from './ProfileMenu.jsx';
import AuthScreenV2 from './AuthScreenV2.jsx';

const roles = {
  provider: { label: 'Provider', description: 'Monitor shipments and cold-chain risk', icon: ShieldCheck },
  rider: { label: 'Rider', description: 'Manage your assigned shipment', icon: Truck },
};

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!supabase) { setChecking(false); return undefined; }
    let active = true;
    const restore = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      const nextSession = data.session;
      setSession(nextSession);
      setRole(nextSession ? await getProfileRole(nextSession.user) : null);
      setChecking(false);
    };
    void restore();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setRole(nextSession ? await getProfileRole(nextSession.user) : null);
      setChecking(false);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  if (checking) return <div className="auth-loading"><div><span className="auth-mark"><ShieldCheck size={25} /></span><h1>Checking session…</h1><p>Restoring your secure ColdSense workspace.</p></div></div>;
  if (!supabase) return <AuthScreenV2 configError="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to FRONTEND/.env before signing in." />;
  if (!session) return <AuthScreenV2 onAuthenticated={(nextSession, nextRole) => { setSession(nextSession); setRole(nextRole); }} />;
  if (role === 'rider') return <><ProfileMenu /><RiderDashboard user={session.user} onSignOut={() => supabase.auth.signOut()} /></>;
  if (role !== 'provider') return <RoleCompletion user={session.user} onComplete={setRole} onSignOut={() => supabase.auth.signOut()} />;
  return <>{children}</>;
}

function AuthScreen({ onAuthenticated, configError = '' }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(configError);

  const submit = async (event) => {
    event.preventDefault();
    if (!selectedRole) { setMessage('Choose Provider or Rider first.'); return; }
    if (password.length < 6) { setMessage('Password must be at least 6 characters.'); return; }
    setBusy(true); setMessage('');
    try {
      const result = mode === 'signup'
        ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name, role: selectedRole } } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (!result.data.session) { setMessage('Account created. Check your email to confirm your account, then sign in.'); setMode('signin'); return; }
      onAuthenticated(result.data.session, selectedRole || await getProfileRole(result.data.session.user));
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Authentication failed.'); }
    finally { setBusy(false); }
  };

  return <main className="auth-shell"><div className="auth-glow auth-glow-one" /><div className="auth-glow auth-glow-two" /><section className="auth-card"><div className="auth-brand"><span className="auth-mark"><ShieldCheck size={23} /></span><div><strong>ColdSense<span>.ai</span></strong><small>Cold-chain operations</small></div></div>{!selectedRole ? <><span className="auth-kicker">Secure workspace</span><h1>Welcome to ColdSense</h1><p className="auth-subtitle">How are you using ColdSense?</p><div className="role-grid">{Object.entries(roles).map(([key, item]) => { const Icon = item.icon; return <button className="role-card" key={key} onClick={() => setSelectedRole(key)}><span><Icon size={23} /></span><strong>{item.label}</strong><p>{item.description}</p><ArrowRight size={17} /></button>; })}</div></> : <><button className="auth-back" onClick={() => setSelectedRole(null)}><X size={14} /> Change role</button><span className="auth-kicker">{roles[selectedRole].label} access</span><h1>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1><p className="auth-subtitle">Sign in to your {roles[selectedRole].label.toLowerCase()} workspace.</p><form className="auth-form" onSubmit={submit}>{mode === 'signup' && <label>Full name<div className="auth-input"><UserRound size={16} /><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></div></label>}<label>Email<div className="auth-input"><UserRound size={16} /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div></label><label>Password<div className="auth-input"><LogIn size={16} /><input required minLength={6} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>{message && <div className="auth-message">{message}</div>}<button className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button></form><button className="auth-switch" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage(''); }}>{mode === 'signup' ? 'Already have an account? Sign in' : 'Don’t have an account? Create account'}</button></>}</section></main>;
}

function RoleCompletion({ user, onComplete, onSignOut }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async (nextRole) => { setBusy(true); setError(''); try { const { error: updateError } = await supabase.auth.updateUser({ data: { role: nextRole } }); if (updateError) throw updateError; onComplete(nextRole); } catch (cause) { setError(cause.message || 'Could not save role.'); } finally { setBusy(false); } };
  return <main className="auth-loading"><div><span className="auth-mark"><UserRound size={25} /></span><h1>Choose your workspace</h1><p>{user.email} needs a role before continuing.</p><div className="role-grid role-grid-small">{Object.entries(roles).map(([key, item]) => <button className="role-card" key={key} disabled={busy} onClick={() => save(key)}><strong>{item.label}</strong><p>{item.description}</p></button>)}</div>{error && <div className="auth-message">{error}</div>}<button className="auth-switch" onClick={onSignOut}>Sign out</button></div></main>;
}
